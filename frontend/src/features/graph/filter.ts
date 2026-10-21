import type { TopologyEdge, TopologyNode, NodeState, Incident } from "../../lib/types";

export function graphLinks(visible: readonly TopologyEdge[], all: readonly TopologyEdge[], incident: Incident | null | undefined, propagation: boolean): (TopologyEdge & { uncertain: boolean })[] {
  const result = visible.map((e) => ({ ...e, uncertain: false }));
  const known = new Set(all.map((e) => `${e.src}->${e.dst}`));
  if (propagation) for (const [src, dst] of incident?.path_edges ?? []) {
    const key = `${src}->${dst}`;
    if (!known.has(key)) { result.push({ src, dst, kind: "static", weight: 0, uncertain: true }); known.add(key); }
  }
  return result;
}

export type FocusDirection = "all" | "upstream" | "downstream";
export function reachable(selected: string | null, edges: readonly TopologyEdge[], direction: FocusDirection): Set<string> | null {
  if (!selected || direction === "all") return null;
  const result = new Set([selected]);
  const queue = [selected];
  while (queue.length) {
    const current = queue.shift();
    for (const edge of edges) {
      const next = direction === "downstream" ? edge.src === current ? edge.dst : null : edge.dst === current ? edge.src : null;
      if (next && !result.has(next)) { result.add(next); queue.push(next); }
    }
  }
  return result;
}

export function filterAssets(nodes: readonly TopologyNode[], readings: readonly NodeState[], query: string, kind: string, flagged: boolean, neighborhood: Set<string> | null): Set<string> {
  const states = new Map(readings.map((n) => [n.id, n.status]));
  const search = query.trim().toLowerCase();
  return new Set(nodes.filter((n) => (!search || `${n.id} ${n.label}`.toLowerCase().includes(search)) && (kind === "all" || n.type === kind) && (!flagged || (states.has(n.id) && states.get(n.id) !== "normal")) && (!neighborhood || neighborhood.has(n.id))).map((n) => n.id));
}
