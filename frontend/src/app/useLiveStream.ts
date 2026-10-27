import { useEffect } from "react";
import { getStatus, getTopology } from "../lib/api";
import type { LiveMessage, Topology, TopologyNode } from "../lib/types";
import { createLiveClient, liveUrl } from "../lib/ws";
import { nodeMap, useLive } from "../store/live";
import { useAttackRun } from "../store/attackRun";

import { playContainmentChime, playIncidentAlarm } from "../lib/audio";
import { useUi } from "../store/ui";
import { incidentBrief, isLiveConversationActive, speak, useVoice } from "../lib/voice";

const narrated = new Set<string>();
let lastBriefAt = 0;

/** At fast-demo pace samples arrive every ~30 ms; rendering each one re-draws the twin, graph and
 *  timeline for frames nobody sees. Samples are still processed one by one, but the store (and
 *  React) take them at most this often. */
const RENDER_INTERVAL_MS = 66;

// The topology changes once per session; rebuilding its index on every sample would be waste.
let topoSource: Topology | null = null;
let topoIndex = new Map<string, TopologyNode>();
function topologyIndex(topology: Topology | null): Map<string, TopologyNode> {
  if (topology !== topoSource) {
    topoSource = topology;
    topoIndex = nodeMap(topology);
  }
  return topoIndex;
}

/** Connects the WebSocket once, feeds the store, and refreshes REST state on (re)connect. */
export function useLiveStream(): void {
  useEffect(() => {
    const { pushMany, setConn, setStatus, setTopology } = useLive.getState();
    let pending: LiveMessage[] = [];
    let lastFlush = 0;
    let flushTimer: ReturnType<typeof setTimeout> | undefined;
    const flush = () => {
      flushTimer = undefined;
      lastFlush = performance.now();
      const batch = pending;
      pending = [];
      pushMany(batch);
    };
    const enqueue = (m: LiveMessage) => {
      pending.push(m);
      if (flushTimer !== undefined) return;
      const wait = RENDER_INTERVAL_MS - (performance.now() - lastFlush);
      if (wait <= 0) flush();
      else flushTimer = setTimeout(flush, wait);
    };
    let prevStatus: string | null = null;
    let previousMode = useLive.getState().latest?.mode;

    const close = createLiveClient({
      url: liveUrl(window.location),
      onMessage: (m) => {
        if (previousMode && previousMode !== m.mode) {
          pending = [];
          clearTimeout(flushTimer);
          flushTimer = undefined;
          useLive.getState().clear();
          useUi.getState().selectAsset(null);
          void getStatus().then(setStatus, () => undefined);
          void getTopology().then(setTopology, () => undefined);
        }
        previousMode = m.mode;
        enqueue(m);
        // Advance the launched test's phase from telemetry, so "detected" only ever comes
        // from the detector actually raising an incident.
        useAttackRun.getState().observe(m, topologyIndex(useLive.getState().topology));
        const currStatus = m.incident?.status ?? null;
        if (currStatus !== prevStatus) {
          const sound = useUi.getState().soundEnabled;
          if ((currStatus === "localizing" || currStatus === "open") && prevStatus !== "localizing" && prevStatus !== "open") {
            playIncidentAlarm(sound);
          } else if (currStatus === "contained" && prevStatus !== "contained") {
            playContainmentChime(sound);
          }
          prevStatus = currStatus;
        }
        if (m.incident && useVoice.getState().incidentBriefings && !isLiveConversationActive() && document.visibilityState === "visible" && (currStatus === "open" || currStatus === "localizing" || currStatus === "contained")) {
          const key = `${m.mode}:${m.incident.id}:${currStatus === "contained" ? "contained" : "detected"}`;
          if (!narrated.has(key) && Date.now() - lastBriefAt >= 45_000) {
            narrated.add(key);
            lastBriefAt = Date.now();
            if (narrated.size > 100) narrated.clear();
            void speak(incidentBrief(m.incident, m.mode)).catch(() => undefined);
          }
        }
      },
      onState: (state) => {
        setConn(state);
        if (state !== "live") return;
        getStatus().then(setStatus, () => undefined);
        getTopology().then(setTopology, () => undefined);
      },
    });
    return () => { clearTimeout(flushTimer); close(); };
  }, []);
}
