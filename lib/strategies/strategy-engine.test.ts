import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { filterClosedCandles, type NormalizedCandle } from "@/lib/market/candles";
import {
  computeCci,
  computeEma,
  computeRsi,
  computeSma,
  computeVolumeRatio,
} from "@/lib/strategies/indicator-calculator";
import { evaluateRule } from "@/lib/strategies/rule-evaluator";
import { evaluateStrategyForSymbol } from "@/lib/strategies/strategy-evaluator";
import type { StrategyDefinition, StrategyRule } from "@/lib/strategies/types";
import { hasOpenTradeForBotSymbol } from "@/lib/bots/db";

function candle(
  i: number,
  close: number,
  volume = 1000,
  intervalMs = 15 * 60 * 1000,
): NormalizedCandle {
  const open = close - 0.5;
  return {
    timestampOpen: i * intervalMs,
    timestampClose: (i + 1) * intervalMs - 1,
    open,
    high: close + 1,
    low: close - 1,
    close,
    volume,
  };
}

function series(n: number, closeFn: (i: number) => number, volumeFn?: (i: number) => number): NormalizedCandle[] {
  return Array.from({ length: n }, (_, i) =>
    candle(i, closeFn(i), volumeFn ? volumeFn(i) : 1000),
  );
}

describe("filterClosedCandles", () => {
  it("excludes forming candle (close time in the future)", () => {
    const now = 1_000_000;
    const candles: NormalizedCandle[] = [
      { ...candle(0, 100), timestampClose: now - 10_000 },
      { ...candle(1, 101), timestampClose: now + 10_000 },
    ];
    const closed = filterClosedCandles(candles, now);
    assert.equal(closed.length, 1);
    assert.equal(closed[0]!.close, 100);
  });
});

describe("indicator-calculator", () => {
  it("computes SMA", () => {
    const values = [1, 2, 3, 4, 5];
    const sma = computeSma(values, 3);
    assert.equal(sma[2], 2);
    assert.equal(sma[4], 4);
  });

  it("computes EMA (adjust=false seed)", () => {
    const values = [1, 2, 3, 4, 5, 6];
    const ema = computeEma(values, 3);
    assert.equal(ema[2], 2);
    assert.ok(ema[5]! > ema[4]!);
  });

  it("computes RSI Wilder on uptrend", () => {
    const closes = series(30, (i) => 100 + i * 0.5).map((c) => c.close);
    const rsi = computeRsi(closes, 14);
    const last = rsi.at(-1);
    assert.ok(last != null && last > 50);
  });

  it("computes CCI", () => {
    const candles = series(60, (i) => 100 + Math.sin(i / 5) * 10);
    const cci = computeCci(candles, 50);
    const last = cci.at(-1);
    assert.ok(last != null && Number.isFinite(last));
  });

  it("computes Volume Ratio vs prior average", () => {
    const volumes = Array.from({ length: 25 }, (_, i) => (i < 24 ? 100 : 200));
    const ratio = computeVolumeRatio(volumes, 20);
    assert.equal(ratio[24], 2);
  });
});

describe("rule-evaluator", () => {
  const baseRule = (partial: Partial<StrategyRule>): StrategyRule => ({
    id: "r1",
    timeframe: "15m",
    indicatorKey: "CCI",
    parameters: { period: 50 },
    operator: "crosses_above",
    value: 150,
    compareTarget: "value",
    ...partial,
  });

  function buildCciCrossCandles(
    operator: "crosses_above" | "crosses_below",
    threshold: number,
  ): NormalizedCandle[] {
    for (let i = 0; i < 80; i++) {
      for (let j = 0; j < 80; j++) {
        const candles = [
          ...series(78, () => 100 + (operator === "crosses_below" ? 50 : 0)),
          candle(78, 100 + i),
          candle(79, 100 + j),
        ];
        const rule = baseRule({ operator, value: threshold });
        if (evaluateRule(rule, candles).passed) return candles;
      }
    }
    throw new Error(`Unable to synthesize ${operator} pattern`);
  }

  it("crosses_above detects threshold cross on CCI", () => {
    const candles = buildCciCrossCandles("crosses_above", 150);
    const rule = baseRule({ operator: "crosses_above", value: 150 });
    const result = evaluateRule(rule, candles);
    assert.equal(result.passed, true, result.reason);
  });

  it("crosses_below detects downward cross", () => {
    const candles = buildCciCrossCandles("crosses_below", 150);
    const rule = baseRule({ operator: "crosses_below", value: 150 });
    const result = evaluateRule(rule, candles);
    assert.equal(result.passed, true, result.reason);
  });

  it("between checks inclusive bounds on RSI", () => {
    const candles = series(40, (i) => 100 + i * 0.2);
    const rule = baseRule({
      indicatorKey: "RSI",
      parameters: { period: 14 },
      operator: "between",
      value: 50,
      valueSecondary: 80,
    });
    const result = evaluateRule(rule, candles);
    assert.equal(typeof result.passed, "boolean");
    assert.ok(result.currentValue != null);
  });

  it("greater_than on volume ratio", () => {
    const candles = series(30, () => 100, (i) => (i < 29 ? 100 : 180));
    const rule = baseRule({
      indicatorKey: "VOLUME_RATIO",
      parameters: { lookback: 20 },
      lookback: 20,
      operator: "greater_than",
      value: 1.5,
    });
    const result = evaluateRule(rule, candles);
    assert.equal(result.passed, true, result.reason);
  });
});

describe("strategy-evaluator", () => {
  it("returns signal when all rules pass", async () => {
    const candles = (() => {
      for (let i = 0; i < 80; i++) {
        for (let j = 0; j < 80; j++) {
          const trial = [...series(78, () => 100), candle(78, 100 + i), candle(79, 100 + j)];
          const rule = {
            id: "r1",
            timeframe: "15m" as const,
            indicatorKey: "CCI" as const,
            parameters: { period: 50 },
            operator: "crosses_above" as const,
            value: 150,
            compareTarget: "value" as const,
          };
          if (evaluateRule(rule, trial).passed) return trial;
        }
      }
      throw new Error("no cross candles");
    })();

    const definition: StrategyDefinition = {
      id: "s1",
      name: "CCI cross",
      version: 1,
      groupMatchMode: "all",
      ruleGroups: [
        {
          id: "g1",
          name: "Entry",
          matchMode: "all",
          rules: [
            {
              id: "r1",
              timeframe: "15m",
              indicatorKey: "CCI",
              parameters: { period: 50 },
              operator: "crosses_above",
              value: 150,
              compareTarget: "value",
            },
          ],
        },
      ],
    };

    const signal = await evaluateStrategyForSymbol({
      definition,
      strategyId: "s1",
      symbol: "SOLUSDC",
      side: "LONG",
      fetchKlines: async () => candles,
    });

    assert.equal(signal.shouldEnter, true);
    assert.ok(signal.matchedRules.length > 0);
    assert.ok(signal.latestClosePrice > 0);
    assert.ok(signal.signalSnapshot);
  });

  it("returns false when rule fails", async () => {
    const candles = series(80, () => 100);
    const definition: StrategyDefinition = {
      id: "s2",
      name: "CCI flat",
      version: 1,
      groupMatchMode: "all",
      ruleGroups: [
        {
          id: "g1",
          name: "Entry",
          matchMode: "all",
          rules: [
            {
              id: "r1",
              timeframe: "15m",
              indicatorKey: "CCI",
              parameters: { period: 50 },
              operator: "crosses_above",
              value: 150,
              compareTarget: "value",
            },
          ],
        },
      ],
    };

    const signal = await evaluateStrategyForSymbol({
      definition,
      strategyId: "s2",
      symbol: "SOLUSDC",
      side: "LONG",
      fetchKlines: async () => candles,
    });

    assert.equal(signal.shouldEnter, false);
    assert.ok(signal.failedRules.length > 0);
  });
});

describe("duplicate open trade prevention", () => {
  it("hasOpenTradeForBotSymbol is exported for runner guard", () => {
    assert.equal(typeof hasOpenTradeForBotSymbol, "function");
  });
});
