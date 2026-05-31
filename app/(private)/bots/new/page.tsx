import type { Metadata } from "next";
import { Suspense } from "react";
import { PrivateAppShell } from "@/components/private/PrivateAppShell";
import { CreateBotForm } from "@/components/bots/CreateBotForm";
import { listCustomStrategies } from "@/lib/strategies/db";
import { getPageScope } from "@/lib/auth/page-scope";

export const metadata: Metadata = {
  title: "Create Bot — XOLID",
  robots: { index: false, follow: false },
};

export default async function CreateBotPage() {
  const { scope } = await getPageScope();
  let customStrategies: { id: string; name: string }[] = [];
  try {
    const rows = await listCustomStrategies(scope);
    customStrategies = rows.map((s) => ({ id: s.id, name: s.name }));
  } catch {
    customStrategies = [];
  }

  return (
    <PrivateAppShell title="Create Bot">
      <p className="text-[10px] font-medium uppercase tracking-[0.38em] text-white/34">Configure</p>
      <h2 className="mt-3 text-[28px] font-medium tracking-[-0.04em] text-white sm:text-[36px]">
        New paper bot
      </h2>
      <p className="mt-4 max-w-[520px] text-[14px] leading-relaxed text-white/48">
        Paper trading only. Choose a system or custom strategy and define risk parameters.
      </p>
      <Suspense fallback={<p className="mt-10 text-white/40">Loading form…</p>}>
        <CreateBotForm customStrategies={customStrategies} />
      </Suspense>
    </PrivateAppShell>
  );
}
