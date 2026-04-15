"use client";

import { useState } from "react";
import { ContactModal } from "@/components/marketing/ContactModal";

export function SiteFooter() {
  const [contactOpen, setContactOpen] = useState(false);

  return (
    <>
      <footer className="border-t border-white/8 py-6 sm:py-8">
        <div className="flex flex-col gap-4 text-[11px] uppercase tracking-[0.28em] text-white/28 sm:flex-row sm:items-center sm:justify-between">
          <p>XOLID.AI</p>
          <button
            type="button"
            onClick={() => setContactOpen(true)}
            className="w-fit text-white/45 transition hover:text-white/85"
          >
            GET IN TOUCH
          </button>
          <p className="text-white/22">Old port labs 2026</p>
        </div>
      </footer>
      <ContactModal open={contactOpen} onClose={() => setContactOpen(false)} />
    </>
  );
}
