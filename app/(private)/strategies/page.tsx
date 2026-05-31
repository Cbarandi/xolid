import type { Metadata } from "next";
import Link from "next/link";
import { PrivateAppShell } from "@/components/private/PrivateAppShell";
import {
  privatePrimaryButtonClass,
  privateSecondaryButtonClass,
} from "@/components/private/styles";
import { strategyCardClass } from "@/components/strategies/styles";
import { STRATEGIES_META } from "@/lib/bots/strategies-meta";
import { listCustomStrategies } from "@/lib/strategies/db";
import { getPageScope } from "@/lib/auth/page-scope";

export const metadata: Metadata = {
  title: "Strategies — XOLID",
  robots: { index: false, follow: false },
};

export default async function StrategiesPage() {
  const { scope } = await getPageScope();
  let customStrategies: Awaited<ReturnType<typeof listCustomStrategies>> = [];
  let customLoadError: string | null = null;

  try {
    customStrategies = await listCustomStrategies(scope);
  } catch {
    customLoadError =
      "Custom strategies unavailable. Run the custom_strategies migration in Supabase.";
  }

  return (
    <PrivateAppShell title="Strategies">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.38em] text-white/34">
            Catalog
          </p>
          <h2 className="mt-3 text-[28px] font-medium tracking-[-0.04em] text-white sm:text-[36px]">
            Strategies
          </h2>
          <p className="mt-4 max-w-[560px] text-[14px] leading-relaxed text-white/48">
            System strategies for bots plus custom rule-based strategies you define.
          </p>
        </div>
        <Link href="/strategies/new" className={privatePrimaryButtonClass}>
          Create strategy
        </Link>
      </div>

      <section className="mt-10">
        <p className="text-[10px] font-medium uppercase tracking-[0.34em] text-white/34">
          System strategies
        </p>
        <ul className="mt-4 space-y-3">
          {STRATEGIES_META.map((s) => (
            <li key={s.key} className={strategyCardClass}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-[15px] font-medium text-white/90">{s.name}</p>
                  <p className="mt-1 text-[11px] uppercase tracking-[0.2em] text-white/32">
                    {s.key}
                  </p>
                </div>
                <span className="rounded-full border border-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-white/45">
                  {s.status === "available" ? "Available" : "Coming soon"}
                </span>
              </div>
              <p className="mt-3 text-[13px] leading-relaxed text-white/48">{s.description}</p>
              <dl className="mt-4 grid grid-cols-2 gap-3 text-[12px] text-white/40 sm:grid-cols-4">
                <div>
                  <dt className="uppercase tracking-[0.16em]">TP</dt>
                  <dd className="mt-1 text-white/72">{s.defaultTp}%</dd>
                </div>
                <div>
                  <dt className="uppercase tracking-[0.16em]">SL</dt>
                  <dd className="mt-1 text-white/72">{s.defaultSl}%</dd>
                </div>
                <div>
                  <dt className="uppercase tracking-[0.16em]">Timeout</dt>
                  <dd className="mt-1 text-white/72">{s.defaultTimeoutMinutes}m</dd>
                </div>
                <div>
                  <dt className="uppercase tracking-[0.16em]">Sides</dt>
                  <dd className="mt-1 text-white/72">{s.allowedSides.join(", ")}</dd>
                </div>
              </dl>
              {s.status === "available" ? (
                <Link
                  href={`/bots/new?strategy_source=SYSTEM&strategy_key=${s.key}`}
                  className={`${privateSecondaryButtonClass} mt-5 inline-flex !flex-none`}
                >
                  Use in bot
                </Link>
              ) : null}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-12">
        <p className="text-[10px] font-medium uppercase tracking-[0.34em] text-white/34">
          Custom strategies
        </p>

        {customLoadError ? (
          <p className="mt-4 text-[13px] text-amber-200/80" role="status">
            {customLoadError}
          </p>
        ) : null}

        {customStrategies.length === 0 && !customLoadError ? (
          <div className={`${strategyCardClass} mt-4`}>
            <p className="text-[14px] text-white/48">
              No custom strategies yet. Build your first rule-based strategy with indicators and
              conditions.
            </p>
            <Link href="/strategies/new" className={`${privatePrimaryButtonClass} mt-5 inline-flex`}>
              Create strategy
            </Link>
          </div>
        ) : null}

        {customStrategies.length > 0 ? (
          <ul className="mt-4 space-y-3">
            {customStrategies.map((s) => {
              const ruleCount = s.definition.ruleGroups.reduce(
                (n, g) => n + g.rules.length,
                0,
              );
              return (
                <li key={s.id} className={strategyCardClass}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <Link
                        href={`/strategies/${s.id}`}
                        className="text-[15px] font-medium text-white/90 hover:underline"
                      >
                        {s.name}
                      </Link>
                      <p className="mt-1 text-[11px] uppercase tracking-[0.2em] text-white/32">
                        {s.status} · {s.definition.ruleGroups.length} group
                        {s.definition.ruleGroups.length === 1 ? "" : "s"} · {ruleCount} rule
                        {ruleCount === 1 ? "" : "s"}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Link
                        href={`/bots/new?strategy_source=CUSTOM&custom_strategy_id=${s.id}`}
                        className={privatePrimaryButtonClass}
                      >
                        Use in bot
                      </Link>
                      <Link href={`/strategies/${s.id}/edit`} className={privateSecondaryButtonClass}>
                        Edit
                      </Link>
                    </div>
                  </div>
                  {s.description ? (
                    <p className="mt-3 text-[13px] leading-relaxed text-white/48">{s.description}</p>
                  ) : null}
                </li>
              );
            })}
          </ul>
        ) : null}
      </section>
    </PrivateAppShell>
  );
}
