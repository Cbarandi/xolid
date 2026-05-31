import type { Metadata } from "next";
import Link from "next/link";
import { PrivateAppShell } from "@/components/private/PrivateAppShell";
import {
  privateActionLinkClass,
  privateTableClass,
  privateTableWrapClass,
  privateTdClass,
  privateThClass,
} from "@/components/private/styles";
import { listAllClosedTrades } from "@/lib/bots/db";
import { getPageScope } from "@/lib/auth/page-scope";
import { formatDuration, formatPnlPct, formatPnlQuote } from "@/lib/bots/format";
import { formatPrice, type DealRow } from "@/lib/bots/types";

export const metadata: Metadata = {
  title: "Closed Deals — XOLID",
  robots: { index: false, follow: false },
};

export default async function ClosedDealsPage() {
  const { scope } = await getPageScope();
  let deals: DealRow[] = [];
  let loadError: string | null = null;

  try {
    deals = await listAllClosedTrades(scope);
  } catch {
    loadError = "Unable to load closed deals.";
    deals = [];
  }

  return (
    <PrivateAppShell title="Closed Deals">
      <p className="text-[10px] font-medium uppercase tracking-[0.38em] text-white/34">Deals</p>
      <h2 className="mt-3 text-[28px] font-medium tracking-[-0.04em] text-white sm:text-[36px]">
        Closed deals
      </h2>
      <p className="mt-4 max-w-[560px] text-[14px] leading-relaxed text-white/48">
        All closed paper trades across bots.
      </p>

      {loadError ? (
        <p className="mt-8 text-[13px] text-red-300/85" role="alert">
          {loadError}
        </p>
      ) : null}

      {deals.length === 0 && !loadError ? (
        <p className="mt-10 text-[14px] text-white/40">No closed deals yet.</p>
      ) : null}

      {deals.length > 0 ? (
        <div className={privateTableWrapClass}>
          <table className={privateTableClass}>
            <thead>
              <tr>
                <th className={privateThClass}>Bot</th>
                <th className={privateThClass}>Symbol</th>
                <th className={privateThClass}>Side</th>
                <th className={privateThClass}>Entry</th>
                <th className={privateThClass}>Exit</th>
                <th className={privateThClass}>PnL</th>
                <th className={privateThClass}>PnL %</th>
                <th className={privateThClass}>Opened</th>
                <th className={privateThClass}>Closed</th>
                <th className={privateThClass}>Duration</th>
                <th className={privateThClass}>Exit reason</th>
                <th className={privateThClass}>Strategy</th>
              </tr>
            </thead>
            <tbody>
              {deals.map((d) => (
                <tr key={d.id}>
                  <td className={privateTdClass}>
                    <Link href={`/bots/${d.botId}`} className={privateActionLinkClass}>
                      {d.botName}
                    </Link>
                  </td>
                  <td className={privateTdClass}>{d.symbol}</td>
                  <td className={privateTdClass}>{d.side}</td>
                  <td className={privateTdClass}>{formatPrice(d.entryPrice)}</td>
                  <td className={privateTdClass}>{formatPrice(d.exitPrice)}</td>
                  <td className={privateTdClass}>
                    {d.pnlQuote != null ? formatPnlQuote(d.pnlQuote) : "—"}
                  </td>
                  <td className={privateTdClass}>
                    {d.pnlPct != null ? formatPnlPct(d.pnlPct) : "—"}
                  </td>
                  <td className={privateTdClass}>{new Date(d.openedAt).toLocaleString()}</td>
                  <td className={privateTdClass}>
                    {d.closedAt ? new Date(d.closedAt).toLocaleString() : "—"}
                  </td>
                  <td className={privateTdClass}>{formatDuration(d.durationMs)}</td>
                  <td className={privateTdClass}>{d.exitReason ?? "—"}</td>
                  <td className={privateTdClass}>{d.strategyName}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </PrivateAppShell>
  );
}
