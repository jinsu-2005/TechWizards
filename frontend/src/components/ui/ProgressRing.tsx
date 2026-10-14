const R = 28;
const C = 2 * Math.PI * R;

/** A ring that fills as `progress` (0..1) advances; a static partial ring when unknown. */
export function ProgressRing({ progress }: { progress: number | null }) {
  const p = progress === null ? null : Math.max(0, Math.min(1, progress));
  return (
    <svg width={72} height={72} viewBox="0 0 72 72" role="img" aria-hidden>
      <circle cx={36} cy={36} r={R} fill="none" stroke="var(--border)" strokeWidth={6} />
      <circle
        cx={36}
        cy={36}
        r={R}
        fill="none"
        stroke="var(--accent)"
        strokeWidth={6}
        strokeLinecap="round"
        strokeDasharray={C}
        strokeDashoffset={p === null ? C * 0.75 : C * (1 - p)}
        transform="rotate(-90 36 36)"
        style={{ transition: "stroke-dashoffset var(--motion-slow) linear" }}
      />
    </svg>
  );
}
