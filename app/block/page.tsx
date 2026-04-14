import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { SiteHeader } from "@/components/marketing/SiteHeader";
import { WaitlistCard } from "@/components/marketing/WaitlistCard";

export const metadata: Metadata = {
  title: "BLOCK — XOLID",
  description:
    "Execution intelligence inside XOLID — structure, validation, and decision systems for the commit.",
  openGraph: {
    title: "BLOCK — XOLID",
    description:
      "Execution intelligence inside XOLID — structure, validation, and decision systems for the commit.",
  },
};

export default function BlockPage() {
  return (
    <main className="min-h-screen bg-black text-white antialiased">
      <div className="mx-auto flex min-h-screen w-full max-w-[1400px] flex-col px-6 sm:px-10 lg:px-16">
        <SiteHeader active="block" />

        <section className="pb-14 pt-6 sm:pb-20 sm:pt-8 lg:pb-24">
          <p className="text-[10px] font-medium uppercase tracking-[0.42em] text-white/40">
            <Link href="/" className="transition hover:text-white/70">
              XOLID
            </Link>
            <span className="mx-2 text-white/22">/</span>
            <span className="text-white/55">Module</span>
          </p>
          <p className="mt-6 text-[10px] font-medium uppercase tracking-[0.38em] text-white/34">
            Execution intelligence
          </p>
          <h1 className="mt-4 max-w-[14ch] text-[44px] font-medium leading-[0.96] tracking-[-0.04em] text-white sm:text-[64px] lg:text-[80px]">
            BLOCK
          </h1>
          <div className="mt-8 h-px w-14 bg-white/18" />
          <p className="mt-8 max-w-[560px] text-[18px] font-medium leading-snug tracking-[-0.02em] text-white/78 sm:text-[20px]">
            Structure is how conviction survives the market.
            <span className="mt-3 block text-[15px] font-normal leading-relaxed tracking-[-0.01em] text-white/46 sm:text-[16px]">
              BLOCK is a trading intelligence and execution system that identifies when a real
              statistical edge exists, what strategy fits that context, and when the best decision is
              to do nothing.
            </span>
          </p>
        </section>

        <section className="border-t border-white/8 py-14 sm:py-20 lg:py-24">
          <p className="text-[10px] font-medium uppercase tracking-[0.38em] text-white/34">
            Positioning
          </p>
          <div className="mt-8 max-w-[680px] space-y-5 text-[17px] leading-[1.62] tracking-[-0.02em] text-white/56 sm:text-[18px]">
            <p>
              Opinion evaporates at the order. BLOCK exists where abstraction dies: sizing,
              invalidation, and the sequence of choices that either compound edge or expose its
              absence.
            </p>
            <p className="text-white/40">
              Trading infrastructure, not a faster interface — built to the same intelligence
              standard as the rest of the system. Strategy becomes testable; execution becomes
              accountable.
            </p>
          </div>
        </section>

        <section className="border-t border-white/8 py-14 sm:py-20 lg:py-24">
          <div className="grid gap-12 lg:grid-cols-[1fr_1.05fr] lg:items-start lg:gap-16">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.38em] text-white/34">
                Operating frame
              </p>
              <div className="mt-8 max-w-[540px] space-y-6 text-[15px] leading-[1.75] text-white/50 sm:text-[16px]">
                <p>
                  The commit is where narrative ends and mechanics begin. BLOCK aligns intent with
                  protocol so decisions stay legible when the tape disagrees.
                </p>
                <p>
                  Discipline here is architectural: how risk is defined before size, how structure
                  survives volatility, and how the desk keeps one standard under pressure.
                </p>
                <p className="text-white/38">
                  VIXION widens foresight upstream. BLOCK enforces consequence downstream — same
                  XOLID stack, two intelligences, one bar for when capital moves.
                </p>
              </div>
              <p className="mt-10 text-[13px] uppercase tracking-[0.28em] text-white/30">
                <Link href="/vixion" className="text-white/45 transition hover:text-white/80">
                  VIXION — narrative intelligence →
                </Link>
              </p>
            </div>
            <WaitlistCard
              eyebrow="BLOCK · XOLID"
              title="Request private access"
              description="Limited entry to the execution module. If BLOCK fits how you run risk, we open it in waves."
            />
          </div>
        </section>

        <SiteFooter />
      </div>
    </main>
  );
}
