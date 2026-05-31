export const AUDIT_EVENT_TYPES = [
  "USER_CREATED",
  "USER_UPDATED",
  "USER_DISABLED",
  "BOT_CREATED",
  "BOT_UPDATED",
  "BOT_STARTED",
  "BOT_PAUSED",
  "BOT_STOPPED",
  "STRATEGY_CREATED",
  "STRATEGY_UPDATED",
  "BINANCE_ACCOUNT_CREATED",
  "BINANCE_ACCOUNT_UPDATED",
  "BINANCE_ACCOUNT_VALIDATED",
  "LOGIN_SUCCESS",
  "LOGIN_FAILURE",
  "LOGOUT",
  "RISK_SETTINGS_UPDATED",
  "GLOBAL_KILL_SWITCH_UPDATED",
  "GLOBAL_LIVE_TRADING_UPDATED",
] as const;

export type AuditEventType = (typeof AUDIT_EVENT_TYPES)[number];

export type AuditLogRecord = {
  id: string;
  userId: string | null;
  username: string | null;
  eventType: AuditEventType;
  entityType: string | null;
  entityId: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
};

export type LogEventInput = {
  userId?: string | null;
  eventType: AuditEventType;
  entityType?: string | null;
  entityId?: string | null;
  metadata?: Record<string, unknown>;
};

export type AuditLogFilters = {
  dateFrom?: string;
  dateTo?: string;
  userId?: string;
  eventType?: AuditEventType;
  limit?: number;
};
