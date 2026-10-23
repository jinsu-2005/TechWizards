import { formatValue } from "../../lib/format";
import { indexToX, seriesPath } from "../../lib/replay";
import { useUi } from "../../store/ui";

const VW = 1000;
const VH = 30;

interface Props {
  id: string;
  reported: readonly number[];
  truth: readonly number[];
  at: number;
  live: boolean;
  physical: boolean;
  status?: string;
}

/** Each path is drawn from received samples. Motion is limited to the live sample marker. */
export function Sparkline({ id, reported, truth, at, live, physical, status }: Props) {
  const selected = useUi((s) => s.selectedAsset === id);
  const select = useUi((s) => s.selectAsset);
  const all = physical ? [...reported, ...truth] : [...reported];
  const min = all.length ? Math.min(...all) : 0;
  const max = all.length ? Math.max(...all) : 1;
  const pad = (max - min) * 0.13 || 0.5;
  const lo = min - pad;
  const hi = max + pad;
  const sample = Math.min(at, reported.length - 1);
  const shown = reported[sample];
  const x = sample < 0 ? 0 : indexToX(sample, reported.length, Math.max(2, reported.length), VW);
  const y = shown === undefined ? VH / 2 : VH - ((shown - lo) / (hi - lo)) * VH;
  const path = seriesPath(reported, Math.max(2, reported.length), VW, VH, lo, hi);
  const gradId = `timeline-fill-${id}`;
  const statusName = status && status !== "normal" ? status : null;

  return (
    <div className={`timeline-row ${selected ? "timeline-row-selected" : ""}`}>
      <div className="timeline-row-label">
        <button type="button" aria-label={`Inspect ${id} from timeline`} aria-pressed={selected}
          onClick={() => select(id)} title={`Inspect ${id}`} className="timeline-tag">{id}</button>
        <span className={`timeline-value ${statusName ? "timeline-value-alert" : ""}`}>
          {shown === undefined ? "–" : formatValue(id, shown)}
        </span>
        <span className={`timeline-status-dot ${statusName ? "timeline-status-alert" : ""}`}
          role="img" aria-label={statusName ? `${statusName} status` : "normal status"} title={statusName ?? "normal"} />
      </div>
      <div className="timeline-plot">
        <svg viewBox={`0 0 ${VW} ${VH}`} preserveAspectRatio="none" className="timeline-svg" aria-hidden>
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity=".20" />
              <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[250, 500, 750].map((guide) => <line key={guide} x1={guide} x2={guide} y1="0" y2={VH}
            stroke="var(--border)" strokeOpacity=".55" strokeDasharray="2 5" vectorEffect="non-scaling-stroke" />)}
          <line x1="0" x2={VW} y1={VH / 2} y2={VH / 2} stroke="var(--border)" strokeOpacity=".55"
            strokeDasharray="3 6" vectorEffect="non-scaling-stroke" />
          {path && <path d={`${path} L${indexToX(reported.length - 1, reported.length, Math.max(2, reported.length), VW).toFixed(1)} ${VH} L0 ${VH} Z`} fill={`url(#${gradId})`} />}
          {physical && <path d={seriesPath(truth, Math.max(2, reported.length), VW, VH, lo, hi)}
            fill="none" stroke="var(--muted)" strokeOpacity=".82" strokeWidth="1.25"
            strokeDasharray="4 4" vectorEffect="non-scaling-stroke" />}
          <path d={path} fill="none" stroke="var(--accent)" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
          {shown !== undefined && <>
            <circle cx={x} cy={y} r="5" fill="var(--surface)" stroke="var(--accent)" strokeWidth="2" vectorEffect="non-scaling-stroke" />
            <circle cx={x} cy={y} r="2" fill="var(--accent)" />
          </>}
        </svg>
        {live && shown !== undefined && <span className="timeline-live-glow" style={{ left: `${(x / VW) * 100}%`, top: `${(y / VH) * 100}%` }} aria-hidden />}
      </div>
    </div>
  );
}
