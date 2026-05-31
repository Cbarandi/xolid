"use client";

import { TIMEFRAMES, type Timeframe } from "@/lib/strategies/types";
import {
  strategyChipActiveClass,
  strategyChipClass,
  strategyChipIdleClass,
  strategyLabelClass,
} from "./styles";

type Props = {
  value: Timeframe;
  onChange: (value: Timeframe) => void;
};

export function TimeframePicker({ value, onChange }: Props) {
  return (
    <div>
      <span className={strategyLabelClass}>Timeframe</span>
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {TIMEFRAMES.map((tf) => {
          const active = value === tf;
          return (
            <button
              key={tf}
              type="button"
              onClick={() => onChange(tf)}
              className={`${strategyChipClass} ${active ? strategyChipActiveClass : strategyChipIdleClass}`}
            >
              {tf}
            </button>
          );
        })}
      </div>
    </div>
  );
}
