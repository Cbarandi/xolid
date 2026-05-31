"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  runExitEngineAction,
  runPaperScanAction,
} from "@/lib/bots/actions";
import type { ExitEngineResult } from "@/lib/bots/paper-exit-engine";
import type { PaperScanResult } from "@/lib/bots/paper-runner";

const buttonClass =
  "inline-flex h-12 items-center justify-center rounded-full border border-white/16 bg-white px-8 text-[11px] font-medium uppercase tracking-[0.28em] text-black transition hover:bg-white/92 disabled:cursor-not-allowed disabled:opacity-50";

function DiagnosticsBlock({
  title,
  data,
}: {
  title: string;
  data: PaperScanResult | ExitEngineResult;
}) {
  const list = (label: string, items: string[]) =>
    items.length > 0 ? (
      <p className="text-[12px] leading-relaxed text-white/45">
        <span className="text-white/55">{label}:</span> {items.join(", ")}
      </p>
    ) : null;

  return (
    <div className="mt-6 rounded-2xl border border-white/8 bg-black/40 px-4 py-4">
      <p className="text-[10px] font-medium uppercase tracking-[0.3em] text-white/38">
        {title}
      </p>
      <p className="mt-3 text-[12px] leading-relaxed text-white/50">
        Source: {data.marketSource}
      </p>
      {"botsScanned" in data ? (
        <>
          <p className="mt-2 text-[12px] text-white/45">
            Bots scanned: {data.botsScanned} · Signals: {data.signals} · Opened:{" "}
            {data.tradesOpened}
          </p>
          {"customStrategiesEvaluated" in data && data.customStrategiesEvaluated > 0 ? (
            <p className="mt-2 text-[12px] text-white/45">
              Custom: {data.customStrategiesEvaluated} strategies · {data.customSymbolsEvaluated}{" "}
              symbols · signals true {data.customSignalsTrue} · false {data.customSignalsFalse} ·
              duplicates skipped {data.skippedDuplicateTrades}
            </p>
          ) : null}
          {list("Symbols checked", data.symbolsChecked)}
          {list("Missing prices", data.missingPrices)}
          {list("Invalid symbols skipped", data.skippedInvalidSymbols)}
          {list("Warnings", data.warnings)}
          {list("Errors", data.errors)}
        </>
      ) : (
        <>
          <p className="mt-2 text-[12px] text-white/45">
            Evaluated: {data.tradesEvaluated} · Closed: {data.tradesClosed} · TP:{" "}
            {data.closedByReason.TP} · SL: {data.closedByReason.SL} · Timeout:{" "}
            {data.closedByReason.TIMEOUT}
          </p>
          {list("Symbols checked", data.symbolsChecked)}
          {list("Missing prices", data.missingPrices)}
          {list("Invalid symbols skipped", data.skippedInvalidSymbols)}
          {list("Warnings", data.warnings)}
          {list("Errors", data.errors)}
        </>
      )}
    </div>
  );
}

export function AdminPaperEnginePanel() {
  const router = useRouter();
  const [pending, setPending] = useState<"scan" | "exit" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastScan, setLastScan] = useState<PaperScanResult | null>(null);
  const [lastExit, setLastExit] = useState<ExitEngineResult | null>(null);

  async function onScan() {
    setPending("scan");
    setError(null);
    try {
      const result = await runPaperScanAction();
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setLastScan(result.result);
      router.refresh();
    } catch {
      setError("Paper scan failed");
    } finally {
      setPending(null);
    }
  }

  async function onExit() {
    setPending("exit");
    setError(null);
    try {
      const result = await runExitEngineAction();
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setLastExit(result.result);
      router.refresh();
    } catch {
      setError("Exit engine failed");
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="mt-10 max-w-[640px] rounded-[28px] border border-white/10 bg-white/[0.02] px-6 py-8 sm:px-8">
      <p className="text-[10px] font-medium uppercase tracking-[0.34em] text-white/38">
        Manual runner
      </p>
      <p className="mt-4 text-[14px] leading-relaxed text-white/48">
        Paper engine v1 — Binance public market data only. SYSTEM bots use mock signals; CUSTOM bots
        evaluate Strategy Builder rules on closed candles. No API keys, no orders, USDC pairs only.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <button
          type="button"
          className={buttonClass}
          disabled={pending != null}
          onClick={onScan}
        >
          {pending === "scan" ? "Running…" : "Run Paper Scan"}
        </button>
        <button
          type="button"
          className={buttonClass}
          disabled={pending != null}
          onClick={onExit}
        >
          {pending === "exit" ? "Running…" : "Run Exit Engine"}
        </button>
      </div>
      {error ? (
        <p className="mt-4 text-[13px] leading-relaxed text-red-300/90" role="alert">
          {error}
        </p>
      ) : null}
      {lastScan ? <DiagnosticsBlock title="Last market scan" data={lastScan} /> : null}
      {lastExit ? <DiagnosticsBlock title="Last exit engine run" data={lastExit} /> : null}
    </div>
  );
}
