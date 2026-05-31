import { closePaperTrade, listOpenTradesWithBotConfig } from "./db";
import { getTickerPrices } from "@/lib/market/binance-public";
import { evaluateTradeExit } from "@/lib/market/pnl";
import { filterUsdcSymbols, isUsdcPair, normalizeSymbol } from "@/lib/market/symbol-guard";

export type ExitEngineResult = {
  tradesEvaluated: number;
  tradesClosed: number;
  symbolsChecked: string[];
  missingPrices: string[];
  skippedInvalidSymbols: string[];
  warnings: string[];
  errors: string[];
  closedByReason: { TP: number; SL: number; TIMEOUT: number };
  marketSource: "binance_public";
};

function num(value: number | string | null | undefined): number {
  if (value == null) return 0;
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
}

function parseSide(side: string): "LONG" | "SHORT" {
  return side.toUpperCase() === "SHORT" ? "SHORT" : "LONG";
}

export async function runExitEngine(): Promise<ExitEngineResult> {
  const openTrades = await listOpenTradesWithBotConfig();
  const result: ExitEngineResult = {
    tradesEvaluated: openTrades.length,
    tradesClosed: 0,
    symbolsChecked: [],
    missingPrices: [],
    skippedInvalidSymbols: [],
    warnings: [],
    errors: [],
    closedByReason: { TP: 0, SL: 0, TIMEOUT: 0 },
    marketSource: "binance_public",
  };

  if (openTrades.length === 0) return result;

  const symbols = new Set<string>();
  for (const trade of openTrades) {
    const sym = normalizeSymbol(trade.symbol);
    if (!isUsdcPair(sym)) {
      result.skippedInvalidSymbols.push(sym);
      continue;
    }
    symbols.add(sym);
  }

  result.symbolsChecked = [...symbols].sort();

  let priceMap: Record<string, number> = {};
  try {
    priceMap = await getTickerPrices(result.symbolsChecked);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Binance ticker fetch failed";
    result.errors.push(msg);
    return result;
  }

  for (const sym of result.symbolsChecked) {
    if (priceMap[sym] == null) {
      result.missingPrices.push(sym);
    }
  }

  const now = new Date();

  for (const trade of openTrades) {
    const symbol = normalizeSymbol(trade.symbol);
    if (!isUsdcPair(symbol)) {
      result.warnings.push(`Trade ${trade.id}: invalid symbol ${trade.symbol}`);
      continue;
    }

    if (!trade.opened_at) {
      result.warnings.push(`Trade ${trade.id}: missing opened_at`);
      continue;
    }

    const currentPrice = priceMap[symbol];
    if (currentPrice == null || !Number.isFinite(currentPrice) || currentPrice <= 0) {
      result.warnings.push(`Trade ${trade.id}: no Binance public price for ${symbol}`);
      continue;
    }

    const entryPrice = num(trade.entry_price);
    const quantity = num(trade.quantity);
    const takeProfitPct = num(trade.take_profit_pct);
    const stopLossPct = num(trade.stop_loss_pct);

    const evaluation = evaluateTradeExit({
      side: parseSide(trade.side),
      entryPrice,
      currentPrice,
      takeProfitPct,
      stopLossPct,
      quantity,
      openedAt: new Date(trade.opened_at),
      timeoutMinutes: trade.timeout_minutes,
      now,
    });

    if (!evaluation.shouldClose) continue;

    try {
      await closePaperTrade({
        tradeId: trade.id,
        exitPrice: evaluation.exitPrice,
        pnlPct: evaluation.pnlPct,
        pnlQuote: evaluation.pnlQuote,
        exitReason: evaluation.exitReason,
      });
      result.tradesClosed++;
      result.closedByReason[evaluation.exitReason]++;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to close trade";
      result.errors.push(`Trade ${trade.id}: ${msg}`);
    }
  }

  return result;
}
