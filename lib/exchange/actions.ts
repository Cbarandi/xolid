"use server";

import { revalidatePath } from "next/cache";
import { logEvent } from "@/lib/audit/logger";
import { requirePrivateSession } from "@/lib/auth/private-session";
import { scopeUserIdForSession } from "@/lib/auth/rbac";
import { validateBinanceConnection } from "./binance";
import {
  createExchangeAccount,
  getExchangeAccount,
  getExchangeAccountCredentials,
  setExchangeAccountActive,
  updateExchangeAccount,
  updateExchangeAccountValidation,
} from "./db";
import { isEncryptionConfigured } from "./encryption";
import type { ExchangeName } from "./types";

export type ExchangeActionResult = { ok: true } | { ok: false; error: string };

export type CreateExchangeActionResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

export type TestConnectionActionResult =
  | { ok: true; accountType: string; canTrade: boolean }
  | { ok: false; error: string };

async function requireAccountUserId() {
  const session = await requirePrivateSession();
  if (!session.userId) {
    throw new Error("A database user account is required to manage exchange connections");
  }
  return { session, scope: scopeUserIdForSession(session) };
}

function revalidateExchange(id?: string) {
  revalidatePath("/exchange");
  if (id) revalidatePath(`/exchange/${id}`);
}

export async function createExchangeAccountAction(input: {
  accountName: string;
  apiKey: string;
  apiSecret: string;
  exchange?: ExchangeName;
}): Promise<CreateExchangeActionResult> {
  if (!isEncryptionConfigured()) {
    return { ok: false, error: "Encryption is not configured (XOLID_MASTER_ENCRYPTION_KEY)" };
  }

  let session;
  try {
    ({ session } = await requireAccountUserId());
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Unauthorized" };
  }

  const accountName = input.accountName.trim();
  const apiKey = input.apiKey.trim();
  const apiSecret = input.apiSecret.trim();
  const exchange = input.exchange ?? "BINANCE";

  if (!accountName) return { ok: false, error: "Account name is required" };
  if (!apiKey || !apiSecret) return { ok: false, error: "API key and secret are required" };
  if (exchange !== "BINANCE") return { ok: false, error: "Only Binance is supported" };

  try {
    const { id } = await createExchangeAccount({
      userId: session.userId!,
      exchange,
      accountName,
      apiKey,
      apiSecret,
    });
    await logEvent({
      userId: session.userId,
      eventType: "BINANCE_ACCOUNT_CREATED",
      entityType: "exchange_account",
      entityId: id,
      metadata: { accountName, exchange },
    });
    revalidateExchange(id);
    return { ok: true, id };
  } catch {
    return { ok: false, error: "Could not create exchange account" };
  }
}

export async function updateExchangeAccountAction(
  id: string,
  input: {
    accountName: string;
    apiKey?: string;
    apiSecret?: string;
  },
): Promise<ExchangeActionResult> {
  if (!isEncryptionConfigured()) {
    return { ok: false, error: "Encryption is not configured (XOLID_MASTER_ENCRYPTION_KEY)" };
  }

  let scope: string | undefined;
  let session;
  try {
    ({ scope, session } = await requireAccountUserId());
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Unauthorized" };
  }

  const accountName = input.accountName.trim();
  if (!accountName) return { ok: false, error: "Account name is required" };

  try {
    await updateExchangeAccount(
      id,
      {
        accountName,
        apiKey: input.apiKey?.trim() || undefined,
        apiSecret: input.apiSecret?.trim() || undefined,
      },
      scope,
    );
    await logEvent({
      userId: session.userId,
      eventType: "BINANCE_ACCOUNT_UPDATED",
      entityType: "exchange_account",
      entityId: id,
      metadata: { accountName, credentialsRotated: Boolean(input.apiKey || input.apiSecret) },
    });
    revalidateExchange(id);
    return { ok: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Could not update account";
    return { ok: false, error: message };
  }
}

export async function setExchangeAccountActiveAction(
  id: string,
  isActive: boolean,
): Promise<ExchangeActionResult> {
  let scope: string | undefined;
  let session;
  try {
    ({ scope, session } = await requireAccountUserId());
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Unauthorized" };
  }

  try {
    await setExchangeAccountActive(id, isActive, scope);
    await logEvent({
      userId: session.userId,
      eventType: "BINANCE_ACCOUNT_UPDATED",
      entityType: "exchange_account",
      entityId: id,
      metadata: { isActive },
    });
    revalidateExchange(id);
    return { ok: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Could not update account status";
    return { ok: false, error: message };
  }
}

export async function testExchangeConnectionAction(id: string): Promise<TestConnectionActionResult> {
  if (!isEncryptionConfigured()) {
    return { ok: false, error: "Encryption is not configured (XOLID_MASTER_ENCRYPTION_KEY)" };
  }

  let scope: string | undefined;
  let session;
  try {
    ({ scope, session } = await requireAccountUserId());
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Unauthorized" };
  }

  const account = await getExchangeAccount(id, scope);
  if (!account) return { ok: false, error: "Account not found" };
  if (!account.isActive) return { ok: false, error: "Account is deactivated" };

  const creds = await getExchangeAccountCredentials(id, scope);
  if (!creds) return { ok: false, error: "Account not found" };

  if (account.exchange !== "BINANCE") {
    return { ok: false, error: "Unsupported exchange" };
  }

  const result = await validateBinanceConnection(creds.apiKey, creds.apiSecret);

  try {
    await updateExchangeAccountValidation(id, result.ok ? "CONNECTED" : "FAILED");
    revalidateExchange(id);
  } catch {
    /* validation ran; persist failure is non-fatal for response */
  }

  await logEvent({
    userId: session.userId,
    eventType: "BINANCE_ACCOUNT_VALIDATED",
    entityType: "exchange_account",
    entityId: id,
    metadata: {
      accountName: account.accountName,
      success: result.ok,
      ...(result.ok
        ? { accountType: result.accountType, canTrade: result.canTrade }
        : { error: result.error }),
    },
  });

  if (!result.ok) {
    return { ok: false, error: result.error };
  }

  return {
    ok: true,
    accountType: result.accountType,
    canTrade: result.canTrade,
  };
}
