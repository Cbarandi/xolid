"use server";

import { revalidatePath } from "next/cache";
import { logEvent } from "@/lib/audit/logger";
import { requirePrivateSession } from "@/lib/auth/private-session";
import { scopeUserIdForSession } from "@/lib/auth/rbac";
import {
  createCustomStrategy,
  getCustomStrategy,
  updateCustomStrategy,
} from "@/lib/strategies/db";
import type { StrategyDefinition } from "@/lib/strategies/types";
import { validateStrategyDefinition } from "@/lib/strategies/validators";

export type StrategyActionResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

function revalidateStrategyPaths(id?: string) {
  revalidatePath("/strategies");
  if (id) {
    revalidatePath(`/strategies/${id}`);
    revalidatePath(`/strategies/${id}/edit`);
  }
}

export async function saveCustomStrategyAction(input: {
  id?: string;
  name: string;
  description?: string;
  definition: StrategyDefinition;
}): Promise<StrategyActionResult> {
  const { name, description, definition } = input;
  const validated = validateStrategyDefinition(name, definition);
  if (!validated.ok) {
    return validated;
  }

  try {
    const session = await requirePrivateSession();
    const scope = scopeUserIdForSession(session);

    if (input.id) {
      const existing = await getCustomStrategy(input.id, scope);
      if (!existing) {
        return { ok: false, error: "Strategy not found" };
      }
      await updateCustomStrategy(input.id, { name, description, definition }, scope);
      await logEvent({
        userId: session.userId,
        eventType: "STRATEGY_UPDATED",
        entityType: "strategy",
        entityId: input.id,
        metadata: { name },
      });
      revalidateStrategyPaths(input.id);
      return { ok: true, id: input.id };
    }

    const { id } = await createCustomStrategy({ name, description, definition }, session.userId);
    await logEvent({
      userId: session.userId,
      eventType: "STRATEGY_CREATED",
      entityType: "strategy",
      entityId: id,
      metadata: { name },
    });
    revalidateStrategyPaths(id);
    return { ok: true, id };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Could not save strategy";
    return { ok: false, error: message };
  }
}
