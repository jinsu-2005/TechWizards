import { useEffect, useState } from "react";
import { useLive } from "../store/live";

/** Receipt time is used because replay and simulation timestamps may use another clock. */
export function useFreshness() {
  const conn = useLive((s) => s.conn);
  const receivedAt = useLive((s) => s.receivedAt);
  const replaying = useLive((s) => s.cursor !== null);
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  const ageSeconds = receivedAt === null ? null : Math.max(0, Math.floor((now - receivedAt) / 1000));
  return { stale: receivedAt !== null && (conn !== "live" || (ageSeconds ?? 0) >= 5), ageSeconds, replaying };
}
