import type { BarRow } from "../../lib/metrics";

// ECharts needs concrete colours; these mirror styles/tokens.css.
const C = { text: "#e6edf3", muted: "#7d8590", border: "#1e2733", accent: "#4c8dff" };

/** Grouped bars: baseline vs AttackTrace, one group per row. */
export function chartOption(rows: readonly BarRow[]) {
  const label = { color: C.muted, fontFamily: "JetBrains Mono, monospace", fontSize: 11 };
  return {
    animationDuration: 300,
    backgroundColor: "transparent",
    textStyle: { fontFamily: "Inter, system-ui, sans-serif" },
    grid: { left: 36, right: 8, top: 32, bottom: 24 },
    legend: { top: 0, right: 0, textStyle: { color: C.text }, icon: "roundRect", itemWidth: 10, itemHeight: 10 },
    tooltip: {
      trigger: "axis" as const,
      axisPointer: { type: "shadow" as const },
      backgroundColor: "#121821",
      borderColor: C.border,
      textStyle: { color: C.text, fontFamily: "JetBrains Mono, monospace", fontSize: 12 },
      valueFormatter: (v: unknown) => (typeof v === "number" ? v.toFixed(2) : String(v)),
    },
    xAxis: {
      type: "category" as const,
      data: rows.map((r) => r.label),
      axisLine: { lineStyle: { color: C.border } },
      axisTick: { show: false },
      axisLabel: label,
    },
    yAxis: {
      type: "value" as const,
      min: 0,
      max: 1,
      interval: 0.25,
      splitLine: { lineStyle: { color: C.border } },
      axisLabel: label,
    },
    series: [
      { name: "Baseline", type: "bar" as const, data: rows.map((r) => r.baseline), itemStyle: { color: C.muted, borderRadius: [3, 3, 0, 0] }, barMaxWidth: 28 },
      { name: "AttackTrace", type: "bar" as const, data: rows.map((r) => r.attacktrace), itemStyle: { color: C.accent, borderRadius: [3, 3, 0, 0] }, barMaxWidth: 28 },
    ],
  };
}
