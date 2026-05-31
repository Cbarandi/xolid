export type BotTradingMode = "PAPER" | "LIVE";

export type UserRiskSettings = {
  id: string;
  userId: string;
  maxTotalLiveCapitalUsdc: number;
  maxCapitalPerBotUsdc: number;
  maxCapitalPerTradeUsdc: number;
  maxOpenLiveTrades: number;
  maxDailyLossUsdc: number;
  liveTradingEnabled: boolean;
  paperTradingEnabled: boolean;
  createdAt: string;
  updatedAt: string;
};

export type UpdateUserRiskSettingsPayload = {
  maxTotalLiveCapitalUsdc?: number;
  maxCapitalPerBotUsdc?: number;
  maxCapitalPerTradeUsdc?: number;
  maxOpenLiveTrades?: number;
  maxDailyLossUsdc?: number;
  liveTradingEnabled?: boolean;
  paperTradingEnabled?: boolean;
};

export type SystemRiskState = {
  id: "global";
  globalKillSwitchEnabled: boolean;
  liveTradingGloballyEnabled: boolean;
  reason: string | null;
  updatedBy: string | null;
  updatedAt: string;
};

export type UpdateSystemRiskStatePayload = {
  globalKillSwitchEnabled?: boolean;
  liveTradingGloballyEnabled?: boolean;
  reason?: string | null;
};

export type RiskBotContext = {
  mode: BotTradingMode;
  userId: string | null;
  capitalPerTrade: number;
  maxOpenTrades: number;
  /** Total USDC allocated across user's live bots (optional aggregate). */
  totalLiveCapitalUsdc?: number;
  /** Current open live trades for this bot or user. */
  openLiveTrades?: number;
  /** Realized loss today in USDC (optional). */
  dailyLossUsdc?: number;
};

export type RiskCheckResult = { allowed: true } | { allowed: false; reason: string };

export type LiveGateContext = {
  system: SystemRiskState;
  settings: UserRiskSettings;
  hasValidatedBinance: boolean;
  bot?: RiskBotContext;
};

export type ReadinessCheckItem = {
  id: string;
  label: string;
  ok: boolean;
  detail: string;
};

export class RiskGateError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RiskGateError";
  }
}
