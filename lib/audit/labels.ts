import type { AuditEventType } from "./types";

const EVENT_LABELS: Record<AuditEventType, string> = {
  USER_CREATED: "User created",
  USER_UPDATED: "User updated",
  USER_DISABLED: "User disabled",
  BOT_CREATED: "Bot created",
  BOT_UPDATED: "Bot updated",
  BOT_STARTED: "Bot started",
  BOT_PAUSED: "Bot paused",
  BOT_STOPPED: "Bot stopped",
  STRATEGY_CREATED: "Strategy created",
  STRATEGY_UPDATED: "Strategy updated",
  BINANCE_ACCOUNT_CREATED: "Binance account created",
  BINANCE_ACCOUNT_UPDATED: "Binance account updated",
  BINANCE_ACCOUNT_VALIDATED: "Binance account validated",
  LOGIN_SUCCESS: "Login success",
  LOGIN_FAILURE: "Login failure",
  LOGOUT: "Logout",
  RISK_SETTINGS_UPDATED: "Risk settings updated",
  GLOBAL_KILL_SWITCH_UPDATED: "Global kill switch updated",
  GLOBAL_LIVE_TRADING_UPDATED: "Global live trading updated",
};

export function auditEventLabel(eventType: AuditEventType): string {
  return EVENT_LABELS[eventType];
}

export function formatAuditEntity(
  entityType: string | null,
  entityId: string | null,
  metadata: Record<string, unknown>,
): string {
  if (entityType && entityId) {
    const name =
      typeof metadata.name === "string"
        ? metadata.name
        : typeof metadata.accountName === "string"
          ? metadata.accountName
          : typeof metadata.username === "string"
            ? metadata.username
            : null;
    if (name) return `${entityType} · ${name}`;
    return `${entityType} · ${entityId.slice(0, 8)}…`;
  }

  if (typeof metadata.username === "string") {
    return metadata.username;
  }

  return "—";
}
