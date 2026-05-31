import { userHasValidatedBinanceAccount } from "@/lib/exchange/db";
import { getSystemRiskState, getUserRiskSettings } from "./db";
import type {
  LiveGateContext,
  ReadinessCheckItem,
  RiskBotContext,
  RiskCheckResult,
  UserRiskSettings,
} from "./types";
import { RiskGateError } from "./types";

function deny(reason: string): RiskCheckResult {
  return { allowed: false, reason };
}

function allow(): RiskCheckResult {
  return { allowed: true };
}

function botAllocationUsdc(bot: RiskBotContext): number {
  return bot.capitalPerTrade * bot.maxOpenTrades;
}

/** Pure evaluation — used by tests and async asserts. */
export function evaluatePaperAllowed(settings: UserRiskSettings): RiskCheckResult {
  if (!settings.paperTradingEnabled) {
    return deny("Paper trading is disabled for this user");
  }
  return allow();
}

/** Pure evaluation of live trading gate. */
export function evaluateLiveAllowed(ctx: LiveGateContext): RiskCheckResult {
  const { system, settings, hasValidatedBinance, bot } = ctx;

  if (system.globalKillSwitchEnabled) {
    return deny("Global kill switch is active — live trading blocked");
  }

  if (!system.liveTradingGloballyEnabled) {
    return deny("Live trading is not globally enabled");
  }

  if (!settings.liveTradingEnabled) {
    return deny("Live trading is not enabled for this user");
  }

  if (!hasValidatedBinance) {
    return deny("No validated Binance account connected");
  }

  if (bot) {
    if (bot.mode !== "LIVE") {
      return deny("Bot is not in LIVE mode");
    }

    const botCheck = evaluateBotWithinRiskLimits(bot, settings);
    if (!botCheck.allowed) return botCheck;
  }

  return allow();
}

export function evaluateBotWithinRiskLimits(
  bot: RiskBotContext,
  settings: UserRiskSettings,
): RiskCheckResult {
  if (bot.mode !== "LIVE") {
    return allow();
  }

  if (bot.capitalPerTrade > settings.maxCapitalPerTradeUsdc) {
    return deny(
      `Capital per trade (${bot.capitalPerTrade} USDC) exceeds limit (${settings.maxCapitalPerTradeUsdc} USDC)`,
    );
  }

  const allocation = botAllocationUsdc(bot);
  if (allocation > settings.maxCapitalPerBotUsdc) {
    return deny(
      `Bot allocation (${allocation} USDC) exceeds per-bot limit (${settings.maxCapitalPerBotUsdc} USDC)`,
    );
  }

  const totalLive = bot.totalLiveCapitalUsdc ?? allocation;
  if (totalLive > settings.maxTotalLiveCapitalUsdc) {
    return deny(
      `Total live capital (${totalLive} USDC) exceeds limit (${settings.maxTotalLiveCapitalUsdc} USDC)`,
    );
  }

  const openTrades = bot.openLiveTrades ?? 0;
  if (openTrades > settings.maxOpenLiveTrades) {
    return deny(
      `Open live trades (${openTrades}) exceeds limit (${settings.maxOpenLiveTrades})`,
    );
  }

  const dailyLoss = bot.dailyLossUsdc ?? 0;
  if (settings.maxDailyLossUsdc > 0 && dailyLoss >= settings.maxDailyLossUsdc) {
    return deny(`Daily loss limit reached (${settings.maxDailyLossUsdc} USDC)`);
  }

  return allow();
}

export function evaluateTradeWithinRiskLimits(
  bot: RiskBotContext,
  settings: UserRiskSettings,
  tradeAmount: number,
): RiskCheckResult {
  if (bot.mode !== "LIVE") {
    return allow();
  }

  if (tradeAmount > settings.maxCapitalPerTradeUsdc) {
    return deny(
      `Trade amount (${tradeAmount} USDC) exceeds per-trade limit (${settings.maxCapitalPerTradeUsdc} USDC)`,
    );
  }

  const botCheck = evaluateBotWithinRiskLimits(bot, settings);
  if (!botCheck.allowed) return botCheck;

  const openTrades = (bot.openLiveTrades ?? 0) + 1;
  if (openTrades > settings.maxOpenLiveTrades) {
    return deny(`Would exceed max open live trades (${settings.maxOpenLiveTrades})`);
  }

  const totalLive = (bot.totalLiveCapitalUsdc ?? 0) + tradeAmount;
  if (totalLive > settings.maxTotalLiveCapitalUsdc) {
    return deny(
      `Trade would exceed total live capital limit (${settings.maxTotalLiveCapitalUsdc} USDC)`,
    );
  }

  return allow();
}

function throwIfDenied(result: RiskCheckResult): void {
  if (!result.allowed) {
    throw new RiskGateError(result.reason);
  }
}

export async function assertPaperAllowed(userId: string): Promise<void> {
  const settings = await getUserRiskSettings(userId);
  throwIfDenied(evaluatePaperAllowed(settings));
}

export async function assertLiveAllowed(userId: string, bot?: RiskBotContext): Promise<void> {
  const [system, settings, hasValidatedBinance] = await Promise.all([
    getSystemRiskState(),
    getUserRiskSettings(userId),
    userHasValidatedBinanceAccount(userId),
  ]);

  throwIfDenied(
    evaluateLiveAllowed({
      system,
      settings,
      hasValidatedBinance,
      bot,
    }),
  );
}

export async function assertBotWithinRiskLimits(bot: RiskBotContext): Promise<void> {
  if (!bot.userId) {
    throwIfDenied(deny("Bot has no owner user"));
  }

  const settings = await getUserRiskSettings(bot.userId!);
  throwIfDenied(evaluateBotWithinRiskLimits(bot, settings));
}

export async function assertTradeWithinRiskLimits(
  bot: RiskBotContext,
  tradeAmount: number,
): Promise<void> {
  if (!bot.userId) {
    throwIfDenied(deny("Bot has no owner user"));
  }

  const settings = await getUserRiskSettings(bot.userId!);
  throwIfDenied(evaluateTradeWithinRiskLimits(bot, settings, tradeAmount));
}

export function buildLiveReadinessChecklist(ctx: LiveGateContext): ReadinessCheckItem[] {
  const { system, settings, hasValidatedBinance } = ctx;
  const limitsConfigured =
    settings.maxTotalLiveCapitalUsdc > 0 &&
    settings.maxCapitalPerBotUsdc > 0 &&
    settings.maxCapitalPerTradeUsdc > 0 &&
    settings.maxOpenLiveTrades > 0;

  return [
    {
      id: "binance",
      label: "Binance account connected & validated",
      ok: hasValidatedBinance,
      detail: hasValidatedBinance ? "Validated account on file" : "Connect and test a Binance account",
    },
    {
      id: "risk_settings",
      label: "Risk limits configured",
      ok: limitsConfigured,
      detail: limitsConfigured
        ? "Capital and trade limits set"
        : "Set non-zero capital and trade limits",
    },
    {
      id: "live_global",
      label: "Live trading globally enabled",
      ok: system.liveTradingGloballyEnabled,
      detail: system.liveTradingGloballyEnabled
        ? "System allows live trading"
        : "Super Admin must enable global live trading",
    },
    {
      id: "kill_switch",
      label: "Global kill switch off",
      ok: !system.globalKillSwitchEnabled,
      detail: system.globalKillSwitchEnabled
        ? "Kill switch is ON — all live trading blocked"
        : "Kill switch is off",
    },
    {
      id: "user_live",
      label: "User live trading enabled",
      ok: settings.liveTradingEnabled,
      detail: settings.liveTradingEnabled
        ? "User flag allows live trading"
        : "Enable live trading for this user",
    },
    {
      id: "bot_live_mode",
      label: "All live gates pass",
      ok: (() => {
        const probe = evaluateLiveAllowed({
          ...ctx,
          bot: ctx.bot ?? {
            mode: "LIVE",
            userId: settings.userId,
            capitalPerTrade: settings.maxCapitalPerTradeUsdc || 0,
            maxOpenTrades: 1,
          },
        });
        return probe.allowed;
      })(),
      detail: (() => {
        const probe = evaluateLiveAllowed({
          ...ctx,
          bot: ctx.bot ?? {
            mode: "LIVE",
            userId: settings.userId,
            capitalPerTrade: settings.maxCapitalPerTradeUsdc || 0,
            maxOpenTrades: 1,
          },
        });
        return probe.allowed ? "Ready for future LIVE bots" : probe.reason;
      })(),
    },
  ];
}

export async function getLiveReadinessForUser(userId: string): Promise<ReadinessCheckItem[]> {
  const [system, settings, hasValidatedBinance] = await Promise.all([
    getSystemRiskState(),
    getUserRiskSettings(userId),
    userHasValidatedBinanceAccount(userId),
  ]);

  return buildLiveReadinessChecklist({
    system,
    settings,
    hasValidatedBinance,
    bot: {
      mode: "LIVE",
      userId,
      capitalPerTrade: settings.maxCapitalPerTradeUsdc || 0,
      maxOpenTrades: 1,
    },
  });
}
