import { useEffect, useState } from "react";
import { parseRobustness, type Reliability, type RobustnessReport } from "../../lib/robustness";
const percent = (value: number | null) => value === null ? "—" : `${(value * 100).toFixed(0)}%`;
const seconds = (value: number | null) => value === null ? "—" : `${value.toFixed(1)}s`;
const score = (value: number | null) => value === null ? "—" : value.toFixed(3);

function ReliabilityTable({ title, value }: { title: string; value: Reliability }) {
  return <section className="min-w-0 rounded-lg border border-border p-3"><h3 className="text-sm font-semibold">{title}</h3><p className="mt-1 text-xs text-muted">{value.n} detected single-origin test cases · Brier {score(value.brier)} · ECE {score(value.ece)} · lower is better</p><div className="mt-3 overflow-x-auto"><table className="w-full text-left text-xs"><thead className="border-b border-border text-muted"><tr>{["Confidence bin", "Cases", "Mean confidence", "Top-1 accuracy"].map((h) => <th key={h} className="p-2">{h}</th>)}</tr></thead><tbody>{value.bins.map((bin) => <tr key={bin.lower} className="border-b border-border last:border-0"><td className="p-2">{percent(bin.lower)}–{percent(bin.upper)}</td><td className="p-2">{bin.n}</td><td className="p-2">{percent(bin.mean_confidence)}</td><td className="p-2">{percent(bin.accuracy)}</td></tr>)}</tbody></table></div><p className="mt-2 text-xs text-muted">Confidently wrong (≥80%): {value.confidently_wrong}. These scores concern matching the injected origin, not probability of malicious activity.</p></section>;
}

export function RobustnessPanel() {
  const [report, setReport] = useState<RobustnessReport | null>(null);
  const [state, setState] = useState("loading");
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    let alive = true;
    setState("loading");
    void fetch("/api/validation/robustness").then(async (response) => {
      if (response.status === 404) { if (alive) setState("missing"); return; }
      if (!response.ok) throw new Error("Unavailable");
      const data = parseRobustness(await response.json());
      if (!data) throw new Error("Invalid report");
      if (alive) { setReport(data); setState("ready"); }
    }).catch(() => { if (alive) setState("error"); });
    return () => { alive = false; };
  }, [revision]);
  return <section aria-label="SIM stress validation" className="rounded-lg border border-border bg-surface p-4">
    <div className="flex flex-wrap items-center justify-between gap-2"><div><h2 className="text-base font-semibold">SIM stress validation & confidence reliability</h2><p className="mt-1 text-xs text-muted">Separate from the standard detector benchmark and local Modbus layer checks.</p></div><div className="flex gap-3 text-xs"><a className="text-accent underline" href="/api/validation/robustness" target="_blank" rel="noreferrer">Report JSON ↗</a><button className="text-accent underline" onClick={() => setRevision((r) => r + 1)}>Refresh</button></div></div>
    {state === "loading" && <p className="mt-4 text-sm text-muted">Loading stress report…</p>}
    {state === "missing" && <p className="mt-4 text-sm text-muted">No stress report yet. Run the offline SIM robustness evaluation to populate this section.</p>}
    {state === "error" && <p role="alert" className="mt-4 text-sm text-suspect">Cannot load a valid stress report. Check the local backend and retry.</p>}
    {state === "ready" && report && <>
      <p className="mt-4 text-sm">{report.n_test_runs} held-out runs · {report.test_seeds.length} test seeds · {new Date(report.generated_at).toLocaleString()}</p>
      {!report.model_matches_current && <p role="status" className="mt-3 rounded border border-suspect/40 bg-suspect/10 p-3 text-sm text-suspect">This report describes a different or unavailable model snapshot. Re-run the evaluation before comparing it with the current detector.</p>}
      <p className="mt-1 text-xs text-muted">Calibration seeds: {report.calibration_seeds.join(", ")} · Test seeds: {report.test_seeds.join(", ")}. Calibration is diagnostic only; live rankings are unchanged.</p>
      <div className="mt-4 overflow-x-auto"><table className="w-full text-left text-sm"><thead className="border-b border-border text-xs text-muted"><tr>{["Scenario", "Runs", "Anomalies in event window", "Any alerts", "Top-1 any origin", "Top-3 all origins", "Origin recall @3", "Detection delay", "Localization delay"].map((h) => <th key={h} className="p-2">{h}</th>)}</tr></thead><tbody>{report.scenarios.map((s) => <tr key={s.scenario} className="border-b border-border last:border-0"><th className="p-2 font-medium">{s.scenario.replaceAll("_", " ")}<span className="mt-1 block text-xs font-normal text-muted">{s.group.replaceAll("_", " ")}</span></th><td className="p-2">{s.n}</td><td className="p-2">{s.detected}/{s.n}</td><td className="p-2">{s.alert_runs}/{s.n}</td><td className="p-2">{percent(s.top1_any)}</td><td className="p-2">{percent(s.top3_all)}</td><td className="p-2">{percent(s.top3_origin_recall)}</td><td className="p-2">{seconds(s.mean_detection_delay_s)}</td><td className="p-2">{seconds(s.mean_localization_delay_s)}</td></tr>)}</tbody></table></div>
      <p className="mt-3 text-xs text-muted">Missed attacks count as localization failures. Delays average detected cases only. For multiple origins, identifying any one origin differs from identifying all of them. Fault/change alerts identify abnormal behavior and do not establish malicious intent.</p>
      <div className="mt-5 grid gap-3 xl:grid-cols-2"><ReliabilityTable title="Raw ranking confidence" value={report.raw_reliability} />{report.calibrated_reliability && <ReliabilityTable title={`Exploratory calibration · fitted on ${report.calibration.n} separate detected cases`} value={report.calibrated_reliability} />}</div>
      {!report.calibration.available && <p className="mt-3 text-sm text-muted">Calibration not fitted: {report.calibration.reason ?? "Insufficient detected calibration cases."}</p>}
      {report.calibration_assessment?.status === "not_recommended" && <div role="status" className="mt-3 rounded border border-suspect/40 bg-suspect/10 p-3 text-sm text-suspect"><strong>Do not apply this calibration to live rankings.</strong><ul className="mt-2 list-disc pl-4">{report.calibration_assessment.reasons.map((reason) => <li key={reason}>{reason}</li>)}</ul></div>}
      <details className="mt-4 rounded border border-border p-3 text-sm"><summary className="cursor-pointer font-medium">Category confusion & study limits</summary><p className="mt-2 text-xs text-muted">Detected, nominal single-origin cases only; misses are counted in the scenario table.</p><ul className="mt-2 space-y-1 text-xs">{report.category_confusion.map((c) => <li key={`${c.expected}:${c.predicted}`}>Injected {c.expected} → ranked {c.predicted}: {c.n}</li>)}</ul><ul className="mt-3 list-disc space-y-1 pl-4 text-xs text-muted">{report.limits.map((limit) => <li key={limit}>{limit}</li>)}</ul></details>
    </>}
  </section>;
}
