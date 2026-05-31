import { createSupabaseServerClient } from "@/lib/supabase-server";
import type { AuditLogFilters, AuditLogRecord, LogEventInput } from "./types";

type AuditLogRow = {
  id: string;
  user_id: string | null;
  event_type: string;
  entity_type: string | null;
  entity_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  users?: { username: string } | { username: string }[] | null;
};

function mapRow(row: AuditLogRow): AuditLogRecord {
  const userJoin = row.users;
  const username = Array.isArray(userJoin)
    ? userJoin[0]?.username ?? null
    : userJoin?.username ?? null;

  return {
    id: row.id,
    userId: row.user_id,
    username,
    eventType: row.event_type as AuditLogRecord["eventType"],
    entityType: row.entity_type,
    entityId: row.entity_id,
    metadata: row.metadata ?? {},
    createdAt: row.created_at,
  };
}

export async function insertAuditLog(input: LogEventInput): Promise<void> {
  const supabase = createSupabaseServerClient();
  const { error } = await supabase.from("audit_logs").insert({
    user_id: input.userId ?? null,
    event_type: input.eventType,
    entity_type: input.entityType ?? null,
    entity_id: input.entityId ?? null,
    metadata: input.metadata ?? {},
  });

  if (error) {
    throw error;
  }
}

export async function listAuditLogs(filters: AuditLogFilters = {}): Promise<AuditLogRecord[]> {
  const supabase = createSupabaseServerClient();
  const limit = Math.min(Math.max(filters.limit ?? 200, 1), 500);

  let query = supabase
    .from("audit_logs")
    .select("*, users(username)")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (filters.userId) {
    query = query.eq("user_id", filters.userId);
  }
  if (filters.eventType) {
    query = query.eq("event_type", filters.eventType);
  }
  if (filters.dateFrom) {
    query = query.gte("created_at", `${filters.dateFrom}T00:00:00.000Z`);
  }
  if (filters.dateTo) {
    query = query.lte("created_at", `${filters.dateTo}T23:59:59.999Z`);
  }

  const { data, error } = await query;
  if (error) {
    console.error("[audit] listAuditLogs failed", error);
    throw new Error("Failed to load audit logs");
  }

  return ((data ?? []) as AuditLogRow[]).map(mapRow);
}
