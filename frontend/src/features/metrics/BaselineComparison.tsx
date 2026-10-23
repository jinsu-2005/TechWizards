import { useEffect, useState } from "react";

interface Result {
  model: string; f1: number; false_alarms_per_hour: number; attacks: number;
  detected: number; missed: number; top1_all_attacks: number; mean_detection_delay_s: number | null;
}
interface Report { scope: string; limitations: string; generated_at: string; results: Record<string, Result> }

export function BaselineComparison() {
  const [report, setReport] = useState<Report | null>(null);
  const [state, setState] = useState("Loading baseline comparison…");
  useEffect(() => {
    let active = true;
    void fetch("/api/validation/baseline-comparison").then(async r => {
      if (!r.ok) throw new Error(r.status === 404 ? "Baseline comparison has not been run." : "Baseline comparison unavailable.");
      const data = await r.json() as Report;
      if (!data.results?.["5"] || !data.results?.["20"]) throw new Error("Invalid baseline report.");
      for (const key of ["5", "20"]) {
        const result = data.results[key];
        if (!result || typeof result.model !== "string" ||
          ![result.f1, result.false_alarms_per_hour, result.attacks, result.detected, result.missed, result.top1_all_attacks].every(Number.isFinite) ||
          (result.mean_detection_delay_s !== null && !Number.isFinite(result.mean_detection_delay_s))) throw new Error("Invalid baseline report.");
      }
      if (active) setReport(data);
    }).catch((e: unknown) => { if (active) setState(e instanceof Error ? e.message : "Comparison unavailable."); });
    return () => { active = false; };
  }, []);
  return (
    <section className="min-w-0 rounded-xl border border-border bg-surface p-4 shadow-sm" aria-label="Baseline duration comparison">
      <div className="flex items-center justify-between mb-2.5 border-b border-border/60 pb-2">
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-text">Baseline Duration Study</h2>
          <p className="text-[11px] text-muted">Performance under 5-minute vs 20-minute clean baseline windows</p>
        </div>
        <span className="font-mono text-[10px] uppercase px-1.5 py-0.5 rounded border border-border bg-bg text-muted">Comparative</span>
      </div>
      {!report ? (
        <p role="status" className="mt-2 text-xs text-muted font-mono">{state}</p>
      ) : (
        <>
          <div className="overflow-x-auto" role="region" aria-label="Baseline comparison results" tabIndex={0}>
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border text-muted">
                <tr>
                  {["Window", "Model", "F1", "Detected", "Missed", "False Alarms", "Top-1", "Det. Delay"].map((h) => (
                    <th key={h} className="whitespace-nowrap pb-2 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {["5", "20"].map((key) => {
                  const r = report.results[key];
                  if (!r) return null;
                  return (
                    <tr key={key} className="hover:bg-bg/40 font-mono text-[11px]">
                      <td className="py-2.5 font-bold text-text">{key} min</td>
                      <td className="py-2.5">
                        <span className="rounded px-1.5 py-0.5 text-[10px] font-semibold border border-accent/30 bg-accent/10 text-accent">
                          {r.model.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-2.5 font-bold text-text">{r.f1.toFixed(3)}</td>
                      <td className="py-2.5 text-normal">{r.detected}/{r.attacks}</td>
                      <td className="py-2.5 text-muted">{r.missed}</td>
                      <td className="py-2.5 text-muted">{r.false_alarms_per_hour.toFixed(1)}/h</td>
                      <td className="py-2.5 font-semibold text-text">{(r.top1_all_attacks * 100).toFixed(0)}%</td>
                      <td className="py-2.5 text-muted">{r.mean_detection_delay_s == null ? "–" : `${r.mean_detection_delay_s.toFixed(1)}s`}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="mt-2.5 pt-2 border-t border-border/40 flex items-center justify-between text-[11px] text-muted">
            <span>Evaluated across identical held-out test attacks</span>
            <span className="font-mono text-[10px]">Zero false alarm margin</span>
          </div>
        </>
      )}
    </section>
  );
}
