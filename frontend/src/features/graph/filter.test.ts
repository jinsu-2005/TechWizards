import { describe, expect, it } from "vitest";
import { reachable, filterAssets, graphLinks } from "./filter";
import type { TopologyEdge, TopologyNode, NodeState, Incident } from "../../lib/types";

const pairs: [string, string][] = [["A", "B"], ["B", "C"], ["C", "B"]];
const edges: TopologyEdge[] = pairs.map(([src, dst]) => ({ src, dst, weight: 1, kind: "static" }));
describe("investigation graph navigation", () => {
  it("marks unsupported propagation direction as uncertain and respects hidden learned links", () => {
    const topology: TopologyEdge[] = [{ src: "A", dst: "B", kind: "static", weight: 1 }, { src: "B", dst: "C", kind: "learned", weight: .8 }];
    const incident = { path_edges: [["B", "A"], ["B", "C"]] } as Incident;
    const links = graphLinks(topology.slice(0, 1), topology, incident, true);
    expect(links.map((e) => [e.src, e.dst, e.uncertain])).toEqual([["A", "B", false], ["B", "A", true]]);
    expect(graphLinks([], topology, incident, false)).toEqual([]);
  });
  it("follows direction and terminates on feedback loops", () => {
    expect([...(reachable("B", edges, "downstream") ?? [])]).toEqual(["B", "C"]);
    expect([...(reachable("B", edges, "upstream") ?? [])]).toEqual(["B", "A", "C"]);
    expect(reachable(null, edges, "downstream")).toBeNull();
  });
  it("combines search, type, status and neighborhood without treating missing readings as flagged", () => {
    const nodes = [{ id: "A", label: "Tank level", type: "sensor" }, { id: "B", label: "Pump", type: "actuator" }, { id: "C", label: "Tank level", type: "sensor" }] as TopologyNode[];
    const readings = [{ id: "A", status: "suspect" }, { id: "B", status: "normal" }] as NodeState[];
    expect([...filterAssets(nodes, readings, "tank", "sensor", true, new Set(["A", "C"]))]).toEqual(["A"]);
    expect([...filterAssets(nodes, readings, "", "all", false, null)]).toEqual(["A", "B", "C"]);
  });
});
