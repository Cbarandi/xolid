export type ExchangeName = "BINANCE";

export const SUPPORTED_EXCHANGES: ExchangeName[] = ["BINANCE"];

export type ValidationStatus = "CONNECTED" | "FAILED";

export type ExchangeAccountRecord = {
  id: string;
  userId: string;
  exchange: ExchangeName;
  accountName: string;
  isActive: boolean;
  validationStatus: ValidationStatus | null;
  lastValidatedAt: string | null;
  createdAt: string;
  /** Masked preview e.g. ****abcd — never full key in UI */
  apiKeyPreview: string;
};

export type BinanceValidationResult =
  | { ok: true; canTrade: boolean; accountType: string }
  | { ok: false; error: string };
