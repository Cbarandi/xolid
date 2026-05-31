export type MarketPrice = {
  symbol: string;
  price: number;
  source: "binance_public";
  fetchedAt: string;
};

export type MarketDataProvider = {
  getTickerPrice(symbol: string): Promise<number>;
  getTickerPrices(symbols: string[]): Promise<Record<string, number>>;
  normalizeSymbol(symbol: string): string;
};
