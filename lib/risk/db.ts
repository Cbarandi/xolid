import { createSupabaseServerClient } from "@/lib/supabase-server";
import type {
  SystemRiskState,
  UpdateSystemRiskStatePayload,
  UpdateUserRiskSettingsPayload,
  UserRiskSettings,
} from "./types";

type RiskSettingsRow = {
  id: string;
  user_id: string;
  max_total_live_capital_usdc: number | string;
  max_capital_per_bot_usdc: number | string;
  max_capital_per_trade_usdc: number | string;
  max_open_live_trades: number;
  max_daily_loss_usdc: number | string;
  live_trading_enabled: boolean;
  paper_trading_enabled: boolean;
  created_at: string;
  updated_at: string;
};

type SystemRiskStateRow = {
  id: string;
  global_kill_switch_enabled: boolean;
  live_trading_globally_enabled: boolean;
  reason: string | null;
  updated_by: string | null;
  updated_at: string;
};

function num(value: number | string): number {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
}

function mapSettings(row: RiskSettingsRow): UserRiskSettings {
  return {
    id: row.id,
    userId: row.user_id,
    maxTotalLiveCapitalUsdc: num(row.max_total_live_capital_usdc),
    maxCapitalPerBotUsdc: num(row.max_capital_per_bot_usdc),
    maxCapitalPerTradeUsdc: num(row.max_capital_per_trade_usdc),
    maxOpenLiveTrades: row.max_open_live_trades,
    maxDailyLossUsdc: num(row.max_daily_loss_usdc),
    liveTradingEnabled: row.live_trading_enabled,
    paperTradingEnabled: row.paper_trading_enabled,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapSystem(row: SystemRiskStateRow): SystemRiskState {
  return {
    id: "global",
    globalKillSwitchEnabled: row.global_kill_switch_enabled,
    liveTradingGloballyEnabled: row.live_trading_globally_enabled,
    reason: row.reason,
    updatedBy: row.updated_by,
    updatedAt: row.updated_at,
  };
}

function getClient() {
  return createSupabaseServerClient();
}

const DEFAULT_SYSTEM: SystemRiskState = {
  id: "global",
  globalKillSwitchEnabled: true,
  liveTradingGloballyEnabled: false,
  reason: "Live trading locked by default",
  updatedBy: null,
  updatedAt: new Date().toISOString(),
};

export async function getUserRiskSettings(userId: string): Promise<UserRiskSettings> {
  const supabase = getClient();
  const { data, error } = await supabase
    .from("risk_settings")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("[risk] getUserRiskSettings failed", error);
    throw new Error("Failed to load risk settings");
  }

  if (data) return mapSettings(data as RiskSettingsRow);

  const { data: created, error: insertError } = await supabase
    .from("risk_settings")
    .insert({ user_id: userId })
    .select("*")
    .single();

  if (insertError || !created) {
    console.error("[risk] create default risk settings failed", insertError);
    throw new Error("Failed to initialize risk settings");
  }

  return mapSettings(created as RiskSettingsRow);
}

export async function updateUserRiskSettings(
  userId: string,
  payload: UpdateUserRiskSettingsPayload,
): Promise<UserRiskSettings> {
  await getUserRiskSettings(userId);

  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (payload.maxTotalLiveCapitalUsdc != null) {
    patch.max_total_live_capital_usdc = payload.maxTotalLiveCapitalUsdc;
  }
  if (payload.maxCapitalPerBotUsdc != null) {
    patch.max_capital_per_bot_usdc = payload.maxCapitalPerBotUsdc;
  }
  if (payload.maxCapitalPerTradeUsdc != null) {
    patch.max_capital_per_trade_usdc = payload.maxCapitalPerTradeUsdc;
  }
  if (payload.maxOpenLiveTrades != null) {
    patch.max_open_live_trades = payload.maxOpenLiveTrades;
  }
  if (payload.maxDailyLossUsdc != null) {
    patch.max_daily_loss_usdc = payload.maxDailyLossUsdc;
  }
  if (payload.liveTradingEnabled != null) {
    patch.live_trading_enabled = payload.liveTradingEnabled;
  }
  if (payload.paperTradingEnabled != null) {
    patch.paper_trading_enabled = payload.paperTradingEnabled;
  }

  const supabase = getClient();
  const { data, error } = await supabase
    .from("risk_settings")
    .update(patch)
    .eq("user_id", userId)
    .select("*")
    .single();

  if (error || !data) {
    console.error("[risk] updateUserRiskSettings failed", error);
    throw new Error("Failed to update risk settings");
  }

  return mapSettings(data as RiskSettingsRow);
}

export async function getSystemRiskState(): Promise<SystemRiskState> {
  const supabase = getClient();
  const { data, error } = await supabase
    .from("system_risk_state")
    .select("*")
    .eq("id", "global")
    .maybeSingle();

  if (error) {
    console.error("[risk] getSystemRiskState failed", error);
    throw new Error("Failed to load system risk state");
  }

  if (!data) return DEFAULT_SYSTEM;
  return mapSystem(data as SystemRiskStateRow);
}

export async function updateSystemRiskState(
  payload: UpdateSystemRiskStatePayload,
  updatedBy: string | null,
): Promise<SystemRiskState> {
  const patch: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
    updated_by: updatedBy,
  };

  if (payload.globalKillSwitchEnabled != null) {
    patch.global_kill_switch_enabled = payload.globalKillSwitchEnabled;
  }
  if (payload.liveTradingGloballyEnabled != null) {
    patch.live_trading_globally_enabled = payload.liveTradingGloballyEnabled;
  }
  if (payload.reason !== undefined) {
    patch.reason = payload.reason;
  }

  const supabase = getClient();
  const { data, error } = await supabase
    .from("system_risk_state")
    .upsert({ id: "global", ...patch }, { onConflict: "id" })
    .select("*")
    .single();

  if (error || !data) {
    console.error("[risk] updateSystemRiskState failed", error);
    throw new Error("Failed to update system risk state");
  }

  return mapSystem(data as SystemRiskStateRow);
}
