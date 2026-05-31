import type { Metadata } from "next";
import Link from "next/link";
import { PrivateAppShell } from "@/components/private/PrivateAppShell";
import { ValidationStatusBadge } from "@/components/exchange/ValidationStatusBadge";
import {
  privatePrimaryButtonClass,
  privateTableClass,
  privateTableWrapClass,
  privateTdClass,
  privateThClass,
} from "@/components/private/styles";
import { getPageScope } from "@/lib/auth/page-scope";
import { listExchangeAccounts } from "@/lib/exchange/db";
import { isEncryptionConfigured } from "@/lib/exchange/encryption";

export const metadata: Metadata = {
  title: "Exchange — XOLID",
  robots: { index: false, follow: false },
};

function formatWhen(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default async function ExchangePage() {
  const { session, scope } = await getPageScope();

  let accounts: Awaited<ReturnType<typeof listExchangeAccounts>> = [];
  let loadError: string | null = null;

  if (!session.userId) {
    loadError = "Sign in with a database user account to manage exchange connections.";
  } else {
    try {
      accounts = await listExchangeAccounts(scope);
    } catch {
      loadError =
        "Unable to load exchange accounts. Run the exchange_accounts migration in Supabase.";
    }
  }

  const encryptionReady = isEncryptionConfigured();

  return (
    <PrivateAppShell title="Exchange">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.38em] text-white/34">
            Connections
          </p>
          <h2 className="mt-3 text-[28px] font-medium tracking-[-0.04em] text-white sm:text-[36px]">
            Exchange accounts
          </h2>
          <p className="mt-4 max-w-[560px] text-[14px] leading-relaxed text-white/48">
            Connect Binance API keys for account validation. Credentials are encrypted at rest.
            XOLID does not place orders from this module.
          </p>
        </div>
        {session.userId && encryptionReady ? (
          <Link href="/exchange/new" className={privatePrimaryButtonClass}>
            Add account
          </Link>
        ) : null}
      </div>

      {!encryptionReady ? (
        <p className="mt-8 text-[13px] text-amber-200/80" role="status">
          Set XOLID_MASTER_ENCRYPTION_KEY (32-byte base64 or 64-char hex) before adding accounts.
        </p>
      ) : null}

      {loadError ? (
        <p className="mt-8 text-[13px] text-red-300/85" role="alert">
          {loadError}
        </p>
      ) : null}

      {accounts.length === 0 && !loadError && session.userId ? (
        <div className="mt-12 rounded-[28px] border border-white/10 bg-white/[0.02] px-6 py-12">
          <p className="text-[14px] text-white/45">No exchange accounts yet.</p>
          {encryptionReady ? (
            <Link href="/exchange/new" className={`${privatePrimaryButtonClass} mt-6 inline-flex`}>
              Add Binance account
            </Link>
          ) : null}
        </div>
      ) : null}

      {accounts.length > 0 ? (
        <>
          <ul className="mt-8 space-y-3 lg:hidden">
            {accounts.map((account) => (
              <li
                key={account.id}
                className="rounded-[20px] border border-white/10 bg-white/[0.02] px-5 py-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Link
                      href={`/exchange/${account.id}`}
                      className="text-[15px] font-medium text-white/90"
                    >
                      {account.accountName}
                    </Link>
                    <p className="mt-1 text-[11px] uppercase tracking-[0.2em] text-white/32">
                      {account.exchange} · {account.apiKeyPreview}
                    </p>
                  </div>
                  <ValidationStatusBadge
                    status={account.validationStatus}
                    isActive={account.isActive}
                  />
                </div>
                <p className="mt-3 text-[12px] text-white/40">
                  Last validation: {formatWhen(account.lastValidatedAt)}
                </p>
              </li>
            ))}
          </ul>

          <div className={`${privateTableWrapClass} hidden lg:block`}>
            <table className={privateTableClass}>
              <thead>
                <tr>
                  <th className={privateThClass}>Name</th>
                  <th className={privateThClass}>Exchange</th>
                  <th className={privateThClass}>API key</th>
                  <th className={privateThClass}>Status</th>
                  <th className={privateThClass}>Validation</th>
                  <th className={privateThClass}>Last validation</th>
                </tr>
              </thead>
              <tbody>
                {accounts.map((account) => (
                  <tr key={account.id}>
                    <td className={privateTdClass}>
                      <Link href={`/exchange/${account.id}`} className="text-white/90 hover:underline">
                        {account.accountName}
                      </Link>
                    </td>
                    <td className={privateTdClass}>{account.exchange}</td>
                    <td className={privateTdClass}>{account.apiKeyPreview}</td>
                    <td className={privateTdClass}>
                      {account.isActive ? "Active" : "Inactive"}
                    </td>
                    <td className={privateTdClass}>
                      <ValidationStatusBadge
                        status={account.validationStatus}
                        isActive={account.isActive}
                      />
                    </td>
                    <td className={privateTdClass}>{formatWhen(account.lastValidatedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : null}
    </PrivateAppShell>
  );
}
