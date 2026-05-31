import crypto from "crypto";
import type { BinanceValidationResult } from "./types";

/** Spot REST only — signed GET /api/v3/account. No orders. */
const BINANCE_API_BASE =
  process.env.BINANCE_API_BASE?.trim() || "https://api.binance.com";

function signQuery(query: string, apiSecret: string): string {
  return crypto.createHmac("sha256", apiSecret).update(query).digest("hex");
}

type BinanceAccountResponse = {
  accountType?: string;
  canTrade?: boolean;
  canWithdraw?: boolean;
  canDeposit?: boolean;
  updateTime?: number;
};

/**
 * Validate Binance API credentials by fetching read-only account info.
 * Never places orders or calls trading endpoints.
 */
export async function validateBinanceConnection(
  apiKey: string,
  apiSecret: string,
): Promise<BinanceValidationResult> {
  const key = apiKey.trim();
  const secret = apiSecret.trim();

  if (!key || !secret) {
    return { ok: false, error: "API key and secret are required" };
  }

  const timestamp = Date.now();
  const query = `timestamp=${timestamp}&recvWindow=5000`;
  const signature = signQuery(query, secret);
  const url = `${BINANCE_API_BASE}/api/v3/account?${query}&signature=${signature}`;

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: { "X-MBX-APIKEY": key },
      cache: "no-store",
    });

    if (!res.ok) {
      let message = `Binance API error ${res.status}`;
      try {
        const body = (await res.json()) as { msg?: string; code?: number };
        if (body.msg) message = body.msg;
      } catch {
        /* ignore parse errors */
      }
      return { ok: false, error: message };
    }

    const data = (await res.json()) as BinanceAccountResponse;
    return {
      ok: true,
      canTrade: Boolean(data.canTrade),
      accountType: data.accountType ?? "SPOT",
    };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Connection failed";
    return { ok: false, error: message };
  }
}
