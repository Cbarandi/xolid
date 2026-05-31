"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  privateFieldClass,
  privateLabelClass,
  privatePrimaryButtonClass,
  privateSecondaryButtonClass,
} from "@/components/private/styles";
import { createExchangeAccountAction } from "@/lib/exchange/actions";

export function CreateExchangeAccountForm() {
  const router = useRouter();
  const [accountName, setAccountName] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [apiSecret, setApiSecret] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);

    const result = await createExchangeAccountAction({ accountName, apiKey, apiSecret });
    setPending(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    router.push(`/exchange/${result.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 max-w-lg space-y-5">
      <div>
        <label htmlFor="accountName" className={privateLabelClass}>
          Account name
        </label>
        <input
          id="accountName"
          type="text"
          required
          value={accountName}
          onChange={(e) => setAccountName(e.target.value)}
          placeholder="Main Binance"
          className={privateFieldClass}
        />
      </div>

      <div>
        <label htmlFor="apiKey" className={privateLabelClass}>
          API key
        </label>
        <input
          id="apiKey"
          type="password"
          autoComplete="off"
          required
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          className={privateFieldClass}
        />
      </div>

      <div>
        <label htmlFor="apiSecret" className={privateLabelClass}>
          API secret
        </label>
        <input
          id="apiSecret"
          type="password"
          autoComplete="off"
          required
          value={apiSecret}
          onChange={(e) => setApiSecret(e.target.value)}
          className={privateFieldClass}
        />
      </div>

      <p className="text-[12px] leading-relaxed text-white/38">
        Read-only validation uses GET /api/v3/account. XOLID never places orders from this screen.
      </p>

      {error ? (
        <p className="text-[13px] text-red-300/85" role="alert">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3 pt-2">
        <button type="submit" disabled={pending} className={privatePrimaryButtonClass}>
          {pending ? "Saving…" : "Add account"}
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => router.push("/exchange")}
          className={privateSecondaryButtonClass}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
