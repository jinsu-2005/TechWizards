import { useMemo } from "react";
import { nodeMap, selectView, useLive } from "../../store/live";
import { Equipment } from "./EquipmentLayer";
import { Links } from "./Links";
import { VIEW } from "./geometry";

/** Pure-SVG plant: tanks fill with the physical level, pipes flow, pumps spin. */
export function TwinView() {
  const latest = useLive(selectView);
  const topology = useLive((s) => s.topology);
  const liveHealth = useLive((s) => s.liveHealth);
  const nodes = useMemo(() => new Map((latest?.nodes ?? []).map((n) => [n.id, n])), [latest]);
  const topo = useMemo(() => nodeMap(topology), [topology]);
  const ageByNode = useMemo(
    () => new Map((liveHealth ?? []).map((h) => [h.node_id, h.age_ms])),
    [liveHealth],
  );
  if (!latest) return null;
  return (
    <svg
      viewBox={`0 0 ${VIEW.w} ${VIEW.h}`}
      preserveAspectRatio="xMidYMid meet"
      className="h-full w-full"
      role="img"
      aria-label="Plant digital twin"
    >
      <Links nodes={nodes} incident={latest.incident} />
      <Equipment nodes={nodes} topo={topo} ageByNode={ageByNode} />
    </svg>
  );
}
