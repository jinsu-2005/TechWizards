import { useEffect } from "react";
import { getStatus, getTopology } from "../lib/api";
import { createLiveClient, liveUrl } from "../lib/ws";
import { useLive } from "../store/live";

import { playContainmentChime, playIncidentAlarm } from "../lib/audio";
import { useUi } from "../store/ui";

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
