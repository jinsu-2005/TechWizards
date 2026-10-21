import { Eye, FileDown, ShieldAlert, ShieldCheck, Sparkles, WifiOff, Wrench } from "lucide-react";
import { useFreshness } from "../../app/useFreshness";
import { useState } from "react";
import { useUi } from "../../store/ui";
import { EmptyState } from "../../components/ui/EmptyState";
import { Panel } from "../../components/ui/Panel";
import { reportUrl } from "../../lib/api";
import { formatValue } from "../../lib/format";
import type { Incident, LiveMessage } from "../../lib/types";
import { selectView, useLive } from "../../store/live";
import { ImpactMeters } from "./ImpactMeters";
import { IsolateButton } from "./IsolateButton";
import { PathChips } from "./PathChips";
import { OriginCard } from "./OriginCard";

function Section({ children }: { children: React.ReactNode }) {
  return <div className="border-b border-border p-3 last:border-b-0">{children}</div>;
}

export function PlantIntegrityGuard({ latest, stale, calibrating = false }: { latest: LiveMessage; stale: boolean; calibrating?: boolean }) {
  const nodes = latest.nodes;
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const normal = nodes.filter((n) => n.status === "normal").length;
  const virtual = nodes.some((n) => n.is_virtual);
  const label = calibrating ? "Detection unavailable" : stale ? "Last received overview" : latest.alert ? "Anomalies under review" : "No active incident";
  const reading = (id: string) => {
    const value = byId.get(id)?.value;
    return value === undefined ? "–" : formatValue(id, value);
  };
  const readings = latest.mode === "hai"
    ? ["P1_LIT01", "P1_FT01", "P1_PIT01", "P3_LT01"].filter((id) => byId.has(id)).map((id) => [id, reading(id)])
    : [["Inflow · FIT201", reading("FIT201")], ["Pump · P101", reading("P101")], ["Tank 1 · LIT101", reading("LIT101")], ["Tank 2 · LIT301", reading("LIT301")]];
  return (
    <div className="flex flex-col gap-3 border-b border-border p-3">
      <div className="rounded-lg border border-border bg-bg/50 p-3">
        <div className="flex items-center gap-2 text-sm font-semibold">
          {calibrating ? <ShieldAlert size={16} className="text-muted" aria-hidden /> : <ShieldCheck size={16} className={stale || latest.alert ? "text-suspect" : "text-normal"} aria-hidden />}
          <span>{label}</span>
        </div>
        {calibrating ? <p className="mt-3 text-xs leading-relaxed text-muted">Baseline calibration is in progress. These are unscored process readings; no normal-range assessment is available yet.</p> : <div className="mt-3 flex items-center justify-between gap-2 text-xs text-muted">
          <span>Nodes in normal range</span>
          <span className="font-mono text-sm text-text">{normal} / {nodes.length}</span>
        </div>}
      </div>
      <div>
        <p className="mb-2 text-xs font-medium text-muted">{latest.mode === "hai" ? "HAI reference readings" : "Reported process readings"}</p>
        <div className="grid grid-cols-2 gap-2">
          {readings.map(([name, value]) => (
            <div key={name} className="rounded-md border border-border bg-bg/50 p-2.5">
              <span className="block text-xs text-muted">{name}</span>
              <span className="mt-1 block font-mono text-sm font-semibold">{value}</span>
            </div>
          ))}
        </div>
      </div>
      {latest.mode !== "hai" && !calibrating && <div className="flex items-center justify-between gap-2 text-xs">
        <span className="text-muted">Virtual sensor fallback</span>
        <span className={virtual ? "text-suspect" : "text-muted"}>{virtual ? "Active" : "Inactive"}</span>
      </div>}
      {latest.mode === "hai" && <div className="rounded-lg border border-border bg-bg/30 p-3 text-xs"><p className="mb-2 font-medium text-muted">Model status · recorded tags</p><div className="grid grid-cols-2 gap-2">{(["normal", "suspect", "affected", "origin"] as const).map((status) => <div key={status} className="flex items-center justify-between gap-2"><span className="capitalize" style={{ color: `var(--${status})` }}>{status}</span><span className="font-mono">{nodes.filter((n) => n.status === status).length}</span></div>)}</div><p className="mt-3 leading-relaxed text-muted">Flags are detector estimates. Recorded telemetry alone does not verify the attacked component.</p></div>}
    </div>
  );
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
        <div className="mb-1.5 flex items-center gap-1.5 text-xs text-muted">
          <ShieldAlert size={14} className="text-origin shrink-0" aria-hidden />
          <span title={incident.id} className="min-w-0 flex-1 truncate font-mono text-[11px] font-semibold text-text">{incident.id}</span>
          <span className="rounded-full border border-origin/40 bg-origin/10 px-1.5 py-0.2 text-[10px] font-mono text-origin uppercase">
            {incident.status}
          </span>
          {incident.mitre && (
            <span
              className="ml-auto rounded border border-accent/60 bg-accent/10 px-1.5 py-0.2 font-mono text-[10px] text-accent font-semibold"
              title={incident.mitre_name}
            >
              {incident.mitre}
            </span>
          )}
          <a
            href={reportUrl(incident.id)}
            download
            aria-label="Report"
            title="Download Forensic PDF Report"
            className={`${incident.mitre ? "" : "ml-auto "}flex h-6 w-6 items-center justify-center rounded border border-border text-muted transition-colors duration-150 hover:bg-border/40 hover:text-text`}
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
        {incident.virtual_active && (
          <div className="mt-2 flex items-center gap-1.5 rounded bg-cyan-950/40 border border-cyan-800/60 px-2 py-1 text-xs text-cyan-400">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span className="font-mono text-[11px] font-medium">Virtual Sensor Self-Healing Active</span>
          </div>
        )}
        <div className="mt-2 flex items-center gap-2">
          <div className="flex-1">
            <IsolateButton incident={incident} />
          </div>
          <button
            type="button"
            onClick={() => useUi.getState().setCopilotOpen(true)}
            aria-label="Ask AI Pilot"
            title="Ask AI Pilot for root-cause guidance and recovery SOP"
            className="flex h-8.5 items-center gap-1.5 rounded-md border border-accent/60 bg-accent/15 px-3 text-xs font-semibold text-accent shadow-xs transition-all hover:bg-accent/25 hover:border-accent active:scale-[0.98]"
          >
            <Sparkles size={13} aria-hidden />
            <span>AI Pilot</span>
          </button>
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
  const { stale } = useFreshness();
  const latest = useLive(selectView);
  const calibrating = useLive((s) => s.latest?.mode === "live" && (s.status?.source?.calibration != null || s.status?.source?.state === "calibrating"));
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
            <PlantIntegrityGuard latest={latest} stale={stale} calibrating={calibrating} />
          )}
          {latest.impact && <Section><ImpactMeters impact={latest.impact} /></Section>}
        </div>
      )}
    </Panel>
  );
}
