/** Deterministic pseudo-random in [0, 1) from a string seed. */
export function deterministicUnit(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967296;
}

export function deterministicRange(seed: string, min: number, max: number): number {
  return min + deterministicUnit(seed) * (max - min);
}

export const MOCK_SYMBOL_BASE_PRICE: Record<string, number> = {
  BTCUSDT: 65_000,
  ETHUSDT: 3_500,
  SOLUSDT: 180,
};

export function mockBasePrice(symbol: string): number {
  return MOCK_SYMBOL_BASE_PRICE[symbol.toUpperCase()] ?? 100;
}
