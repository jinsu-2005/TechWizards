import { STATUS_LABEL } from "../twin/status";
import { StatusGlyph } from "../twin/StatusGlyph";
import { selectView, useLive } from "../../store/live";

/** Live node scores (smoothed forecast error) with status, from the message already streamed. */
export function NodeScores() {
  const nodes = useLive((s) => selectView(s)?.nodes);
  if (!nodes?.length) return null;
  return (
    <div className="flex flex-col gap-1 border-t border-border pt-2" aria-label="Node scores">
      <span className="text-xs text-muted">Node scores</span>
      {nodes.map((n) => (
        <div key={n.id} className="flex items-center gap-2 font-mono text-xs" title={STATUS_LABEL[n.status]}>
          <svg width={14} height={14} viewBox="-7 -7 14 14" aria-label={STATUS_LABEL[n.status]} role="img">
            <StatusGlyph status={n.status} cx={0} cy={0} />
          </svg>
          <span className="min-w-0 flex-1 truncate" title={n.id}>{n.id}</span>
          <span className="ml-auto text-muted">{n.score.toFixed(2)}</span>
        </div>
      ))}
    </div>
  );
}
