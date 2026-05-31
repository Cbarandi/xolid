import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PrivateAppShell } from "@/components/private/PrivateAppShell";
import { CreateExchangeAccountForm } from "@/components/exchange/CreateExchangeAccountForm";
import { privateSecondaryButtonClass } from "@/components/private/styles";
import { getPageScope } from "@/lib/auth/page-scope";
import { isEncryptionConfigured } from "@/lib/exchange/encryption";

export const metadata: Metadata = {
  title: "Add Exchange — XOLID",
  robots: { index: false, follow: false },
};

export default async function NewExchangeAccountPage() {
  const { session } = await getPageScope();

  if (!session.userId) {
    redirect("/exchange");
  }

  if (!isEncryptionConfigured()) {
    redirect("/exchange");
  }

  return (
    <PrivateAppShell title="Add Exchange">
      <Link href="/exchange" className={`${privateSecondaryButtonClass} inline-flex`}>
        Back to exchange
      </Link>

      <div className="mt-8">
        <p className="text-[10px] font-medium uppercase tracking-[0.38em] text-white/34">
          Binance
        </p>
        <h2 className="mt-3 text-[28px] font-medium tracking-[-0.04em] text-white sm:text-[36px]">
          Add exchange account
        </h2>
        <p className="mt-4 max-w-[560px] text-[14px] leading-relaxed text-white/48">
          API keys are encrypted with AES-256-GCM before storage. Use read-only or restricted keys
          when possible.
        </p>
      </div>

      <CreateExchangeAccountForm />
    </PrivateAppShell>
  );
}
