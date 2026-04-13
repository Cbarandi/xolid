import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { SiteHeader } from "@/components/marketing/SiteHeader";
import { WaitlistCard } from "@/components/marketing/WaitlistCard";

export const metadata: Metadata = {
  title: "VIXION — XOLID",
  description:
    "Narrative intelligence inside XOLID — early recognition of trend, sentiment, and information flow before the tape finishes the story.",
  openGraph: {
    title: "VIXION — XOLID",
    description:
      "Narrative intelligence inside XOLID — early recognition of trend, sentiment, and information flow before the tape finishes the story.",
  },
};

export default function VixionPage() {
  return (
    <main className="min-h-screen bg-black text-white antialiased">
      <p
        className="pointer-events-none fixed left-[10px] top-[10px] z-[10050] text-[10px] text-white opacity-40"
        aria-hidden
      >
        XOLID DEV BUILD
      </p>
      <div className="mx-auto flex min-h-screen w-full max-w-[1400px] flex-col px-6 sm:px-10 lg:px-16">
        <SiteHeader active="vixion" />

        <section className="pb-14 pt-6 sm:pb-20 sm:pt-8 lg:pb-24">
          <p className="text-[10px] font-medium uppercase tracking-[0.42em] text-white/40">
            <Link href="/" className="transition hover:text-white/70">
              XOLID
            </Link>
            <span className="mx-2 text-white/22">/</span>
            <span className="text-white/55">Module</span>
          </p>
          <p className="mt-6 text-[10px] font-medium uppercase tracking-[0.38em] text-white/34">
            Narrative intelligence
          </p>
          <h1 className="mt-4 max-w-[14ch] text-[44px] font-medium leading-[0.96] tracking-[-0.04em] text-white sm:text-[64px] lg:text-[80px]">
            VIXION
          </h1>
          <div className="mt-8 h-px w-14 bg-white/18" />
          <p className="mt-8 max-w-[580px] text-[18px] font-medium leading-snug tracking-[-0.02em] text-white/78 sm:text-[20px]">
            The tape is late to the story.
            <span className="mt-3 block text-[15px] font-normal leading-relaxed tracking-[-0.01em] text-white/46 sm:text-[16px]">
              VIXION is a narrative intelligence engine that converts real-world narratives into
              quantified probabilities and actionable signals.
            </span>
            <span className="mt-3 block text-[15px] font-normal leading-relaxed tracking-[-0.01em] text-white/46 sm:text-[16px]">
              We are not building another trading platform. We are defining a new category.
            </span>
          </p>
        </section>

        <section className="border-t border-white/8 py-14 sm:py-20 lg:py-24">
          <p className="text-[10px] font-medium uppercase tracking-[0.38em] text-white/34">
            Positioning
          </p>
          <div className="mt-8 max-w-[680px] space-y-5 text-[17px] leading-[1.62] tracking-[-0.02em] text-white/56 sm:text-[18px]">
            <p>
              Markets draft narratives in motion: repetition, doubt, conviction — then price catches
              up or breaks the premise. VIXION tracks that draft while it is still elastic, as the
              forward-reading half of the same intelligence system.
            </p>
            <p className="text-white/40">
              Inside XOLID, this is reconnaissance, not noise. Early recognition of what is
              emerging, strengthening, or quietly losing the room — before the move is fully priced.
            </p>
          </div>
        </section>

        <section className="border-t border-white/8 py-14 sm:py-20 lg:py-24">
          <div className="grid gap-12 lg:grid-cols-[1fr_1.05fr] lg:items-start lg:gap-16">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.38em] text-white/34">
                Reading frame
              </p>
              <div className="mt-8 max-w-[540px] space-y-6 text-[15px] leading-[1.75] text-white/50 sm:text-[16px]">
                <p>
                  Sentiment is velocity: where attention tightens, where consensus hardens, and
                  where the story still has room to reprice if reality shifts.
                </p>
                <p>
                  Trend, here, is not a line on a screen — it is the arc of belief as information
                  moves through the system, sometimes wrong, often early, occasionally decisive.
                </p>
                <p className="text-white/38">
                  BLOCK holds the line when conviction becomes size. VIXION widens foresight while
                  XOLID keeps the edge coherent across both.
                </p>
              </div>
              <p className="mt-10 text-[13px] uppercase tracking-[0.28em] text-white/30">
                <Link href="/block" className="text-white/45 transition hover:text-white/80">
                  ← BLOCK — execution intelligence
                </Link>
              </p>
            </div>
            <WaitlistCard
              eyebrow="VIXION · XOLID"
              title="Request private access"
              description="Limited entry to the narrative module. If VIXION fits how you read flow, we open it in waves."
            />
          </div>
        </section>

        <SiteFooter />
      </div>
    </main>
  );
}
