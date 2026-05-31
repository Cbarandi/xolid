"use client";

import { getIndicator } from "@/lib/strategies/indicator-registry";
import { getOperatorsForIndicator } from "@/lib/strategies/operator-registry";
import type {
  CompareTarget,
  IndicatorKey,
  IndicatorParameters,
  OperatorKey,
} from "@/lib/strategies/types";
import {
  strategyChipActiveClass,
  strategyChipClass,
  strategyChipIdleClass,
  strategyFieldClass,
  strategyLabelClass,
} from "./styles";

type Props = {
  indicatorKey: IndicatorKey;
  operator: OperatorKey;
  value?: number;
  valueSecondary?: number;
  compareTarget: CompareTarget;
  compareIndicatorKey?: IndicatorKey;
  compareParameters?: IndicatorParameters;
  lookback?: number;
  onOperatorChange: (operator: OperatorKey) => void;
  onValueChange: (value: number | undefined) => void;
  onValueSecondaryChange: (value: number | undefined) => void;
  onCompareTargetChange: (target: CompareTarget) => void;
  onCompareIndicatorChange: (key: IndicatorKey, params: IndicatorParameters) => void;
  onLookbackChange: (lookback: number) => void;
};

export function OperatorPicker({
  indicatorKey,
  operator,
  value,
  valueSecondary,
  compareTarget,
  compareIndicatorKey,
  compareParameters,
  lookback,
  onOperatorChange,
  onValueChange,
  onValueSecondaryChange,
  onCompareTargetChange,
  onCompareIndicatorChange,
  onLookbackChange,
}: Props) {
  const indicator = getIndicator(indicatorKey);
  const operators = indicator
    ? getOperatorsForIndicator(indicator.compatibleOperators)
    : [];
  const opDef = operators.find((o) => o.key === operator);

  const isVolumeRatio = indicatorKey === "VOLUME_RATIO";
  const showCompareIndicator =
    opDef?.requiresCompareIndicator ||
    (compareTarget === "indicator" &&
      !["rising", "falling"].includes(operator));

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="operator-select" className={strategyLabelClass}>
          Operator
        </label>
        <select
          id="operator-select"
          value={operator}
          onChange={(e) => onOperatorChange(e.target.value as OperatorKey)}
          className={strategyFieldClass}
        >
          {operators.map((op) => (
            <option key={op.key} value={op.key} className="bg-black">
              {op.label}
            </option>
          ))}
        </select>
      </div>

      {isVolumeRatio ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="volume-lookback" className={strategyLabelClass}>
              Lookback candles
            </label>
            <input
              id="volume-lookback"
              type="number"
              min={2}
              max={500}
              step={1}
              value={lookback ?? Number(indicator?.defaultParameters.lookback ?? 20)}
              onChange={(e) => onLookbackChange(parseInt(e.target.value, 10))}
              className={strategyFieldClass}
            />
          </div>
          <div>
            <label htmlFor="volume-threshold" className={strategyLabelClass}>
              Ratio threshold (e.g. 1.5 = 50% above avg)
            </label>
            <input
              id="volume-threshold"
              type="number"
              min={0.01}
              step={0.1}
              value={value ?? 1.5}
              onChange={(e) => onValueChange(Number(e.target.value))}
              className={strategyFieldClass}
            />
          </div>
        </div>
      ) : null}

      {!isVolumeRatio && opDef?.requiresValue ? (
        <div>
          <span className={strategyLabelClass}>Compare to</span>
          <div className="flex flex-wrap gap-2">
            {(
              [
                { key: "value", label: "Value" },
                { key: "indicator", label: "Indicator" },
                { key: "price", label: "Price" },
              ] as const
            ).map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => onCompareTargetChange(opt.key)}
                className={`${strategyChipClass} ${compareTarget === opt.key ? strategyChipActiveClass : strategyChipIdleClass}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {!isVolumeRatio && compareTarget === "value" && opDef?.requiresValue ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="rule-value" className={strategyLabelClass}>
              Value
            </label>
            <input
              id="rule-value"
              type="number"
              step={0.1}
              value={value ?? ""}
              onChange={(e) =>
                onValueChange(e.target.value === "" ? undefined : Number(e.target.value))
              }
              className={strategyFieldClass}
            />
          </div>
          {opDef.requiresSecondaryValue ? (
            <div>
              <label htmlFor="rule-value-2" className={strategyLabelClass}>
                Second value
              </label>
              <input
                id="rule-value-2"
                type="number"
                step={0.1}
                value={valueSecondary ?? ""}
                onChange={(e) =>
                  onValueSecondaryChange(
                    e.target.value === "" ? undefined : Number(e.target.value),
                  )
                }
                className={strategyFieldClass}
              />
            </div>
          ) : null}
        </div>
      ) : null}

      {!isVolumeRatio && showCompareIndicator && compareTarget === "indicator" ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="compare-indicator" className={strategyLabelClass}>
              Compare indicator
            </label>
            <select
              id="compare-indicator"
              value={compareIndicatorKey ?? "EMA"}
              onChange={(e) => {
                const key = e.target.value as IndicatorKey;
                const def = getIndicator(key);
                if (def) onCompareIndicatorChange(key, { ...def.defaultParameters });
              }}
              className={strategyFieldClass}
            >
              {["EMA", "SMA", "RSI", "CCI", "VWAP"].map((key) => (
                <option key={key} value={key} className="bg-black">
                  {key}
                </option>
              ))}
            </select>
          </div>
          {compareIndicatorKey && getIndicator(compareIndicatorKey)?.parameters.length ? (
            <div>
              <label htmlFor="compare-period" className={strategyLabelClass}>
                Period
              </label>
              <input
                id="compare-period"
                type="number"
                min={1}
                max={500}
                step={1}
                value={Number(compareParameters?.period ?? 20)}
                onChange={(e) =>
                  onCompareIndicatorChange(compareIndicatorKey, {
                    ...(compareParameters ?? {}),
                    period: parseInt(e.target.value, 10),
                  })
                }
                className={strategyFieldClass}
              />
            </div>
          ) : null}
          {opDef?.supportsPercent ? (
            <div>
              <label htmlFor="percent-value" className={strategyLabelClass}>
                Percent
              </label>
              <input
                id="percent-value"
                type="number"
                min={0}
                step={1}
                value={value ?? 50}
                onChange={(e) => onValueChange(Number(e.target.value))}
                className={strategyFieldClass}
              />
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
