"use server";

import { revalidatePath } from "next/cache";
import { logEvent } from "@/lib/audit/logger";
import { requirePrivateSession } from "@/lib/auth/private-session";
import { scopeUserIdForSession } from "@/lib/auth/rbac";
import { assertPaperAllowed } from "@/lib/risk/checks";
import { RiskGateError } from "@/lib/risk/types";
import {
  createBot,
  duplicateBot,
  getBot,
  setBotDbStatus,
  updateBot,
} from "@/lib/bots/db";
import {
  validatePauseTransition,
  validateStartTransition,
  validateStopTransition,
  type DbBotStatus,
  type LifecycleError,
  type LifecycleTransition,
} from "@/lib/bots/lifecycle";
import { runExitEngine } from "@/lib/bots/paper-exit-engine";
import { runPaperScan } from "@/lib/bots/paper-runner";
import {
  validateCreateBotInput,
  validateUpdateBotInput,
  type CreateBotInput,
  type UpdateBotInput,
} from "@/lib/bots/validators";
import type { AuditEventType } from "@/lib/audit/types";

function revalidateTradingApp(id?: string) {
  revalidatePath("/dashboard");
  revalidatePath("/bots");
  revalidatePath("/deals/active");
  revalidatePath("/deals/closed");
  if (id) {
    revalidatePath(`/bots/${id}`);
    revalidatePath(`/bots/${id}/edit`);
  }
}

export type CreateBotActionResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

export type SimpleActionResult = { ok: true } | { ok: false; error: string };

export type PaperScanActionResult =
  | { ok: true; result: Awaited<ReturnType<typeof runPaperScan>> }
  | { ok: false; error: string };

export type ExitEngineActionResult =
  | { ok: true; result: Awaited<ReturnType<typeof runExitEngine>> }
  | { ok: false; error: string };

async function transitionBot(
  id: string,
  validate: (current: DbBotStatus) => LifecycleError | LifecycleTransition,
  eventType: AuditEventType,
): Promise<SimpleActionResult> {
  try {
    const session = await requirePrivateSession();
    const scope = scopeUserIdForSession(session);
    const bot = await getBot(id, scope);
    if (!bot) {
      return { ok: false, error: "Bot not found" };
    }

    const current = bot.dbStatus;
    const next = validate(current);
    if (!next.ok) {
      return next;
    }

    if (session.userId) {
      await assertPaperAllowed(session.userId);
    }

    await setBotDbStatus(id, next.next);
    await logEvent({
      userId: session.userId,
      eventType,
      entityType: "bot",
      entityId: id,
      metadata: { name: bot.name, from: current, to: next.next },
    });
    revalidateTradingApp(id);
    return { ok: true };
  } catch (e) {
    if (e instanceof RiskGateError) {
      return { ok: false, error: e.message };
    }
    return { ok: false, error: "Failed to update bot status" };
  }
}

export async function createBotAction(raw: CreateBotInput): Promise<CreateBotActionResult> {
  const validated = validateCreateBotInput(raw);
  if (!validated.ok) {
    return { ok: false, error: validated.error };
  }

  try {
    const session = await requirePrivateSession();
    if (session.userId) {
      await assertPaperAllowed(session.userId);
    }
    const { id } = await createBot(validated.data, session.userId);
    await logEvent({
      userId: session.userId,
      eventType: "BOT_CREATED",
      entityType: "bot",
      entityId: id,
      metadata: { name: validated.data.name, strategySource: validated.data.strategySource },
    });
    revalidateTradingApp();
    return { ok: true, id };
  } catch (e) {
    if (e instanceof RiskGateError) {
      return { ok: false, error: e.message };
    }
    const message = e instanceof Error ? e.message : "Could not create bot";
    return { ok: false, error: message };
  }
}

export async function startBotAction(id: string): Promise<SimpleActionResult> {
  return transitionBot(id, validateStartTransition, "BOT_STARTED");
}

export async function pauseBotAction(id: string): Promise<SimpleActionResult> {
  return transitionBot(id, validatePauseTransition, "BOT_PAUSED");
}

export async function stopBotAction(id: string): Promise<SimpleActionResult> {
  return transitionBot(id, validateStopTransition, "BOT_STOPPED");
}

export async function runPaperScanAction(): Promise<PaperScanActionResult> {
  try {
    const result = await runPaperScan();
    revalidateTradingApp();
    revalidatePath("/admin/bots");
    return { ok: true, result };
  } catch {
    return { ok: false, error: "Paper scan failed" };
  }
}

export async function runExitEngineAction(): Promise<ExitEngineActionResult> {
  try {
    const result = await runExitEngine();
    revalidateTradingApp();
    revalidatePath("/admin/bots");
    return { ok: true, result };
  } catch {
    return { ok: false, error: "Exit engine failed" };
  }
}

export type UpdateBotActionResult = { ok: true } | { ok: false; error: string };

export async function updateBotAction(
  id: string,
  raw: UpdateBotInput,
): Promise<UpdateBotActionResult> {
  const validated = validateUpdateBotInput(raw);
  if (!validated.ok) {
    return { ok: false, error: validated.error };
  }

  try {
    const session = await requirePrivateSession();
    const scope = scopeUserIdForSession(session);
    const bot = await getBot(id, scope);
    if (!bot) {
      return { ok: false, error: "Bot not found" };
    }

    await updateBot(id, {
      name: validated.data.name,
      ...(validated.data.strategyKey ? { strategyKey: validated.data.strategyKey } : {}),
      side: validated.data.side,
      symbols: validated.data.symbols,
      capitalPerTrade: validated.data.capitalPerTrade,
      maxOpenTrades: validated.data.maxOpenTrades,
      takeProfitPct: validated.data.takeProfitPct,
      stopLossPct: validated.data.stopLossPct,
      timeoutMinutes: validated.data.timeoutMinutes,
    });
    await logEvent({
      userId: session.userId,
      eventType: "BOT_UPDATED",
      entityType: "bot",
      entityId: id,
      metadata: { name: validated.data.name },
    });
    revalidateTradingApp(id);
    return { ok: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Could not update bot";
    return { ok: false, error: message };
  }
}

export type DuplicateBotActionResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

export async function duplicateBotAction(id: string): Promise<DuplicateBotActionResult> {
  try {
    const session = await requirePrivateSession();
    const scope = scopeUserIdForSession(session);
    const { id: newId } = await duplicateBot(id, scope);
    const source = await getBot(id, scope);
    await logEvent({
      userId: session.userId,
      eventType: "BOT_CREATED",
      entityType: "bot",
      entityId: newId,
      metadata: { name: source ? `Copy of ${source.name}` : undefined, duplicatedFrom: id },
    });
    revalidateTradingApp();
    return { ok: true, id: newId };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Could not copy bot";
    return { ok: false, error: message };
  }
}
