import type { StrategyDefinition, StrategyRule, StrategyRuleGroup } from "./types";
import { getIndicator } from "./indicator-registry";
import { getOperator } from "./operator-registry";
import { TIMEFRAMES } from "./types";

function isValidRule(rule: StrategyRule): string | null {
  const indicator = getIndicator(rule.indicatorKey);
  if (!indicator) return "Invalid indicator";

  if (!TIMEFRAMES.includes(rule.timeframe)) return "Invalid timeframe";

  const op = getOperator(rule.operator);
  if (!op) return "Invalid operator";

  if (!indicator.compatibleOperators.includes(rule.operator)) {
    return `Operator not supported for ${indicator.label}`;
  }

  if (op.requiresValue && rule.value == null && rule.compareTarget !== "indicator") {
    return "Value is required";
  }

  if (op.requiresSecondaryValue && rule.valueSecondary == null) {
    return "Second value is required";
  }

  if (op.requiresCompareIndicator && rule.compareTarget === "indicator" && !rule.compareIndicatorKey) {
    return "Compare indicator is required";
  }

  if (rule.indicatorKey === "VOLUME_RATIO") {
    const lookback = rule.lookback ?? Number(rule.parameters.lookback ?? 0);
    if (!Number.isFinite(lookback) || lookback < 2) {
      return "Volume ratio lookback must be at least 2";
    }
    if (rule.value == null || rule.value <= 0) {
      return "Volume ratio threshold must be greater than 0";
    }
  }

  return null;
}

function isValidGroup(group: StrategyRuleGroup): string | null {
  if (!group.name.trim()) return "Rule group name is required";
  if (group.rules.length === 0) return "Each rule group needs at least one rule";

  for (const rule of group.rules) {
    const err = isValidRule(rule);
    if (err) return err;
  }

  return null;
}

export function validateStrategyDefinition(
  name: string,
  definition: Pick<StrategyDefinition, "ruleGroups" | "groupMatchMode" | "version">,
): { ok: true } | { ok: false; error: string } {
  const trimmed = name.trim();
  if (!trimmed) return { ok: false, error: "Strategy name is required" };
  if (definition.version !== 1) return { ok: false, error: "Unsupported strategy version" };
  if (definition.ruleGroups.length === 0) {
    return { ok: false, error: "Add at least one rule group" };
  }

  for (const group of definition.ruleGroups) {
    const err = isValidGroup(group);
    if (err) return { ok: false, error: err };
  }

  return { ok: true };
}
