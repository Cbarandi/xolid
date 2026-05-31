import type { OperatorDefinition, OperatorKey } from "./types";

export const OPERATORS: OperatorDefinition[] = [
  {
    key: "greater_than",
    label: "Greater than",
    shortLabel: ">",
    requiresValue: true,
    requiresSecondaryValue: false,
    requiresCompareIndicator: false,
    supportsPercent: false,
  },
  {
    key: "less_than",
    label: "Less than",
    shortLabel: "<",
    requiresValue: true,
    requiresSecondaryValue: false,
    requiresCompareIndicator: false,
    supportsPercent: false,
  },
  {
    key: "crosses_above",
    label: "Crosses above",
    shortLabel: "crosses above",
    requiresValue: true,
    requiresSecondaryValue: false,
    requiresCompareIndicator: false,
    supportsPercent: false,
  },
  {
    key: "crosses_below",
    label: "Crosses below",
    shortLabel: "crosses below",
    requiresValue: true,
    requiresSecondaryValue: false,
    requiresCompareIndicator: false,
    supportsPercent: false,
  },
  {
    key: "equal_to",
    label: "Equal to",
    shortLabel: "=",
    requiresValue: true,
    requiresSecondaryValue: false,
    requiresCompareIndicator: false,
    supportsPercent: false,
  },
  {
    key: "between",
    label: "Between",
    shortLabel: "between",
    requiresValue: true,
    requiresSecondaryValue: true,
    requiresCompareIndicator: false,
    supportsPercent: false,
  },
  {
    key: "outside_range",
    label: "Outside range",
    shortLabel: "outside",
    requiresValue: true,
    requiresSecondaryValue: true,
    requiresCompareIndicator: false,
    supportsPercent: false,
  },
  {
    key: "rising",
    label: "Rising",
    shortLabel: "rising",
    requiresValue: false,
    requiresSecondaryValue: false,
    requiresCompareIndicator: false,
    supportsPercent: false,
  },
  {
    key: "falling",
    label: "Falling",
    shortLabel: "falling",
    requiresValue: false,
    requiresSecondaryValue: false,
    requiresCompareIndicator: false,
    supportsPercent: false,
  },
  {
    key: "percent_above",
    label: "Percent above",
    shortLabel: "% above",
    requiresValue: true,
    requiresSecondaryValue: false,
    requiresCompareIndicator: true,
    supportsPercent: true,
  },
  {
    key: "percent_below",
    label: "Percent below",
    shortLabel: "% below",
    requiresValue: true,
    requiresSecondaryValue: false,
    requiresCompareIndicator: true,
    supportsPercent: true,
  },
];

const OPERATOR_MAP = new Map<OperatorKey, OperatorDefinition>(
  OPERATORS.map((op) => [op.key, op]),
);

export function getOperator(key: OperatorKey): OperatorDefinition | undefined {
  return OPERATOR_MAP.get(key);
}

export function getOperatorsForIndicator(
  compatible: OperatorKey[],
): OperatorDefinition[] {
  return compatible
    .map((key) => OPERATOR_MAP.get(key))
    .filter((op): op is OperatorDefinition => op != null);
}
