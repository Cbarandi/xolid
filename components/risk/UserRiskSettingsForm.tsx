"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  privateFieldClass,
  privateLabelClass,
  privatePrimaryButtonClass,
} from "@/components/private/styles";
import { updateUserRiskSettingsAction } from "@/lib/risk/actions";
import type { UserRiskSettings } from "@/lib/risk/types";

type UserOption = { id: string; username: string };

type Props = {
  users: UserOption[];
  selectedUserId: string;
  settings: UserRiskSettings | null;
};

export function UserRiskSettingsForm({ users, selectedUserId, settings }: Props) {
  const router = useRouter();
  const [userId, setUserId] = useState(selectedUserId);
  const [maxTotal, setMaxTotal] = useState("0");
  const [maxPerBot, setMaxPerBot] = useState("0");
  const [maxPerTrade, setMaxPerTrade] = useState("0");
  const [maxOpen, setMaxOpen] = useState("0");
  const [maxDailyLoss, setMaxDailyLoss] = useState("0");
  const [liveEnabled, setLiveEnabled] = useState(false);
  const [paperEnabled, setPaperEnabled] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    setUserId(selectedUserId);
  }, [selectedUserId]);

  useEffect(() => {
    if (!settings) return;
    setMaxTotal(String(settings.maxTotalLiveCapitalUsdc));
    setMaxPerBot(String(settings.maxCapitalPerBotUsdc));
    setMaxPerTrade(String(settings.maxCapitalPerTradeUsdc));
    setMaxOpen(String(settings.maxOpenLiveTrades));
    setMaxDailyLoss(String(settings.maxDailyLossUsdc));
    setLiveEnabled(settings.liveTradingEnabled);
    setPaperEnabled(settings.paperTradingEnabled);
  }, [settings]);

  function onUserChange(nextId: string) {
    setUserId(nextId);
    router.push(`/risk?userId=${encodeURIComponent(nextId)}`);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);

    const result = await updateUserRiskSettingsAction(userId, {
      maxTotalLiveCapitalUsdc: Number(maxTotal),
      maxCapitalPerBotUsdc: Number(maxPerBot),
      maxCapitalPerTradeUsdc: Number(maxPerTrade),
      maxOpenLiveTrades: Number.parseInt(maxOpen, 10),
      maxDailyLossUsdc: Number(maxDailyLoss),
      liveTradingEnabled: liveEnabled,
      paperTradingEnabled: paperEnabled,
    });

    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }

    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-5 space-y-4">
      <div>
        <label htmlFor="risk-user" className={privateLabelClass}>
          User
        </label>
        <select
          id="risk-user"
          value={userId}
          onChange={(e) => onUserChange(e.target.value)}
          className={privateFieldClass}
        >
          {users.map((u) => (
            <option key={u.id} value={u.id} className="bg-black text-white">
              {u.username}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="max-total" className={privateLabelClass}>
            Max total live capital (USDC)
          </label>
          <input
            id="max-total"
            type="number"
            min={0}
            step="0.01"
            value={maxTotal}
            onChange={(e) => setMaxTotal(e.target.value)}
            className={privateFieldClass}
          />
        </div>
        <div>
          <label htmlFor="max-bot" className={privateLabelClass}>
            Max capital per bot (USDC)
          </label>
          <input
            id="max-bot"
            type="number"
            min={0}
            step="0.01"
            value={maxPerBot}
            onChange={(e) => setMaxPerBot(e.target.value)}
            className={privateFieldClass}
          />
        </div>
        <div>
          <label htmlFor="max-trade" className={privateLabelClass}>
            Max capital per trade (USDC)
          </label>
          <input
            id="max-trade"
            type="number"
            min={0}
            step="0.01"
            value={maxPerTrade}
            onChange={(e) => setMaxPerTrade(e.target.value)}
            className={privateFieldClass}
          />
        </div>
        <div>
          <label htmlFor="max-open" className={privateLabelClass}>
            Max open live trades
          </label>
          <input
            id="max-open"
            type="number"
            min={0}
            step={1}
            value={maxOpen}
            onChange={(e) => setMaxOpen(e.target.value)}
            className={privateFieldClass}
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="max-daily-loss" className={privateLabelClass}>
            Max daily loss (USDC)
          </label>
          <input
            id="max-daily-loss"
            type="number"
            min={0}
            step="0.01"
            value={maxDailyLoss}
            onChange={(e) => setMaxDailyLoss(e.target.value)}
            className={privateFieldClass}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-6">
        <label className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-white/55">
          <input
            type="checkbox"
            checked={liveEnabled}
            disabled={pending}
            onChange={(e) => setLiveEnabled(e.target.checked)}
            className="h-4 w-4 accent-white"
          />
          Live trading enabled
        </label>
        <label className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-white/55">
          <input
            type="checkbox"
            checked={paperEnabled}
            disabled={pending}
            onChange={(e) => setPaperEnabled(e.target.checked)}
            className="h-4 w-4 accent-white"
          />
          Paper trading enabled
        </label>
      </div>

      <p className="text-[12px] leading-relaxed text-amber-200/75">
        Live mode remains locked in the bot UI. These flags prepare the gate for a future release —
        no Binance orders are sent.
      </p>

      {error ? (
        <p className="text-[13px] text-red-300/85" role="alert">
          {error}
        </p>
      ) : null}

      <button type="submit" disabled={pending || !userId} className={privatePrimaryButtonClass}>
        {pending ? "Saving…" : "Save user risk settings"}
      </button>
    </form>
  );
}
