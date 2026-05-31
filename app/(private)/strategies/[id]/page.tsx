import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PrivateAppShell } from "@/components/private/PrivateAppShell";
import {
  privatePrimaryButtonClass,
  privateSecondaryButtonClass,
} from "@/components/private/styles";
import { strategyCardClass } from "@/components/strategies/styles";
import { getCustomStrategy } from "@/lib/strategies/db";
import { getPageScope } from "@/lib/auth/page-scope";
import { formatRuleSummary } from "@/lib/strategies/rule-summary";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const strategy = await getCustomStrategy(id).catch(() => null);
  return {
    title: strategy ? `${strategy.name} — Strategies — XOLID` : "Strategy — XOLID",
  };
}

export default async function StrategyDetailPage({ params }: Props) {
  const { id } = await params;
  const { scope } = await getPageScope();
  const strategy = await getCustomStrategy(id, scope).catch(() => null);
  if (!strategy) notFound();

  const { definition } = strategy;

  return (
    <PrivateAppShell title={strategy.name}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href="/strategies"
            className="text-[11px] uppercase tracking-[0.28em] text-white/40 transition hover:text-white/70"
          >
            ← Strategies
          </Link>
          <p className="mt-4 text-[10px] font-medium uppercase tracking-[0.38em] text-white/34">
            Custom · {strategy.status}
          </p>
          <h2 className="mt-2 text-[28px] font-medium tracking-[-0.04em] text-white sm:text-[36px]">
            {strategy.name}
          </h2>
          {strategy.description ? (
            <p className="mt-3 max-w-[560px] text-[14px] leading-relaxed text-white/48">
              {strategy.description}
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={`/strategies/${id}/edit`} className={privatePrimaryButtonClass}>
            Edit
          </Link>
          <Link href="/strategies/new" className={privateSecondaryButtonClass}>
            New strategy
          </Link>
        </div>
      </div>

      <p className="mt-6 text-[12px] text-white/35">
        Groups match: {definition.groupMatchMode === "all" ? "All (AND)" : "Any (OR)"} · Version{" "}
        {definition.version}
      </p>

      <div className="mt-8 space-y-4">
        {definition.ruleGroups.map((group, groupIndex) => (
          <section key={group.id} className={strategyCardClass}>
            <p className="text-[10px] uppercase tracking-[0.26em] text-white/32">
              Group {groupIndex + 1} · {group.matchMode === "all" ? "All rules" : "Any rule"}
            </p>
            <h3 className="mt-1 text-[17px] font-medium text-white/88">{group.name}</h3>
            <ul className="mt-4 space-y-3">
              {group.rules.map((rule, ruleIndex) => (
                <li
                  key={rule.id}
                  className="rounded-2xl border border-white/8 bg-black/20 px-4 py-3"
                >
                  <p className="text-[10px] uppercase tracking-[0.2em] text-white/28">
                    Rule {ruleIndex + 1}
                  </p>
                  <p className="mt-2 text-[14px] leading-snug text-white/78">
                    {formatRuleSummary(rule)}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <p className="mt-8 text-[12px] text-white/30">
        Saved {new Date(strategy.updatedAt).toLocaleString()} · No execution or backtest yet
      </p>
    </PrivateAppShell>
  );
}
