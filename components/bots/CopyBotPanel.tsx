"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { duplicateBotAction } from "@/lib/bots/actions";
import type { BotRecord } from "@/lib/bots/types";
import { privatePrimaryButtonClass, privateSecondaryButtonClass } from "@/components/private/styles";

type Props = {
  bot: BotRecord;
};

export function CopyBotPanel({ bot }: Props) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onCopy() {
    setError(null);
    setPending(true);
    try {
      const result = await duplicateBotAction(bot.id);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.push(`/bots/${result.id}/edit`);
      router.refresh();
    } catch {
      setError("Could not copy bot");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mt-10 max-w-[520px] rounded-[28px] border border-white/10 bg-white/[0.02] px-6 py-8 sm:px-8">
      <p className="text-[10px] uppercase tracking-[0.32em] text-white/38">Copy configuration</p>
      <p className="mt-4 text-[15px] leading-relaxed text-white/58">
        Creates a new DRAFT bot named{" "}
        <span className="text-white/85">Copy of {bot.name}</span> with the same strategy, symbols,
        and risk settings.
      </p>
      <ul className="mt-6 space-y-2 text-[13px] text-white/45">
        <li>Strategy: {bot.strategyName} ({bot.strategySource === "CUSTOM" ? "Custom" : "System"})</li>
        <li>Side: {bot.side}</li>
        <li>Symbols: {bot.symbols.join(", ")}</li>
        <li>Capital / trade: ${bot.capitalPerTrade}</li>
      </ul>
      {error ? (
        <p className="mt-4 text-[13px] text-red-300/90" role="alert">
          {error}
        </p>
      ) : null}
      <div className="mt-8 flex flex-wrap gap-3">
        <button
          type="button"
          disabled={pending}
          onClick={onCopy}
          className={privatePrimaryButtonClass}
        >
          {pending ? "Creating…" : "Create copy"}
        </button>
        <Link href={`/bots/${bot.id}`} className={privateSecondaryButtonClass}>
          Cancel
        </Link>
      </div>
    </div>
  );
}
