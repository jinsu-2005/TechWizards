import { useEffect } from "react";
import { getStatus, getTopology } from "../lib/api";
import { createLiveClient, liveUrl } from "../lib/ws";
import { useLive } from "../store/live";

import { playContainmentChime, playIncidentAlarm } from "../lib/audio";
import { useUi } from "../store/ui";
import { incidentBrief, isLiveConversationActive, speak, useVoice } from "../lib/voice";

const narrated = new Set<string>();
let lastBriefAt = 0;

/** Connects the WebSocket once, feeds the store, and refreshes REST state on (re)connect. */
export function useLiveStream(): void {
  useEffect(() => {
    const { push, setConn, setStatus, setTopology } = useLive.getState();
    let prevStatus: string | null = null;
    let previousMode = useLive.getState().latest?.mode;

    const close = createLiveClient({
      url: liveUrl(window.location),
      onMessage: (m) => {
        if (previousMode && previousMode !== m.mode) {
          useLive.getState().clear();
          useUi.getState().selectAsset(null);
          void getStatus().then(setStatus, () => undefined);
          void getTopology().then(setTopology, () => undefined);
        }
        previousMode = m.mode;
        push(m);
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
    return close;
  }, []);
}
