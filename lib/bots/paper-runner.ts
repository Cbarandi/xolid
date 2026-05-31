import {
  countOpenTradesForBot,
  getOpenTradeSymbolsForBot,
  insertPaperTrade,
  listActiveBotsRaw,
} from "./db";
import { deterministicUnit } from "./deterministic";
import { getTickerPrices } from "@/lib/market/binance-public";
import { filterUsdcSymbols, isUsdcPair, normalizeSymbol } from "@/lib/market/symbol-guard";
import { getCustomStrategy } from "@/lib/strategies/db";
import { evaluateStrategyForSymbol } from "@/lib/strategies/strategy-evaluator";

export const PAPER_SIGNAL_PROBABILITY = 0.2;

export type PaperScanResult = {
  scanKey: string;
  botsScanned: number;
  signals: number;
  tradesOpened: number;
  symbolsChecked: string[];
  missingPrices: string[];
  skippedInvalidSymbols: string[];
  warnings: string[];
  errors: string[];
  marketSource: "binance_public";
  customStrategiesEvaluated: number;
  customSymbolsEvaluated: number;
  customSignalsTrue: number;
  customSignalsFalse: number;
  skippedDuplicateTrades: number;
};

function scanKeyNow(): string {
  return new Date().toISOString().slice(0, 16);
}

function pickSymbol(symbols: string[], botId: string, scanKey: string): string {
  const idx = Math.floor(deterministicUnit(`${botId}:${scanKey}:symbol`) * symbols.length);
  return symbols[idx]!;
}

function botSideToDb(side: string): "LONG" | "SHORT" {
  return side.toUpperCase() === "SHORT" ? "SHORT" : "LONG";
}

function emptyScanResult(scanKey: string): PaperScanResult {
  return {
    scanKey,
    botsScanned: 0,
    signals: 0,
    tradesOpened: 0,
    symbolsChecked: [],
    missingPrices: [],
    skippedInvalidSymbols: [],
    warnings: [],
    errors: [],
    marketSource: "binance_public",
    customStrategiesEvaluated: 0,
    customSymbolsEvaluated: 0,
    customSignalsTrue: 0,
    customSignalsFalse: 0,
    skippedDuplicateTrades: 0,
  };
}

async function runSystemBotScan(
  row: Awaited<ReturnType<typeof listActiveBotsRaw>>[number],
  scanKey: string,
  priceMap: Record<string, number>,
  result: PaperScanResult,
): Promise<void> {
  const validSymbols = filterUsdcSymbols(row.symbols ?? []);
  if (validSymbols.length === 0) {
    result.warnings.push(`Bot ${row.name}: no valid USDC symbols configured`);
    return;
  }

  const bot = {
    id: row.id,
    name: row.name,
    symbols: validSymbols,
    side: row.side,
    capitalPerTrade: Number(row.capital_per_trade),
    maxOpenTrades: row.max_open_trades,
  };

  const openCount = await countOpenTradesForBot(bot.id);
  if (openCount >= bot.maxOpenTrades) return;

  const roll = deterministicUnit(`${bot.id}:${scanKey}:signal`);
  if (roll >= PAPER_SIGNAL_PROBABILITY) return;

  result.signals++;
  const symbol = pickSymbol(bot.symbols, bot.id, scanKey);
  const entryPrice = priceMap[symbol];

  if (entryPrice == null || !Number.isFinite(entryPrice) || entryPrice <= 0) {
    result.warnings.push(`Bot ${row.name}: skipped ${symbol} — no Binance public price`);
    if (!result.missingPrices.includes(symbol)) {
      result.missingPrices.push(symbol);
    }
    return;
  }

  const openSymbols = await getOpenTradeSymbolsForBot(bot.id);
  if (openSymbols.has(symbol)) {
    result.skippedDuplicateTrades++;
    result.warnings.push(`Bot ${row.name}: skipped ${symbol} — open trade already exists`);
    return;
  }

  const quantity = Math.round((bot.capitalPerTrade / entryPrice) * 1e8) / 1e8;

  try {
    await insertPaperTrade({
      botId: bot.id,
      symbol,
      side: botSideToDb(bot.side),
      entryPrice,
      quantity,
    });
    result.tradesOpened++;
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed to insert trade";
    result.errors.push(`Bot ${row.name}: ${msg}`);
  }
}

async function runCustomBotScan(
  row: Awaited<ReturnType<typeof listActiveBotsRaw>>[number],
  priceMap: Record<string, number>,
  result: PaperScanResult,
): Promise<void> {
  const validSymbols = filterUsdcSymbols(row.symbols ?? []);
  if (validSymbols.length === 0) {
    result.warnings.push(`Bot ${row.name}: no valid USDC symbols configured`);
    return;
  }

  if (!row.custom_strategy_id) {
    result.errors.push(`Bot ${row.name}: CUSTOM bot missing custom_strategy_id`);
    return;
  }

  const strategy = await getCustomStrategy(row.custom_strategy_id);
  if (!strategy) {
    result.errors.push(`Bot ${row.name}: custom strategy ${row.custom_strategy_id} not found`);
    return;
  }

  result.customStrategiesEvaluated++;

  const side = botSideToDb(row.side);
  const capitalPerTrade = Number(row.capital_per_trade);
  const maxOpenTrades = row.max_open_trades;

  let openSymbols = await getOpenTradeSymbolsForBot(row.id);
  let openCount = openSymbols.size;

  for (const symbol of validSymbols) {
    if (openCount >= maxOpenTrades) {
      result.warnings.push(`Bot ${row.name}: max open trades reached (${maxOpenTrades})`);
      break;
    }

    if (openSymbols.has(symbol)) {
      result.skippedDuplicateTrades++;
      continue;
    }

    result.customSymbolsEvaluated++;

    try {
      const signal = await evaluateStrategyForSymbol({
        definition: strategy.definition,
        strategyId: strategy.id,
        symbol,
        side,
      });

      if (!signal.shouldEnter) {
        result.customSignalsFalse++;
        continue;
      }

      result.customSignalsTrue++;
      result.signals++;

      const tickerPrice = priceMap[symbol];
      const entryPrice =
        tickerPrice != null && Number.isFinite(tickerPrice) && tickerPrice > 0
          ? tickerPrice
          : signal.latestClosePrice;

      if (!Number.isFinite(entryPrice) || entryPrice <= 0) {
        result.warnings.push(`Bot ${row.name}: skipped ${symbol} — no entry price`);
        if (!result.missingPrices.includes(symbol)) {
          result.missingPrices.push(symbol);
        }
        continue;
      }

      const quantity = Math.round((capitalPerTrade / entryPrice) * 1e8) / 1e8;

      await insertPaperTrade({
        botId: row.id,
        symbol,
        side,
        entryPrice,
        quantity,
        signalSnapshot: signal.signalSnapshot ?? null,
      });

      result.tradesOpened++;
      openCount++;
      openSymbols = new Set([...openSymbols, symbol]);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Custom strategy evaluation failed";
      result.errors.push(`Bot ${row.name} ${symbol}: ${msg}`);
    }
  }
}

export async function runPaperScan(scanKey = scanKeyNow()): Promise<PaperScanResult> {
  const rows = await listActiveBotsRaw();
  const result = emptyScanResult(scanKey);
  result.botsScanned = rows.length;

  const allSymbols = new Set<string>();
  for (const row of rows) {
    for (const raw of row.symbols ?? []) {
      const sym = normalizeSymbol(raw);
      if (!isUsdcPair(sym)) {
        if (sym) result.skippedInvalidSymbols.push(sym);
        continue;
      }
      allSymbols.add(sym);
    }
  }

  result.symbolsChecked = [...allSymbols].sort();

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

  for (const row of rows) {
    const strategySource = (row.strategy_source ?? "SYSTEM").toUpperCase();

    if (strategySource === "CUSTOM") {
      await runCustomBotScan(row, priceMap, result);
      continue;
    }

    await runSystemBotScan(row, scanKey, priceMap, result);
  }

  return result;
}
