import { createSupabaseServerClient } from "@/lib/supabase-server";
import type { CustomStrategyRecord, StrategyDefinition } from "./types";

type CustomStrategyRow = {
  id: string;
  user_id: string | null;
  name: string;
  description: string | null;
  definition: StrategyDefinition;
  status: string;
  created_at: string;
  updated_at: string;
};

function getClient() {
  return createSupabaseServerClient();
}

function mapRow(row: CustomStrategyRow): CustomStrategyRecord {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    definition: {
      ...row.definition,
      id: row.id,
      name: row.name,
      description: row.description ?? undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    },
    status: row.status as CustomStrategyRecord["status"],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function listCustomStrategies(scopeUserId?: string): Promise<CustomStrategyRecord[]> {
  const supabase = getClient();
  let query = supabase.from("custom_strategies").select("*").order("updated_at", { ascending: false });
  if (scopeUserId) {
    query = query.eq("user_id", scopeUserId);
  }

  const { data, error } = await query;

  if (error) {
    console.error("[strategies] listCustomStrategies failed", error);
    throw new Error("Failed to load custom strategies");
  }

  return ((data ?? []) as CustomStrategyRow[]).map(mapRow);
}

export async function getCustomStrategy(id: string, scopeUserId?: string): Promise<CustomStrategyRecord | null> {
  const supabase = getClient();
  const { data, error } = await supabase
    .from("custom_strategies")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("[strategies] getCustomStrategy failed", error);
    throw new Error("Failed to load strategy");
  }

  if (!data) return null;
  const row = data as CustomStrategyRow;
  if (scopeUserId && row.user_id !== scopeUserId) return null;
  return mapRow(row);
}

export async function createCustomStrategy(
  input: {
    name: string;
    description?: string;
    definition: StrategyDefinition;
  },
  ownerUserId?: string | null,
): Promise<{ id: string }> {
  const supabase = getClient();
  const now = new Date().toISOString();
  const definition: StrategyDefinition = {
    ...input.definition,
    id: "",
    name: input.name.trim(),
    description: input.description?.trim(),
    version: 1,
    createdAt: now,
    updatedAt: now,
  };

  const { data, error } = await supabase
    .from("custom_strategies")
    .insert({
      name: input.name.trim(),
      description: input.description?.trim() || null,
      definition,
      status: "DRAFT",
      user_id: ownerUserId ?? null,
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error("[strategies] createCustomStrategy failed", error);
    throw new Error("Failed to create strategy");
  }

  return { id: data.id as string };
}

export async function updateCustomStrategy(
  id: string,
  input: {
    name: string;
    description?: string;
    definition: StrategyDefinition;
  },
  scopeUserId?: string,
): Promise<void> {
  const existing = await getCustomStrategy(id, scopeUserId);
  if (!existing) throw new Error("Strategy not found");

  const supabase = getClient();
  const now = new Date().toISOString();
  const definition: StrategyDefinition = {
    ...input.definition,
    id,
    name: input.name.trim(),
    description: input.description?.trim(),
    version: 1,
    updatedAt: now,
  };

  const { error } = await supabase
    .from("custom_strategies")
    .update({
      name: input.name.trim(),
      description: input.description?.trim() || null,
      definition,
      updated_at: now,
    })
    .eq("id", id);

  if (error) {
    console.error("[strategies] updateCustomStrategy failed", error);
    throw new Error("Failed to update strategy");
  }
}
