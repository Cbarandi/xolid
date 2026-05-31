import type { StrategySource } from "@/lib/bots/types";
import { strategySourceLabel } from "@/lib/bots/strategy-display";

type Props = {
  source: StrategySource;
  className?: string;
};

export function StrategyBadge({ source, className = "" }: Props) {
  const isCustom = source === "CUSTOM";
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[9px] uppercase tracking-[0.18em] ${
        isCustom
          ? "border-violet-400/25 bg-violet-400/10 text-violet-200/85"
          : "border-white/12 bg-white/[0.04] text-white/50"
      } ${className}`.trim()}
    >
      {strategySourceLabel(source)}
    </span>
  );
}

type CellProps = {
  name: string;
  source: StrategySource;
};

export function StrategyCell({ name, source }: CellProps) {
  return (
    <span className="inline-flex flex-col items-start gap-1.5">
      <span className="text-white/78">{name}</span>
      <StrategyBadge source={source} />
    </span>
  );
}
