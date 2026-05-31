"use client";

import { getIndicator } from "@/lib/strategies/indicator-registry";
import { formatRuleSummary } from "@/lib/strategies/rule-summary";
import type { StrategyRule } from "@/lib/strategies/types";
import { IndicatorPicker } from "./IndicatorPicker";
import { OperatorPicker } from "./OperatorPicker";
import { TimeframePicker } from "./TimeframePicker";
import { strategyCardClass, strategyGhostButtonClass } from "./styles";

type Props = {
  rule: StrategyRule;
  index: number;
  onChange: (rule: StrategyRule) => void;
  onRemove: () => void;
  canRemove: boolean;
};

export function RuleCard({ rule, index, onChange, onRemove, canRemove }: Props) {
  const summary = formatRuleSummary(rule);

  function patch(partial: Partial<StrategyRule>) {
    onChange({ ...rule, ...partial });
  }

  return (
    <article className={strategyCardClass}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] uppercase tracking-[0.26em] text-white/32">Rule {index + 1}</p>
          <p className="mt-2 text-[14px] leading-snug tracking-[-0.01em] text-white/82">{summary}</p>
        </div>
        {canRemove ? (
          <button type="button" onClick={onRemove} className={strategyGhostButtonClass}>
            Remove
          </button>
        ) : null}
      </div>

      <div className="mt-5 space-y-5 border-t border-white/8 pt-5">
        <TimeframePicker
          value={rule.timeframe}
          onChange={(timeframe) => patch({ timeframe })}
        />

        <IndicatorPicker
          value={rule.indicatorKey}
          parameters={rule.parameters}
          onIndicatorChange={(indicatorKey, parameters) => {
            const def = getIndicator(indicatorKey);
            const defaultOp = def?.compatibleOperators[0] ?? rule.operator;
            patch({
              indicatorKey,
              parameters,
              operator: defaultOp,
              compareTarget: "value",
              value: indicatorKey === "VOLUME_RATIO" ? 1.5 : rule.value,
              lookback: indicatorKey === "VOLUME_RATIO" ? Number(parameters.lookback ?? 20) : rule.lookback,
            });
          }}
          onParameterChange={(key, value) => {
            const parameters = { ...rule.parameters, [key]: value };
            const lookback =
              rule.indicatorKey === "VOLUME_RATIO" && key === "lookback"
                ? Number(value)
                : rule.lookback;
            patch({ parameters, lookback });
          }}
        />

        <OperatorPicker
          indicatorKey={rule.indicatorKey}
          operator={rule.operator}
          value={rule.value}
          valueSecondary={rule.valueSecondary}
          compareTarget={rule.compareTarget}
          compareIndicatorKey={rule.compareIndicatorKey}
          compareParameters={rule.compareParameters}
          lookback={rule.lookback}
          onOperatorChange={(operator) => patch({ operator })}
          onValueChange={(value) => patch({ value })}
          onValueSecondaryChange={(valueSecondary) => patch({ valueSecondary })}
          onCompareTargetChange={(compareTarget) => patch({ compareTarget })}
          onCompareIndicatorChange={(compareIndicatorKey, compareParameters) =>
            patch({ compareIndicatorKey, compareParameters, compareTarget: "indicator" })
          }
          onLookbackChange={(lookback) => patch({ lookback, parameters: { ...rule.parameters, lookback } })}
        />
      </div>
    </article>
  );
}
