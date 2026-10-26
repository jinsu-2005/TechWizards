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
        const ratio = flowRatio(l, nodes);
        const dur = l.kind === "pipe" ? flowDuration(ratio) : null;
        const delay = active ? pulseDelay(l, incident.path_edges, incident.path) : null;
        const isTreated = l.id === "o1" || l.id === "o2";
        const pipeColor = isTreated ? "#60a5fa" : "var(--accent)";
        const pipeGlow = isTreated ? "rgb(96 165 250 / 0.85)" : "rgb(var(--accent-rgb) / 0.85)";
        return (
          <g key={l.id}>
            {l.kind === "pipe" ? (
              <>
                {/* Outer pipeline conduit housing */}
                <path d={l.d} stroke={pipeColor} strokeWidth={13} strokeOpacity={0.06} fill="none" strokeLinecap="round" />
                <path d={l.d} stroke="var(--border)" strokeWidth={7.5} fill="none" strokeLinecap="round" />
                {/* Luminous fluid interior stream */}
                <path
                  d={l.d}
                  stroke={pipeColor}
                  strokeWidth={4.5}
                  strokeOpacity={dur === null ? 0.2 : 0.4}
                  fill="none"
                  strokeLinecap="round"
                />
                {/* Dynamic flowing fluid particles */}
                <path
                  d={l.d}
                  className={dur === null ? "" : "flow"}
                  stroke={pipeColor}
                  strokeOpacity={dur === null ? 0.25 : 0.95}
                  strokeWidth={2.75}
                  strokeDasharray="7 12"
                  strokeLinecap="round"
                  fill="none"
                  style={
                    dur === null
                      ? undefined
                      : {
                          animationDuration: `${dur}s`,
                          filter: `drop-shadow(0 0 5px ${pipeGlow})`,
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
