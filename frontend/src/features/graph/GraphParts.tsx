import { BaseEdge, Handle, Position, getBezierPath, type Edge, type EdgeProps, type Node, type NodeProps } from "@xyflow/react";
import { Cpu, Gauge, Settings2 } from "lucide-react";
import { formatValue } from "../../lib/format";
import { QUALITY_ICON, QUALITY_LABEL, ageLabel } from "../../lib/quality";
import type { NodeKind, NodeStatus, Quality } from "../../lib/types";
import { STATUS_COLOR, STATUS_LABEL } from "../twin/status";
import { StatusGlyph } from "../twin/StatusGlyph";
import { useUi } from "../../store/ui";

export interface PlantNodeData extends Record<string, unknown> {
  id: string; kind: NodeKind; value: number | null; status: NodeStatus;
  quality?: Quality | null; ageMs?: number | null; label?: string; stage?: string;
}
export type PlantNode = Node<PlantNodeData, "plant">;
export interface StageData extends Record<string, unknown> { title: string; count: number }
export type StageNode = Node<StageData, "stage">;
export type GraphNode = PlantNode | StageNode;

export function StageNodeView({ data }: NodeProps<StageNode>) {
  return <div className="graph-stage h-full w-full rounded-2xl border border-border/60 bg-surface/30">
    <div className="flex items-center justify-between gap-4 px-4 py-3 text-xs font-medium text-muted"><span>{data.title}</span><span className="rounded-full border border-border px-2 py-0.5 font-mono text-[10px]">{data.count} {data.count === 1 ? "asset" : "assets"}</span></div>
  </div>;
}

export function PlantNodeView({ data, selected }: NodeProps<PlantNode>) {
  const select = useUi((s) => s.selectAsset);
  const Icon = data.kind === "controller" ? Cpu : data.kind === "actuator" ? Settings2 : Gauge;
  const flagged = data.status !== "normal";
  const QualityIcon = data.quality && data.quality !== "good" ? QUALITY_ICON[data.quality] : undefined;
  return <div role="button" tabIndex={0} aria-pressed={selected} aria-label={`Inspect ${data.id}: ${STATUS_LABEL[data.status]}`}
    onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); select(data.id); } }}
    title={`${data.label ?? data.id} · ${STATUS_LABEL[data.status]}`}
    className={`graph-asset relative flex h-[82px] w-[164px] cursor-pointer items-center rounded-lg bg-surface px-3 shadow-sm ${data.status === "origin" ? "graph-origin" : ""}`}
    style={{ border: `${selected || flagged ? 2 : 1}px solid ${selected ? "var(--accent)" : flagged ? STATUS_COLOR[data.status] : "var(--border)"}`,
      boxShadow: flagged ? `0 0 0 3px rgb(var(--${data.status}-rgb) / 0.12)` : undefined,
      transition: "border-color var(--motion-fast), box-shadow var(--motion-fast)" }}>
    <Handle type="target" position={Position.Left} className="!h-1 !w-1 !border-0 !bg-transparent" />
    <div className="flex min-w-0 flex-1 flex-col leading-tight">
      <span className="flex items-center gap-1.5 font-mono text-[13px] font-medium text-muted"><Icon size={13} aria-hidden className="shrink-0" /><span className="truncate">{data.id}</span></span>
      <span className="mt-1 font-mono text-base font-semibold text-text">{data.value === null ? "–" : formatValue(data.id, data.value)}</span>
      <span className="mt-1 text-[11px] text-muted">{data.stage ?? data.kind} · {STATUS_LABEL[data.status]}</span>
    </div>
    {QualityIcon && data.quality && <div className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-surface text-suspect shadow-sm" title={`${QUALITY_LABEL[data.quality]} · ${ageLabel(data.ageMs)}`}><QualityIcon size={11} aria-hidden /></div>}
    <svg width={14} height={14} viewBox="0 0 14 14" aria-hidden className="ml-1 shrink-0"><StatusGlyph status={data.status} cx={7} cy={7} /></svg>
    <Handle type="source" position={Position.Right} className="!h-1 !w-1 !border-0 !bg-transparent" />
  </div>;
}

export interface PulseEdgeData extends Record<string, unknown> {
  learned: boolean; delay: number | null; onset?: number; phase?: number; cycle?: number;
  dimmed?: boolean; feedback?: boolean; uncertain?: boolean;
}
export type PulseEdgeT = Edge<PulseEdgeData, "pulse">;

export function PulseEdgeView(props: EdgeProps<PulseEdgeT>) {
  const { sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, data, markerEnd } = props;
  const [curve] = getBezierPath({ sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition });
  const d = data?.feedback ? `M ${sourceX},${sourceY} C ${sourceX + 60},${sourceY - 110} ${targetX - 60},${targetY - 110} ${targetX},${targetY}` : curve;
  const onPath = data?.delay !== null && data?.delay !== undefined;
  // A recorded dataset has no P&ID, so every edge it draws is a learned association. Excluding
  // learned edges from the ambient flow left HAI with a completely static graph.
  const isHealthyActive = !onPath && !data?.dimmed && !data?.uncertain;

  return (
    <g>
      <title>{`${props.source} → ${props.target} · ${data?.uncertain ? "Direction uncertain" : onPath ? `Inferred effect, source onset +${data?.onset ?? 0}s (illustrative animation)` : data?.learned ? "Learned statistical association" : "Configured topology"}`}</title>
      <BaseEdge
        path={d}
        markerEnd={markerEnd}
        style={{
          stroke: data?.uncertain ? "var(--suspect)" : onPath ? "var(--origin)" : "var(--muted)",
          strokeOpacity: data?.dimmed ? 0.08 : onPath ? 0.9 : data?.learned ? 0.2 : 0.55,
          strokeWidth: onPath ? 2.5 : 1.25,
          strokeDasharray: data?.uncertain ? "8 5" : data?.learned ? "4 4" : undefined,
        }}
      />
      {/* Ambient flow along healthy wires; a negative delay starts each pulse mid-flight. */}
      {isHealthyActive && (
        <path
          d={d}
          pathLength={1}
          className="graph-ambient-particle"
          stroke="var(--accent)"
          strokeWidth={data?.learned ? 2 : 2.75}
          strokeLinecap="round"
          fill="none"
          style={{
            // A learned link is an inference, so its flow reads fainter than a configured one.
            opacity: data?.learned ? 0.45 : 0.9,
            animationDelay: `${-(((sourceX * 7 + sourceY * 13) % 100) / 100) * 3.85}s`,
          }}
        />
      )}
      {/* Propagation wave: a static glow under the wire plus a pulse timed by hop order. */}
      {onPath && !data?.uncertain && (
        <>
          <path d={d} className="graph-trace-glow" stroke="var(--origin)" strokeOpacity={0.14} strokeWidth={8} strokeLinecap="round" fill="none" />
          <path
            d={d}
            pathLength={1}
            className="graph-trace"
            stroke="var(--origin)"
            strokeWidth={4}
            strokeLinecap="round"
            fill="none"
            style={{
              ["--trace-cycle" as string]: `${(data.cycle ?? 7) / 2}s`,
              animationDelay: `${(data.phase ?? 0) * ((data.cycle ?? 7) / 2)}s`,
            }}
          />
        </>
      )}
    </g>
  );
}
