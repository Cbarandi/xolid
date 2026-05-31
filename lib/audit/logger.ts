import { insertAuditLog } from "./db";
import type { LogEventInput } from "./types";

/** Persist an audit record. Never throws — failures are logged to stderr. */
export async function logEvent(input: LogEventInput): Promise<void> {
  try {
    await insertAuditLog(input);
  } catch (error) {
    console.error("[audit] logEvent failed", {
      eventType: input.eventType,
      entityType: input.entityType,
      entityId: input.entityId,
      error,
    });
  }
}
