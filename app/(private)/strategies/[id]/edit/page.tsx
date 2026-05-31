import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PrivateAppShell } from "@/components/private/PrivateAppShell";
import { StrategyBuilder } from "@/components/strategies/StrategyBuilder";
import { getCustomStrategy } from "@/lib/strategies/db";
import { getPageScope } from "@/lib/auth/page-scope";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const strategy = await getCustomStrategy(id).catch(() => null);
  return {
    title: strategy ? `Edit ${strategy.name} — XOLID` : "Edit Strategy — XOLID",
  };
}

export default async function EditStrategyPage({ params }: Props) {
  const { id } = await params;
  const { scope } = await getPageScope();
  const strategy = await getCustomStrategy(id, scope).catch(() => null);
  if (!strategy) notFound();

  return (
    <PrivateAppShell title="Edit Strategy">
      <div className="mb-6">
        <Link
          href={`/strategies/${id}`}
          className="text-[11px] uppercase tracking-[0.28em] text-white/40 transition hover:text-white/70"
        >
          ← {strategy.name}
        </Link>
        <p className="mt-4 text-[10px] font-medium uppercase tracking-[0.38em] text-white/34">
          Builder
        </p>
        <h2 className="mt-3 text-[28px] font-medium tracking-[-0.04em] text-white sm:text-[36px]">
          Edit strategy
        </h2>
      </div>

      <StrategyBuilder mode="edit" strategyId={id} initial={strategy.definition} />
    </PrivateAppShell>
  );
}
