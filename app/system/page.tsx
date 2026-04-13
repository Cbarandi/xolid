import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { SiteHeader } from "@/components/marketing/SiteHeader";

export const metadata: Metadata = {
  title: "XOLID.ai — XOLID",
  description:
    "XOLID.ai turns market data, news, and narrative into actionable trading and investment signals — VIXION and BLOCK in one system.",
  openGraph: {
    title: "XOLID.ai — XOLID",
    description:
      "XOLID.ai turns market data, news, and narrative into actionable trading and investment signals — VIXION and BLOCK in one system.",
  },
};

export default function SystemPage() {
  return (
    <main className="min-h-screen bg-black text-white antialiased">
      <p
        className="pointer-events-none fixed left-[10px] top-[10px] z-[10050] text-[10px] text-white opacity-40"
        aria-hidden
      >
        XOLID DEV BUILD
      </p>
      <div className="mx-auto flex min-h-screen w-full max-w-[1400px] flex-col px-6 sm:px-10 lg:px-16">
        <SiteHeader active="system" />

        <section className="pb-14 pt-6 sm:pb-20 sm:pt-8 lg:pb-24">
          <p className="text-[10px] font-medium uppercase tracking-[0.42em] text-white/40">
            <Link href="/" className="transition hover:text-white/70">
              XOLID
            </Link>
            <span className="mx-2 text-white/22">/</span>
            <span className="text-white/55">Module</span>
          </p>
          <p className="mt-6 text-[10px] font-medium uppercase tracking-[0.38em] text-white/34">
            System
          </p>
          <h1 className="mt-4 max-w-[14ch] text-[44px] font-medium leading-[0.96] tracking-[-0.04em] text-white sm:text-[64px] lg:text-[80px]">
            <span className="uppercase">XOLID</span>
            <span className="normal-case">.ai</span>
          </h1>
          <div className="mt-8 h-px w-14 bg-white/18" />
          <p className="mt-8 max-w-[560px] text-[18px] font-medium leading-snug tracking-[-0.02em] text-white/78 sm:text-[20px]">
            What is XOLID.ai?
            <span className="mt-3 block text-[15px] font-normal leading-relaxed tracking-[-0.01em] text-white/46 sm:text-[16px]">
              XOLID.ai is a platform that turns market data, news, and narrative into actionable
              trading and investment signals, combining intelligence (VIXION) and execution (BLOCK)
              in a single system.
            </span>
            <span className="mt-3 block text-[15px] font-normal leading-relaxed tracking-[-0.01em] text-white/46 sm:text-[16px]">
              Markets don&apos;t move only on data. Markets move on narrative.
            </span>
          </p>
        </section>

        <SiteFooter />
      </div>
    </main>
  );
}
