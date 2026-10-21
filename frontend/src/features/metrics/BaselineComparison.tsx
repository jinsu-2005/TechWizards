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
  return <section className="min-w-0 rounded-lg border border-border bg-surface p-4" aria-label="Baseline duration comparison">
    <h2 className="font-semibold">Five- vs twenty-minute baseline</h2>
    {!report ? <p role="status" className="mt-2 text-sm text-muted">{state}</p> : <>
      <p className="mt-2 text-sm text-muted">{report.scope}</p>
      <div className="mt-3 overflow-x-auto" role="region" aria-label="Baseline comparison results" tabIndex={0}><table className="w-full text-left text-sm"><thead className="border-b border-border text-xs text-muted"><tr>{["Baseline", "Model", "F1", "Detected", "Missed", "False alarms/h", "Top-1 all attacks", "Detection delay"].map(h => <th key={h} className="whitespace-nowrap p-2">{h}</th>)}</tr></thead><tbody>{["5", "20"].map(key => {
        const r = report.results[key]; if (!r) return null;
        return <tr key={key} className="border-b border-border"><th className="p-2">{key} min</th><td className="p-2 uppercase">{r.model}</td><td className="p-2">{r.f1.toFixed(3)}</td><td className="p-2">{r.detected}/{r.attacks}</td><td className="p-2">{r.missed}</td><td className="p-2">{r.false_alarms_per_hour.toFixed(1)}</td><td className="p-2">{(r.top1_all_attacks * 100).toFixed(0)}%</td><td className="p-2">{r.mean_detection_delay_s == null ? "Unavailable" : `${r.mean_detection_delay_s.toFixed(1)}s`}</td></tr>;
      })}</tbody></table></div>
      <p className="mt-3 text-xs leading-relaxed text-muted">{report.limitations} Delay averages detected cases only; misses remain in the attack denominator. Zero observed false alarms does not establish a zero underlying rate.</p>
    </>}
  </section>;
}
