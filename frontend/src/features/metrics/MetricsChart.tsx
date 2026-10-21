import { useId } from "react";
import type { BarRow } from "../../lib/metrics";

export function MetricsChart({ rows }: { rows: readonly BarRow[] }) {
  const title = useId();
  const width = 800, height = 300, left = 48, bottom = 52, top = 34;
  const plotHeight = height - bottom - top;
  const group = (width - left - 20) / Math.max(1, rows.length);
  const bar = Math.min(26, group * .25);
  const y = (v: number) => top + (1 - Math.max(0, Math.min(1, v))) * plotHeight;
  return (
    <figure className="h-full overflow-x-auto" aria-labelledby={title} tabIndex={0}>
      <figcaption id={title} className="sr-only">Detection F1 by scenario: baseline and AttackTrace. Higher is better.</figcaption>
      <svg role="img" aria-labelledby={title} viewBox={`0 0 ${width} ${height}`} className="h-full min-h-[280px] min-w-[600px] w-full">
        <g fill="var(--muted)" fontSize={11}>
          <rect x={width - 230} y={8} width={12} height={12} rx={2} /><text x={width - 212} y={19}>Baseline</text>
          <rect x={width - 120} y={8} width={12} height={12} rx={2} fill="var(--accent)" /><text x={width - 102} y={19}>AttackTrace</text>
          {[0, .25, .5, .75, 1].map(v => <g key={v}><line x1={left} x2={width - 20} y1={y(v)} y2={y(v)} stroke="var(--border)" /><text x={left - 10} y={y(v) + 4} textAnchor="end">{v.toFixed(2)}</text></g>)}
          {rows.map((row, i) => {
            const center = left + group * (i + .5);
            return <g key={row.label}>
              <rect x={center - bar - 3} y={y(row.baseline)} width={bar} height={y(0) - y(row.baseline)} rx={3}><title>{`${row.label}: baseline ${row.baseline.toFixed(3)}`}</title></rect>
              <rect x={center + 3} y={y(row.attacktrace)} width={bar} height={y(0) - y(row.attacktrace)} fill="var(--accent)" rx={3}><title>{`${row.label}: AttackTrace ${row.attacktrace.toFixed(3)}`}</title></rect>
              <text x={center} y={height - 25} textAnchor="middle">{row.label}</text>
            </g>;
          })}
        </g>
      </svg>
      <table className="sr-only"><caption>Exact F1 values</caption><thead><tr><th>Scenario</th><th>Baseline</th><th>AttackTrace</th></tr></thead><tbody>{rows.map(row => <tr key={row.label}><th>{row.label}</th><td>{row.baseline.toFixed(3)}</td><td>{row.attacktrace.toFixed(3)}</td></tr>)}</tbody></table>
    </figure>
  );
}
