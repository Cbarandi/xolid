import type { NormalizedCandle } from "@/lib/market/candles";

export type IndicatorSeries = (number | null)[];

function round(value: number, digits = 8): number {
  const f = 10 ** digits;
  return Math.round(value * f) / f;
}

export function computeSma(values: number[], period: number): IndicatorSeries {
  const out: IndicatorSeries = new Array(values.length).fill(null);
  if (period <= 0 || values.length < period) return out;

  let sum = 0;
  for (let i = 0; i < period; i++) sum += values[i]!;
  out[period - 1] = sum / period;

  for (let i = period; i < values.length; i++) {
    sum += values[i]! - values[i - period]!;
    out[i] = sum / period;
  }

  return out;
}

/** pandas ewm(adjust=False) equivalent seeded with SMA. */
export function computeEma(values: number[], period: number): IndicatorSeries {
  const out: IndicatorSeries = new Array(values.length).fill(null);
  if (period <= 0 || values.length < period) return out;

  let sum = 0;
  for (let i = 0; i < period; i++) sum += values[i]!;
  let ema = sum / period;
  out[period - 1] = ema;

  const k = 2 / (period + 1);
  for (let i = period; i < values.length; i++) {
    ema = values[i]! * k + ema * (1 - k);
    out[i] = ema;
  }

  return out;
}

/** RSI with Wilder smoothing. */
export function computeRsi(closes: number[], period: number): IndicatorSeries {
  const out: IndicatorSeries = new Array(closes.length).fill(null);
  if (period <= 0 || closes.length <= period) return out;

  let avgGain = 0;
  let avgLoss = 0;
  for (let i = 1; i <= period; i++) {
    const change = closes[i]! - closes[i - 1]!;
    if (change >= 0) avgGain += change;
    else avgLoss -= change;
  }
  avgGain /= period;
  avgLoss /= period;

  const rsiAt = (gain: number, loss: number) => {
    if (loss === 0) return 100;
    const rs = gain / loss;
    return 100 - 100 / (1 + rs);
  };

  out[period] = round(rsiAt(avgGain, avgLoss), 4);

  for (let i = period + 1; i < closes.length; i++) {
    const change = closes[i]! - closes[i - 1]!;
    const gain = change > 0 ? change : 0;
    const loss = change < 0 ? -change : 0;
    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;
    out[i] = round(rsiAt(avgGain, avgLoss), 4);
  }

  return out;
}

function typicalPrices(candles: NormalizedCandle[]): number[] {
  return candles.map((c) => (c.high + c.low + c.close) / 3);
}

/** CCI using TP, SMA(TP), and mean absolute deviation. */
export function computeCci(candles: NormalizedCandle[], period: number): IndicatorSeries {
  const out: IndicatorSeries = new Array(candles.length).fill(null);
  if (period <= 0 || candles.length < period) return out;

  const tps = typicalPrices(candles);
  for (let i = period - 1; i < candles.length; i++) {
    const slice = tps.slice(i - period + 1, i + 1);
    const sma = slice.reduce((s, v) => s + v, 0) / period;
    const mad = slice.reduce((s, v) => s + Math.abs(v - sma), 0) / period;
    if (mad === 0) out[i] = 0;
    else out[i] = round((tps[i]! - sma) / (0.015 * mad), 4);
  }

  return out;
}

/** ADX (Wilder). Returns ADX line only. */
export function computeAdx(candles: NormalizedCandle[], period: number): IndicatorSeries {
  const out: IndicatorSeries = new Array(candles.length).fill(null);
  if (period <= 0 || candles.length <= period * 2) return out;

  const tr: number[] = [];
  const plusDm: number[] = [];
  const minusDm: number[] = [];

  for (let i = 0; i < candles.length; i++) {
    if (i === 0) {
      tr.push(candles[i]!.high - candles[i]!.low);
      plusDm.push(0);
      minusDm.push(0);
      continue;
    }
    const upMove = candles[i]!.high - candles[i - 1]!.high;
    const downMove = candles[i - 1]!.low - candles[i]!.low;
    plusDm.push(upMove > downMove && upMove > 0 ? upMove : 0);
    minusDm.push(downMove > upMove && downMove > 0 ? downMove : 0);
    tr.push(
      Math.max(
        candles[i]!.high - candles[i]!.low,
        Math.abs(candles[i]!.high - candles[i - 1]!.close),
        Math.abs(candles[i]!.low - candles[i - 1]!.close),
      ),
    );
  }

  let smoothTr = tr.slice(1, period + 1).reduce((s, v) => s + v, 0);
  let smoothPlus = plusDm.slice(1, period + 1).reduce((s, v) => s + v, 0);
  let smoothMinus = minusDm.slice(1, period + 1).reduce((s, v) => s + v, 0);

  const dxValues: number[] = [];

  for (let i = period; i < candles.length; i++) {
    if (i > period) {
      smoothTr = smoothTr - smoothTr / period + tr[i]!;
      smoothPlus = smoothPlus - smoothPlus / period + plusDm[i]!;
      smoothMinus = smoothMinus - smoothMinus / period + minusDm[i]!;
    }

    const plusDi = smoothTr === 0 ? 0 : (100 * smoothPlus) / smoothTr;
    const minusDi = smoothTr === 0 ? 0 : (100 * smoothMinus) / smoothTr;
    const diSum = plusDi + minusDi;
    const dx = diSum === 0 ? 0 : (100 * Math.abs(plusDi - minusDi)) / diSum;
    dxValues.push(dx);

    if (dxValues.length === period) {
      const adx = dxValues.reduce((s, v) => s + v, 0) / period;
      out[i] = round(adx, 4);
    } else if (dxValues.length > period) {
      const prevAdx = out[i - 1] ?? dxValues.slice(0, period).reduce((s, v) => s + v, 0) / period;
      const adx = (prevAdx * (period - 1) + dx) / period;
      out[i] = round(adx, 4);
    }
  }

  return out;
}

/**
 * Current volume divided by SMA(volume, lookback) on prior candles.
 * At index i uses volumes[i-lookback..i-1] as baseline.
 */
export function computeVolumeRatio(volumes: number[], lookback: number): IndicatorSeries {
  const out: IndicatorSeries = new Array(volumes.length).fill(null);
  if (lookback <= 0 || volumes.length <= lookback) return out;

  for (let i = lookback; i < volumes.length; i++) {
    const baseline = volumes.slice(i - lookback, i);
    const avg = baseline.reduce((s, v) => s + v, 0) / lookback;
    if (avg > 0) out[i] = round(volumes[i]! / avg, 4);
  }

  return out;
}

export function latestPair(series: IndicatorSeries): { previous: number | null; current: number | null } {
  let current: number | null = null;
  let previous: number | null = null;

  for (let i = series.length - 1; i >= 0; i--) {
    const v = series[i];
    if (v == null) continue;
    if (current == null) {
      current = v;
      continue;
    }
    previous = v;
    break;
  }

  return { previous, current };
}

export function closesFromCandles(candles: NormalizedCandle[]): number[] {
  return candles.map((c) => c.close);
}

export function volumesFromCandles(candles: NormalizedCandle[]): number[] {
  return candles.map((c) => c.volume);
}

export function periodFromParams(params: Record<string, number | string>, fallback = 14): number {
  const raw = params.period ?? params.lookback ?? fallback;
  const n = typeof raw === "number" ? raw : Number(raw);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback;
}
