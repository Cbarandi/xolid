export function normalizeSymbol(symbol: string): string {
  return symbol.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
}

/** Only Binance USDC spot pairs are allowed in this phase. */
export function isUsdcPair(symbol: string): boolean {
  const s = normalizeSymbol(symbol);
  return s.endsWith("USDC") && s.length > 4;
}

export function assertUsdcPair(symbol: string): void {
  if (!isUsdcPair(symbol)) {
    throw new Error(`Only USDC pairs are allowed: ${symbol}`);
  }
}

export function filterUsdcSymbols(symbols: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of symbols) {
    const s = normalizeSymbol(raw);
    if (!isUsdcPair(s) || seen.has(s)) continue;
    seen.add(s);
    out.push(s);
  }
  return out;
}

export function rejectNonUsdcSymbols(symbols: string[]): string[] {
  return symbols
    .map(normalizeSymbol)
    .filter((s) => s.length > 0 && !isUsdcPair(s));
}
