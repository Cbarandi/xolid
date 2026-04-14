import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { SiteHeader } from "@/components/marketing/SiteHeader";

export const metadata: Metadata = {
  title: "System — XOLID",
  description:
    "XOLID turns market narratives into actionable trading edge — narrative intelligence (VIXION) and execution intelligence (BLOCK) in one system.",
  openGraph: {
    title: "System — XOLID",
    description:
      "XOLID turns market narratives into actionable trading edge — narrative intelligence (VIXION) and execution intelligence (BLOCK) in one system.",
  },
};

function SectionLabel({ children }: { children: string }) {
  return (
    <p className="text-[10px] font-medium uppercase tracking-[0.38em] text-white/34">{children}</p>
  );
}

function FlowArrow() {
  return (
    <span className="mx-2 shrink-0 text-[11px] font-normal text-white/22 sm:mx-3" aria-hidden>
      →
    </span>
  );
}

function FlowRow({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-wrap items-baseline justify-center gap-y-2 text-center sm:justify-start sm:text-left">
      {children}
    </div>
  );
}

function FlowStep({ children }: { children: string }) {
  return (
    <span className="text-[12px] font-medium uppercase tracking-[0.22em] text-white/78 sm:text-[13px]">
      {children}
    </span>
  );
}

export default function SystemPage() {
  return (
    <main className="min-h-screen bg-black text-white antialiased">
      <div className="mx-auto flex min-h-screen w-full max-w-[1400px] flex-col px-6 sm:px-10 lg:px-16">
        <SiteHeader active="system" />

        {/* 1. Hero */}
        <section className="pb-16 pt-6 sm:pb-24 sm:pt-8 lg:pb-32 lg:pt-10">
          <p className="text-[10px] font-medium uppercase tracking-[0.42em] text-white/40">
            <Link href="/" className="transition hover:text-white/70">
              XOLID
            </Link>
            <span className="mx-2 text-white/22">/</span>
            <span className="text-white/55">System</span>
          </p>
          <p className="mt-6 text-[10px] font-medium uppercase tracking-[0.38em] text-white/34">
            XOLID.ai
          </p>
          <h1 className="mt-6 max-w-[20ch] text-[40px] font-medium leading-[0.96] tracking-[-0.04em] text-white sm:max-w-[24ch] sm:text-[56px] lg:max-w-[28ch] lg:text-[72px]">
            We are defining a new category in trading.
          </h1>
          <div className="mt-10 h-px w-14 bg-white/18 sm:mt-12" />
        </section>

        {/* 2. What is XOLID */}
        <section className="border-t border-white/8 py-16 sm:py-24 lg:py-28" aria-labelledby="system-what-heading">
          <SectionLabel>What is XOLID</SectionLabel>
          <h2 id="system-what-heading" className="sr-only">
            What is XOLID
          </h2>
          <p className="mt-10 max-w-[920px] text-[26px] font-medium leading-[1.08] tracking-[-0.035em] text-white/92 sm:text-[34px] lg:text-[40px]">
            XOLID turns market narratives into actionable trading edge.
          </p>
          <p className="mt-10 max-w-[640px] text-[17px] font-normal leading-[1.65] tracking-[-0.02em] text-white/52 sm:text-[18px]">
            A next-generation market intelligence and execution platform that identifies narratives,
            validates them with data, and executes with precision.
          </p>
        </section>

        {/* 3. Market reality */}
        <section className="border-t border-white/8 py-16 sm:py-24 lg:py-28" aria-labelledby="system-reality-heading">
          <SectionLabel>Market reality</SectionLabel>
          <h2 id="system-reality-heading" className="sr-only">
            Market reality
          </h2>
          <div className="mt-12 max-w-[720px] space-y-16 sm:mt-16">
            <div className="space-y-4">
              <p className="text-[22px] font-medium leading-snug tracking-[-0.03em] text-white/55 sm:text-[28px] lg:text-[32px]">
                Markets don&apos;t move only on data.
              </p>
              <p className="text-[22px] font-medium leading-snug tracking-[-0.03em] text-white sm:text-[28px] lg:text-[32px]">
                Markets move on narrative.
              </p>
            </div>
            <div className="h-px max-w-12 bg-white/14" />
            <div className="space-y-4">
              <p className="text-[22px] font-medium leading-snug tracking-[-0.03em] text-white/55 sm:text-[28px] lg:text-[32px]">
                Price tells you what happened.
              </p>
              <p className="text-[22px] font-medium leading-snug tracking-[-0.03em] text-white sm:text-[28px] lg:text-[32px]">
                Narrative tells you what happens next.
              </p>
            </div>
          </div>
        </section>

        {/* 4. What we do */}
        <section className="border-t border-white/8 py-16 sm:py-24 lg:py-28" aria-labelledby="system-core-heading">
          <SectionLabel>What we do</SectionLabel>
          <h2 id="system-core-heading" className="sr-only">
            What we do
          </h2>
          <div className="mt-14 grid gap-20 lg:mt-20 lg:grid-cols-2 lg:gap-24">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.32em] text-white/45">VIXION</p>
              <p className="mt-4 text-[20px] font-medium leading-snug tracking-[-0.03em] text-white sm:text-[24px]">
                Narrative Intelligence Engine.
              </p>
              <p className="mt-8 max-w-[480px] text-[16px] leading-[1.65] tracking-[-0.015em] text-white/48 sm:text-[17px]">
                Detects narratives before they become price. Transforms real-world signals into
                quantified probabilities.
              </p>
              <p className="mt-8 text-[13px] font-medium uppercase tracking-[0.18em] text-white/38">
                Answers
              </p>
              <p className="mt-3 max-w-[420px] text-[17px] font-medium leading-snug tracking-[-0.02em] text-white/72 sm:text-[18px]">
                What is happening and why it matters.
              </p>
            </div>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.32em] text-white/45">BLOCK</p>
              <p className="mt-4 text-[20px] font-medium leading-snug tracking-[-0.03em] text-white sm:text-[24px]">
                Execution Intelligence Engine.
              </p>
              <p className="mt-8 max-w-[480px] text-[16px] leading-[1.65] tracking-[-0.015em] text-white/48 sm:text-[17px]">
                Executes only when real edge exists. Remains inactive when it doesn&apos;t.
              </p>
              <p className="mt-8 text-[13px] font-medium uppercase tracking-[0.18em] text-white/38">
                Answers
              </p>
              <p className="mt-3 max-w-[420px] text-[17px] font-medium leading-snug tracking-[-0.02em] text-white/72 sm:text-[18px]">
                What to do and how to act.
              </p>
            </div>
          </div>
        </section>

        {/* 5. Framework */}
        <section className="border-t border-white/8 py-16 sm:py-24 lg:py-32" aria-labelledby="system-framework-heading">
          <SectionLabel>Framework</SectionLabel>
          <h2 id="system-framework-heading" className="sr-only">
            Framework
          </h2>

          <div className="mt-14 space-y-12 lg:mt-20 lg:space-y-16">
            <div>
              <FlowRow>
                <FlowStep>Narrative</FlowStep>
                <FlowArrow />
                <FlowStep>Insight</FlowStep>
                <FlowArrow />
                <FlowStep>Leverage</FlowStep>
                <FlowArrow />
                <FlowStep>Performance</FlowStep>
              </FlowRow>
              <div className="mt-8 h-px max-w-3xl bg-gradient-to-r from-white/20 via-white/10 to-transparent" />
            </div>

            <div className="grid gap-14 lg:grid-cols-2 lg:gap-0">
              <div className="lg:border-r lg:border-white/10 lg:pr-14 xl:pr-20">
                <div className="mt-2">
                  <FlowRow>
                    <span className="text-[12px] font-medium uppercase tracking-[0.26em] text-white/42 sm:text-[13px]">
                      VIXION
                    </span>
                    <span className="mx-2 shrink-0 text-[11px] text-white/22 sm:mx-3" aria-hidden>
                      =
                    </span>
                    <FlowStep>Narrative</FlowStep>
                    <FlowArrow />
                    <FlowStep>Insight</FlowStep>
                    <FlowArrow />
                    <FlowStep>Leverage</FlowStep>
                  </FlowRow>
                </div>
              </div>
              <div className="border-t border-white/10 pt-14 lg:border-t-0 lg:pl-14 lg:pt-0 xl:pl-20">
                <div className="mt-2">
                  <FlowRow>
                    <span className="text-[12px] font-medium uppercase tracking-[0.26em] text-white/42 sm:text-[13px]">
                      BLOCK
                    </span>
                    <span className="mx-2 shrink-0 text-[11px] text-white/22 sm:mx-3" aria-hidden>
                      =
                    </span>
                    <FlowStep>Validation</FlowStep>
                    <FlowArrow />
                    <FlowStep>Strategy</FlowStep>
                    <FlowArrow />
                    <FlowStep>Execution</FlowStep>
                  </FlowRow>
                </div>
              </div>
            </div>

            <div className="border-l border-white/20 pl-6 sm:pl-10 lg:pl-12">
              <p className="text-[10px] font-medium uppercase tracking-[0.32em] text-white/35">Together</p>
              <p className="mt-6 max-w-[780px] text-[20px] font-medium leading-snug tracking-[-0.03em] text-white sm:text-[24px] lg:text-[28px]">
                Leverage + Execution → XOLID Edge
              </p>
            </div>
          </div>
        </section>

        {/* 6. Closing */}
        <section className="border-t border-white/8 py-20 sm:py-28 lg:py-36" aria-labelledby="system-close-heading">
          <h2 id="system-close-heading" className="sr-only">
            Closing
          </h2>
          <div className="max-w-[720px] space-y-6 sm:space-y-8">
            <p className="text-[24px] font-medium leading-[1.1] tracking-[-0.035em] text-white/55 sm:text-[32px] lg:text-[38px]">
              This is not another trading platform.
            </p>
            <p className="text-[26px] font-medium leading-[1.08] tracking-[-0.035em] text-white sm:text-[36px] lg:text-[44px]">
              This is a new operating system for trading.
            </p>
          </div>
        </section>

        <SiteFooter />
      </div>
    </main>
  );
}
