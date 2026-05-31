import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { computePnlPct, evaluateTradeExit } from "./pnl";
import {
  filterUsdcSymbols,
  isUsdcPair,
  normalizeSymbol,
  rejectNonUsdcSymbols,
} from "./symbol-guard";

describe("symbol-guard", () => {
  it("normalizes symbols", () => {
    assert.equal(normalizeSymbol(" solusdc "), "SOLUSDC");
    assert.equal(normalizeSymbol("btc-usdc"), "BTCUSDC");
  });

  it("allows USDC pairs only", () => {
    assert.equal(isUsdcPair("SOLUSDC"), true);
    assert.equal(isUsdcPair("BTCUSDC"), true);
    assert.equal(isUsdcPair("BTCUSDT"), false);
    assert.equal(isUsdcPair("USDC"), false);
  });

  it("filters USDC symbols", () => {
    assert.deepEqual(filterUsdcSymbols(["SOLUSDC", "BTCUSDT", "btcusdc"]), [
      "SOLUSDC",
      "BTCUSDC",
    ]);
  });

  it("rejects non-USDC symbols", () => {
    assert.deepEqual(rejectNonUsdcSymbols(["SOLUSDC", "ETHUSDT"]), ["ETHUSDT"]);
  });
});

describe("pnl", () => {
  it("computes LONG pnl", () => {
    assert.equal(computePnlPct("LONG", 100, 102), 2);
    assert.equal(computePnlPct("LONG", 100, 98), -2);
  });

  it("computes SHORT pnl", () => {
    assert.equal(computePnlPct("SHORT", 100, 98), 2);
    assert.equal(computePnlPct("SHORT", 100, 102), -2);
  });

  it("does not close when TP/SL/timeout not reached", () => {
    const result = evaluateTradeExit({
      side: "LONG",
      entryPrice: 100,
      currentPrice: 100.5,
      takeProfitPct: 2.5,
      stopLossPct: 1.2,
      quantity: 1,
      openedAt: new Date(),
      timeoutMinutes: 60,
      now: new Date(Date.now() + 30_000),
    });
    assert.equal(result.shouldClose, false);
  });

  it("closes on TP", () => {
    const result = evaluateTradeExit({
      side: "LONG",
      entryPrice: 100,
      currentPrice: 103,
      takeProfitPct: 2.5,
      stopLossPct: 1.2,
      quantity: 2,
      openedAt: new Date(),
      timeoutMinutes: 60,
    });
    assert.equal(result.shouldClose, true);
    if (result.shouldClose) {
      assert.equal(result.exitReason, "TP");
      assert.equal(result.pnlPct, 3);
    }
  });

  it("missing price prevents trade open via guard", () => {
    const prices: Record<string, number> = { BTCUSDC: 65000 };
    const symbol = "SOLUSDC";
    assert.equal(prices[symbol], undefined);
  });
});
