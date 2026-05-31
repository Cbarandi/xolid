import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EditBotForm } from "@/components/bots/EditBotForm";
import { PrivateAppShell } from "@/components/private/PrivateAppShell";
import { getBot } from "@/lib/bots/db";
import { getPageScope } from "@/lib/auth/page-scope";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const bot = await getBot(id).catch(() => null);
  return { title: bot ? `Edit ${bot.name} — XOLID` : "Edit Bot — XOLID" };
}

export default async function EditBotPage({ params }: Props) {
  const { id } = await params;
  const { scope } = await getPageScope();
  const bot = await getBot(id, scope).catch(() => null);
  if (!bot) notFound();

  const canEdit = bot.dbStatus === "DRAFT" || bot.dbStatus === "PAUSED";

  return (
    <PrivateAppShell title="Edit Bot">
      <p className="text-[10px] font-medium uppercase tracking-[0.38em] text-white/34">Configure</p>
      <h2 className="mt-3 text-[28px] font-medium tracking-[-0.04em] text-white sm:text-[36px]">
        Edit {bot.name}
      </h2>

      {!canEdit ? (
        <div className="mt-8 max-w-[520px] rounded-[28px] border border-white/10 bg-white/[0.02] px-6 py-8">
          <p className="text-[14px] leading-relaxed text-white/52">
            This bot can only be edited when status is DRAFT or PAUSED. Pause the bot first or copy
            it to a new draft.
          </p>
          <Link
            href={`/bots/${id}`}
            className="mt-6 inline-block text-[11px] uppercase tracking-[0.28em] text-white/45 hover:text-white/75"
          >
            ← Back to bot
          </Link>
        </div>
      ) : (
        <EditBotForm bot={bot} />
      )}
    </PrivateAppShell>
  );
}
