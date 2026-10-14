import { ArrowLeft, FileX, LoaderCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { EmptyState } from "../../components/ui/EmptyState";
import {
  f1Rows,
  parseMetrics,
  pct,
  type HaiMetrics,
  type LiveEvalMetrics,
  type Metrics,
} from "../../lib/metrics";
import { MetricsChart } from "./MetricsChart";

type Load = { state: "loading" } | { state: "missing" } | { state: "ready"; metrics: Metrics };

function Card({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="flex flex-col gap-1 rounded border border-border bg-surface p-3">
      <span className="text-xs uppercase tracking-wide text-muted">{label}</span>
      <span className="font-mono text-2xl font-medium">{value}</span>
      <span className="h-4 font-mono text-xs text-muted">{sub ?? ""}</span>
    </div>
  );
}

function Cards({ m }: { m: Metrics }) {
  const { attacktrace: a, baseline: b } = m.detection;
  const loc = m.localization;
  const ttl = loc.mean_time_to_localize_s;
  const iso = m.isolation?.isolate_top1;
  const amb = m.ambiguity;
  return (
    <div className={`grid gap-2 ${iso && amb ? "grid-cols-7" : "grid-cols-5"}`}>
      <Card label="F1" value={a.f1.toFixed(2)} sub={`Baseline ${b.f1.toFixed(2)}`} />
      <Card label="Top-1" value={pct(loc.top1)} sub={loc.baseline ? `Baseline ${pct(loc.baseline.top1)}` : undefined} />
      <Card label="Top-3" value={pct(loc.top3)} sub={loc.baseline ? `Baseline ${pct(loc.baseline.top3)}` : undefined} />
      <Card label="Time to localize" value={ttl === null ? "–" : `${ttl.toFixed(1)} s`} />
      <Card
        label="False alarms"
        value={`${a.false_alarm_per_hour.toFixed(1)} /h`}
        sub={`Baseline ${b.false_alarm_per_hour.toFixed(1)} /h`}
      />
      {iso && <Card label="Contained" value={pct(iso.success_rate)} sub={`${iso.contained} of ${iso.n} isolated`} />}
      {amb && <Card label="Ambiguous" value={pct(amb.ambiguous_rate)} sub={`${amb.n_ambiguous} of ${amb.n_incidents} incidents`} />}
    </div>
  );
}

function HaiCards({ h }: { h: HaiMetrics }) {
  const { attacktrace: a, baseline: b, localization: l } = h;
  const maj = l.majority_process;
  return (
    <section aria-label="HAI results" className="mt-2 flex flex-col gap-2">
      <h2 className="font-mono text-xs uppercase tracking-wide text-muted">
        HAI · {h.files.join(", ")} · {h.active_model}
      </h2>
      <div className="grid grid-cols-5 gap-2">
        <Card label="F1" value={a.f1.toFixed(2)} sub={`Adjusted ${a.f1_point_adjusted.toFixed(2)} · Baseline ${b.f1.toFixed(2)}`} />
        <Card
          label="Attacks detected"
          value={pct(a.windows_detected)}
          sub={`${Math.round(a.windows_detected * a.n_windows)} of ${a.n_windows}`}
        />
        <Card
          label="False alarms"
          value={`${a.false_alarm_per_hour.toFixed(2)} /h`}
          sub={`Baseline ${b.false_alarm_per_hour.toFixed(2)} /h`}
        />
        <Card label="Process Top-1" value={pct(l.process_top1)} sub={`Always ${maj} ${pct(l.always_majority_process)}`} />
        <Card
          label="Top-1 if detected"
          value={l.process_top1_given_detected === null ? "–" : pct(l.process_top1_given_detected)}
          sub={
            l.always_majority_given_detected === null
              ? undefined
              : `Always ${maj} ${pct(l.always_majority_given_detected)}`
          }
        />
      </div>
    </section>
  );
}

function formatUptime(s: number | null): string {
  if (s === null) return "–";
  const m = s / 60;
  return m < 60 ? `${m.toFixed(0)} min` : `${(m / 60).toFixed(1)} h`;
}

function LiveCards({ l }: { l: LiveEvalMetrics }) {
  return (
    <section aria-label="Live results" className="mt-2 flex flex-col gap-2">
      <h2 className="font-mono text-xs uppercase tracking-wide text-muted">
        Live · {l.n_attacks} attacks · {l.n_clean_runs} clean runs
      </h2>
      <div className="grid grid-cols-5 gap-2">
        <Card label="F1" value={l.detection.f1.toFixed(2)} sub={`P ${l.detection.precision.toFixed(2)} · R ${l.detection.recall.toFixed(2)}`} />
        <Card label="Top-1 / Top-3" value={`${pct(l.localization.top1)} / ${pct(l.localization.top3)}`} />
        <Card label="Latency" value={`${l.latency_ms.p50.toFixed(0)} ms`} sub={`p95 ${l.latency_ms.p95.toFixed(0)} ms`} />
        <Card label="Samples/s" value={l.samples_per_s.toFixed(0)} sub={`${l.dropped} dropped`} />
        <Card label="False alarms" value={`${l.detection.false_alarm_per_hour.toFixed(2)} /h`} sub={`Uptime ${formatUptime(l.uptime_s)}`} />
      </div>
    </section>
  );
}

export function MetricsPage() {
  const [load, setLoad] = useState<Load>({ state: "loading" });

  useEffect(() => {
    let live = true;
    fetch("/api/metrics")
      .then((r) => (r.ok ? r.json() : null))
      .then((raw: unknown) => {
        if (!live) return;
        const metrics = parseMetrics(raw);
        setLoad(metrics ? { state: "ready", metrics } : { state: "missing" });
      })
      .catch(() => live && setLoad({ state: "missing" }));
    return () => {
      live = false;
    };
  }, []);

  const rows = useMemo(() => (load.state === "ready" ? f1Rows(load.metrics) : []), [load]);

  return (
    <div className="flex h-full min-w-[1280px] flex-col gap-1 p-1">
      <header className="flex h-12 shrink-0 items-center gap-3 border-b border-border px-2">
        <a href="/" className="flex items-center gap-1 text-xs text-muted transition-colors duration-150 hover:text-text">
          <ArrowLeft size={14} aria-hidden />
          Dashboard
        </a>
        <h1 className="text-sm font-semibold tracking-tight">Metrics</h1>
      </header>
      <main className="flex min-h-0 flex-1 flex-col gap-2 p-1">
        {load.state === "loading" && <EmptyState icon={LoaderCircle} text="Loading" />}
        {load.state === "missing" && <EmptyState icon={FileX} text="Run make eval" />}
        {load.state === "ready" && (
          <>
            <Cards m={load.metrics} />
            {load.metrics.hai && <HaiCards h={load.metrics.hai} />}
            {load.metrics.live && <LiveCards l={load.metrics.live} />}
            <section aria-label="F1 by scenario" className="min-h-0 flex-1 rounded border border-border bg-surface p-3">
              <MetricsChart rows={rows} />
            </section>
          </>
        )}
      </main>
    </div>
  );
}
