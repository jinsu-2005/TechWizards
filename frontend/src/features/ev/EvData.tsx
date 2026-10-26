import { useState } from "react";
import { ChevronRight, Cpu, X } from "lucide-react";
import { navigate } from "../../lib/navigation";
import { componentStatus, formatReading, getReading, type ComponentKind, type Frame, type Snapshot } from "./model";
import { useEv } from "./store";

const SIGNALS = [{ id: "TEMP", title: "Pack temperature" }, { id: "COOL", title: "Pump request vs feedback" }, { id: "CAN", title: "Gateway latency" }, { id: "VCU", title: "Torque request" }];

function Chart({ snapshot, frame, id, title }: { snapshot: Snapshot; frame: Frame; id: string; title: string }) {
  const history = snapshot.history.filter((h) => h.time_s <= frame.time_s);
  const values = history.map((h) => getReading(h, id)).filter((r) => r !== undefined);
  const current = getReading(frame, id);
  const min = Math.min(0, ...values.flatMap((v) => [v.value, v.expected]));
  const max = Math.max(1, ...values.flatMap((v) => [v.value, v.expected]));
  const point = (value: number, i: number) => `${i / Math.max(1, values.length - 1) * 600},${130 - (value - min) / (max - min || 1) * 115}`;
  return <div className="evs-chart">
    <div><span>{title}</span><strong>{current?.value.toFixed(1)} <small>{current?.unit}</small></strong></div>
    {values.length < 2 ? <p role="status">Collecting samples…</p> : <svg viewBox="0 0 600 145" role="img" aria-label={`${title}: measured ${current?.value.toFixed(1)}, reference ${current?.expected.toFixed(1)} ${current?.unit}`}>
      <path d="M0 35H600M0 70H600M0 105H600" fill="none" stroke="var(--border)" />
      <polyline points={values.map((v, i) => point(v.expected, i)).join(" ")} fill="none" stroke="var(--muted)" strokeWidth="1.5" strokeDasharray="5 4" />
      <polyline points={values.map((v, i) => point(v.value, i)).join(" ")} fill="none" stroke="var(--sig-b)" strokeWidth="2.5" />
    </svg>}
  </div>;
}

export function EvData({ snapshot, frame }: { snapshot: Snapshot; frame: Frame }) {
  const ev = useEv();
  const [tab, setTab] = useState<"parts" | "signals">("parts");
  const [kind, setKind] = useState<ComponentKind | "All">("All");
  const [search, setSearch] = useState("");
  const filtered = snapshot.components.filter((c) => (kind === "All" || c.kind === kind) && `${c.id} ${c.name} ${c.system}`.toLowerCase().includes(search.toLowerCase()));
  return <aside className="evs-drawer evs-drawer-right" aria-label="Vehicle data">
    <header><div className="evs-tabs" role="tablist"><button role="tab" aria-selected={tab === "parts"} onClick={() => setTab("parts")}>Parts</button><button role="tab" aria-selected={tab === "signals"} onClick={() => setTab("signals")}>Signals</button></div><button className="evs-x" aria-label="Close" onClick={() => navigate("/ev")}><X size={16} aria-hidden /></button></header>
    {tab === "parts" ? <>
      <div className="evs-filters">
        <input aria-label="Search components" placeholder="Search parts" value={search} onChange={(e) => setSearch(e.target.value)} />
        <select aria-label="Component type" value={kind} onChange={(e) => setKind(e.target.value as ComponentKind | "All")}>{["All", "Sensor", "Actuator", "Controller"].map((k) => <option key={k}>{k}</option>)}</select>
      </div>
      <div className="evs-parts">
        {filtered.map((c) => <button key={c.id} aria-pressed={c.id === ev.selected} data-state={componentStatus(frame, c.id)} onClick={() => { ev.select(c.id); navigate("/ev"); }}>
          <Cpu size={16} aria-hidden /><span><strong>{c.name}</strong><small>{c.id} · {c.kind}</small></span><em>{formatReading(getReading(frame, c.id))}</em><ChevronRight size={14} aria-hidden />
        </button>)}
        {filtered.length === 0 && <p role="status">No matching parts.</p>}
      </div>
    </> : <div className="evs-charts">{SIGNALS.map((s) => <Chart key={s.id} snapshot={snapshot} frame={frame} {...s} />)}</div>}
  </aside>;
}
