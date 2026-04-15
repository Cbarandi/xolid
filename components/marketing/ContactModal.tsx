"use client";

import { useCallback, useEffect, useId } from "react";
import { ContactForm } from "@/components/ContactForm";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function ContactModal({ open, onClose }: Props) {
  const titleId = useId();

  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (!open) return;
    document.addEventListener("keydown", onKeyDown);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prev;
    };
  }, [open, onKeyDown]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[10060] flex items-center justify-center p-4 sm:p-6"
      role="presentation"
    >
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-black/75 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-[10061] w-full max-w-[440px] rounded-[28px] border border-white/12 bg-black px-7 py-8 shadow-[0_0_0_1px_rgba(255,255,255,0.04)] sm:px-9 sm:py-10"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-[18px] leading-none text-white/50 transition hover:border-white/22 hover:text-white/90"
          aria-label="Close dialog"
        >
          ×
        </button>

        <p className="text-[10px] font-medium uppercase tracking-[0.34em] text-white/48">
          GET IN TOUCH
        </p>
        <h2
          id={titleId}
          className="mt-3 text-[26px] font-medium leading-[1.05] tracking-[-0.04em] text-white sm:text-[30px]"
        >
          Contact
        </h2>
        <p className="mt-4 text-[14px] leading-7 text-white/52 sm:text-[15px]">
          Reach the XOLID team. We read every message.
        </p>

        <ContactForm className="mt-6" />
      </div>
    </div>
  );
}
