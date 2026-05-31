import { getKlines } from "@/lib/market/binance-public";
import type { CandleInterval, NormalizedCandle } from "@/lib/market/candles";
import { evaluateRule, indicatorSnapshot } from "./rule-evaluator";
import type { StrategyDefinition, StrategyRule, Timeframe } from "./types";
import { periodFromParams } from "./indicator-calculator";

export type SignalSnapshot = {
  strategyId: string;
  matchedRules: string[];
  failedRules: string[];
  reason: string;
  indicatorValues?: Record<string, number>;
  evaluatedAt: string;
  timeframe: Timeframe;
};

export type SignalResult = {
  shouldEnter: boolean;
  side: "LONG" | "SHORT";
  symbol: string;
  reason: string;
  evaluatedAt: string;
  matchedRules: string[];
  failedRules: string[];
  latestClosePrice: number;
  timeframe: Timeframe;
  indicatorValues?: Record<string, number>;
  strategyId?: string;
  signalSnapshot?: SignalSnapshot;
};

const TIMEFRAME_INTERVAL: Record<Timeframe, CandleInterval> = {
  "5m": "5m",
  "15m": "15m",
  "1h": "1h",
  "4h": "4h",
  "1d": "1d",
};

const MIN_KLINES = 120;
const MAX_KLINES = 500;

function minCandlesForRule(rule: StrategyRule): number {
  const period = periodFromParams(rule.parameters, 14);
  const lookback = rule.lookback ?? periodFromParams(rule.parameters, 20);
  switch (rule.indicatorKey) {
    case "ADX":
      return period * 3 + 10;
    case "VOLUME_RATIO":
      return lookback + 5;
    case "CCI":
    case "RSI":
      return period + 5;
    default:
      return period + 5;
  }
}

function klineLimitForRules(rules: StrategyRule[]): number {
  let need = MIN_KLINES;
  for (const rule of rules) {
    need = Math.max(need, minCandlesForRule(rule) + 5);
  }
  return Math.min(need, MAX_KLINES);
}

function collectRules(definition: StrategyDefinition): StrategyRule[] {
  return definition.ruleGroups.flatMap((g) => g.rules);
}

function primaryTimeframe(definition: StrategyDefinition): Timeframe {
  const rules = collectRules(definition);
  const tf = rules.find((r) => r.timeframe)?.timeframe;
  return tf ?? "15m";
}

export type EvaluateStrategyInput = {
  definition: StrategyDefinition;
  strategyId: string;
  symbol: string;
  side: "LONG" | "SHORT";
  fetchKlines?: (
    symbol: string,
    interval: CandleInterval,
    limit: number,
  ) => Promise<NormalizedCandle[]>;
};

export async function evaluateStrategyForSymbol(
  input: EvaluateStrategyInput,
): Promise<SignalResult> {
  const { definition, strategyId, symbol, side } = input;
  const evaluatedAt = new Date().toISOString();
  const fetchKlinesFn = input.fetchKlines ?? getKlines;

  const matchedRules: string[] = [];
  const failedRules: string[] = [];
  const indicatorValues: Record<string, number> = {};
  let latestClosePrice = 0;
  const timeframe = primaryTimeframe(definition);

  const rules = collectRules(definition);
  if (rules.length === 0) {
    return {
      shouldEnter: false,
      side,
      symbol,
      reason: "Strategy has no rules",
      evaluatedAt,
      matchedRules,
      failedRules: ["No rules defined"],
      latestClosePrice: 0,
      timeframe,
      strategyId,
    };
  }

  const limit = klineLimitForRules(rules);
  const candlesByTf = new Map<Timeframe, NormalizedCandle[]>();

  for (const tf of new Set(rules.map((r) => r.timeframe))) {
    const interval = TIMEFRAME_INTERVAL[tf];
    const candles = await fetchKlinesFn(symbol, interval, limit);
    candlesByTf.set(tf, candles);
  }

  let allGroupsPassed = true;

  for (const group of definition.ruleGroups) {
    let groupPassed = true;

    for (const rule of group.rules) {
      const candles = candlesByTf.get(rule.timeframe) ?? [];
      if (candles.length === 0) {
        allGroupsPassed = false;
        groupPassed = false;
        failedRules.push(`${rule.id}: no candles for ${rule.timeframe}`);
        continue;
      }

      latestClosePrice = candles[candles.length - 1]!.close;
      Object.assign(indicatorValues, indicatorSnapshot(rule, candles));

      const evalResult = evaluateRule(rule, candles);
      if (evalResult.passed) {
        matchedRules.push(evalResult.summary);
      } else {
        groupPassed = false;
        failedRules.push(`${evalResult.summary} — ${evalResult.reason}`);
      }
    }

    if (!groupPassed) allGroupsPassed = false;
  }

  const shouldEnter = allGroupsPassed && failedRules.length === 0;
  const reason = shouldEnter
    ? `All rule groups passed (${matchedRules.length} rules)`
    : failedRules[0] ?? "Rule evaluation failed";

  const signalSnapshot: SignalSnapshot = {
    strategyId,
    matchedRules,
    failedRules,
    reason,
    indicatorValues,
    evaluatedAt,
    timeframe,
  };

  return {
    shouldEnter,
    side,
    symbol,
    reason,
    evaluatedAt,
    matchedRules,
    failedRules,
    latestClosePrice,
    timeframe,
    indicatorValues,
    strategyId,
    signalSnapshot,
  };
}
