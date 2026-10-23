import { isActive } from "../../lib/incident";
import type { Incident, NodeState } from "../../lib/types";
import { LINKS, flowDuration, flowRatio, pulseDelay } from "./geometry";

interface Props {
  nodes: ReadonlyMap<string, NodeState>;
  incident: Incident | null;
}

/** Pipes with flowing dashes, control wires, and attack pulses along the incident path. */
export function Links({ nodes, incident }: Props) {
  const active = isActive(incident);
  return (
    <g>
      {LINKS.map((l) => {
        const dur = l.kind === "pipe" ? flowDuration(flowRatio(l, nodes)) : null;
        const delay = active ? pulseDelay(l, incident.path_edges, incident.path) : null;
        return (
          <g key={l.id}>
            {l.kind === "pipe" ? (
              <>
                <path d={l.d} stroke="var(--accent)" strokeWidth={11} strokeOpacity={0.08} fill="none" strokeLinecap="round" />
                <path d={l.d} stroke="var(--border)" strokeWidth={7} fill="none" strokeLinecap="round" />
                <path
                  d={l.d}
                  className={dur === null ? "" : "flow"}
                  stroke="var(--accent)"
                  strokeOpacity={dur === null ? 0.2 : 0.95}
                  strokeWidth={2.75}
                  strokeDasharray="6 10"
                  strokeLinecap="round"
                  fill="none"
                  style={
                    dur === null
                      ? undefined
                      : {
                          animationDuration: `${dur}s`,
                          filter: "drop-shadow(0 0 4px rgb(var(--accent-rgb) / 0.8))",
                        }
                  }
                />
              </>
            ) : (
              <path
                d={l.d}
                stroke="var(--muted)"
                strokeOpacity={0.4}
                strokeWidth={1}
                strokeDasharray="4 4"
                fill="none"
              />
            )}
            {delay !== null && (
              <path
                d={l.d}
                pathLength={1}
                className="attack-pulse"
                stroke="var(--origin)"
                strokeWidth={5}
                strokeLinecap="round"
                fill="none"
                style={{
                  animationDelay: `${Math.min(delay, 6)}s`,
                  filter: "drop-shadow(0 0 5px var(--origin))",
                }}
              />
            )}
          </g>
        );
      })}
    </g>
  );
}
