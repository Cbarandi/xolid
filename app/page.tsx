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
      <p
        className="pointer-events-none fixed left-[10px] top-[10px] z-[10050] text-[10px] text-white opacity-40"
        aria-hidden
      >
        XOLID DEV BUILD
      </p>
      <WaitlistAccessModal open={waitlistOpen} onClose={closeWaitlist} />

      <div className="mx-auto flex min-h-screen w-full max-w-[1100px] flex-col px-6 sm:px-10 lg:px-16">
        <SiteHeader active="home" onOpenWaitlist={openWaitlist} />

        <section className="flex flex-1 flex-col items-center justify-center py-16 sm:py-20 lg:py-24">
          <div className="w-full max-w-[920px] text-center">
            <p className="reveal reveal-delay-1 mb-5 text-[10px] font-medium uppercase tracking-[0.42em] text-white/55 sm:mb-6 sm:text-[11px]">
              Trading with Edge
            </p>

            <h1 className="reveal reveal-delay-2 text-[40px] font-medium leading-[0.96] tracking-[-0.04em] text-white sm:text-[56px] lg:text-[72px] xl:text-[84px]">
              We are defining a new category in trading.
            </h1>

            <div className="reveal reveal-delay-3 mx-auto mt-8 h-px w-14 bg-white/18 sm:mt-10" />

            <p className="reveal reveal-delay-3 mx-auto mt-8 max-w-[640px] text-[17px] font-medium leading-snug tracking-[-0.02em] text-white/78 sm:mt-10 sm:text-[20px]">
              Edge is not found. It is built.
            </p>

            <div className="reveal reveal-delay-4 mx-auto mt-8 max-w-[560px] sm:mt-10">
              <p className="text-[15px] leading-[1.75] tracking-[-0.01em] text-white/58 sm:text-[17px]">
                We give you edge — through intelligence and infrastructure, not noise.
              </p>
            </div>

            <div className="reveal reveal-delay-5 mt-10 flex justify-center sm:mt-12">
              <button
                type="button"
                onClick={openWaitlist}
                className="inline-flex h-12 items-center justify-center rounded-full border border-white/16 bg-white px-8 text-[11px] font-medium uppercase tracking-[0.28em] text-black transition hover:scale-[1.01] hover:bg-white/92"
              >
                Request Access
              </button>
            </div>
          </div>
        </section>

        <SiteFooter />
      </div>
    </main>
  );
}
