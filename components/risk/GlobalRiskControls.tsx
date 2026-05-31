"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  privateFieldClass,
  privateLabelClass,
  privatePrimaryButtonClass,
} from "@/components/private/styles";
import { updateGlobalRiskStateAction } from "@/lib/risk/actions";
import type { SystemRiskState } from "@/lib/risk/types";

type Props = {
  system: SystemRiskState;
  canEdit: boolean;
};

export function GlobalRiskControls({ system, canEdit }: Props) {
  const router = useRouter();
  const [killSwitch, setKillSwitch] = useState(system.globalKillSwitchEnabled);
  const [liveEnabled, setLiveEnabled] = useState(system.liveTradingGloballyEnabled);
  const [reason, setReason] = useState(system.reason ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canEdit) return;

    setError(null);
    setPending(true);
    const result = await updateGlobalRiskStateAction({
      globalKillSwitchEnabled: killSwitch,
      liveTradingGloballyEnabled: liveEnabled,
      reason: reason.trim() || null,
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
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[20px] border border-white/10 bg-white/[0.02] px-5 py-4">
        <div>
          <p className="text-[14px] font-medium text-white/88">Global kill switch</p>
          <p className="mt-1 text-[12px] text-white/42">
            When ON, all live trading is blocked immediately.
          </p>
        </div>
        <label className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-white/55">
          <input
            type="checkbox"
            checked={killSwitch}
            disabled={!canEdit || pending}
            onChange={(e) => setKillSwitch(e.target.checked)}
            className="h-4 w-4 accent-white"
          />
          {killSwitch ? "ON" : "OFF"}
        </label>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[20px] border border-white/10 bg-white/[0.02] px-5 py-4">
        <div>
          <p className="text-[14px] font-medium text-white/88">Global live trading</p>
          <p className="mt-1 text-[12px] text-white/42">
            Must be enabled before any user can trade live. No real orders are placed yet.
          </p>
        </div>
        <label className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-white/55">
          <input
            type="checkbox"
            checked={liveEnabled}
            disabled={!canEdit || pending}
            onChange={(e) => setLiveEnabled(e.target.checked)}
            className="h-4 w-4 accent-white"
          />
          {liveEnabled ? "Enabled" : "Disabled"}
        </label>
      </div>

      <div>
        <label htmlFor="global-reason" className={privateLabelClass}>
          Reason / notes
        </label>
        <textarea
          id="global-reason"
          rows={3}
          value={reason}
          disabled={!canEdit || pending}
          onChange={(e) => setReason(e.target.value)}
          className={`${privateFieldClass} !h-auto min-h-[88px] resize-y rounded-3xl py-4`}
          placeholder="Why live is locked or enabled…"
        />
      </div>

      {!canEdit ? (
        <p className="text-[12px] text-white/38">Only Super Admin can modify global controls.</p>
      ) : null}

      {error ? (
        <p className="text-[13px] text-red-300/85" role="alert">
          {error}
        </p>
      ) : null}

      {canEdit ? (
        <button type="submit" disabled={pending} className={privatePrimaryButtonClass}>
          {pending ? "Saving…" : "Save global controls"}
        </button>
      ) : null}
    </form>
  );
}
