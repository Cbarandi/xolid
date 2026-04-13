"use client";

import Link from "next/link";

export type SiteHeaderModule = "home" | "system" | "block" | "vixion";

const link = (active: SiteHeaderModule, mod: SiteHeaderModule, href: string, label: string) => {
  const isActive = active === mod;
  return (
    <Link
      href={href}
      className={`text-[11px] uppercase tracking-[0.28em] transition ${
        isActive ? "text-white/90" : "text-white/50 hover:text-white/90"
      }`}
    >
      {label}
    </Link>
  );
};

const navLinkClass =
  "text-[11px] uppercase tracking-[0.28em] text-white/50 transition hover:text-white/90";

type SiteHeaderProps = {
  active: SiteHeaderModule;
  /** Kept for API compatibility; sign-in is at /login. */
  onOpenWaitlist?: () => void;
};

export function SiteHeader({ active }: SiteHeaderProps) {
  return (
    <header className="flex items-center justify-between py-6 sm:py-8">
      <Link href="/" className="group flex items-center gap-3.5">
        <div className="logo-hover relative h-9 w-9 shrink-0 sm:h-10 sm:w-10">
          {/* eslint-disable-next-line @next/next/no-img-element -- SVG asset; not next/image */}
          <img
            src="/branding/xolid-symbol.svg?v=4"
            alt="XOLID"
            width={40}
            height={40}
            decoding="async"
            fetchPriority={active === "home" ? "high" : "auto"}
            className="h-full w-full object-contain"
          />
        </div>
        <span className="text-[11px] font-medium uppercase tracking-[0.38em] text-white/92 sm:text-xs">
          XOLID
        </span>
      </Link>

      <nav className="hidden items-center gap-6 md:flex lg:gap-8" aria-label="Primary">
        {link(active, "system", "/system", "System")}
        {link(active, "block", "/block", "Block")}
        {link(active, "vixion", "/vixion", "Vixion")}
        <Link href="/login" className={navLinkClass}>
          Log in
        </Link>
      </nav>
    </header>
  );
}
