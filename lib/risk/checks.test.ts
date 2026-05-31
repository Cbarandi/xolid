import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { evaluateLiveAllowed, evaluatePaperAllowed } from "./checks";
import type { LiveGateContext, SystemRiskState, UserRiskSettings } from "./types";

function settings(overrides: Partial<UserRiskSettings> = {}): UserRiskSettings {
  return {
    id: "rs1",
    userId: "u1",
    maxTotalLiveCapitalUsdc: 1000,
    maxCapitalPerBotUsdc: 500,
    maxCapitalPerTradeUsdc: 100,
    maxOpenLiveTrades: 5,
    maxDailyLossUsdc: 50,
    liveTradingEnabled: false,
    paperTradingEnabled: true,
    createdAt: "",
    updatedAt: "",
    ...overrides,
  };
}

function system(overrides: Partial<SystemRiskState> = {}): SystemRiskState {
  return {
    id: "global",
    globalKillSwitchEnabled: true,
    liveTradingGloballyEnabled: false,
    reason: "locked",
    updatedBy: null,
    updatedAt: "",
    ...overrides,
  };
}

function liveCtx(overrides: Partial<LiveGateContext> = {}): LiveGateContext {
  return {
    system: system(),
    settings: settings(),
    hasValidatedBinance: false,
    ...overrides,
  };
}

describe("risk checks", () => {
  it("allows paper when paper_trading_enabled", () => {
    assert.deepEqual(evaluatePaperAllowed(settings()), { allowed: true });
  });

  it("blocks paper when paper_trading_enabled is false", () => {
    const result = evaluatePaperAllowed(settings({ paperTradingEnabled: false }));
    assert.equal(result.allowed, false);
  });

  it("blocks live when kill switch is on", () => {
    const result = evaluateLiveAllowed(
      liveCtx({
        system: system({ globalKillSwitchEnabled: true }),
        settings: settings({ liveTradingEnabled: true }),
        hasValidatedBinance: true,
      }),
    );
    assert.equal(result.allowed, false);
    if (!result.allowed) {
      assert.match(result.reason, /kill switch/i);
    }
  });

  it("blocks live when not globally enabled", () => {
    const result = evaluateLiveAllowed(
      liveCtx({
        system: system({ globalKillSwitchEnabled: false, liveTradingGloballyEnabled: false }),
        settings: settings({ liveTradingEnabled: true }),
        hasValidatedBinance: true,
      }),
    );
    assert.equal(result.allowed, false);
  });

  it("blocks live when user flag is off", () => {
    const result = evaluateLiveAllowed(
      liveCtx({
        system: system({ globalKillSwitchEnabled: false, liveTradingGloballyEnabled: true }),
        settings: settings({ liveTradingEnabled: false }),
        hasValidatedBinance: true,
      }),
    );
    assert.equal(result.allowed, false);
  });

  it("blocks live without validated Binance account", () => {
    const result = evaluateLiveAllowed(
      liveCtx({
        system: system({ globalKillSwitchEnabled: false, liveTradingGloballyEnabled: true }),
        settings: settings({ liveTradingEnabled: true }),
        hasValidatedBinance: false,
      }),
    );
    assert.equal(result.allowed, false);
  });

  it("allows live when all gates pass with LIVE bot", () => {
    const result = evaluateLiveAllowed(
      liveCtx({
        system: system({ globalKillSwitchEnabled: false, liveTradingGloballyEnabled: true }),
        settings: settings({ liveTradingEnabled: true }),
        hasValidatedBinance: true,
        bot: {
          mode: "LIVE",
          userId: "u1",
          capitalPerTrade: 50,
          maxOpenTrades: 2,
        },
      }),
    );
    assert.equal(result.allowed, true);
  });

  it("blocks live bot exceeding per-trade limit", () => {
    const result = evaluateLiveAllowed(
      liveCtx({
        system: system({ globalKillSwitchEnabled: false, liveTradingGloballyEnabled: true }),
        settings: settings({ liveTradingEnabled: true, maxCapitalPerTradeUsdc: 100 }),
        hasValidatedBinance: true,
        bot: {
          mode: "LIVE",
          userId: "u1",
          capitalPerTrade: 150,
          maxOpenTrades: 1,
        },
      }),
    );
    assert.equal(result.allowed, false);
  });
});
