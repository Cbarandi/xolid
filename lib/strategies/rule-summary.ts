import { getIndicator } from "./indicator-registry";
import { getOperator } from "./operator-registry";
import type { IndicatorParameters, StrategyRule, Timeframe } from "./types";

function formatParams(indicatorKey: string, params: IndicatorParameters): string {
  const def = getIndicator(indicatorKey as StrategyRule["indicatorKey"]);
  if (!def || def.parameters.length === 0) return "";

  const parts = def.parameters.map((p) => {
    const v = params[p.key] ?? p.defaultValue;
    if (p.type === "select") return null;
    return String(v);
  }).filter(Boolean);

  return parts.length > 0 ? `(${parts.join(",")})` : "";
}

function formatIndicatorLabel(indicatorKey: StrategyRule["indicatorKey"], params: IndicatorParameters): string {
  const def = getIndicator(indicatorKey);
  if (!def) return indicatorKey;

  if (indicatorKey === "VOLUME_RATIO") {
    return "volume";
  }
  if (indicatorKey === "VOLUME") {
    return "volume";
  }
  if (indicatorKey === "MACD") {
    const fast = params.fast ?? 12;
    const slow = params.slow ?? 26;
    const signal = params.signal ?? 9;
    return `MACD(${fast},${slow},${signal})`;
  }
  if (indicatorKey === "BOLLINGER_BANDS") {
    const period = params.period ?? 20;
    const band = params.band ?? "middle";
    return `BB ${String(band)}(${period})`;
  }
  if (indicatorKey === "WICK_PCT") {
    const side = params.side ?? "upper";
    return `${String(side)} wick %`;
  }

  return `${def.label}${formatParams(indicatorKey, params)}`;
}

function formatCompareTarget(rule: StrategyRule): string {
  if (rule.compareTarget === "price") return "price";
  if (rule.compareTarget === "indicator" && rule.compareIndicatorKey) {
    return formatIndicatorLabel(
      rule.compareIndicatorKey,
      rule.compareParameters ?? getIndicator(rule.compareIndicatorKey)?.defaultParameters ?? {},
    );
  }
  if (rule.valueSecondary != null && rule.operator === "between") {
    return `${rule.value} and ${rule.valueSecondary}`;
  }
  if (rule.valueSecondary != null && rule.operator === "outside_range") {
    return `${rule.value} and ${rule.valueSecondary}`;
  }
  if (rule.value != null) return String(rule.value);
  return "";
}

function formatVolumeRatioSummary(rule: StrategyRule, tf: string): string {
  const lookback = rule.lookback ?? Number(rule.parameters.lookback ?? 20);
  const threshold = rule.value ?? 1.5;
  const pctAbove = Math.round((threshold - 1) * 100);

  if (rule.operator === "greater_than") {
    return `${tf} volume is ${pctAbove}% above average of last ${lookback} candles`;
  }
  if (rule.operator === "less_than") {
    const pctBelow = Math.round((1 - threshold) * 100);
    return `${tf} volume is ${Math.abs(pctBelow)}% below average of last ${lookback} candles`;
  }
  return `${tf} volume ratio ${rule.operator.replace("_", " ")} ${threshold}× avg (${lookback} candles)`;
}

function formatOperatorPhrase(rule: StrategyRule, target: string): string {
  const op = getOperator(rule.operator);
  if (!op) return "";

  switch (rule.operator) {
    case "greater_than":
      return rule.compareTarget === "indicator"
        ? `is greater than ${target}`
        : `is greater than ${target}`;
    case "less_than":
      return `is less than ${target}`;
    case "crosses_above":
      return `crosses above ${target}`;
    case "crosses_below":
      return `crosses below ${target}`;
    case "equal_to":
      return `is equal to ${target}`;
    case "between":
      return `is between ${rule.value} and ${rule.valueSecondary}`;
    case "outside_range":
      return `is outside ${rule.value} and ${rule.valueSecondary}`;
    case "rising":
      return "is rising";
    case "falling":
      return "is falling";
    case "percent_above":
      return `is ${rule.value ?? 0}% above ${target}`;
    case "percent_below":
      return `is ${rule.value ?? 0}% below ${target}`;
    default:
      return op.shortLabel;
  }
}

export function formatTimeframeLabel(tf: Timeframe): string {
  return tf;
}

export function formatRuleSummary(rule: StrategyRule): string {
  const tf = formatTimeframeLabel(rule.timeframe);

  if (rule.indicatorKey === "VOLUME_RATIO") {
    return formatVolumeRatioSummary(rule, tf);
  }

  const indicator = formatIndicatorLabel(rule.indicatorKey, rule.parameters);
  const target = formatCompareTarget(rule);
  const phrase = formatOperatorPhrase(rule, target);

  if (rule.operator === "rising" || rule.operator === "falling") {
    return `${tf} ${indicator} ${phrase}`;
  }

  if (rule.compareTarget === "indicator" && rule.compareIndicatorKey) {
    return `${tf} ${indicator} ${phrase}`;
  }

  return `${tf} ${indicator} ${phrase}`.replace(/\s+/g, " ").trim();
}

export function formatRuleSummaryShort(rule: StrategyRule): string {
  const full = formatRuleSummary(rule);
  return full.length > 72 ? `${full.slice(0, 69)}…` : full;
}
