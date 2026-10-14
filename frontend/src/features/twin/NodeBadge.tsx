import { formatValue, isSpoofed } from "../../lib/format";
import { QUALITY_ICON, QUALITY_LABEL, ageLabel } from "../../lib/quality";
import type { NodeState, TopologyNode } from "../../lib/types";
import { CHAR_W, TEXT, type Pt } from "./geometry";
import { STATUS_COLOR, STATUS_LABEL } from "./status";
import { StatusGlyph } from "./StatusGlyph";

interface Props {
  node: NodeState;
  at: Pt;
  topo?: TopologyNode;
  h?: number;
  /** LIVE only: age of this node's last reading, for the quality tooltip. */
  ageMs?: number | null;
}

/** ID + reported value + status glyph. A spoofed sensor also shows its physical value. A LIVE
 *  node whose data is not `good` also shows a small quality icon (never colour alone). */
export function NodeBadge({ node, at, topo, h = 46, ageMs }: Props) {
  const spoof = isSpoofed(topo, node.value, node.truth);
  const value = formatValue(node.id, node.value);
  const truth = spoof && node.truth !== null ? `true ${formatValue(node.id, node.truth)}` : null;
  const chars = Math.max(node.id.length + 2, value.length, truth?.length ?? 0); // +2: status glyph
  const w = Math.max(72, Math.ceil(chars * CHAR_W + 16));
  const height = truth ? h + 20 : h; // a third line shows the physical value of a spoofed sensor
  const x = at.x - w / 2;
  const y = at.y - h / 2;
  const color = STATUS_COLOR[node.status];
  const flagged = node.status !== "normal";
  return (
    <g aria-label={`${node.id} ${STATUS_LABEL[node.status]}`}>
      <title>{`${node.id} · ${STATUS_LABEL[node.status]} · score ${node.score.toFixed(2)}`}</title>
      {node.status === "origin" && (
        <rect
          className="pulse-ring"
          x={x}
          y={y}
          width={w}
          height={height}
          rx={8}
          fill="none"
          stroke={color}
          strokeWidth={2}
        />
      )}
      <rect
        x={x}
        y={y}
        width={w}
        height={height}
        rx={8}
        fill="var(--surface)"
        stroke={color}
        strokeWidth={flagged ? 2 : 1}
        style={{ transition: "stroke var(--motion-fast)" }}
      />
      <text x={x + 8} y={y + 17} className="fill-muted font-mono" fontSize={TEXT}>
        {node.id}
      </text>
      <StatusGlyph status={node.status} cx={x + w - 12} cy={y + 13} />
      {node.quality && node.quality !== "good" && QUALITY_ICON[node.quality] && (
        <g transform={`translate(${x + w - 32}, ${y + 4})`}>
          <title>{`${QUALITY_LABEL[node.quality]} · ${ageLabel(ageMs)}`}</title>
          {(() => {
            const Icon = QUALITY_ICON[node.quality];
            return Icon ? <Icon size={14} className="text-suspect" aria-hidden /> : null;
          })()}
        </g>
      )}
      <text x={x + 8} y={y + 37} className="fill-text font-mono" fontSize={TEXT}>
        {value}
      </text>
      {truth && (
        <text x={x + 8} y={y + 57} fontSize={TEXT} fill="var(--suspect)" className="font-mono">
          {truth}
        </text>
      )}
    </g>
  );
}
