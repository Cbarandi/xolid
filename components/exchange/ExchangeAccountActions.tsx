"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { privatePrimaryButtonClass, privateSecondaryButtonClass } from "@/components/private/styles";
import {
  setExchangeAccountActiveAction,
  testExchangeConnectionAction,
} from "@/lib/exchange/actions";

type Props = {
  accountId: string;
  isActive: boolean;
};

export function ExchangeAccountActions({ accountId, isActive }: Props) {
  const router = useRouter();
  const [statusError, setStatusError] = useState<string | null>(null);
  const [testError, setTestError] = useState<string | null>(null);
  const [testSuccess, setTestSuccess] = useState<string | null>(null);
  const [statusPending, setStatusPending] = useState(false);
  const [testPending, setTestPending] = useState(false);

  async function toggleActive() {
    setStatusError(null);
    setStatusPending(true);
    const result = await setExchangeAccountActiveAction(accountId, !isActive);
    setStatusPending(false);
    if (!result.ok) {
      setStatusError(result.error);
      return;
    }
    router.refresh();
  }

  async function testConnection() {
    setTestError(null);
    setTestSuccess(null);
    setTestPending(true);
    const result = await testExchangeConnectionAction(accountId);
    setTestPending(false);

    if (!result.ok) {
      setTestError(result.error);
      router.refresh();
      return;
    }

    setTestSuccess(`Connected — ${result.accountType}${result.canTrade ? " (trading enabled on Binance)" : ""}`);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          disabled={testPending || !isActive}
          onClick={testConnection}
          className={privatePrimaryButtonClass}
        >
          {testPending ? "Testing…" : "Test connection"}
        </button>
        {isActive ? (
          <button
            type="button"
            disabled={statusPending}
            onClick={toggleActive}
            className={privateSecondaryButtonClass}
          >
            {statusPending ? "Updating…" : "Deactivate"}
          </button>
        ) : (
          <button
            type="button"
            disabled={statusPending}
            onClick={toggleActive}
            className={privatePrimaryButtonClass}
          >
            {statusPending ? "Updating…" : "Activate"}
          </button>
        )}
      </div>

      {testSuccess ? (
        <p className="text-[13px] text-emerald-300/85" role="status">
          {testSuccess}
        </p>
      ) : null}
      {testError ? (
        <p className="text-[13px] text-red-300/85" role="alert">
          {testError}
        </p>
      ) : null}
      {statusError ? (
        <p className="text-[13px] text-red-300/85" role="alert">
          {statusError}
        </p>
      ) : null}
    </div>
  );
}
