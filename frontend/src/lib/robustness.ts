export interface Reliability {
  n: number; brier: number | null; ece: number | null; confidently_wrong: number;
  bins: { lower: number; upper: number; n: number; mean_confidence: number; accuracy: number }[];
}
export interface RobustnessReport {
  schema_version: number; generated_at: string; mode: string; scope: string; n_test_runs: number;
  calibration_seeds: number[]; test_seeds: number[];
  calibration: { available: boolean; n: number; scope?: string; applied_to_live_ranking?: boolean; reason?: string };
  calibration_assessment?: { status: string; reasons: string[] };
  model_matches_current: boolean;
  raw_reliability: Reliability; calibrated_reliability: Reliability | null;
  scenarios: { scenario: string; group: string; n: number; detected: number; alert_runs: number; top1_any: number | null; top3_all: number | null; top3_origin_recall: number | null; mean_detection_delay_s: number | null; mean_localization_delay_s: number | null }[];
  category_confusion: { expected: string; predicted: string; n: number }[]; limits: string[];
}

const object = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null && !Array.isArray(value);
const finite = (value: unknown): value is number => typeof value === "number" && Number.isFinite(value);
const nullable = (value: unknown) => value === null || finite(value);
const numbers = (value: unknown): value is number[] => Array.isArray(value) && value.every(finite);
const strings = (value: unknown): value is string[] => Array.isArray(value) && value.every((v) => typeof v === "string");
function reliability(value: unknown): value is Reliability {
  return object(value) && finite(value.n) && finite(value.confidently_wrong) && nullable(value.brier) && nullable(value.ece)
    && Array.isArray(value.bins) && value.bins.every((b) => object(b) && [b.lower, b.upper, b.n, b.mean_confidence, b.accuracy].every(finite));
}
function validReport(value: unknown): value is RobustnessReport {
  if (!object(value) || value.schema_version !== 1 || value.mode !== "sim" || typeof value.scope !== "string"
    || typeof value.generated_at !== "string" || !Number.isFinite(Date.parse(value.generated_at)) || !finite(value.n_test_runs)
    || !numbers(value.calibration_seeds) || !numbers(value.test_seeds) || typeof value.model_matches_current !== "boolean"
    || !object(value.calibration) || typeof value.calibration.available !== "boolean" || !finite(value.calibration.n)
    || (value.calibration.reason !== undefined && typeof value.calibration.reason !== "string")
    || !reliability(value.raw_reliability) || !(value.calibrated_reliability === null || reliability(value.calibrated_reliability))
    || !strings(value.limits)) return false;
  if (!Array.isArray(value.scenarios) || !value.scenarios.every((s) => object(s) && typeof s.scenario === "string" && typeof s.group === "string"
    && [s.n, s.detected, s.alert_runs].every(finite) && [s.top1_any, s.top3_all, s.top3_origin_recall, s.mean_detection_delay_s, s.mean_localization_delay_s].every(nullable))) return false;
  if (!Array.isArray(value.category_confusion) || !value.category_confusion.every((c) => object(c) && typeof c.expected === "string" && typeof c.predicted === "string" && finite(c.n))) return false;
  if (value.calibration_assessment !== undefined && (!object(value.calibration_assessment) || typeof value.calibration_assessment.status !== "string" || !strings(value.calibration_assessment.reasons))) return false;
  return true;
}
export const parseRobustness = (value: unknown): RobustnessReport | null => validReport(value) ? value : null;
