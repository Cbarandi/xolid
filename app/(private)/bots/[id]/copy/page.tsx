import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CopyBotPanel } from "@/components/bots/CopyBotPanel";
import { PrivateAppShell } from "@/components/private/PrivateAppShell";
import { getBot } from "@/lib/bots/db";
import { getPageScope } from "@/lib/auth/page-scope";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const bot = await getBot(id).catch(() => null);
  return { title: bot ? `Copy ${bot.name} — XOLID` : "Copy Bot — XOLID" };
}

export default async function CopyBotPage({ params }: Props) {
  const { id } = await params;
  const { scope } = await getPageScope();
  const bot = await getBot(id, scope).catch(() => null);
  if (!bot) notFound();

  return (
    <PrivateAppShell title="Copy Bot">
      <p className="text-[10px] font-medium uppercase tracking-[0.38em] text-white/34">Duplicate</p>
      <h2 className="mt-3 text-[28px] font-medium tracking-[-0.04em] text-white sm:text-[36px]">
        Copy {bot.name}
      </h2>
      <CopyBotPanel bot={bot} />
    </PrivateAppShell>
  );
}
