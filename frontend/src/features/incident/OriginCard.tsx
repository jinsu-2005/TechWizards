import { CircleHelp, Cog, Cpu, Gauge } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Incident, NodeKind, OriginCandidate } from "../../lib/types";
import { BreakdownBar, BreakdownLegend } from "./BreakdownBar";

const KIND_ICON: Record<NodeKind, LucideIcon> = { sensor: Gauge, actuator: Cog, controller: Cpu };

const pct = (x: number): string => `${Math.round(x * 100)}%`;

/** Top 3 with equal weight: the top two are too close to trust a single answer. */
function Ambiguous({ incident }: { incident: Incident }) {
  return (
    <div className="flex flex-col gap-2" data-testid="ambiguous">
      <div className="flex items-center gap-2 text-suspect">
        <CircleHelp size={20} aria-hidden />
        <span className="text-base font-medium">Ambiguous</span>
        <span className="ml-auto text-xs text-muted">Top 3</span>
      </div>
      <ul className="flex flex-col gap-2">
        {incident.origin.slice(0, 3).map((c) => {
          const Icon = KIND_ICON[c.type];
          return (
            <li key={c.id} className="flex flex-col gap-1" data-testid={`candidate-${c.id}`}>
              <div className="flex items-center gap-2 font-mono">
                <Icon size={14} className="text-suspect" aria-hidden />
                <span>{c.id}</span>
                <span className="text-xs text-muted">{c.type}</span>
                <span className="ml-auto">{pct(c.confidence)}</span>
              </div>
              <BreakdownBar c={c} />
            </li>
          );
        })}
      </ul>
      <BreakdownLegend />
    </div>
  );
}

function RankRow({ c, rank }: { c: OriginCandidate; rank: number }) {
  return (
    <li className="flex flex-col gap-1">
      <div className="flex font-mono text-xs text-muted">
        <span className="w-4">{rank}</span>
        <span>{c.id}</span>
        <span className="ml-auto">{pct(c.confidence)}</span>
      </div>
      <BreakdownBar c={c} />
    </li>
  );
}

export function OriginCard({ incident }: { incident: Incident }) {
  const [top, ...rest] = incident.origin;
  if (!top) return null;
  if (incident.ambiguous) return <Ambiguous incident={incident} />;
  const Icon = KIND_ICON[top.type];
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <Icon size={20} className="text-origin" aria-hidden />
        <div className="flex flex-col leading-tight">
          <span data-testid="origin-id" className="font-mono text-base font-medium text-origin">
            {top.id}
          </span>
          <span className="text-xs text-muted">{top.type}</span>
        </div>
        <span className="ml-auto font-mono text-lg" aria-label="Confidence">
          {pct(top.confidence)}
        </span>
      </div>
      <div className="h-1 overflow-hidden rounded-full bg-border" aria-hidden>
        <div
          className="h-full bg-origin"
          style={{ width: pct(top.confidence), transition: "width var(--motion-slow) linear" }}
        />
      </div>
      {top.breakdown && (
        <>
          <BreakdownBar c={top} />
          <BreakdownLegend />
        </>
      )}
      {rest.length > 0 && (
        <ul className="flex flex-col gap-1">
          {rest.slice(0, 2).map((c, i) => (
            <RankRow key={c.id} c={c} rank={i + 2} />
          ))}
        </ul>
      )}
    </div>
  );
}
