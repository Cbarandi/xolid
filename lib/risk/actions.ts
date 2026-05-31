"use server";

import { revalidatePath } from "next/cache";
import { logEvent } from "@/lib/audit/logger";
import { getPrivateSession } from "@/lib/auth/private-session";
import { requireAdminOrAbove, requireSuperAdmin } from "@/lib/auth/rbac";
import {
  getSystemRiskState,
  updateSystemRiskState,
  updateUserRiskSettings,
} from "./db";
import type { UpdateSystemRiskStatePayload, UpdateUserRiskSettingsPayload } from "./types";

export type RiskActionResult = { ok: true } | { ok: false; error: string };

function revalidateRisk() {
  revalidatePath("/risk");
}

export async function updateGlobalRiskStateAction(
  payload: UpdateSystemRiskStatePayload,
): Promise<RiskActionResult> {
  const session = await getPrivateSession();
  requireSuperAdmin(session);

  try {
    const previous = await getSystemRiskState();
    const next = await updateSystemRiskState(payload, session!.userId);

    if (
      payload.globalKillSwitchEnabled != null &&
      payload.globalKillSwitchEnabled !== previous.globalKillSwitchEnabled
    ) {
      await logEvent({
        userId: session!.userId,
        eventType: "GLOBAL_KILL_SWITCH_UPDATED",
        entityType: "system_risk",
        entityId: "global",
        metadata: {
          enabled: payload.globalKillSwitchEnabled,
          reason: payload.reason ?? next.reason,
        },
      });
    }

    if (
      payload.liveTradingGloballyEnabled != null &&
      payload.liveTradingGloballyEnabled !== previous.liveTradingGloballyEnabled
    ) {
      await logEvent({
        userId: session!.userId,
        eventType: "GLOBAL_LIVE_TRADING_UPDATED",
        entityType: "system_risk",
        entityId: "global",
        metadata: {
          enabled: payload.liveTradingGloballyEnabled,
          reason: payload.reason ?? next.reason,
        },
      });
    }

    revalidateRisk();
    return { ok: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Could not update global risk controls";
    return { ok: false, error: message };
  }
}

export async function updateUserRiskSettingsAction(
  userId: string,
  payload: UpdateUserRiskSettingsPayload,
): Promise<RiskActionResult> {
  const session = await getPrivateSession();
  requireAdminOrAbove(session);

  if (!userId.trim()) {
    return { ok: false, error: "User is required" };
  }

  try {
    await updateUserRiskSettings(userId, payload);
    await logEvent({
      userId: session!.userId,
      eventType: "RISK_SETTINGS_UPDATED",
      entityType: "risk_settings",
      entityId: userId,
      metadata: { targetUserId: userId, ...payload },
    });
    revalidateRisk();
    return { ok: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Could not update user risk settings";
    return { ok: false, error: message };
  }
}
