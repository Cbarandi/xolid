export type CoinListKey =
  | "BIG_CAP"
  | "LARGE"
  | "MEDIUM"
  | "EXPLOSIVE"
  | "CORE"
  | "WATCHLIST";

export type CoinList = {
  key: CoinListKey;
  name: string;
  symbols: string[];
};

/** Predefined symbol lists — persistence can be added later. */
export const PREDEFINED_COIN_LISTS: CoinList[] = [
  {
    key: "BIG_CAP",
    name: "Big Cap",
    symbols: ["BTCUSDC", "ETHUSDC", "BNBUSDC", "SOLUSDC"],
  },
  {
    key: "LARGE",
    name: "Large",
    symbols: ["XRPUSDC", "ADAUSDC", "AVAXUSDC", "LINKUSDC", "DOTUSDC"],
  },
  {
    key: "MEDIUM",
    name: "Medium",
    symbols: ["MATICUSDC", "ATOMUSDC", "LTCUSDC", "UNIUSDC", "NEARUSDC"],
  },
  {
    key: "EXPLOSIVE",
    name: "Explosive",
    symbols: ["WIFUSDC", "PEPEUSDC", "BONKUSDC", "FETUSDC", "RENDERUSDC"],
  },
  {
    key: "CORE",
    name: "Core",
    symbols: ["BTCUSDC", "ETHUSDC", "SOLUSDC"],
  },
  {
    key: "WATCHLIST",
    name: "Watchlist",
    symbols: ["BTCUSDC", "ETHUSDC", "SOLUSDC", "AVAXUSDC", "LINKUSDC"],
  },
];

export function getCoinList(key: CoinListKey): CoinList | undefined {
  return PREDEFINED_COIN_LISTS.find((l) => l.key === key);
}
