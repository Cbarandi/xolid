import type { Metadata } from "next";
import Link from "next/link";
import { PrivateAppShell } from "@/components/private/PrivateAppShell";
import { BotRowActions } from "@/components/bots/BotRowActions";
import {
  privatePrimaryButtonClass,
  privateTableClass,
  privateTableWrapClass,
  privateTdClass,
  privateThClass,
} from "@/components/private/styles";
import { getBotPerformanceSummaries } from "@/lib/bots/db";
import type { BotPerformanceSummary } from "@/lib/bots/types";
import { getPageScope } from "@/lib/auth/page-scope";
import { StrategyCell } from "@/components/bots/StrategyBadge";
import { formatActiveTime, formatPnlPct, formatPnlQuote } from "@/lib/bots/format";

export const metadata: Metadata = {
  title: "Trading Bots — XOLID",
  robots: { index: false, follow: false },
};

export default async function BotsListPage() {
  const { scope } = await getPageScope();
  let bots: BotPerformanceSummary[] = [];
  let loadError: string | null = null;

  try {
    bots = await getBotPerformanceSummaries(scope);
  } catch {
    loadError = "Unable to load bots. Check Supabase configuration and run the trading_bots migration.";
    bots = [];
  }

  return (
    <PrivateAppShell title="Bots">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.38em] text-white/34">Product</p>
          <h2 className="mt-3 text-[28px] font-medium tracking-[-0.04em] text-white sm:text-[36px]">
            Trading bots
          </h2>
          <p className="mt-4 max-w-[560px] text-[14px] leading-relaxed text-white/48">
            Paper mode only. Create, monitor and manage automated bots.
          </p>
        </div>
        <Link href="/bots/new" className={privatePrimaryButtonClass}>
          Create bot
        </Link>
      </div>

      {loadError ? (
        <p className="mt-8 text-[13px] text-red-300/85" role="alert">
          {loadError}
        </p>
      ) : null}

      {bots.length === 0 && !loadError ? (
        <div className="mt-12 rounded-[28px] border border-white/10 bg-white/[0.02] px-6 py-12">
          <p className="text-[14px] text-white/45">No bots yet. Create your first paper bot.</p>
          <Link href="/bots/new" className={`${privatePrimaryButtonClass} mt-6 inline-flex`}>
            Create bot
          </Link>
        </div>
      ) : null}

      {bots.length > 0 ? (
        <div className={privateTableWrapClass}>
          <table className={privateTableClass}>
            <thead>
              <tr>
                <th className={privateThClass}>Name</th>
                <th className={privateThClass}>Status</th>
                <th className={privateThClass}>Strategy</th>
                <th className={privateThClass}>Mode</th>
                <th className={privateThClass}>Side</th>
                <th className={privateThClass}>Symbols</th>
                <th className={privateThClass}>Active time</th>
                <th className={privateThClass}>Deals</th>
                <th className={privateThClass}>Open</th>
                <th className={privateThClass}>Closed</th>
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
                  <td className={privateTdClass}>{bot.mode}</td>
                  <td className={privateTdClass}>{bot.side}</td>
                  <td className={privateTdClass}>{bot.symbols.join(", ")}</td>
                  <td className={privateTdClass}>
                    {formatActiveTime(bot.activeSince, bot.dbStatus === "ACTIVE")}
                  </td>
                  <td className={privateTdClass}>{bot.totalDeals}</td>
                  <td className={privateTdClass}>{bot.openDeals}</td>
                  <td className={privateTdClass}>{bot.closedDeals}</td>
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
      ) : null}
    </PrivateAppShell>
  );
}
