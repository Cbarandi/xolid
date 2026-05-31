import type { DealRow } from "./types";
import { getTickerPrices } from "@/lib/market/binance-public";
import { computePnlPct, computePnlQuote } from "@/lib/market/pnl";

export async function enrichOpenDealsWithLivePrices(
  deals: DealRow[],
): Promise<DealRow[]> {
  if (deals.length === 0) return deals;

  let prices: Record<string, number> = {};
  try {
    prices = await getTickerPrices(deals.map((d) => d.symbol));
  } catch {
    return deals;
  }

  return deals.map((deal) => {
    const currentPrice = prices[deal.symbol];
    if (currentPrice == null || deal.entryPrice <= 0) return deal;

    const side = deal.side === "short" ? "SHORT" : "LONG";
    const pnlPct = Math.round(computePnlPct(side, deal.entryPrice, currentPrice) * 100) / 100;
    const notional =
      deal.quantity != null && deal.quantity > 0
        ? deal.quantity * deal.entryPrice
        : deal.entryPrice;
    const pnlQuote = computePnlQuote(notional, pnlPct);

    return { ...deal, currentPrice, pnlPct, pnlQuote };
  });
}
