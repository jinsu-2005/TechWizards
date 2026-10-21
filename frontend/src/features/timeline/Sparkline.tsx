import { formatValue } from "../../lib/format";
import { seriesPath } from "../../lib/replay";
import { useUi } from "../../store/ui";

/** Virtual drawing width; the SVG stretches to its container, so no measuring is needed. */
const VW = 1000;

interface Props {
  id: string;
  reported: readonly number[];
  truth: readonly number[];
  /** Sample index of the value shown in the label (cursor or newest). */
  at: number;
  height: number;
}

/** Reported value (solid) over physical truth (dashed); a gap between them is spoofing. */
export function Sparkline({ id, reported, truth, at, height }: Props) {
  const selected = useUi((s) => s.selectedAsset === id);
  const select = useUi((s) => s.selectAsset);
  const all = [...reported, ...truth];
  const min = all.length ? Math.min(...all) : 0;
  const max = all.length ? Math.max(...all) : 1;
  const pad = (max - min) * 0.1 || 0.5;
  const lo = min - pad;
  const hi = max + pad;
  const shown = reported[at];
  const gradId = `spark-grad-${id}`;

  return (
    <div className={`grid grid-cols-[148px_1fr] items-center border-b border-border/30 last:border-b-0 hover:bg-surface/40 transition-colors ${selected ? "bg-accent/10" : ""}`} style={{ height }}>
      <div className="flex items-baseline gap-2 pl-2 font-mono leading-none">
        <button aria-label={`Inspect ${id} from timeline`} aria-pressed={selected} className="w-14 text-left text-xs font-semibold text-text/80 hover:text-accent" onClick={() => select(id)}>{id}</button>
        <span className="whitespace-nowrap text-xs font-mono font-medium text-accent">
          {shown === undefined ? "–" : formatValue(id, shown)}
        </span>
      </div>
      <div className="relative h-full w-full">
        <svg
          viewBox={`0 0 ${VW} ${height}`}
          preserveAspectRatio="none"
          className="h-full w-full min-w-0"
          aria-hidden
        >
          <defs>
            <linearGradient id={gradId} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.25} />
              <stop offset="100%" stopColor="var(--accent)" stopOpacity={0.0} />
            </linearGradient>
          </defs>

          {/* Oscilloscope Grid Guides */}
          <line x1={250} y1={0} x2={250} y2={height} stroke="var(--border)" strokeWidth={0.8} strokeDasharray="2 4" strokeOpacity={0.5} />
          <line x1={500} y1={0} x2={500} y2={height} stroke="var(--border)" strokeWidth={0.8} strokeDasharray="2 4" strokeOpacity={0.5} />
          <line x1={750} y1={0} x2={750} y2={height} stroke="var(--border)" strokeWidth={0.8} strokeDasharray="2 4" strokeOpacity={0.5} />
          <line x1={0} y1={height / 2} x2={VW} y2={height / 2} stroke="var(--border)" strokeWidth={0.6} strokeDasharray="4 6" strokeOpacity={0.4} />

          {/* Physical Truth Waveform (Dashed Reference) */}
          <path
            d={seriesPath(truth, Math.max(2, reported.length), VW, height, lo, hi)}
            fill="none"
            stroke="var(--muted)"
            strokeWidth={1}
            strokeDasharray="3 3"
            vectorEffect="non-scaling-stroke"
          />

          {/* Reported Live Waveform */}
          <path
            d={seriesPath(reported, Math.max(2, reported.length), VW, height, lo, hi)}
            fill="none"
            stroke="var(--accent)"
            strokeWidth={1.5}
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </div>
    </div>
  );
}
