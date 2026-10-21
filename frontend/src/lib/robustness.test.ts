import { describe, expect, it } from "vitest";
import { parseRobustness } from "./robustness";

function fixture() {
  return { schema_version: 1, mode: "sim", scope: "Offline stress study", generated_at: "2026-10-15T10:00:00Z", n_test_runs: 0,
    calibration_seeds: [7100], test_seeds: [8200], model_matches_current: true, calibration: { available: false, n: 0 },
    raw_reliability: { n: 0, brier: null, ece: null, confidently_wrong: 0, bins: [] }, calibrated_reliability: null,
    scenarios: [], category_confusion: [], limits: ["Synthetic study"] };
}
describe("stress report contract", () => {
  it("accepts empty-but-valid reports and preserves unavailable measures", () => {
    expect(parseRobustness(fixture())?.raw_reliability.brier).toBeNull();
  });
  it("rejects incomplete, unsupported and non-finite results without crashing", () => {
    for (const value of [null, {}, { ...fixture(), schema_version: 2 }, { ...fixture(), raw_reliability: {} },
      { ...fixture(), n_test_runs: NaN }, { ...fixture(), scenarios: [{}] }, { ...fixture(), generated_at: "bad date" },
      { ...fixture(), calibration_assessment: { status: "not_recommended", reasons: [5] } }]) expect(parseRobustness(value)).toBeNull();
  });
});
