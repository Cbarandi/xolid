import type { Metadata } from "next";
import Link from "next/link";
import { PrivateAppShell } from "@/components/private/PrivateAppShell";
import { KpiGrid } from "@/components/private/KpiGrid";
import { BotRowActions } from "@/components/bots/BotRowActions";
import {
  privateActionLinkClass,
  privatePrimaryButtonClass,
  privateTableClass,
  privateTableWrapClass,
  privateTdClass,
  privateThClass,
} from "@/components/private/styles";
import { getBotPerformanceSummaries, getDashboardMetrics } from "@/lib/bots/db";
import type { BotPerformanceSummary, DashboardMetrics } from "@/lib/bots/types";
import { getPageScope } from "@/lib/auth/page-scope";
import { StrategyCell } from "@/components/bots/StrategyBadge";
import { formatActiveTime, formatPnlPct, formatPnlQuote } from "@/lib/bots/format";

export const metadata: Metadata = {
  title: "Dashboard — XOLID",
  robots: { index: false, follow: false },
};

export default async function DashboardPage() {
  const { scope } = await getPageScope();
  let metrics: DashboardMetrics;
  let bots: BotPerformanceSummary[] = [];
  let loadError: string | null = null;

  try {
    [metrics, bots] = await Promise.all([
      getDashboardMetrics(scope),
      getBotPerformanceSummaries(scope),
    ]);
  } catch {
    loadError = "Unable to load dashboard. Check Supabase configuration.";
    metrics = {
      totalBots: 0,
      activeBots: 0,
      totalOpenDeals: 0,
      totalClosedDeals: 0,
      dealsLast24h: 0,
      totalPnlQuote: 0,
      totalPnlPct: 0,
      winningDeals: 0,
      losingDeals: 0,
      stopLossHits: 0,
    };
    bots = [];
  }

  return (
    <PrivateAppShell title="Dashboard">
      <p className="text-[10px] font-medium uppercase tracking-[0.38em] text-white/34">Overview</p>
      <h2 className="mt-3 text-[28px] font-medium tracking-[-0.04em] text-white sm:text-[36px]">
        Trading dashboard
      </h2>
      <p className="mt-4 max-w-[560px] text-[14px] leading-relaxed text-white/48">
        Paper trading metrics across all bots and deals.
      </p>

      {loadError ? (
        <p className="mt-8 text-[13px] text-red-300/85" role="alert">
          {loadError}
        </p>
      ) : null}

      <KpiGrid
        items={[
          { label: "Total bots", value: String(metrics.totalBots) },
          { label: "Active bots", value: String(metrics.activeBots) },
          { label: "Open deals", value: String(metrics.totalOpenDeals) },
          { label: "Closed deals", value: String(metrics.totalClosedDeals) },
          { label: "Deals 24h", value: String(metrics.dealsLast24h) },
          {
            label: "Total PnL",
            value: formatPnlQuote(metrics.totalPnlQuote),
            tone: metrics.totalPnlQuote >= 0 ? "positive" : "negative",
          },
          {
            label: "Total PnL %",
            value: formatPnlPct(metrics.totalPnlPct),
            tone: metrics.totalPnlPct >= 0 ? "positive" : "negative",
          },
          { label: "Winning deals", value: String(metrics.winningDeals) },
          { label: "Losing deals", value: String(metrics.losingDeals) },
          { label: "Stop loss hits", value: String(metrics.stopLossHits) },
        ]}
      />

      <div className="mt-12 flex flex-wrap items-center justify-between gap-4">
        <p className="text-[10px] font-medium uppercase tracking-[0.38em] text-white/34">
          Bot performance
        </p>
        <Link href="/bots/new" className={privatePrimaryButtonClass}>
          Create bot
        </Link>
      </div>

      {bots.length === 0 ? (
        <p className="mt-8 text-[14px] text-white/40">No bots yet.</p>
      ) : (
        <div className={privateTableWrapClass}>
          <table className={privateTableClass}>
            <thead>
              <tr>
                <th className={privateThClass}>Bot</th>
                <th className={privateThClass}>Status</th>
                <th className={privateThClass}>Strategy</th>
                <th className={privateThClass}>Symbols</th>
                <th className={privateThClass}>Active time</th>
                <th className={privateThClass}>Deals</th>
                <th className={privateThClass}>24h</th>
                <th className={privateThClass}>+ / −</th>
                <th className={privateThClass}>SL</th>
                <th className={privateThClass}>PnL</th>
                <th className={privateThClass}>PnL %</th>
                <th className={privateThClass}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bots.map((bot) => (
                <tr key={bot.id}>
                  <td className={privateTdClass}>
                    <Link href={`/bots/${bot.id}`} className="text-white/90 hover:underline">
                      {bot.name}
                    </Link>
                  </td>
                  <td className={privateTdClass}>{bot.status}</td>
                  <td className={privateTdClass}>
                    <StrategyCell name={bot.strategyName} source={bot.strategySource} />
                  </td>
                  <td className={privateTdClass}>{bot.symbolsCount}</td>
                  <td className={privateTdClass}>
                    {formatActiveTime(bot.activeSince, bot.dbStatus === "ACTIVE")}
                  </td>
                  <td className={privateTdClass}>{bot.totalDeals}</td>
                  <td className={privateTdClass}>{bot.dealsLast24h}</td>
                  <td className={privateTdClass}>
                    {bot.positiveDeals} / {bot.negativeDeals}
                  </td>
                  <td className={privateTdClass}>{bot.stopLossHits}</td>
                  <td className={privateTdClass}>{formatPnlQuote(bot.pnlQuote)}</td>
                  <td className={privateTdClass}>{formatPnlPct(bot.pnlPct)}</td>
                  <td className={privateTdClass}>
                    <BotRowActions botId={bot.id} status={bot.status} compact />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-10 flex flex-wrap gap-4">
        <Link href="/deals/active" className={privateActionLinkClass}>
          View active deals →
        </Link>
        <Link href="/bots" className={privateActionLinkClass}>
          All bots →
        </Link>
      </div>
    </PrivateAppShell>
  );
}
