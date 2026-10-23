import { useEffect } from "react";
import { getLiveHealth, getStatus } from "../lib/api";
import { useLive } from "../store/live";

const POLL_MS = 2000;

/** Refresh source availability in every mode so an emulator started after the dashboard
 *  loads becomes selectable without a page reload. Per-tag quality is only needed in LIVE. */
export function useLiveSourcePoll(): void {
  const mode = useLive((s) => s.latest?.mode);
  const setStatus = useLive((s) => s.setStatus);
  const setLiveHealth = useLive((s) => s.setLiveHealth);

  useEffect(() => {
    let cancelled = false;
    const poll = (): void => {
      getStatus().then((s) => !cancelled && setStatus(s)).catch(() => undefined);
      if (mode === "live") {
        getLiveHealth().then((h) => !cancelled && setLiveHealth(h)).catch(() => undefined);
      }
    };
    poll();
    const id = setInterval(poll, mode === "live" ? POLL_MS : 5000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [mode, setStatus, setLiveHealth]);
}
