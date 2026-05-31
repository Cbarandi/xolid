export type BotMode = "paper";
export type BotSide = "long" | "short";
export type BotStatus = "draft" | "active" | "paused" | "stopped";
export type BotStrategy = "BITE_CCI_V1" | "CONTINENTAL_V1";
export type StrategySource = "SYSTEM" | "CUSTOM";

export type BotSummary = {
  id: string;
  name: string;
  strategySource: StrategySource;
  strategyKey: BotStrategy | null;
  customStrategyId: string | null;
  strategyName: string;
  mode: BotMode;
  side: BotSide;
  status: BotStatus;
  symbols: string[];
};

export type BotTrade = {
  id: string;
  symbol: string;
  side: BotSide;
  entry: string;
  exit?: string;
  pnlPct?: number;
  pnlQuote?: number;
  status: "open" | "closed" | "cancelled";
};

export type BotRecord = BotSummary & {
  capitalPerTrade: number;
  maxOpenTrades: number;
  takeProfitPct: number;
  stopLossPct: number;
  timeoutMinutes: number;
  createdAt: string;
  updatedAt: string;
  dbStatus: "DRAFT" | "ACTIVE" | "PAUSED" | "STOPPED";
};

export type DashboardMetrics = {
  totalBots: number;
  activeBots: number;
  totalOpenDeals: number;
  totalClosedDeals: number;
  dealsLast24h: number;
  totalPnlQuote: number;
  totalPnlPct: number;
  winningDeals: number;
  losingDeals: number;
  stopLossHits: number;
};

export type BotPerformanceSummary = {
  id: string;
  name: string;
  status: BotStatus;
  dbStatus: "DRAFT" | "ACTIVE" | "PAUSED" | "STOPPED";
  strategySource: StrategySource;
  strategyKey: BotStrategy | null;
  customStrategyId: string | null;
  strategyName: string;
  mode: BotMode;
  side: BotSide;
  symbols: string[];
  symbolsCount: number;
  createdAt: string;
  updatedAt: string;
  activeSince: string | null;
  totalDeals: number;
  openDeals: number;
  closedDeals: number;
  dealsLast24h: number;
  positiveDeals: number;
  negativeDeals: number;
  stopLossHits: number;
  tpHits: number;
  timeoutExits: number;
  pnlQuote: number;
  pnlPct: number;
};

export type DealRow = {
  id: string;
  botId: string;
  botName: string;
  strategyName: string;
  symbol: string;
  side: BotSide;
  entryPrice: number;
  exitPrice?: number;
  currentPrice?: number;
  quantity?: number;
  pnlQuote?: number;
  pnlPct?: number;
  openedAt: string;
  closedAt?: string;
  durationMs: number;
  exitReason?: string;
  status: "open" | "closed";
};

export type BotMetrics = {
  activeSince: string | null;
  activeDurationMs: number;
  totalDeals: number;
  dealsLast24h: number;
  openDeals: number;
  closedDeals: number;
  positiveDeals: number;
  negativeDeals: number;
  slHits: number;
  tpHits: number;
  timeoutExits: number;
  pnlQuote: number;
  pnlPct: number;
};

export type UpdateBotPayload = {
  name?: string;
  strategyKey?: BotStrategy;
  side?: "LONG" | "SHORT";
  symbols?: string[];
  capitalPerTrade?: number;
  maxOpenTrades?: number;
  takeProfitPct?: number;
  stopLossPct?: number;
  timeoutMinutes?: number;
};

export type BotDetail = BotRecord & {
  openTrades: BotTrade[];
  closedTrades: BotTrade[];
  pnlSummary: {
    totalPct: number;
    totalQuote: number;
    winRate: number;
    trades: number;
    openCount: number;
    closedCount: number;
  };
};

export function formatDbStatus(status: string): BotStatus {
  switch (status.toUpperCase()) {
    case "ACTIVE":
      return "active";
    case "PAUSED":
      return "paused";
    case "STOPPED":
      return "stopped";
    default:
      return "draft";
  }
}

export function formatDbSide(side: string): BotSide {
  return side.toUpperCase() === "SHORT" ? "short" : "long";
}

export function formatDbTradeStatus(status: string): BotTrade["status"] {
  switch (status.toUpperCase()) {
    case "CLOSED":
      return "closed";
    case "CANCELLED":
      return "cancelled";
    default:
      return "open";
  }
}

export function formatPrice(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(Number(value))) return "—";
  return Number(value).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 8,
  });
}

export function toBotDetail(bot: BotRecord, trades: BotTrade[]): BotDetail {
  const openTrades = trades.filter((t) => t.status === "open");
  const closedTrades = trades.filter((t) => t.status === "closed");
  const closedWithPnl = closedTrades.filter((t) => t.pnlPct != null);
  const totalPct = closedWithPnl.reduce((sum, t) => sum + (t.pnlPct ?? 0), 0);
  const totalQuote = closedTrades.reduce((sum, t) => sum + (t.pnlQuote ?? 0), 0);
  const wins = closedWithPnl.filter((t) => (t.pnlPct ?? 0) > 0).length;

  return {
    ...bot,
    openTrades,
    closedTrades,
    pnlSummary: {
      totalPct: Math.round(totalPct * 100) / 100,
      totalQuote: Math.round(totalQuote * 100) / 100,
      winRate:
        closedWithPnl.length === 0
          ? 0
          : Math.round((wins / closedWithPnl.length) * 100),
      trades: trades.length,
      openCount: openTrades.length,
      closedCount: closedTrades.length,
    },
  };
}
