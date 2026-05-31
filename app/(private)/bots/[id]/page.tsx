import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BotLifecycleControls } from "@/components/bots/BotLifecycleControls";
import { PrivateAppShell } from "@/components/private/PrivateAppShell";
import { KpiGrid } from "@/components/private/KpiGrid";
import {
  privatePrimaryButtonClass,
  privateSecondaryButtonClass,
  privateSectionLabelClass,
  privateTableClass,
  privateTdClass,
  privateThClass,
} from "@/components/private/styles";
import {
  computeBotMetrics,
  getBot,
  listBotTrades,
  listBotTradesRaw,
} from "@/lib/bots/db";
import { formatDuration, formatPnlPct, formatPnlQuote } from "@/lib/bots/format";
import { StrategyBadge } from "@/components/bots/StrategyBadge";
import { formatDbSide, formatPrice, type DealRow } from "@/lib/bots/types";
import { getPageScope } from "@/lib/auth/page-scope";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const bot = await getBot(id);
    return { title: bot ? `${bot.name} — XOLID` : "Bot — XOLID" };
  } catch {
    return { title: "Bot — XOLID" };
  }
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-[28px] border border-white/10 bg-white/[0.02] px-6 py-6 sm:px-8 sm:py-7">
      <p className={privateSectionLabelClass}>{title}</p>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.28em] text-white/32">{label}</p>
      <p className="mt-2 text-[15px] font-medium tracking-[-0.02em] text-white/88">{value}</p>
    </div>
  );
}

function DealsTable({
  deals,
  mode,
}: {
  deals: DealRow[];
  mode: "open" | "closed";
}) {
  if (deals.length === 0) {
    return <p className="text-[14px] text-white/38">No {mode} deals.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className={`${privateTableClass} min-w-[720px]`}>
        <thead>
          <tr>
            <th className={privateThClass}>Symbol</th>
            <th className={privateThClass}>Side</th>
            <th className={privateThClass}>Entry</th>
            {mode === "closed" ? <th className={privateThClass}>Exit</th> : null}
            <th className={privateThClass}>PnL</th>
            <th className={privateThClass}>PnL %</th>
            <th className={privateThClass}>Opened</th>
            {mode === "closed" ? <th className={privateThClass}>Closed</th> : null}
            <th className={privateThClass}>Duration</th>
            {mode === "closed" ? <th className={privateThClass}>Reason</th> : null}
          </tr>
        </thead>
        <tbody>
          {deals.map((d) => (
            <tr key={d.id}>
              <td className={privateTdClass}>{d.symbol}</td>
              <td className={privateTdClass}>{d.side}</td>
              <td className={privateTdClass}>{formatPrice(d.entryPrice)}</td>
              {mode === "closed" ? (
                <td className={privateTdClass}>{formatPrice(d.exitPrice)}</td>
              ) : null}
              <td className={privateTdClass}>
                {d.pnlQuote != null ? formatPnlQuote(d.pnlQuote) : "—"}
              </td>
              <td className={privateTdClass}>
                {d.pnlPct != null ? formatPnlPct(d.pnlPct) : "—"}
              </td>
              <td className={privateTdClass}>
                {new Date(d.openedAt).toLocaleString()}
              </td>
              {mode === "closed" ? (
                <td className={privateTdClass}>
                  {d.closedAt ? new Date(d.closedAt).toLocaleString() : "—"}
                </td>
              ) : null}
              <td className={privateTdClass}>{formatDuration(d.durationMs)}</td>
              {mode === "closed" ? (
                <td className={privateTdClass}>{d.exitReason ?? "—"}</td>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default async function BotDetailPage({ params }: Props) {
  const { id } = await params;
  const { scope } = await getPageScope();

  let bot;
  let rawTrades;
  try {
    bot = await getBot(id, scope);
    if (!bot) notFound();
    rawTrades = await listBotTradesRaw(id);
  } catch {
    notFound();
  }

  const metrics = computeBotMetrics(bot, rawTrades);
  const trades = await listBotTrades(id);

  const openDeals: DealRow[] = rawTrades
    .filter((t) => t.status === "OPEN")
    .map((t) => ({
      id: t.id,
      botId: id,
      botName: bot.name,
      strategyName: bot.strategyName,
      symbol: t.symbol,
      side: formatDbSide(t.side),
      entryPrice: Number(t.entry_price),
      openedAt: t.opened_at ?? t.created_at,
      durationMs: Date.now() - new Date(t.opened_at ?? t.created_at).getTime(),
      status: "open" as const,
    }));

  const closedDeals: DealRow[] = rawTrades
    .filter((t) => t.status === "CLOSED")
    .map((t) => {
      const openedAt = t.opened_at ?? t.created_at;
      const closedAt = t.closed_at ?? undefined;
      return {
        id: t.id,
        botId: id,
        botName: bot.name,
        strategyName: bot.strategyName,
        symbol: t.symbol,
        side: formatDbSide(t.side),
        entryPrice: Number(t.entry_price),
        exitPrice: t.exit_price != null ? Number(t.exit_price) : undefined,
        pnlQuote: t.pnl_quote != null ? Number(t.pnl_quote) : undefined,
        pnlPct: t.pnl_pct != null ? Number(t.pnl_pct) : undefined,
        openedAt,
        closedAt,
        durationMs:
          closedAt != null
            ? new Date(closedAt).getTime() - new Date(openedAt).getTime()
            : 0,
        exitReason: t.exit_reason ?? undefined,
        status: "closed" as const,
      };
    });

  const canEdit = bot.dbStatus === "DRAFT" || bot.dbStatus === "PAUSED";

  return (
    <PrivateAppShell title={bot.name}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.38em] text-white/34">
            <span className="inline-flex flex-wrap items-center gap-2">
              {bot.strategyName}
              <StrategyBadge source={bot.strategySource} />
              · {bot.mode} · {bot.status}
            </span>
          </p>
          <h2 className="mt-2 text-[28px] font-medium tracking-[-0.04em] text-white sm:text-[36px]">
            {bot.name}
          </h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {canEdit ? (
            <Link href={`/bots/${id}/edit`} className={privatePrimaryButtonClass}>
              Edit
            </Link>
          ) : (
            <span className={`${privatePrimaryButtonClass} cursor-not-allowed opacity-40`}>
              Edit
            </span>
          )}
          <Link href={`/bots/${id}/copy`} className={privateSecondaryButtonClass}>
            Copy bot
          </Link>
          <Link href="/bots" className={privateSecondaryButtonClass}>
            All bots
          </Link>
        </div>
      </div>

      {bot.strategySource === "CUSTOM" ? (
        <p className="mt-6 max-w-[560px] rounded-[20px] border border-violet-400/20 bg-violet-400/5 px-4 py-3 text-[13px] leading-relaxed text-violet-100/75">
          Custom strategy bot — evaluated on closed Binance public candles during Paper Scan. Exit
          engine uses ticker prices; rule execution is v0 (RSI, CCI, EMA, SMA, ADX, Volume Ratio).
        </p>
      ) : null}

      <BotLifecycleControls botId={id} status={bot.status} />

      <KpiGrid
        items={[
          {
            label: "Active since",
            value: metrics.activeSince
              ? new Date(metrics.activeSince).toLocaleString()
              : "—",
          },
          { label: "Active duration", value: formatDuration(metrics.activeDurationMs) },
          { label: "Total deals", value: String(metrics.totalDeals) },
          { label: "Deals 24h", value: String(metrics.dealsLast24h) },
          { label: "Open deals", value: String(metrics.openDeals) },
          { label: "Closed deals", value: String(metrics.closedDeals) },
          { label: "Positive", value: String(metrics.positiveDeals) },
          { label: "Negative", value: String(metrics.negativeDeals) },
          { label: "SL hits", value: String(metrics.slHits) },
          { label: "TP hits", value: String(metrics.tpHits) },
          { label: "Timeout exits", value: String(metrics.timeoutExits) },
          {
            label: "PnL quote",
            value: formatPnlQuote(metrics.pnlQuote),
            tone: metrics.pnlQuote >= 0 ? "positive" : "negative",
          },
          {
            label: "PnL %",
            value: formatPnlPct(metrics.pnlPct),
            tone: metrics.pnlPct >= 0 ? "positive" : "negative",
          },
        ]}
      />

      <div className="mt-12 grid gap-5 lg:grid-cols-2">
        <Panel title="Configuration">
          <div className="grid gap-6 sm:grid-cols-2">
            <Stat label="Strategy" value={bot.strategyName} />
            <Stat label="Strategy type" value={bot.strategySource === "CUSTOM" ? "Custom" : "System"} />
            {bot.strategySource === "CUSTOM" && bot.customStrategyId ? (
              <div className="sm:col-span-2">
                <Stat
                  label="Custom strategy"
                  value={
                    <Link
                      href={`/strategies/${bot.customStrategyId}`}
                      className="text-white/70 underline-offset-2 hover:underline"
                    >
                      View strategy definition
                    </Link>
                  }
                />
              </div>
            ) : null}
            <Stat label="Side" value={bot.side} />
            <Stat label="Symbols" value={bot.symbols.join(", ") || "—"} />
            <Stat label="Capital / trade" value={`$${bot.capitalPerTrade}`} />
            <Stat label="Max open" value={String(bot.maxOpenTrades)} />
            <Stat label="Take profit" value={`${bot.takeProfitPct}%`} />
            <Stat label="Stop loss" value={`${bot.stopLossPct}%`} />
            <Stat label="Timeout" value={`${bot.timeoutMinutes} min`} />
            <Stat label="Trades loaded" value={String(trades.length)} />
          </div>
        </Panel>
      </div>

      <div className="mt-8 space-y-8">
        <Panel title="Open deals">
          <DealsTable deals={openDeals} mode="open" />
        </Panel>
        <Panel title="Closed deals">
          <DealsTable deals={closedDeals} mode="closed" />
        </Panel>
      </div>
    </PrivateAppShell>
  );
}
