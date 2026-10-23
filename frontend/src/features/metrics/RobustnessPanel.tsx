import { useEffect, useState } from "react";
import { parseRobustness, type Reliability, type RobustnessReport } from "../../lib/robustness";
import { ShieldCheck, ExternalLink, RefreshCw } from "lucide-react";

const percent = (value: number | null) => (value === null ? "—" : `${(value * 100).toFixed(0)}%`);
const seconds = (value: number | null) => (value === null ? "—" : `${value.toFixed(1)}s`);
const score = (value: number | null) => (value === null ? "—" : value.toFixed(3));

function ReliabilityTable({ title, value }: { title: string; value: Reliability }) {
  return (
    <section className="min-w-0 rounded-lg border border-border/70 bg-bg/60 p-3">
      <div className="flex items-center justify-between mb-1.5">
        <h3 className="text-xs font-bold text-text">{title}</h3>
        <span className="font-mono text-[10.5px] text-muted">
          Brier {score(value.brier)} · ECE {score(value.ece)}
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead className="border-b border-border text-muted text-[10.5px]">
            <tr>
              {["Bin", "Cases", "Mean Conf.", "Top-1 Acc."].map((h) => (
                <th key={h} className="pb-1.5 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50 text-[11px]">
            {value.bins.map((bin) => (
              <tr key={bin.lower} className="hover:bg-surface/50">
                <td className="py-1 text-muted">{percent(bin.lower)}–{percent(bin.upper)}</td>
                <td className="py-1 text-text">{bin.n}</td>
                <td className="py-1 text-muted">{percent(bin.mean_confidence)}</td>
                <td className="py-1 font-semibold text-text">{percent(bin.accuracy)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function RobustnessPanel() {
  const [report, setReport] = useState<RobustnessReport | null>(null);
  const [state, setState] = useState("loading");
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    let alive = true;
    setState("loading");
    void fetch("/api/validation/robustness")
      .then(async (response) => {
        if (response.status === 404) {
          if (alive) setState("missing");
          return;
        }
        if (!response.ok) throw new Error("Unavailable");
        const data = parseRobustness(await response.json());
        if (!data) throw new Error("Invalid report");
        if (alive) {
          setReport(data);
          setState("ready");
        }
      })
      .catch(() => {
        if (alive) setState("error");
      });
    return () => {
      alive = false;
    };
  }, [revision]);

  return (
    <section aria-label="SIM stress validation" className="min-w-0 rounded-xl border border-border bg-surface p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-2.5 mb-3">
        <div className="flex items-center gap-2">
          <ShieldCheck size={16} className="text-accent" />
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-text">SIM Stress Validation &amp; Reliability</h2>
            <p className="text-[11px] text-muted">Held-out attack runs, detection delays, and confidence calibration</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <a
            className="inline-flex items-center gap-1 font-mono text-[11px] text-muted hover:text-accent"
            href="/api/validation/robustness"
            target="_blank"
            rel="noreferrer"
          >
            JSON <ExternalLink size={10} />
          </a>
          <button
            onClick={() => setRevision((r) => r + 1)}
            aria-label="Refresh stress data"
            className="p-1 text-muted hover:text-text rounded hover:bg-bg"
            title="Refresh stress data"
          >
            <RefreshCw size={12} />
          </button>
        </div>
      </div>

      {state === "loading" && <p className="text-xs font-mono text-muted">Loading stress evaluation…</p>}
      {state === "missing" && <p className="text-xs text-muted">No stress report generated yet.</p>}
      {state === "error" && <p role="alert" className="text-xs text-suspect">Cannot load stress validation report.</p>}

      {state === "ready" && report && (
        <>
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="rounded px-2 py-0.5 font-mono text-[10.5px] font-semibold border border-accent/30 bg-accent/10 text-accent">
              {report.n_test_runs} Test Runs
            </span>
            <span className="rounded px-2 py-0.5 font-mono text-[10.5px] text-muted border border-border bg-bg">
              {report.test_seeds.length} Random Seeds
            </span>
            <span className="rounded px-2 py-0.5 font-mono text-[10.5px] text-muted border border-border bg-bg">
              {new Date(report.generated_at).toLocaleDateString()}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border text-muted text-[11px]">
                <tr>
                  {["Scenario", "Runs", "Detected", "Alerts", "Top-1", "Top-3", "Recall@3", "Det. Delay", "Loc. Delay"].map((h) => (
                    <th key={h} className="pb-2 font-medium whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 font-mono text-[11px]">
                {report.scenarios.map((s) => (
                  <tr key={s.scenario} className="hover:bg-bg/40">
                    <td className="py-2 font-sans font-semibold text-text whitespace-nowrap">
                      {s.scenario.replaceAll("_", " ")}
                      <span className="block text-[10px] font-normal text-muted uppercase">{s.group.replaceAll("_", " ")}</span>
                    </td>
                    <td className="py-2 text-muted">{s.n}</td>
                    <td className="py-2 text-normal font-semibold">{s.detected}/{s.n}</td>
                    <td className="py-2 text-muted">{s.alert_runs}/{s.n}</td>
                    <td className="py-2 font-bold text-text">{percent(s.top1_any)}</td>
                    <td className="py-2 text-text">{percent(s.top3_all)}</td>
                    <td className="py-2 text-accent font-semibold">{percent(s.top3_origin_recall)}</td>
                    <td className="py-2 text-muted">{seconds(s.mean_detection_delay_s)}</td>
                    <td className="py-2 text-muted">{seconds(s.mean_localization_delay_s)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            <ReliabilityTable title="Raw Ranking Confidence" value={report.raw_reliability} />
            {report.calibrated_reliability && (
              <ReliabilityTable title="Diagnostic Calibration" value={report.calibrated_reliability} />
            )}
          </div>
        </>
      )}
    </section>
  );
}
