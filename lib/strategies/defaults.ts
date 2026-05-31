import type { StrategyDefinition, StrategyRule, StrategyRuleGroup } from "./types";
import { getIndicator } from "./indicator-registry";

export function newRuleId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `rule_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function createEmptyRule(): StrategyRule {
  const cci = getIndicator("CCI")!;
  return {
    id: newRuleId(),
    timeframe: "15m",
    indicatorKey: "CCI",
    parameters: { ...cci.defaultParameters },
    operator: "crosses_above",
    value: 150,
    compareTarget: "value",
    lookback: 20,
  };
}

export function createEmptyRuleGroup(index = 1): StrategyRuleGroup {
  return {
    id: newRuleId(),
    name: `Rule group ${index}`,
    matchMode: "all",
    rules: [createEmptyRule()],
    collapsed: false,
  };
}

export function createEmptyStrategyDefinition(name = "Untitled strategy"): StrategyDefinition {
  return {
    id: "",
    name,
    description: "",
    version: 1,
    groupMatchMode: "all",
    ruleGroups: [createEmptyRuleGroup()],
  };
}
