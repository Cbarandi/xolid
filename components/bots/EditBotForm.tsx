"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { updateBotAction } from "@/lib/bots/actions";
import type { BotRecord, BotSide, BotStrategy } from "@/lib/bots/types";
import {
  privateFieldClass,
  privateLabelClass,
  privatePrimaryButtonClass,
} from "@/components/private/styles";

const STRATEGIES: { value: BotStrategy; label: string }[] = [
  { value: "BITE_CCI_V1", label: "BITE CCI v1" },
  { value: "CONTINENTAL_V1", label: "Continental v1 (placeholder)" },
];

type Props = {
  bot: BotRecord;
};

export function EditBotForm({ bot }: Props) {
  const router = useRouter();
  const [side, setSide] = useState<BotSide>(bot.side);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);

    const form = e.currentTarget;
    const fd = new FormData(form);
    const symbolsRaw = String(fd.get("symbols") ?? "");

    try {
      const result = await updateBotAction(bot.id, {
        name: String(fd.get("name") ?? ""),
        ...(bot.strategySource === "SYSTEM"
          ? { strategyKey: String(fd.get("strategy") ?? bot.strategyKey ?? "") as BotStrategy }
          : {}),
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

      router.push(`/bots/${bot.id}`);
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="mt-10 max-w-[520px] space-y-5" onSubmit={onSubmit}>
      <div>
        <label htmlFor="bot-name" className={privateLabelClass}>
          Bot name
        </label>
        <input
          id="bot-name"
          name="name"
          type="text"
          required
          defaultValue={bot.name}
          className={privateFieldClass}
        />
      </div>

      <div>
        <span className={privateLabelClass}>Strategy</span>
        {bot.strategySource === "CUSTOM" ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3">
            <p className="text-[14px] text-white/85">{bot.strategyName}</p>
            <p className="mt-1 text-[11px] uppercase tracking-[0.2em] text-white/32">Custom · read-only</p>
          </div>
        ) : (
          <>
            <select
              id="strategy"
              name="strategy"
              required
              defaultValue={bot.strategyKey ?? undefined}
              className={privateFieldClass}
            >
              {STRATEGIES.map((s) => (
                <option key={s.value} value={s.value} className="bg-black">
                  {s.label}
                </option>
              ))}
            </select>
          </>
        )}
      </div>

      <div>
        <span className={privateLabelClass}>Side</span>
        <div className="flex flex-wrap gap-3">
          {(["long", "short"] as const).map((value) => (
            <label
              key={value}
              className={`inline-flex h-12 cursor-pointer items-center gap-2.5 rounded-full border px-5 text-[11px] uppercase tracking-[0.22em] transition ${
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
          defaultValue={bot.symbols.join(", ")}
          className={privateFieldClass}
        />
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
            defaultValue={bot.capitalPerTrade}
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
            defaultValue={bot.maxOpenTrades}
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
            defaultValue={bot.takeProfitPct}
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
            defaultValue={bot.stopLossPct}
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
          defaultValue={bot.timeoutMinutes}
          required
          className={privateFieldClass}
        />
      </div>

      {error ? (
        <p className="text-[13px] leading-6 text-red-300/90" role="alert">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-4 pt-2">
        <button type="submit" disabled={pending} className={privatePrimaryButtonClass}>
          {pending ? "Saving…" : "Save changes"}
        </button>
        <Link
          href={`/bots/${bot.id}`}
          className="text-[11px] uppercase tracking-[0.28em] text-white/40 transition hover:text-white/70"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
