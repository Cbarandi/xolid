export type TradeSide = "LONG" | "SHORT";

export type ExitReason = "TP" | "SL" | "TIMEOUT";

export type ExitEvaluation =
  | { shouldClose: false }
  | {
      shouldClose: true;
      exitReason: ExitReason;
      exitPrice: number;
      pnlPct: number;
      pnlQuote: number;
    };

export function computePnlPct(
  side: TradeSide,
  entryPrice: number,
  exitPrice: number,
): number {
  if (entryPrice <= 0 || exitPrice <= 0) return 0;
  if (side === "SHORT") {
    return ((entryPrice - exitPrice) / entryPrice) * 100;
  }
  return ((exitPrice - entryPrice) / entryPrice) * 100;
}

export function computePnlQuote(notional: number, pnlPct: number): number {
  return Math.round(notional * (pnlPct / 100) * 100) / 100;
}

export function evaluateTradeExit(input: {
  side: TradeSide;
  entryPrice: number;
  currentPrice: number;
  takeProfitPct: number;
  stopLossPct: number;
  quantity: number;
  openedAt: Date;
  timeoutMinutes: number;
  now?: Date;
}): ExitEvaluation {
  const now = input.now ?? new Date();
  const exitPrice = input.currentPrice;
  const pnlPct = Math.round(computePnlPct(input.side, input.entryPrice, exitPrice) * 100) / 100;
  const notional = input.quantity * input.entryPrice;
  const pnlQuote = computePnlQuote(notional, pnlPct);

  if (pnlPct >= input.takeProfitPct) {
    return { shouldClose: true, exitReason: "TP", exitPrice, pnlPct, pnlQuote };
  }

  if (pnlPct <= -input.stopLossPct) {
    return { shouldClose: true, exitReason: "SL", exitPrice, pnlPct, pnlQuote };
  }

  const timeoutMs = input.timeoutMinutes * 60 * 1000;
  if (now.getTime() - input.openedAt.getTime() >= timeoutMs) {
    return { shouldClose: true, exitReason: "TIMEOUT", exitPrice, pnlPct, pnlQuote };
  }

  return { shouldClose: false };
}
