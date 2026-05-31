import { createSupabaseServerClient } from "@/lib/supabase-server";
import { decryptSecret, encryptSecret, maskApiKey } from "./encryption";
import type { ExchangeAccountRecord, ExchangeName, ValidationStatus } from "./types";

type ExchangeAccountRow = {
  id: string;
  user_id: string;
  exchange: string;
  account_name: string;
  api_key_encrypted: string;
  api_secret_encrypted: string;
  is_active: boolean;
  validation_status: string | null;
  last_validated_at: string | null;
  created_at: string;
};

function getClient() {
  return createSupabaseServerClient();
}

function mapRow(row: ExchangeAccountRow): ExchangeAccountRecord {
  let apiKeyPreview = "****";
  try {
    const apiKey = decryptSecret(row.api_key_encrypted);
    apiKeyPreview = maskApiKey(apiKey);
  } catch {
    apiKeyPreview = "****";
  }

  return {
    id: row.id,
    userId: row.user_id,
    exchange: row.exchange as ExchangeName,
    accountName: row.account_name,
    isActive: row.is_active,
    validationStatus: row.validation_status as ValidationStatus | null,
    lastValidatedAt: row.last_validated_at,
    createdAt: row.created_at,
    apiKeyPreview,
  };
}

export async function listExchangeAccounts(scopeUserId?: string): Promise<ExchangeAccountRecord[]> {
  const supabase = getClient();
  let query = supabase
    .from("exchange_accounts")
    .select("*")
    .order("created_at", { ascending: false });

  if (scopeUserId) {
    query = query.eq("user_id", scopeUserId);
  }

  const { data, error } = await query;
  if (error) {
    console.error("[exchange] listExchangeAccounts failed", error);
    throw new Error("Failed to load exchange accounts");
  }

  return ((data ?? []) as ExchangeAccountRow[]).map(mapRow);
}

export async function getExchangeAccount(
  id: string,
  scopeUserId?: string,
): Promise<ExchangeAccountRecord | null> {
  const supabase = getClient();
  const { data, error } = await supabase
    .from("exchange_accounts")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("[exchange] getExchangeAccount failed", error);
    throw new Error("Failed to load exchange account");
  }

  if (!data) return null;
  const row = data as ExchangeAccountRow;
  if (scopeUserId && row.user_id !== scopeUserId) return null;
  return mapRow(row);
}

export async function getExchangeAccountCredentials(
  id: string,
  scopeUserId?: string,
): Promise<{ apiKey: string; apiSecret: string } | null> {
  const supabase = getClient();
  const { data, error } = await supabase
    .from("exchange_accounts")
    .select("user_id, api_key_encrypted, api_secret_encrypted")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return null;
  const row = data as Pick<
    ExchangeAccountRow,
    "user_id" | "api_key_encrypted" | "api_secret_encrypted"
  >;
  if (scopeUserId && row.user_id !== scopeUserId) return null;

  return {
    apiKey: decryptSecret(row.api_key_encrypted),
    apiSecret: decryptSecret(row.api_secret_encrypted),
  };
}

export async function createExchangeAccount(input: {
  userId: string;
  exchange: ExchangeName;
  accountName: string;
  apiKey: string;
  apiSecret: string;
}): Promise<{ id: string }> {
  const supabase = getClient();
  const { data, error } = await supabase
    .from("exchange_accounts")
    .insert({
      user_id: input.userId,
      exchange: input.exchange,
      account_name: input.accountName.trim(),
      api_key_encrypted: encryptSecret(input.apiKey.trim()),
      api_secret_encrypted: encryptSecret(input.apiSecret.trim()),
      is_active: true,
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error("[exchange] createExchangeAccount failed", error);
    throw new Error("Failed to create exchange account");
  }

  return { id: data.id as string };
}

export async function updateExchangeAccount(
  id: string,
  input: {
    accountName?: string;
    apiKey?: string;
    apiSecret?: string;
  },
  scopeUserId?: string,
): Promise<void> {
  const existing = await getExchangeAccount(id, scopeUserId);
  if (!existing) throw new Error("Exchange account not found");

  const patch: Record<string, unknown> = {};
  if (input.accountName != null) patch.account_name = input.accountName.trim();
  if (input.apiKey != null && input.apiKey.trim()) {
    patch.api_key_encrypted = encryptSecret(input.apiKey.trim());
  }
  if (input.apiSecret != null && input.apiSecret.trim()) {
    patch.api_secret_encrypted = encryptSecret(input.apiSecret.trim());
  }

  if (Object.keys(patch).length === 0) return;

  const supabase = getClient();
  const { error } = await supabase.from("exchange_accounts").update(patch).eq("id", id);
  if (error) {
    console.error("[exchange] updateExchangeAccount failed", error);
    throw new Error("Failed to update exchange account");
  }
}

export async function setExchangeAccountActive(
  id: string,
  isActive: boolean,
  scopeUserId?: string,
): Promise<void> {
  const existing = await getExchangeAccount(id, scopeUserId);
  if (!existing) throw new Error("Exchange account not found");

  const supabase = getClient();
  const { error } = await supabase
    .from("exchange_accounts")
    .update({ is_active: isActive })
    .eq("id", id);

  if (error) {
    console.error("[exchange] setExchangeAccountActive failed", error);
    throw new Error("Failed to update account status");
  }
}

export async function updateExchangeAccountValidation(
  id: string,
  status: ValidationStatus,
): Promise<void> {
  const supabase = getClient();
  const { error } = await supabase
    .from("exchange_accounts")
    .update({
      validation_status: status,
      last_validated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    console.error("[exchange] updateExchangeAccountValidation failed", error);
    throw new Error("Failed to save validation result");
  }
}

export async function userHasValidatedBinanceAccount(userId: string): Promise<boolean> {
  const supabase = getClient();
  const { count, error } = await supabase
    .from("exchange_accounts")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("exchange", "BINANCE")
    .eq("is_active", true)
    .eq("validation_status", "CONNECTED");

  if (error) {
    console.error("[exchange] userHasValidatedBinanceAccount failed", error);
    return false;
  }

  return (count ?? 0) > 0;
}
