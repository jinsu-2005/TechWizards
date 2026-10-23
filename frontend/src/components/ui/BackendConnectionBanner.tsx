import { LoaderCircle, Wifi, WifiOff } from "lucide-react";
import { useEffect, useState } from "react";
import { useLive } from "../../store/live";

/** Telemetry connection feedback, including the longer wait of a sleeping cloud backend. */
export function BackendConnectionBanner() {
  const conn = useLive((state) => state.conn);
  const receivedAt = useLive((state) => state.receivedAt);
  const [waitingLong, setWaitingLong] = useState(false);

  useEffect(() => {
    if (conn === "live" && receivedAt !== null) return;
    const timer = window.setTimeout(() => setWaitingLong(true), 7000);
    return () => window.clearTimeout(timer);
  }, [conn, receivedAt]);

  if (conn === "live" && receivedAt !== null) return null;
  const reconnecting = conn === "reconnecting";
  const streamReady = conn === "live";
  return (
    <div className="backend-connection-banner" role="status" aria-live="polite" aria-busy="true">
      <span className="backend-connection-symbol" aria-hidden="true">
        {reconnecting ? <WifiOff size={17} /> : <Wifi size={17} />}
        <LoaderCircle size={11} className="backend-connection-spinner" />
      </span>
      <div className="min-w-0">
        <strong>{streamReady ? "Waiting for process readings" : waitingLong ? "Waiting for the backend to wake up" : reconnecting ? "Reconnecting to the backend" : "Connecting to the backend"}</strong>
        <p>{streamReady ? "The connection is open. The latest telemetry will appear as soon as the source emits it." : waitingLong ? "A sleeping server can take a while to start. We’ll connect automatically when it is ready." : "Establishing the telemetry stream and loading the process model…"}</p>
      </div>
      <span className="backend-connection-dots" aria-hidden="true"><i /><i /><i /></span>
    </div>
  );
}
