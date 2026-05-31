"use client";

import { useMemo, useState } from "react";
import {
  getIndicator,
  getIndicatorsByCategory,
  INDICATOR_CATEGORIES,
} from "@/lib/strategies/indicator-registry";
import type { IndicatorKey, IndicatorParameters } from "@/lib/strategies/types";
import {
  strategyChipActiveClass,
  strategyChipClass,
  strategyChipIdleClass,
  strategyFieldClass,
  strategyLabelClass,
} from "./styles";

type Props = {
  value: IndicatorKey;
  parameters: IndicatorParameters;
  onIndicatorChange: (key: IndicatorKey, defaults: IndicatorParameters) => void;
  onParameterChange: (key: string, value: number | string) => void;
};

export function IndicatorPicker({
  value,
  parameters,
  onIndicatorChange,
  onParameterChange,
}: Props) {
  const indicator = getIndicator(value);
  const [category, setCategory] = useState(indicator?.category ?? "Momentum");

  const categoryIndicators = useMemo(
    () => getIndicatorsByCategory(category),
    [category],
  );

  return (
    <div className="space-y-4">
      <div>
        <span className={strategyLabelClass}>Category</span>
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {INDICATOR_CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`${strategyChipClass} ${category === cat ? strategyChipActiveClass : strategyChipIdleClass}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="indicator-select" className={strategyLabelClass}>
          Indicator
        </label>
        <select
          id="indicator-select"
          value={value}
          onChange={(e) => {
            const key = e.target.value as IndicatorKey;
            const def = getIndicator(key);
            if (def) onIndicatorChange(key, { ...def.defaultParameters });
          }}
          className={strategyFieldClass}
        >
          {categoryIndicators.map((ind) => (
            <option key={ind.key} value={ind.key} className="bg-black">
              {ind.label}
            </option>
          ))}
        </select>
        {indicator ? (
          <p className="mt-2 text-[12px] leading-relaxed text-white/38">{indicator.description}</p>
        ) : null}
      </div>

      {indicator && indicator.parameters.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {indicator.parameters.map((param) => (
            <div key={param.key}>
              <label htmlFor={`param-${param.key}`} className={strategyLabelClass}>
                {param.label}
              </label>
              {param.type === "select" ? (
                <select
                  id={`param-${param.key}`}
                  value={String(parameters[param.key] ?? param.defaultValue)}
                  onChange={(e) => onParameterChange(param.key, e.target.value)}
                  className={strategyFieldClass}
                >
                  {(param.options ?? []).map((opt) => (
                    <option key={String(opt.value)} value={String(opt.value)} className="bg-black">
                      {opt.label}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  id={`param-${param.key}`}
                  type="number"
                  min={param.min}
                  max={param.max}
                  step={param.step ?? (param.type === "integer" ? 1 : 0.1)}
                  value={Number(parameters[param.key] ?? param.defaultValue)}
                  onChange={(e) =>
                    onParameterChange(
                      param.key,
                      param.type === "integer" ? parseInt(e.target.value, 10) : Number(e.target.value),
                    )
                  }
                  className={strategyFieldClass}
                />
              )}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
