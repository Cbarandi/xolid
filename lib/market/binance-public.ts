import type { MarketDataProvider } from "./types";
import {
  filterClosedCandles,
  parseBinanceKlines,
  type CandleInterval,
  type NormalizedCandle,
} from "./candles";
import { assertUsdcPair, filterUsdcSymbols, normalizeSymbol } from "./symbol-guard";

export type { CandleInterval, NormalizedCandle };
export { filterClosedCandles };

/** Public Spot REST API only — no keys, no signed routes, no orders. */
const BINANCE_PUBLIC_BASE =
  process.env.BINANCE_PUBLIC_API_BASE?.trim() || "https://api.binance.com";

type TickerRow = { symbol: string; price: string };

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Binance public API error ${res.status} for ${url}`);
  }
  return res.json() as Promise<T>;
}

export { normalizeSymbol };

export async function getTickerPrice(symbol: string): Promise<number> {
  const normalized = normalizeSymbol(symbol);
  assertUsdcPair(normalized);

  const url = `${BINANCE_PUBLIC_BASE}/api/v3/ticker/price?symbol=${encodeURIComponent(normalized)}`;
  const row = await fetchJson<TickerRow>(url);
  const price = Number(row.price);

  if (!Number.isFinite(price) || price <= 0) {
    throw new Error(`Invalid Binance ticker price for ${normalized}`);
  }

  return price;
}

export async function getTickerPrices(symbols: string[]): Promise<Record<string, number>> {
  const wanted = filterUsdcSymbols(symbols);
  const out: Record<string, number> = {};
  if (wanted.length === 0) return out;

  const url = `${BINANCE_PUBLIC_BASE}/api/v3/ticker/price`;
  const rows = await fetchJson<TickerRow[]>(url);
  const wantedSet = new Set(wanted);

  for (const row of rows) {
    if (!wantedSet.has(row.symbol)) continue;
    const price = Number(row.price);
    if (Number.isFinite(price) && price > 0) {
      out[row.symbol] = price;
    }
  }

  return out;
}

const SUPPORTED_INTERVALS: CandleInterval[] = ["5m", "15m", "1h", "4h", "1d"];

export function isSupportedKlineInterval(interval: string): interval is CandleInterval {
  return SUPPORTED_INTERVALS.includes(interval as CandleInterval);
}

/** Fetch Binance public klines — closed candles only (forming bar excluded). */
export async function getKlines(
  symbol: string,
  interval: CandleInterval,
  limit: number,
): Promise<NormalizedCandle[]> {
  const normalized = normalizeSymbol(symbol);
  assertUsdcPair(normalized);

  const capped = Math.min(Math.max(limit, 2), 1000);
  const url =
    `${BINANCE_PUBLIC_BASE}/api/v3/klines?symbol=${encodeURIComponent(normalized)}` +
    `&interval=${encodeURIComponent(interval)}&limit=${capped}`;

  const raw = await fetchJson<unknown[][]>(url);
  const parsed = parseBinanceKlines(raw);
  return filterClosedCandles(parsed);
}

export const binancePublicProvider: MarketDataProvider = {
  getTickerPrice,
  getTickerPrices,
  normalizeSymbol,
};
