import { createSupabaseServerClient } from "@/lib/supabase-server";
import {
  formatDbSide,
  formatDbStatus,
  formatDbTradeStatus,
  formatPrice,
  type BotMetrics,
  type BotPerformanceSummary,
  type BotRecord,
  type BotStrategy,
  type BotSummary,
  type BotTrade,
  type DashboardMetrics,
  type DealRow,
  type StrategySource,
  type UpdateBotPayload,
} from "./types";
import type { ValidatedCreateBotInput } from "./validators";
import type { DbBotStatus } from "./lifecycle";
import { getCustomStrategy } from "@/lib/strategies/db";

type TradingBotRow = {
  id: string;
  user_id: string | null;
  name: string;
  strategy_key: string | null;
  strategy_source: string | null;
  custom_strategy_id: string | null;
  strategy_name: string | null;
  mode: string;
  side: string;
  symbols: string[] | null;
  capital_per_trade: number | string;
  max_open_trades: number;
  take_profit_pct: number | string;
  stop_loss_pct: number | string;
  timeout_minutes: number;
  status: string;
  created_at: string;
  updated_at: string;
};

type TradingBotTradeRow = {
  id: string;
  bot_id: string;
  symbol: string;
  side: string;
  entry_price: number | string | null;
  exit_price: number | string | null;
  quantity: number | string | null;
  status: string;
  opened_at: string | null;
  closed_at: string | null;
  pnl_quote: number | string | null;
  pnl_pct: number | string | null;
  exit_reason: string | null;
  signal_snapshot: Record<string, unknown> | null;
  created_at: string;
};

function num(value: number | string | null | undefined): number {
  if (value == null) return 0;
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
}

function resolveStrategyName(row: TradingBotRow): string {
  if (row.strategy_name?.trim()) return row.strategy_name.trim();
  if (row.strategy_key) return row.strategy_key;
  return "Unknown strategy";
}

function mapBotRow(row: TradingBotRow): BotRecord {
  const dbStatus = row.status.toUpperCase() as BotRecord["dbStatus"];
  const strategySource = (row.strategy_source ?? "SYSTEM") as StrategySource;
  const strategyKey = row.strategy_key ? (row.strategy_key as BotStrategy) : null;

  return {
    id: row.id,
    name: row.name,
    strategySource,
    strategyKey,
    customStrategyId: row.custom_strategy_id ?? null,
    strategyName: resolveStrategyName(row),
    mode: "paper",
    side: formatDbSide(row.side),
    status: formatDbStatus(row.status),
    symbols: row.symbols ?? [],
    capitalPerTrade: num(row.capital_per_trade),
    maxOpenTrades: row.max_open_trades,
    takeProfitPct: num(row.take_profit_pct),
    stopLossPct: num(row.stop_loss_pct),
    timeoutMinutes: row.timeout_minutes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    dbStatus,
  };
}

function mapTradeRow(row: TradingBotTradeRow): BotTrade {
  const entry = row.entry_price != null ? num(row.entry_price) : null;
  const exit = row.exit_price != null ? num(row.exit_price) : null;
  const pnlPct = row.pnl_pct != null ? num(row.pnl_pct) : undefined;
  const pnlQuote = row.pnl_quote != null ? num(row.pnl_quote) : undefined;

  return {
    id: row.id,
    symbol: row.symbol,
    side: formatDbSide(row.side),
    entry: formatPrice(entry),
    exit: exit != null ? formatPrice(exit) : undefined,
    pnlPct,
    pnlQuote,
    status: formatDbTradeStatus(row.status),
  };
}

function getClient() {
  return createSupabaseServerClient();
}

export async function createBot(
  input: ValidatedCreateBotInput,
  ownerUserId?: string | null,
): Promise<{ id: string }> {
  const supabase = getClient();

  let strategyName = input.strategyName;
  if (input.strategySource === "CUSTOM") {
    const custom = await getCustomStrategy(input.customStrategyId!);
    if (!custom) {
      throw new Error("Custom strategy not found");
    }
    strategyName = custom.name;
  }

  const insertRow: Record<string, unknown> = {
    name: input.name,
    strategy_source: input.strategySource,
    strategy_name: strategyName,
    mode: input.mode,
    side: input.side,
    symbols: input.symbols,
    capital_per_trade: input.capitalPerTrade,
    max_open_trades: input.maxOpenTrades,
    take_profit_pct: input.takeProfitPct,
    stop_loss_pct: input.stopLossPct,
    timeout_minutes: input.timeoutMinutes,
    status: "DRAFT",
    user_id: ownerUserId ?? null,
  };

  if (input.strategySource === "SYSTEM") {
    insertRow.strategy_key = input.strategyKey;
    insertRow.custom_strategy_id = null;
  } else {
    insertRow.strategy_key = null;
    insertRow.custom_strategy_id = input.customStrategyId;
  }

  const { data, error } = await supabase
    .from("trading_bots")
    .insert(insertRow)
    .select("id")
    .single();

  if (error || !data) {
    console.error("[bots] createBot failed", error);
    throw new Error("Failed to create bot");
  }

  return { id: data.id as string };
}

export async function listBots(scopeUserId?: string): Promise<BotSummary[]> {
  const supabase = getClient();

  let query = supabase.from("trading_bots").select("*").order("created_at", { ascending: false });
  if (scopeUserId) {
    query = query.eq("user_id", scopeUserId);
  }

  const { data, error } = await query;

  if (error) {
    console.error("[bots] listBots failed", error);
    throw new Error("Failed to load bots");
  }

  return (data as TradingBotRow[]).map(mapBotRow);
}

export async function getBot(id: string, scopeUserId?: string): Promise<BotRecord | null> {
  const supabase = getClient();

  const { data, error } = await supabase.from("trading_bots").select("*").eq("id", id).maybeSingle();

  if (error) {
    console.error("[bots] getBot failed", error);
    throw new Error("Failed to load bot");
  }

  if (!data) return null;
  const row = data as TradingBotRow;
  if (scopeUserId && row.user_id !== scopeUserId) return null;
  return mapBotRow(row);
}

export async function listBotTrades(botId: string): Promise<BotTrade[]> {
  const supabase = getClient();

  const { data, error } = await supabase
    .from("trading_bot_trades")
    .select("*")
    .eq("bot_id", botId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[bots] listBotTrades failed", error);
    throw new Error("Failed to load trades");
  }

  return (data as TradingBotTradeRow[]).map(mapTradeRow);
}

export async function getBotDbStatus(id: string): Promise<DbBotStatus | null> {
  const supabase = getClient();
  const { data, error } = await supabase
    .from("trading_bots")
    .select("status")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("[bots] getBotDbStatus failed", error);
    throw new Error("Failed to load bot status");
  }

  if (!data) return null;
  return data.status as DbBotStatus;
}

export async function setBotDbStatus(id: string, status: DbBotStatus): Promise<void> {
  const supabase = getClient();
  const { error } = await supabase
    .from("trading_bots")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    console.error("[bots] setBotDbStatus failed", error);
    throw new Error("Failed to update bot status");
  }
}

export async function listActiveBotsRaw(): Promise<TradingBotRow[]> {
  const supabase = getClient();
  const { data, error } = await supabase
    .from("trading_bots")
    .select("*")
    .eq("status", "ACTIVE")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[bots] listActiveBotsRaw failed", error);
    throw new Error("Failed to load active bots");
  }

  return (data ?? []) as TradingBotRow[];
}

export async function countOpenTradesForBot(botId: string): Promise<number> {
  const supabase = getClient();
  const { count, error } = await supabase
    .from("trading_bot_trades")
    .select("id", { count: "exact", head: true })
    .eq("bot_id", botId)
    .eq("status", "OPEN");

  if (error) {
    console.error("[bots] countOpenTradesForBot failed", error);
    throw new Error("Failed to count open trades");
  }

  return count ?? 0;
}

export async function getOpenTradeSymbolsForBot(botId: string): Promise<Set<string>> {
  const supabase = getClient();
  const { data, error } = await supabase
    .from("trading_bot_trades")
    .select("symbol")
    .eq("bot_id", botId)
    .eq("status", "OPEN");

  if (error) {
    console.error("[bots] getOpenTradeSymbolsForBot failed", error);
    throw new Error("Failed to load open trade symbols");
  }

  return new Set((data ?? []).map((row) => row.symbol as string));
}

export async function hasOpenTradeForBotSymbol(botId: string, symbol: string): Promise<boolean> {
  const symbols = await getOpenTradeSymbolsForBot(botId);
  return symbols.has(symbol);
}

export async function insertPaperTrade(input: {
  botId: string;
  symbol: string;
  side: "LONG" | "SHORT";
  entryPrice: number;
  quantity: number;
  signalSnapshot?: Record<string, unknown> | null;
}): Promise<string> {
  const supabase = getClient();
  const now = new Date().toISOString();

  const row: Record<string, unknown> = {
    bot_id: input.botId,
    symbol: input.symbol,
    side: input.side,
    entry_price: input.entryPrice,
    quantity: input.quantity,
    status: "OPEN",
    opened_at: now,
  };

  if (input.signalSnapshot != null) {
    row.signal_snapshot = input.signalSnapshot;
  }

  const { data, error } = await supabase
    .from("trading_bot_trades")
    .insert(row)
    .select("id")
    .single();

  if (error || !data) {
    console.error("[bots] insertPaperTrade failed", error);
    throw new Error("Failed to open paper trade");
  }

  return data.id as string;
}

export type OpenTradeWithBotConfig = TradingBotTradeRow & {
  timeout_minutes: number;
  capital_per_trade: number | string;
  take_profit_pct: number | string;
  stop_loss_pct: number | string;
};

export async function listOpenTradesWithBotConfig(): Promise<OpenTradeWithBotConfig[]> {
  const supabase = getClient();

  const { data: trades, error: tradesError } = await supabase
    .from("trading_bot_trades")
    .select("*")
    .eq("status", "OPEN");

  if (tradesError) {
    console.error("[bots] listOpenTradesWithBotConfig trades failed", tradesError);
    throw new Error("Failed to load open trades");
  }

  if (!trades?.length) return [];

  const botIds = [...new Set(trades.map((t) => t.bot_id as string))];
  const { data: bots, error: botsError } = await supabase
    .from("trading_bots")
    .select("id, timeout_minutes, capital_per_trade, take_profit_pct, stop_loss_pct")
    .in("id", botIds);

  if (botsError) {
    console.error("[bots] listOpenTradesWithBotConfig bots failed", botsError);
    throw new Error("Failed to load bot config for trades");
  }

  const botMap = new Map(
    (bots ?? []).map((b) => [
      b.id as string,
      {
        timeout_minutes: b.timeout_minutes as number,
        capital_per_trade: b.capital_per_trade as number | string,
        take_profit_pct: b.take_profit_pct as number | string,
        stop_loss_pct: b.stop_loss_pct as number | string,
      },
    ]),
  );

  return (trades as TradingBotTradeRow[])
    .map((trade) => {
      const cfg = botMap.get(trade.bot_id);
      if (!cfg) return null;
      return { ...trade, ...cfg };
    })
    .filter((t): t is OpenTradeWithBotConfig => t != null);
}

export async function closePaperTrade(input: {
  tradeId: string;
  exitPrice: number;
  pnlPct: number;
  pnlQuote: number;
  exitReason: "TP" | "SL" | "TIMEOUT" | "MANUAL";
}): Promise<void> {
  const supabase = getClient();
  const { error } = await supabase
    .from("trading_bot_trades")
    .update({
      status: "CLOSED",
      exit_price: input.exitPrice,
      pnl_pct: input.pnlPct,
      pnl_quote: input.pnlQuote,
      exit_reason: input.exitReason,
      closed_at: new Date().toISOString(),
    })
    .eq("id", input.tradeId)
    .eq("status", "OPEN");

  if (error) {
    console.error("[bots] closePaperTrade failed", error);
    throw new Error("Failed to close paper trade");
  }
}

const MS_24H = 24 * 60 * 60 * 1000;

function tradeTimestamp(row: TradingBotTradeRow): number {
  const t = row.opened_at ?? row.created_at;
  return new Date(t).getTime();
}

function summarizeBotTrades(
  bot: TradingBotRow,
  trades: TradingBotTradeRow[],
): Omit<
  BotPerformanceSummary,
  "id" | "name" | "status" | "dbStatus" | "strategySource" | "strategyKey" | "customStrategyId" | "strategyName" | "mode" | "side" | "symbols" | "symbolsCount" | "createdAt" | "updatedAt" | "activeSince"
> {
  const now = Date.now();
  const dayAgo = now - MS_24H;
  const closed = trades.filter((t) => t.status === "CLOSED");
  const open = trades.filter((t) => t.status === "OPEN");
  const dealsLast24h = trades.filter((t) => tradeTimestamp(t) >= dayAgo).length;
  const positiveDeals = closed.filter((t) => num(t.pnl_pct) > 0).length;
  const negativeDeals = closed.filter((t) => num(t.pnl_pct) < 0).length;
  const stopLossHits = closed.filter((t) => t.exit_reason === "SL").length;
  const tpHits = closed.filter((t) => t.exit_reason === "TP").length;
  const timeoutExits = closed.filter((t) => t.exit_reason === "TIMEOUT").length;
  const pnlQuote = closed.reduce((s, t) => s + num(t.pnl_quote), 0);
  const pnlPct = closed.reduce((s, t) => s + num(t.pnl_pct), 0);

  return {
    totalDeals: trades.length,
    openDeals: open.length,
    closedDeals: closed.length,
    dealsLast24h,
    positiveDeals,
    negativeDeals,
    stopLossHits,
    tpHits,
    timeoutExits,
    pnlQuote: Math.round(pnlQuote * 100) / 100,
    pnlPct: Math.round(pnlPct * 100) / 100,
  };
}

function activeSinceForBot(bot: TradingBotRow): string | null {
  if (bot.status === "ACTIVE") return bot.updated_at ?? bot.created_at;
  if (bot.status === "PAUSED" || bot.status === "STOPPED") return bot.created_at;
  return null;
}

async function fetchBotsAndTrades(scopeUserId?: string): Promise<{
  bots: TradingBotRow[];
  trades: TradingBotTradeRow[];
}> {
  const supabase = getClient();
  let botsQuery = supabase.from("trading_bots").select("*").order("created_at", { ascending: false });
  if (scopeUserId) {
    botsQuery = botsQuery.eq("user_id", scopeUserId);
  }

  const [{ data: bots, error: botsError }, { data: trades, error: tradesError }] =
    await Promise.all([
      botsQuery,
      supabase.from("trading_bot_trades").select("*").order("created_at", { ascending: false }),
    ]);

  if (botsError) throw new Error("Failed to load bots");
  if (tradesError) throw new Error("Failed to load trades");

  const botRows = (bots ?? []) as TradingBotRow[];
  const botIds = new Set(botRows.map((b) => b.id));
  const tradeRows = ((trades ?? []) as TradingBotTradeRow[]).filter((t) => botIds.has(t.bot_id));

  return {
    bots: botRows,
    trades: tradeRows,
  };
}

function mapDealRow(
  trade: TradingBotTradeRow,
  bot: TradingBotRow,
  currentPrice?: number,
): DealRow {
  const openedAt = trade.opened_at ?? trade.created_at;
  const closedAt = trade.closed_at ?? undefined;
  const endMs = closedAt ? new Date(closedAt).getTime() : Date.now();
  const startMs = new Date(openedAt).getTime();

  return {
    id: trade.id,
    botId: trade.bot_id,
    botName: bot.name,
    strategyName: resolveStrategyName(bot),
    symbol: trade.symbol,
    side: formatDbSide(trade.side),
    entryPrice: num(trade.entry_price),
    exitPrice: trade.exit_price != null ? num(trade.exit_price) : undefined,
    currentPrice,
    quantity: trade.quantity != null ? num(trade.quantity) : undefined,
    pnlQuote: trade.pnl_quote != null ? num(trade.pnl_quote) : undefined,
    pnlPct: trade.pnl_pct != null ? num(trade.pnl_pct) : undefined,
    openedAt,
    closedAt,
    durationMs: Math.max(0, endMs - startMs),
    exitReason: trade.exit_reason ?? undefined,
    status: trade.status === "CLOSED" ? "closed" : "open",
  };
}

export async function getBotPerformanceSummaries(scopeUserId?: string): Promise<BotPerformanceSummary[]> {
  const { bots, trades } = await fetchBotsAndTrades(scopeUserId);
  const tradesByBot = new Map<string, TradingBotTradeRow[]>();
  for (const t of trades) {
    const list = tradesByBot.get(t.bot_id) ?? [];
    list.push(t);
    tradesByBot.set(t.bot_id, list);
  }

  return bots.map((bot) => {
    const botTrades = tradesByBot.get(bot.id) ?? [];
    const stats = summarizeBotTrades(bot, botTrades);
    const mapped = mapBotRow(bot);
    return {
      id: bot.id,
      name: bot.name,
      status: mapped.status,
      dbStatus: mapped.dbStatus,
      strategySource: mapped.strategySource,
      strategyKey: mapped.strategyKey,
      customStrategyId: mapped.customStrategyId,
      strategyName: mapped.strategyName,
      mode: mapped.mode,
      side: mapped.side,
      symbols: mapped.symbols,
      symbolsCount: mapped.symbols.length,
      createdAt: bot.created_at,
      updatedAt: bot.updated_at,
      activeSince: activeSinceForBot(bot),
      ...stats,
    };
  });
}

export async function getDashboardMetrics(scopeUserId?: string): Promise<DashboardMetrics> {
  const summaries = await getBotPerformanceSummaries(scopeUserId);
  return {
    totalBots: summaries.length,
    activeBots: summaries.filter((b) => b.dbStatus === "ACTIVE").length,
    totalOpenDeals: summaries.reduce((s, b) => s + b.openDeals, 0),
    totalClosedDeals: summaries.reduce((s, b) => s + b.closedDeals, 0),
    dealsLast24h: summaries.reduce((s, b) => s + b.dealsLast24h, 0),
    totalPnlQuote: Math.round(summaries.reduce((s, b) => s + b.pnlQuote, 0) * 100) / 100,
    totalPnlPct: Math.round(summaries.reduce((s, b) => s + b.pnlPct, 0) * 100) / 100,
    winningDeals: summaries.reduce((s, b) => s + b.positiveDeals, 0),
    losingDeals: summaries.reduce((s, b) => s + b.negativeDeals, 0),
    stopLossHits: summaries.reduce((s, b) => s + b.stopLossHits, 0),
  };
}

export function computeBotMetrics(
  bot: BotRecord,
  trades: TradingBotTradeRow[],
): BotMetrics {
  const stats = summarizeBotTrades(
    {
      id: bot.id,
      name: bot.name,
      strategy_key: bot.strategyKey,
      strategy_source: bot.strategySource,
      custom_strategy_id: bot.customStrategyId,
      strategy_name: bot.strategyName,
      mode: "PAPER",
      side: bot.side.toUpperCase(),
      symbols: bot.symbols,
      capital_per_trade: bot.capitalPerTrade,
      max_open_trades: bot.maxOpenTrades,
      take_profit_pct: bot.takeProfitPct,
      stop_loss_pct: bot.stopLossPct,
      timeout_minutes: bot.timeoutMinutes,
      status: bot.dbStatus,
      created_at: bot.createdAt,
      updated_at: bot.updatedAt,
      user_id: null,
    },
    trades,
  );
  const activeSince = bot.dbStatus === "ACTIVE" ? bot.updatedAt : bot.createdAt;
  const activeDurationMs =
    bot.dbStatus === "ACTIVE"
      ? Math.max(0, Date.now() - new Date(activeSince).getTime())
      : 0;

  return {
    activeSince: bot.dbStatus === "ACTIVE" ? activeSince : null,
    activeDurationMs,
    totalDeals: stats.totalDeals,
    dealsLast24h: stats.dealsLast24h,
    openDeals: stats.openDeals,
    closedDeals: stats.closedDeals,
    positiveDeals: stats.positiveDeals,
    negativeDeals: stats.negativeDeals,
    slHits: stats.stopLossHits,
    tpHits: stats.tpHits,
    timeoutExits: stats.timeoutExits,
    pnlQuote: stats.pnlQuote,
    pnlPct: stats.pnlPct,
  };
}

export async function listAllOpenTrades(scopeUserId?: string): Promise<DealRow[]> {
  const { bots, trades } = await fetchBotsAndTrades(scopeUserId);
  const botMap = new Map(bots.map((b) => [b.id, b]));
  return trades
    .filter((t) => t.status === "OPEN")
    .map((t) => {
      const bot = botMap.get(t.bot_id);
      if (!bot) return null;
      return mapDealRow(t, bot);
    })
    .filter((d): d is DealRow => d != null);
}

export async function listAllClosedTrades(scopeUserId?: string): Promise<DealRow[]> {
  const { bots, trades } = await fetchBotsAndTrades(scopeUserId);
  const botMap = new Map(bots.map((b) => [b.id, b]));
  return trades
    .filter((t) => t.status === "CLOSED")
    .map((t) => {
      const bot = botMap.get(t.bot_id);
      if (!bot) return null;
      return mapDealRow(t, bot);
    })
    .filter((d): d is DealRow => d != null);
}

export async function listBotTradesRaw(botId: string): Promise<TradingBotTradeRow[]> {
  const supabase = getClient();
  const { data, error } = await supabase
    .from("trading_bot_trades")
    .select("*")
    .eq("bot_id", botId)
    .order("created_at", { ascending: false });
  if (error) throw new Error("Failed to load trades");
  return (data ?? []) as TradingBotTradeRow[];
}

export async function updateBot(id: string, payload: UpdateBotPayload): Promise<void> {
  const status = await getBotDbStatus(id);
  if (!status) throw new Error("Bot not found");
  if (status !== "DRAFT" && status !== "PAUSED") {
    throw new Error("Bot can only be edited when DRAFT or PAUSED");
  }

  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (payload.name != null) patch.name = payload.name.trim();
  if (payload.strategyKey != null) patch.strategy_key = payload.strategyKey;
  if (payload.side != null) patch.side = payload.side;
  if (payload.symbols != null) patch.symbols = payload.symbols;
  if (payload.capitalPerTrade != null) patch.capital_per_trade = payload.capitalPerTrade;
  if (payload.maxOpenTrades != null) patch.max_open_trades = payload.maxOpenTrades;
  if (payload.takeProfitPct != null) patch.take_profit_pct = payload.takeProfitPct;
  if (payload.stopLossPct != null) patch.stop_loss_pct = payload.stopLossPct;
  if (payload.timeoutMinutes != null) patch.timeout_minutes = payload.timeoutMinutes;

  const supabase = getClient();
  const { error } = await supabase.from("trading_bots").update(patch).eq("id", id);
  if (error) {
    console.error("[bots] updateBot failed", error);
    throw new Error("Failed to update bot");
  }
}

export async function duplicateBot(id: string, scopeUserId?: string): Promise<{ id: string }> {
  const supabase = getClient();
  const { data: source, error: fetchError } = await supabase
    .from("trading_bots")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (fetchError || !source) throw new Error("Bot not found");
  const row = source as TradingBotRow;
  if (scopeUserId && row.user_id !== scopeUserId) throw new Error("Bot not found");

  const { data, error } = await supabase
    .from("trading_bots")
    .insert({
      name: `Copy of ${row.name}`,
      user_id: row.user_id,
      strategy_source: row.strategy_source,
      strategy_key: row.strategy_key,
      custom_strategy_id: row.custom_strategy_id,
      strategy_name: row.strategy_name,
      mode: "PAPER",
      side: row.side,
      symbols: row.symbols,
      capital_per_trade: row.capital_per_trade,
      max_open_trades: row.max_open_trades,
      take_profit_pct: row.take_profit_pct,
      stop_loss_pct: row.stop_loss_pct,
      timeout_minutes: row.timeout_minutes,
      status: "DRAFT",
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error("[bots] duplicateBot failed", error);
    throw new Error("Failed to copy bot");
  }

  return { id: data.id as string };
}
