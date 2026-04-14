"use client";

import { useCallback, useState } from "react";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { SiteHeader } from "@/components/marketing/SiteHeader";
import { WaitlistAccessModal } from "@/components/marketing/WaitlistAccessModal";

export default function Home() {
  const [waitlistOpen, setWaitlistOpen] = useState(false);

  const openWaitlist = useCallback(() => setWaitlistOpen(true), []);
  const closeWaitlist = useCallback(() => setWaitlistOpen(false), []);

  return (
    <main className="min-h-screen bg-black text-white antialiased">
      <WaitlistAccessModal open={waitlistOpen} onClose={closeWaitlist} />

      <div className="mx-auto flex min-h-screen w-full max-w-[1200px] flex-col px-6 sm:px-10 lg:px-16">
        <SiteHeader active="home" onOpenWaitlist={openWaitlist} />

        <section className="flex flex-1 flex-col justify-center py-20 sm:py-28 lg:min-h-[min(88dvh,920px)] lg:py-32">
          <div className="w-full max-w-[640px] sm:max-w-[720px] lg:max-w-[820px]">
            <p className="reveal reveal-delay-1 max-w-[52ch] text-[12px] font-normal leading-[1.55] tracking-[-0.01em] text-white/48 sm:text-[13px] lg:text-[14px] lg:leading-[1.5]">
              XOLID turns market narratives into actionable trading edge.
            </p>

            <h1 className="reveal reveal-delay-2 mt-8 text-[2.35rem] font-medium leading-[0.98] tracking-[-0.045em] text-white sm:mt-10 sm:text-[3rem] lg:mt-12 lg:text-[clamp(3.25rem,4.2vw+1.5rem,4.75rem)]">
              The operating system for narrative-driven trading.
            </h1>

            <p className="reveal reveal-delay-3 mt-8 max-w-[48ch] text-[16px] font-normal leading-[1.62] tracking-[-0.018em] text-white/52 sm:mt-10 sm:text-[17px] lg:text-[18px]">
              XOLID detects market narratives, validates them with data, and executes only when real
              edge exists.
            </p>

            <div
              className="reveal reveal-delay-4 mt-12 border-t border-white/[0.09] pt-10 sm:mt-14 sm:pt-12"
              aria-label="Product framework"
            >
              <ul className="space-y-4 text-[12px] leading-snug tracking-[-0.01em] sm:text-[13px]">
                <li className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
                  <span className="font-medium uppercase tracking-[0.22em] text-white/38">VIXION</span>
                  <span className="text-[11px] font-normal text-white/20" aria-hidden>
                    →
                  </span>
                  <span className="text-white/58">Detects narrative</span>
                </li>
                <li className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
                  <span className="font-medium uppercase tracking-[0.22em] text-white/38">BLOCK</span>
                  <span className="text-[11px] font-normal text-white/20" aria-hidden>
                    →
                  </span>
                  <span className="text-white/58">Validates and executes</span>
                </li>
                <li className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
                  <span className="font-medium uppercase tracking-[0.22em] text-white/38">XOLID</span>
                  <span className="text-[11px] font-normal text-white/20" aria-hidden>
                    →
                  </span>
                  <span className="text-white/58">Turns insight into edge</span>
                </li>
              </ul>
            </div>

            <div className="reveal reveal-delay-5 mt-14 sm:mt-16">
              <p className="mb-4 max-w-[40ch] text-[14px] font-normal leading-snug tracking-[-0.012em] text-white/70 sm:mb-[18px] sm:text-[15px]">
                Join the XOLID system
              </p>
              <button
                type="button"
                onClick={openWaitlist}
                className="inline-flex h-12 items-center justify-center rounded-full border border-white/16 bg-white px-9 text-[11px] font-medium uppercase tracking-[0.28em] text-black transition duration-300 ease-out hover:bg-white/92"
              >
                Request access
              </button>
            </div>

            <div
              className="reveal reveal-delay-6 mt-16 h-px w-full max-w-md bg-gradient-to-r from-white/18 via-white/8 to-transparent sm:mt-20 lg:mt-24 lg:max-w-lg"
              aria-hidden
            />
          </div>
        </section>

        <SiteFooter />
      </div>
    </main>
  );
}
