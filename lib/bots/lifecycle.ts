import type { BotStatus } from "./types";

export type DbBotStatus = "DRAFT" | "ACTIVE" | "PAUSED" | "STOPPED";

export function toDbStatus(status: BotStatus): DbBotStatus {
  switch (status) {
    case "active":
      return "ACTIVE";
    case "paused":
      return "PAUSED";
    case "stopped":
      return "STOPPED";
    default:
      return "DRAFT";
  }
}

export function canStartBot(status: DbBotStatus): boolean {
  return status === "DRAFT" || status === "PAUSED";
}

export function canPauseBot(status: DbBotStatus): boolean {
  return status === "ACTIVE";
}

export function canStopBot(status: DbBotStatus): boolean {
  return status === "ACTIVE" || status === "PAUSED";
}

export type LifecycleError = { ok: false; error: string };

export type LifecycleTransition = { ok: true; next: DbBotStatus };

export function validateStartTransition(
  current: DbBotStatus,
): LifecycleError | LifecycleTransition {
  if (current === "STOPPED") {
    return { ok: false, error: "Stopped bots cannot be restarted" };
  }
  if (!canStartBot(current)) {
    return { ok: false, error: `Cannot start bot from status ${current}` };
  }
  return { ok: true, next: "ACTIVE" };
}

export function validatePauseTransition(
  current: DbBotStatus,
): LifecycleError | LifecycleTransition {
  if (!canPauseBot(current)) {
    return { ok: false, error: `Cannot pause bot from status ${current}` };
  }
  return { ok: true, next: "PAUSED" };
}

export function validateStopTransition(
  current: DbBotStatus,
): LifecycleError | LifecycleTransition {
  if (!canStopBot(current)) {
    return { ok: false, error: `Cannot stop bot from status ${current}` };
  }
  return { ok: true, next: "STOPPED" };
}
