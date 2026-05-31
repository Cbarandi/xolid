import type { BotStrategy, StrategySource } from "./types";
import { BOT_STRATEGIES } from "./constants";
import { STRATEGIES_META } from "./strategies-meta";
import { filterUsdcSymbols, isUsdcPair, normalizeSymbol } from "@/lib/market/symbol-guard";

export type CreateBotInput = {
  name: string;
  strategySource: string;
  strategyKey?: string;
  customStrategyId?: string;
  strategyName?: string;
  mode: string;
  side: string;
  symbols: string[];
  capitalPerTrade: number;
  maxOpenTrades: number;
  takeProfitPct: number;
  stopLossPct: number;
  timeoutMinutes: number;
};

export type ValidatedCreateBotInput = {
  name: string;
  strategySource: StrategySource;
  strategyKey: BotStrategy | null;
  customStrategyId: string | null;
  strategyName: string;
  mode: "PAPER";
  side: "LONG" | "SHORT";
  symbols: string[];
  capitalPerTrade: number;
  maxOpenTrades: number;
  takeProfitPct: number;
  stopLossPct: number;
  timeoutMinutes: number;
};

export type UpdateBotInput = {
  name: string;
  strategyKey?: string;
  side: string;
  symbols: string[];
  capitalPerTrade: number;
  maxOpenTrades: number;
  takeProfitPct: number;
  stopLossPct: number;
  timeoutMinutes: number;
};

export type ValidatedUpdateBotInput = Omit<
  ValidatedCreateBotInput,
  "strategySource" | "strategyKey" | "customStrategyId" | "strategyName" | "mode"
> & {
  strategyKey?: BotStrategy;
};

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function normalizeSymbols(raw: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of raw) {
    const sym = normalizeSymbol(item);
    if (!sym || seen.has(sym)) continue;
    seen.add(sym);
    out.push(sym);
  }
  return out;
}

function parseSide(raw: string): "LONG" | "SHORT" | null {
  const v = raw.trim().toLowerCase();
  if (v === "long") return "LONG";
  if (v === "short") return "SHORT";
  if (raw === "LONG" || raw === "SHORT") return raw;
  return null;
}

function parseStrategySource(raw: string): StrategySource | null {
  const v = raw.trim().toUpperCase();
  if (v === "SYSTEM" || v === "CUSTOM") return v;
  return null;
}

function systemStrategyName(key: BotStrategy): string {
  return STRATEGIES_META.find((s) => s.key === key)?.name ?? key;
}

function validateRiskFields(input: CreateBotInput): { ok: true } | { ok: false; error: string } {
  if (!Number.isFinite(input.capitalPerTrade) || input.capitalPerTrade <= 0) {
    return { ok: false, error: "Capital per trade must be greater than 0" };
  }

  if (!Number.isInteger(input.maxOpenTrades) || input.maxOpenTrades <= 0) {
    return { ok: false, error: "Max open trades must be a positive integer" };
  }

  if (!Number.isFinite(input.takeProfitPct) || input.takeProfitPct <= 0) {
    return { ok: false, error: "Take profit must be greater than 0" };
  }

  if (!Number.isFinite(input.stopLossPct) || input.stopLossPct <= 0) {
    return { ok: false, error: "Stop loss must be greater than 0" };
  }

  if (!Number.isInteger(input.timeoutMinutes) || input.timeoutMinutes <= 0) {
    return { ok: false, error: "Timeout must be a positive integer" };
  }

  return { ok: true };
}

function validateSymbols(input: CreateBotInput): { ok: true; symbols: string[] } | { ok: false; error: string } {
  const symbols = filterUsdcSymbols(normalizeSymbols(input.symbols));
  if (symbols.length === 0) {
    const normalized = normalizeSymbols(input.symbols);
    const invalid = normalized.filter((s) => !isUsdcPair(s));
    if (invalid.length > 0) {
      return {
        ok: false,
        error: `Only USDC pairs are allowed. Invalid: ${invalid.join(", ")}`,
      };
    }
    return { ok: false, error: "At least one valid USDC symbol is required" };
  }

  const invalid = normalizeSymbols(input.symbols).filter((s) => !isUsdcPair(s));
  if (invalid.length > 0) {
    return {
      ok: false,
      error: `Only USDC pairs are allowed. Invalid: ${invalid.join(", ")}`,
    };
  }

  return { ok: true, symbols };
}

export function validateCreateBotInput(
  input: CreateBotInput,
): { ok: true; data: ValidatedCreateBotInput } | { ok: false; error: string } {
  const name = input.name.trim();
  if (!name) {
    return { ok: false, error: "Bot name is required" };
  }

  const strategySource = parseStrategySource(input.strategySource);
  if (!strategySource) {
    return { ok: false, error: "Strategy source must be SYSTEM or CUSTOM" };
  }

  const mode = input.mode.trim().toUpperCase();
  if (mode !== "PAPER") {
    return { ok: false, error: "Only PAPER mode is allowed" };
  }

  const side = parseSide(input.side);
  if (!side) {
    return { ok: false, error: "Side must be LONG or SHORT" };
  }

  const symbolsResult = validateSymbols(input);
  if (!symbolsResult.ok) return symbolsResult;

  const riskResult = validateRiskFields(input);
  if (!riskResult.ok) return riskResult;

  if (strategySource === "SYSTEM") {
    const key = input.strategyKey?.trim() as BotStrategy | undefined;
    if (!key || !BOT_STRATEGIES.includes(key)) {
      return { ok: false, error: "Invalid system strategy" };
    }

    return {
      ok: true,
      data: {
        name,
        strategySource,
        strategyKey: key,
        customStrategyId: null,
        strategyName: input.strategyName?.trim() || systemStrategyName(key),
        mode: "PAPER",
        side,
        symbols: symbolsResult.symbols,
        capitalPerTrade: input.capitalPerTrade,
        maxOpenTrades: input.maxOpenTrades,
        takeProfitPct: input.takeProfitPct,
        stopLossPct: input.stopLossPct,
        timeoutMinutes: input.timeoutMinutes,
      },
    };
  }

  const customId = input.customStrategyId?.trim();
  if (!customId || !UUID_RE.test(customId)) {
    return { ok: false, error: "Valid custom strategy id is required" };
  }

  return {
    ok: true,
    data: {
      name,
      strategySource,
      strategyKey: null,
      customStrategyId: customId,
      strategyName: input.strategyName?.trim() || "Custom strategy",
      mode: "PAPER",
      side,
      symbols: symbolsResult.symbols,
      capitalPerTrade: input.capitalPerTrade,
      maxOpenTrades: input.maxOpenTrades,
      takeProfitPct: input.takeProfitPct,
      stopLossPct: input.stopLossPct,
      timeoutMinutes: input.timeoutMinutes,
    },
  };
}

export function validateUpdateBotInput(
  input: UpdateBotInput,
): { ok: true; data: ValidatedUpdateBotInput } | { ok: false; error: string } {
  const name = input.name.trim();
  if (!name) {
    return { ok: false, error: "Bot name is required" };
  }

  const side = parseSide(input.side);
  if (!side) {
    return { ok: false, error: "Side must be LONG or SHORT" };
  }

  const symbolsResult = validateSymbols({
    ...input,
    mode: "paper",
    strategySource: "SYSTEM",
  });
  if (!symbolsResult.ok) return symbolsResult;

  const riskResult = validateRiskFields({
    ...input,
    mode: "paper",
    strategySource: "SYSTEM",
  });
  if (!riskResult.ok) return riskResult;

  let strategyKey: BotStrategy | undefined;
  if (input.strategyKey) {
    const key = input.strategyKey.trim() as BotStrategy;
    if (!BOT_STRATEGIES.includes(key)) {
      return { ok: false, error: "Invalid system strategy" };
    }
    strategyKey = key;
  }

  return {
    ok: true,
    data: {
      name,
      side,
      symbols: symbolsResult.symbols,
      capitalPerTrade: input.capitalPerTrade,
      maxOpenTrades: input.maxOpenTrades,
      takeProfitPct: input.takeProfitPct,
      stopLossPct: input.stopLossPct,
      timeoutMinutes: input.timeoutMinutes,
      ...(strategyKey ? { strategyKey } : {}),
    },
  };
}
