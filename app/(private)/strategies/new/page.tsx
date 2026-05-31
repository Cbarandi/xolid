import type { Metadata } from "next";
import Link from "next/link";
import { PrivateAppShell } from "@/components/private/PrivateAppShell";
import { StrategyBuilder } from "@/components/strategies/StrategyBuilder";
import { createEmptyStrategyDefinition } from "@/lib/strategies/defaults";

export const metadata: Metadata = {
  title: "Create Strategy — XOLID",
  robots: { index: false, follow: false },
};

export default function NewStrategyPage() {
  const initial = createEmptyStrategyDefinition();

  return (
    <PrivateAppShell title="Create Strategy">
      <div className="mb-6">
        <Link
          href="/strategies"
          className="text-[11px] uppercase tracking-[0.28em] text-white/40 transition hover:text-white/70"
        >
          ← Strategies
        </Link>
        <p className="mt-4 text-[10px] font-medium uppercase tracking-[0.38em] text-white/34">
          Builder
        </p>
        <h2 className="mt-3 text-[28px] font-medium tracking-[-0.04em] text-white sm:text-[36px]">
          New strategy
        </h2>
        <p className="mt-3 max-w-[560px] text-[14px] leading-relaxed text-white/48">
          Define rule groups with indicators, timeframes and conditions. Paper mode only — no
          execution yet.
        </p>
      </div>

      <StrategyBuilder mode="create" initial={initial} />
    </PrivateAppShell>
  );
}
