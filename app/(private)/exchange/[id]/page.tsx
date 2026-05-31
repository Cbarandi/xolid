import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { PrivateAppShell } from "@/components/private/PrivateAppShell";
import { EditExchangeAccountForm } from "@/components/exchange/EditExchangeAccountForm";
import { ExchangeAccountActions } from "@/components/exchange/ExchangeAccountActions";
import { ValidationStatusBadge } from "@/components/exchange/ValidationStatusBadge";
import { privateSecondaryButtonClass, privateSectionLabelClass } from "@/components/private/styles";
import { getPageScope } from "@/lib/auth/page-scope";
import { getExchangeAccount } from "@/lib/exchange/db";

type Props = {
  params: Promise<{ id: string }>;
};

function formatWhen(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const account = await getExchangeAccount(id).catch(() => null);
  return {
    title: account ? `${account.accountName} — Exchange — XOLID` : "Exchange — XOLID",
  };
}

export default async function ExchangeAccountDetailPage({ params }: Props) {
  const { session, scope } = await getPageScope();

  if (!session.userId) {
    redirect("/exchange");
  }

  const { id } = await params;
  const account = await getExchangeAccount(id, scope).catch(() => null);
  if (!account) notFound();

  return (
    <PrivateAppShell title="Exchange Account">
      <Link href="/exchange" className={`${privateSecondaryButtonClass} inline-flex`}>
        Back to exchange
      </Link>

      <div className="mt-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.38em] text-white/34">
            {account.exchange}
          </p>
          <h2 className="mt-3 text-[28px] font-medium tracking-[-0.04em] text-white sm:text-[36px]">
            {account.accountName}
          </h2>
          <p className="mt-2 text-[14px] text-white/48">API key {account.apiKeyPreview}</p>
        </div>
        <ValidationStatusBadge status={account.validationStatus} isActive={account.isActive} />
      </div>

      <section className="mt-10 rounded-[28px] border border-white/10 bg-white/[0.02] px-6 py-6 sm:px-8">
        <p className={privateSectionLabelClass}>Connection</p>
        <dl className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-[10px] uppercase tracking-[0.28em] text-white/32">Last validation</dt>
            <dd className="mt-2 text-[15px] text-white/88">{formatWhen(account.lastValidatedAt)}</dd>
          </div>
          <div>
            <dt className="text-[10px] uppercase tracking-[0.28em] text-white/32">Validation result</dt>
            <dd className="mt-2">
              <ValidationStatusBadge status={account.validationStatus} isActive={account.isActive} />
            </dd>
          </div>
          <div>
            <dt className="text-[10px] uppercase tracking-[0.28em] text-white/32">Account status</dt>
            <dd className="mt-2 text-[15px] text-white/88">
              {account.isActive ? "Active" : "Inactive"}
            </dd>
          </div>
          <div>
            <dt className="text-[10px] uppercase tracking-[0.28em] text-white/32">Added</dt>
            <dd className="mt-2 text-[15px] text-white/88">{formatWhen(account.createdAt)}</dd>
          </div>
        </dl>

        <div className="mt-6">
          <ExchangeAccountActions accountId={account.id} isActive={account.isActive} />
        </div>
      </section>

      <section className="mt-6 rounded-[28px] border border-white/10 bg-white/[0.02] px-6 py-6 sm:px-8">
        <p className={privateSectionLabelClass}>Edit account</p>
        <p className="mt-3 max-w-[560px] text-[13px] leading-relaxed text-white/45">
          Update the display name or rotate API credentials. Leave key fields blank to keep current
          values.
        </p>
        <EditExchangeAccountForm
          accountId={account.id}
          initialName={account.accountName}
          apiKeyPreview={account.apiKeyPreview}
        />
      </section>
    </PrivateAppShell>
  );
}
