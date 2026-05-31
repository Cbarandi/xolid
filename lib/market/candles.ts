export type CandleInterval = "5m" | "15m" | "1h" | "4h" | "1d";

export type NormalizedCandle = {
  timestampOpen: number;
  timestampClose: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

export const INTERVAL_MS: Record<CandleInterval, number> = {
  "5m": 5 * 60 * 1000,
  "15m": 15 * 60 * 1000,
  "1h": 60 * 60 * 1000,
  "4h": 4 * 60 * 60 * 1000,
  "1d": 24 * 60 * 60 * 1000,
};

/** Drop candles that have not closed yet (including the forming bar). */
export function filterClosedCandles(
  candles: NormalizedCandle[],
  nowMs = Date.now(),
): NormalizedCandle[] {
  return candles.filter((c) => c.timestampClose <= nowMs);
}

export function parseBinanceKlines(raw: unknown[][]): NormalizedCandle[] {
  return raw.map((row) => ({
    timestampOpen: Number(row[0]),
    timestampClose: Number(row[6]),
    open: Number(row[1]),
    high: Number(row[2]),
    low: Number(row[3]),
    close: Number(row[4]),
    volume: Number(row[5]),
  }));
}
