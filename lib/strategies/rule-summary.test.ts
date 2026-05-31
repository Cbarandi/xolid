import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { formatRuleSummary } from "./rule-summary";
import type { StrategyRule } from "./types";

function baseRule(partial: Partial<StrategyRule>): StrategyRule {
  return {
    id: "1",
    timeframe: "15m",
    indicatorKey: "CCI",
    parameters: { period: 50 },
    operator: "crosses_above",
    value: 150,
    compareTarget: "value",
    ...partial,
  };
}

describe("formatRuleSummary", () => {
  it("formats CCI cross example", () => {
    assert.equal(formatRuleSummary(baseRule({})), "15m CCI(50) crosses above 150");
  });

  it("formats EMA vs EMA comparison", () => {
    assert.equal(
      formatRuleSummary(
        baseRule({
          timeframe: "4h",
          indicatorKey: "EMA",
          parameters: { period: 20 },
          operator: "greater_than",
          compareTarget: "indicator",
          compareIndicatorKey: "EMA",
          compareParameters: { period: 100 },
          value: undefined,
        }),
      ),
      "4h EMA(20) is greater than EMA(100)",
    );
  });

  it("formats volume ratio example", () => {
    assert.equal(
      formatRuleSummary(
        baseRule({
          indicatorKey: "VOLUME_RATIO",
          parameters: { lookback: 20 },
          operator: "greater_than",
          value: 1.5,
          lookback: 20,
        }),
      ),
      "15m volume is 50% above average of last 20 candles",
    );
  });

  it("formats RSI between range", () => {
    assert.equal(
      formatRuleSummary(
        baseRule({
          timeframe: "1h",
          indicatorKey: "RSI",
          parameters: { period: 14 },
          operator: "between",
          value: 50,
          valueSecondary: 70,
        }),
      ),
      "1h RSI(14) is between 50 and 70",
    );
  });
});
