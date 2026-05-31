import type { ReactNode } from "react";
import Link from "next/link";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { SiteHeader } from "@/components/marketing/SiteHeader";

type Props = {
  breadcrumb: string;
  children: ReactNode;
};

export function BotsPageShell({ breadcrumb, children }: Props) {
  return (
    <main className="min-h-screen bg-black text-white antialiased">
      <div className="mx-auto flex min-h-screen w-full max-w-[1400px] flex-col px-6 sm:px-10 lg:px-16">
        <SiteHeader active="bots" showLogout />
        <section className="flex flex-1 flex-col pb-14 pt-6 sm:pb-20 sm:pt-8 lg:pb-24">
          <p className="text-[10px] font-medium uppercase tracking-[0.42em] text-white/40">
            <Link href="/" className="transition hover:text-white/70">
              XOLID
            </Link>
            <span className="mx-2 text-white/22">/</span>
            <Link href="/bots" className="transition hover:text-white/70">
              Bots
            </Link>
            {breadcrumb ? (
              <>
                <span className="mx-2 text-white/22">/</span>
                <span className="text-white/55">{breadcrumb}</span>
              </>
            ) : null}
          </p>
          {children}
        </section>
        <SiteFooter />
      </div>
    </main>
  );
}

export const botFieldClass =
  "h-12 w-full rounded-full border border-white/10 bg-white/[0.02] px-5 text-sm text-white outline-none placeholder:text-white/24 focus:border-white/28 disabled:cursor-not-allowed disabled:opacity-45";

export const botLabelClass =
  "mb-2 block text-[10px] uppercase tracking-[0.3em] text-white/34";

export const botSectionLabelClass =
  "text-[10px] font-medium uppercase tracking-[0.38em] text-white/34";

export const botPrimaryButtonClass =
  "inline-flex h-12 items-center justify-center rounded-full border border-white/16 bg-white px-8 text-[11px] font-medium uppercase tracking-[0.28em] text-black transition hover:bg-white/92 disabled:cursor-not-allowed disabled:opacity-50";
