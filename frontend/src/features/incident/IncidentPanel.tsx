import { Eye, FileDown, ShieldAlert, ShieldCheck, WifiOff, Wrench } from "lucide-react";
import { useState } from "react";
import { EmptyState } from "../../components/ui/EmptyState";
import { Panel } from "../../components/ui/Panel";
import { reportUrl } from "../../lib/api";
import type { Incident } from "../../lib/types";
import { selectView, useLive } from "../../store/live";
import { ImpactMeters } from "./ImpactMeters";
import { IsolateButton } from "./IsolateButton";
import { PathChips } from "./PathChips";
import { OriginCard } from "./OriginCard";

function Section({ children }: { children: React.ReactNode }) {
  return <div className="border-b border-border p-2 last:border-b-0">{children}</div>;
}

function Reveal({ incident }: { incident: Incident }) {
  const [shown, setShown] = useState(false);
  const truth = incident.ground_truth;
  if (!truth) return null;
  const hit = incident.origin[0]?.id === truth.target;
  return (
    <button
      type="button"
      onClick={() => setShown((s) => !s)}
      className="flex w-full items-center gap-1 text-left text-xs text-muted hover:text-text"
    >
      <Eye size={12} aria-hidden />
      {shown ? (
        <span className="font-mono">
          {truth.attack_id} · {truth.target} · {truth.scenario} ·{" "}
          <span className={hit ? "text-normal" : "text-origin"}>{hit ? "hit" : "miss"}</span>
        </span>
      ) : (
        <span>Reveal</span>
      )}
    </button>
  );
}

function Details({ incident }: { incident: Incident }) {
  return (
    <>
      <Section>
        <div className="mb-1 flex items-center gap-1 text-xs text-muted">
          <ShieldAlert size={12} className="text-origin" aria-hidden />
          <span className="font-mono">{incident.id}</span>
          <span className="rounded-full border border-border px-1">{incident.status}</span>
          {incident.mitre && (
            <span
              className="ml-auto rounded border border-accent px-1 font-mono text-accent"
              title={incident.mitre_name}
            >
              {incident.mitre}
            </span>
          )}
          <a
            href={reportUrl(incident.id)}
            download
            aria-label="Report"
            title="Report (PDF)"
            className={`${incident.mitre ? "" : "ml-auto "}flex h-6 w-6 items-center justify-center rounded border border-border text-muted transition-colors duration-150 hover:text-text`}
          >
            <FileDown size={14} aria-hidden />
          </a>
        </div>
        <OriginCard incident={incident} />
      </Section>
      <Section>
        <PathChips incident={incident} />
      </Section>
      <Section>
        <p className="font-mono text-xs leading-snug">{incident.explanation}</p>
        <p className="mt-1 flex items-center gap-1 text-xs text-affected">
          <Wrench size={12} aria-hidden />
          <span className="font-mono">{incident.action}</span>
        </p>
        <div className="mt-2">
          <IsolateButton incident={incident} />
        </div>
      </Section>
      <Section>
        <Reveal incident={incident} />
      </Section>
    </>
  );
}

export function IncidentPanel() {
  const conn = useLive((s) => s.conn);
  const latest = useLive(selectView);
  const hasStream = useLive((s) => s.latest !== null);
  const live = (conn === "live" || hasStream) && latest !== null;
  const incident = latest?.incident ?? null;
  const active = incident !== null && incident.status !== "closed";
  return (
    <Panel title="Incident" icon={active ? ShieldAlert : ShieldCheck}>
      {!live ? (
        <EmptyState icon={WifiOff} text="No signal" />
      ) : (
        <div className="flex h-full flex-col overflow-y-auto">
          {active ? (
            <Details incident={incident} />
          ) : (
            <div className="h-28 border-b border-border">
              <EmptyState icon={ShieldCheck} text="No incident" />
            </div>
          )}
          <Section>
            <ImpactMeters impact={latest.impact} />
          </Section>
        </div>
      )}
    </Panel>
  );
}
