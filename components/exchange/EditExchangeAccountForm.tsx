"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  privateFieldClass,
  privateLabelClass,
  privatePrimaryButtonClass,
} from "@/components/private/styles";
import { updateExchangeAccountAction } from "@/lib/exchange/actions";

type Props = {
  accountId: string;
  initialName: string;
  apiKeyPreview: string;
};

export function EditExchangeAccountForm({ accountId, initialName, apiKeyPreview }: Props) {
  const router = useRouter();
  const [accountName, setAccountName] = useState(initialName);
  const [apiKey, setApiKey] = useState("");
  const [apiSecret, setApiSecret] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setPending(true);

    const result = await updateExchangeAccountAction(accountId, {
      accountName,
      apiKey: apiKey || undefined,
      apiSecret: apiSecret || undefined,
    });
    setPending(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    setApiKey("");
    setApiSecret("");
    setSuccess(true);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-5 max-w-lg space-y-4">
      <div>
        <label htmlFor="edit-accountName" className={privateLabelClass}>
          Account name
        </label>
        <input
          id="edit-accountName"
          type="text"
          required
          value={accountName}
          onChange={(e) => setAccountName(e.target.value)}
          className={privateFieldClass}
        />
      </div>

      <div>
        <p className={privateLabelClass}>Current API key</p>
        <p className="text-[14px] text-white/55">{apiKeyPreview}</p>
      </div>

      <div>
        <label htmlFor="edit-apiKey" className={privateLabelClass}>
          New API key (optional)
        </label>
        <input
          id="edit-apiKey"
          type="password"
          autoComplete="off"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="Leave blank to keep current"
          className={privateFieldClass}
        />
      </div>

      <div>
        <label htmlFor="edit-apiSecret" className={privateLabelClass}>
          New API secret (optional)
        </label>
        <input
          id="edit-apiSecret"
          type="password"
          autoComplete="off"
          value={apiSecret}
          onChange={(e) => setApiSecret(e.target.value)}
          placeholder="Leave blank to keep current"
          className={privateFieldClass}
        />
      </div>

      {error ? (
        <p className="text-[13px] text-red-300/85" role="alert">
          {error}
        </p>
      ) : null}
      {success ? (
        <p className="text-[13px] text-emerald-300/85" role="status">
          Account updated.
        </p>
      ) : null}

      <button type="submit" disabled={pending} className={privatePrimaryButtonClass}>
        {pending ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}
