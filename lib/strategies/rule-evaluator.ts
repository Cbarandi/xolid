import type { NormalizedCandle } from "@/lib/market/candles";
import {
  computeAdx,
  computeCci,
  computeEma,
  computeRsi,
  computeSma,
  computeVolumeRatio,
  closesFromCandles,
  latestPair,
  periodFromParams,
  volumesFromCandles,
  type IndicatorSeries,
} from "./indicator-calculator";
import { formatRuleSummary } from "./rule-summary";
import type { IndicatorKey, IndicatorParameters, StrategyRule } from "./types";

export type RuleEvalResult = {
  ruleId: string;
  summary: string;
  passed: boolean;
  reason: string;
  currentValue?: number;
  previousValue?: number;
  compareCurrent?: number;
  comparePrevious?: number;
};

type SeriesContext = {
  primary: IndicatorSeries;
  compare?: IndicatorSeries;
};

function resolveCompareSeries(
  candles: NormalizedCandle[],
  key: IndicatorKey,
  params: IndicatorParameters,
): IndicatorSeries {
  return computeIndicatorSeries(key, candles, params);
}

export function computeIndicatorSeries(
  indicatorKey: IndicatorKey,
  candles: NormalizedCandle[],
  params: IndicatorParameters,
  lookback?: number,
): IndicatorSeries {
  const closes = closesFromCandles(candles);
  const volumes = volumesFromCandles(candles);
  const period = periodFromParams(params);

  switch (indicatorKey) {
    case "RSI":
      return computeRsi(closes, period);
    case "CCI":
      return computeCci(candles, period);
    case "EMA":
      return computeEma(closes, period);
    case "SMA":
    case "MA":
      return computeSma(closes, period);
    case "ADX":
      return computeAdx(candles, period);
    case "VOLUME_RATIO": {
      const lb = lookback ?? periodFromParams(params, 20);
      return computeVolumeRatio(volumes, lb);
    }
    default:
      return new Array(candles.length).fill(null);
  }
}

function numericTarget(rule: StrategyRule): number | null {
  if (rule.value == null) return null;
  return rule.value;
}

function compareValueAt(
  rule: StrategyRule,
  ctx: SeriesContext,
  index: number,
): number | null {
  if (rule.compareTarget === "indicator" && ctx.compare) {
    return ctx.compare[index] ?? null;
  }
  if (rule.compareTarget === "price") {
    return null;
  }
  return numericTarget(rule);
}

function valuesAtIndex(
  rule: StrategyRule,
  ctx: SeriesContext,
  index: number,
  candles: NormalizedCandle[],
): { primary: number | null; compare: number | null } {
  const primary = ctx.primary[index] ?? null;
  let compare: number | null = null;

  if (rule.compareTarget === "price") {
    compare = candles[index]?.close ?? null;
  } else {
    compare = compareValueAt(rule, ctx, index);
  }

  return { primary, compare };
}

function lastTwoIndices(series: IndicatorSeries): { prev: number; curr: number } | null {
  const indices: number[] = [];
  for (let i = series.length - 1; i >= 0; i--) {
    if (series[i] == null) continue;
    indices.push(i);
    if (indices.length === 2) break;
  }
  if (indices.length < 2) return null;
  return { prev: indices[1]!, curr: indices[0]! };
}

export function evaluateRule(rule: StrategyRule, candles: NormalizedCandle[]): RuleEvalResult {
  const summary = formatRuleSummary(rule);
  const base: RuleEvalResult = {
    ruleId: rule.id,
    summary,
    passed: false,
    reason: "",
  };

  if (candles.length < 3) {
    return { ...base, reason: "Not enough closed candles" };
  }

  const lookback = rule.lookback ?? periodFromParams(rule.parameters, 20);
  const primary = computeIndicatorSeries(rule.indicatorKey, candles, rule.parameters, lookback);

  let compare: IndicatorSeries | undefined;
  if (rule.compareTarget === "indicator" && rule.compareIndicatorKey) {
    compare = resolveCompareSeries(
      candles,
      rule.compareIndicatorKey,
      rule.compareParameters ?? {},
    );
  }

  const ctx: SeriesContext = { primary, compare };
  const pairIdx = lastTwoIndices(primary);
  if (!pairIdx) {
    return { ...base, reason: "Indicator warmup incomplete" };
  }

  const prevVals = valuesAtIndex(rule, ctx, pairIdx.prev, candles);
  const currVals = valuesAtIndex(rule, ctx, pairIdx.curr, candles);

  if (currVals.primary == null) {
    return { ...base, reason: "No current indicator value" };
  }

  const result: RuleEvalResult = {
    ...base,
    currentValue: currVals.primary,
    previousValue: prevVals.primary ?? undefined,
    compareCurrent: currVals.compare ?? undefined,
    comparePrevious: prevVals.compare ?? undefined,
  };

  const curr = currVals.primary;
  const prev = prevVals.primary;
  const target = numericTarget(rule);

  const cmpCurr = rule.compareTarget === "indicator" ? currVals.compare : target;
  const cmpPrev = rule.compareTarget === "indicator" ? prevVals.compare : target;

  switch (rule.operator) {
    case "greater_than": {
      if (cmpCurr == null) return { ...result, reason: "Missing compare target" };
      const passed = curr > cmpCurr;
      return {
        ...result,
        passed,
        reason: passed
          ? `${curr} > ${cmpCurr}`
          : `${curr} not greater than ${cmpCurr}`,
      };
    }
    case "less_than": {
      if (cmpCurr == null) return { ...result, reason: "Missing compare target" };
      const passed = curr < cmpCurr;
      return {
        ...result,
        passed,
        reason: passed ? `${curr} < ${cmpCurr}` : `${curr} not less than ${cmpCurr}`,
      };
    }
    case "crosses_above": {
      if (prev == null) return { ...result, reason: "No previous indicator value" };
      if (cmpCurr == null || cmpPrev == null) return { ...result, reason: "Missing compare target" };
      const passed = prev <= cmpPrev && curr > cmpCurr;
      return {
        ...result,
        passed,
        reason: passed
          ? `${prev} -> ${curr} crossed above ${cmpCurr}`
          : `No cross above (${prev} -> ${curr} vs ${cmpCurr})`,
      };
    }
    case "crosses_below": {
      if (prev == null) return { ...result, reason: "No previous indicator value" };
      if (cmpCurr == null || cmpPrev == null) return { ...result, reason: "Missing compare target" };
      const passed = prev >= cmpPrev && curr < cmpCurr;
      return {
        ...result,
        passed,
        reason: passed
          ? `${prev} -> ${curr} crossed below ${cmpCurr}`
          : `No cross below (${prev} -> ${curr} vs ${cmpCurr})`,
      };
    }
    case "between": {
      if (rule.value == null || rule.valueSecondary == null) {
        return { ...result, reason: "Missing between bounds" };
      }
      const lo = Math.min(rule.value, rule.valueSecondary);
      const hi = Math.max(rule.value, rule.valueSecondary);
      const passed = curr >= lo && curr <= hi;
      return {
        ...result,
        passed,
        reason: passed
          ? `${curr} between ${lo} and ${hi}`
          : `${curr} not between ${lo} and ${hi}`,
      };
    }
    default:
      return {
        ...result,
        reason: `Operator ${rule.operator} not supported in v0 evaluator`,
      };
  }
}

export function indicatorSnapshot(
  rule: StrategyRule,
  candles: NormalizedCandle[],
): Record<string, number> {
  const lookback = rule.lookback ?? periodFromParams(rule.parameters, 20);
  const series = computeIndicatorSeries(rule.indicatorKey, candles, rule.parameters, lookback);
  const { previous, current } = latestPair(series);
  const snap: Record<string, number> = {};
  if (current != null) snap[`${rule.indicatorKey}_current`] = current;
  if (previous != null) snap[`${rule.indicatorKey}_previous`] = previous;
  return snap;
}
