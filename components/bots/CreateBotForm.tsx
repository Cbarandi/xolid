"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createBotAction } from "@/lib/bots/actions";
import { STRATEGIES_META } from "@/lib/bots/strategies-meta";
import type { BotSide, BotStrategy, StrategySource } from "@/lib/bots/types";
import {
  privateFieldClass,
  privateLabelClass,
  privatePrimaryButtonClass,
} from "@/components/private/styles";
import {
  strategyCardClass,
  strategyChipActiveClass,
  strategyChipClass,
  strategyChipIdleClass,
} from "@/components/strategies/styles";

export type CustomStrategyOption = {
  id: string;
  name: string;
};

type Props = {
  customStrategies: CustomStrategyOption[];
};

const SYSTEM_STRATEGIES = STRATEGIES_META.map((s) => ({
  value: s.key as BotStrategy,
  label: s.name,
  description: s.description,
  available: s.status === "available",
}));

function parseInitialSelection(
  searchParams: URLSearchParams,
  customStrategies: CustomStrategyOption[],
): {
  source: StrategySource;
  systemKey: BotStrategy;
  customId: string;
} {
  const sourceParam = searchParams.get("strategy_source")?.toUpperCase();
  const customIdParam = searchParams.get("custom_strategy_id") ?? "";
  const systemKeyParam = searchParams.get("strategy_key") as BotStrategy | null;

  if (sourceParam === "CUSTOM" && customIdParam) {
    return {
      source: "CUSTOM",
      systemKey: "BITE_CCI_V1",
      customId: customIdParam,
    };
  }

  const systemKey =
    systemKeyParam && SYSTEM_STRATEGIES.some((s) => s.value === systemKeyParam)
      ? systemKeyParam
      : "BITE_CCI_V1";

  const defaultCustomId = customStrategies[0]?.id ?? "";

  return {
    source: "SYSTEM",
    systemKey,
    customId: customIdParam || defaultCustomId,
  };
}

export function CreateBotForm({ customStrategies }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const symbolsDefault = searchParams.get("symbols") ?? "BTCUSDC, SOLUSDC";

  const initial = useMemo(
    () => parseInitialSelection(searchParams, customStrategies),
    [searchParams, customStrategies],
  );

  const [strategySource, setStrategySource] = useState<StrategySource>(initial.source);
  const [systemKey, setSystemKey] = useState<BotStrategy>(initial.systemKey);
  const [customId, setCustomId] = useState(initial.customId);
  const [side, setSide] = useState<BotSide>("long");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedCustom = customStrategies.find((s) => s.id === customId);
  const selectedSystem = SYSTEM_STRATEGIES.find((s) => s.value === systemKey);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);

    const form = e.currentTarget;
    const fd = new FormData(form);
    const symbolsRaw = String(fd.get("symbols") ?? "");

    const strategyName =
      strategySource === "CUSTOM"
        ? selectedCustom?.name ?? "Custom strategy"
        : selectedSystem?.label ?? systemKey;

    try {
      const result = await createBotAction({
        name: String(fd.get("name") ?? ""),
        strategySource,
        strategyKey: strategySource === "SYSTEM" ? systemKey : undefined,
        customStrategyId: strategySource === "CUSTOM" ? customId : undefined,
        strategyName,
        mode: "paper",
        side: String(fd.get("side") ?? side),
        symbols: symbolsRaw
          .split(/[,\s]+/)
          .map((s) => s.trim())
          .filter(Boolean),
        capitalPerTrade: Number(fd.get("capitalPerTrade")),
        maxOpenTrades: Number(fd.get("maxOpenTrades")),
        takeProfitPct: Number(fd.get("takeProfitPct")),
        stopLossPct: Number(fd.get("stopLossPct")),
        timeoutMinutes: Number(fd.get("timeoutMinutes")),
      });

      if (!result.ok) {
        setError(result.error);
        return;
      }

      router.push(`/bots/${result.id}`);
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="mt-10 max-w-[560px] space-y-5" onSubmit={onSubmit}>
      <div>
        <label htmlFor="bot-name" className={privateLabelClass}>
          Bot name
        </label>
        <input
          id="bot-name"
          name="name"
          type="text"
          required
          placeholder="My paper bot"
          className={privateFieldClass}
        />
      </div>

      <div className="space-y-4">
        <span className={privateLabelClass}>Strategy</span>

        <div className="flex flex-wrap gap-2">
          {(["SYSTEM", "CUSTOM"] as const).map((source) => (
            <button
              key={source}
              type="button"
              onClick={() => setStrategySource(source)}
              className={`${strategyChipClass} ${strategySource === source ? strategyChipActiveClass : strategyChipIdleClass}`}
            >
              {source === "SYSTEM" ? "System" : "Custom"}
            </button>
          ))}
        </div>

        {strategySource === "SYSTEM" ? (
          <div className="space-y-3">
            <p className="text-[10px] uppercase tracking-[0.24em] text-white/32">System strategies</p>
            {SYSTEM_STRATEGIES.map((s) => (
              <label
                key={s.value}
                className={`block cursor-pointer ${strategyCardClass} ${
                  systemKey === s.value ? "border-white/20 bg-white/[0.05]" : ""
                } ${!s.available ? "opacity-50" : ""}`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="radio"
                    name="systemStrategy"
                    value={s.value}
                    checked={systemKey === s.value}
                    disabled={!s.available}
                    onChange={() => setSystemKey(s.value)}
                    className="mt-1 accent-white"
                  />
                  <div>
                    <p className="text-[14px] font-medium text-white/88">{s.label}</p>
                    <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-white/32">
                      {s.value}
                    </p>
                    <p className="mt-2 text-[12px] leading-relaxed text-white/42">{s.description}</p>
                  </div>
                </div>
              </label>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-[10px] uppercase tracking-[0.24em] text-white/32">Custom strategies</p>
            {customStrategies.length === 0 ? (
              <div className={strategyCardClass}>
                <p className="text-[13px] leading-relaxed text-white/48">
                  No custom strategies yet.{" "}
                  <Link href="/strategies/new" className="text-white/70 underline-offset-2 hover:underline">
                    Create one
                  </Link>
                </p>
              </div>
            ) : (
              customStrategies.map((s) => (
                <label
                  key={s.id}
                  className={`block cursor-pointer ${strategyCardClass} ${
                    customId === s.id ? "border-white/20 bg-white/[0.05]" : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="customStrategy"
                      value={s.id}
                      checked={customId === s.id}
                      onChange={() => setCustomId(s.id)}
                      className="mt-1 accent-white"
                    />
                    <div>
                      <p className="text-[14px] font-medium text-white/88">{s.name}</p>
                      <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-white/32">Custom</p>
                    </div>
                  </div>
                </label>
              ))
            )}
            {strategySource === "CUSTOM" && customStrategies.length > 0 && !customId ? (
              <p className="text-[12px] text-amber-200/80">Select a custom strategy.</p>
            ) : null}
          </div>
        )}
      </div>

      <div>
        <span className={privateLabelClass}>Mode</span>
        <div className="flex flex-wrap gap-3">
          <label className="inline-flex min-h-12 cursor-pointer items-center gap-2.5 rounded-full border border-white/16 bg-white/[0.04] px-5 text-[11px] uppercase tracking-[0.22em] text-white/85">
            <input type="radio" name="mode" value="paper" defaultChecked className="accent-white" />
            Paper
          </label>
          <label className="inline-flex min-h-12 cursor-not-allowed items-center gap-2.5 rounded-full border border-white/8 bg-white/[0.02] px-5 text-[11px] uppercase tracking-[0.22em] text-white/28">
            <input type="radio" name="mode" value="live" disabled className="accent-white" />
            Live
          </label>
        </div>
        <p className="mt-2 text-xs leading-6 text-white/32">
          Live is locked by the Risk Engine. Configure gates at /risk (Admin).
        </p>
      </div>

      <div>
        <span className={privateLabelClass}>Side</span>
        <div className="flex flex-wrap gap-3">
          {(["long", "short"] as const).map((value) => (
            <label
              key={value}
              className={`inline-flex min-h-12 cursor-pointer items-center gap-2.5 rounded-full border px-5 text-[11px] uppercase tracking-[0.22em] transition ${
                side === value
                  ? "border-white/16 bg-white/[0.04] text-white/85"
                  : "border-white/10 bg-white/[0.02] text-white/45"
              }`}
            >
              <input
                type="radio"
                name="side"
                value={value}
                checked={side === value}
                onChange={() => setSide(value)}
                className="accent-white"
              />
              {value}
            </label>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="symbols" className={privateLabelClass}>
          Symbols
        </label>
        <input
          id="symbols"
          name="symbols"
          type="text"
          required
          defaultValue={symbolsDefault}
          placeholder="BTCUSDC, SOLUSDC"
          className={privateFieldClass}
        />
        <p className="mt-2 text-xs leading-6 text-white/32">
          Comma-separated USDC pairs only (Binance public market data).
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="capital" className={privateLabelClass}>
            Capital per trade
          </label>
          <input
            id="capital"
            name="capitalPerTrade"
            type="number"
            min={1}
            step={1}
            defaultValue={500}
            required
            className={privateFieldClass}
          />
        </div>
        <div>
          <label htmlFor="maxOpen" className={privateLabelClass}>
            Max open trades
          </label>
          <input
            id="maxOpen"
            name="maxOpenTrades"
            type="number"
            min={1}
            max={20}
            step={1}
            defaultValue={3}
            required
            className={privateFieldClass}
          />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="tp" className={privateLabelClass}>
            Take profit %
          </label>
          <input
            id="tp"
            name="takeProfitPct"
            type="number"
            min={0.1}
            step={0.1}
            defaultValue={2.5}
            required
            className={privateFieldClass}
          />
        </div>
        <div>
          <label htmlFor="sl" className={privateLabelClass}>
            Stop loss %
          </label>
          <input
            id="sl"
            name="stopLossPct"
            type="number"
            min={0.1}
            step={0.1}
            defaultValue={1.2}
            required
            className={privateFieldClass}
          />
        </div>
      </div>

      <div>
        <label htmlFor="timeout" className={privateLabelClass}>
          Timeout minutes
        </label>
        <input
          id="timeout"
          name="timeoutMinutes"
          type="number"
          min={1}
          step={1}
          defaultValue={240}
          required
          className={privateFieldClass}
        />
      </div>

      {strategySource === "CUSTOM" ? (
        <p className="text-[12px] leading-relaxed text-white/38">
          Custom strategies are evaluated on closed Binance public candles during Paper Scan. Unsupported
          indicators are ignored until added to the v0 engine.
        </p>
      ) : null}

      {error ? (
        <p className="text-[13px] leading-6 text-red-300/90" role="alert">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-4 pt-2">
        <button
          type="submit"
          disabled={pending || (strategySource === "CUSTOM" && (!customId || customStrategies.length === 0))}
          className={privatePrimaryButtonClass}
        >
          {pending ? "Creating…" : "Create Paper Bot"}
        </button>
        <Link
          href="/bots"
          className="text-[11px] uppercase tracking-[0.28em] text-white/40 transition hover:text-white/70"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
