"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

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

const MOBILE_MENU_ID = "site-header-mobile-menu";

export function SiteHeader({ active }: SiteHeaderProps) {
  const pathname = usePathname();
  const headerRef = useRef<HTMLElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuTop, setMenuTop] = useState(0);

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  useEffect(() => {
    closeMenu();
  }, [pathname, closeMenu]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMenu();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [menuOpen, closeMenu]);

  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const mq = window.matchMedia("(min-width: 769px)");
    const onChange = () => {
      if (mq.matches) closeMenu();
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [menuOpen, closeMenu]);

  useLayoutEffect(() => {
    if (!menuOpen || !headerRef.current) return;
    const update = () => {
      if (headerRef.current) {
        setMenuTop(headerRef.current.getBoundingClientRect().bottom);
      }
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [menuOpen]);

  return (
    <header ref={headerRef} className="relative py-6 sm:py-8">
      {menuOpen ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 cursor-default bg-black/50 min-[769px]:hidden"
            aria-label="Close menu"
            tabIndex={-1}
            onClick={closeMenu}
          />
          <div
            id={MOBILE_MENU_ID}
            role="dialog"
            aria-modal="true"
            aria-label="Navigation"
            className="fixed left-0 right-0 z-50 flex min-h-0 min-[769px]:hidden flex-col items-center gap-0 overflow-y-auto bg-black py-8 shadow-[0_12px_40px_rgba(0,0,0,0.65)]"
            style={{ top: menuTop, maxHeight: `calc(100dvh - ${menuTop}px)` }}
          >
            <nav
              className="flex w-full max-w-full flex-col items-center gap-8 px-6"
              aria-label="Primary mobile"
            >
              <Link
                href="/system"
                onClick={closeMenu}
                className={`w-full py-2 text-center text-[11px] uppercase tracking-[0.28em] transition ${
                  active === "system" ? "text-white/90" : "text-white/50 hover:text-white/90"
                }`}
              >
                System
              </Link>
              <Link
                href="/block"
                onClick={closeMenu}
                className={`w-full py-2 text-center text-[11px] uppercase tracking-[0.28em] transition ${
                  active === "block" ? "text-white/90" : "text-white/50 hover:text-white/90"
                }`}
              >
                Block
              </Link>
              <Link
                href="/vixion"
                onClick={closeMenu}
                className={`w-full py-2 text-center text-[11px] uppercase tracking-[0.28em] transition ${
                  active === "vixion" ? "text-white/90" : "text-white/50 hover:text-white/90"
                }`}
              >
                Vixion
              </Link>
              <Link
                href="/login"
                onClick={closeMenu}
                className="w-full py-2 text-center text-[11px] uppercase tracking-[0.28em] text-white/50 transition hover:text-white/90"
              >
                Log in
              </Link>
            </nav>
          </div>
        </>
      ) : null}

      <div className="relative z-[60] flex w-full items-center justify-between">
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

        <nav
          className="hidden min-[769px]:flex min-[769px]:items-center min-[769px]:gap-6 lg:gap-8"
          aria-label="Primary"
        >
          {link(active, "system", "/system", "System")}
          {link(active, "block", "/block", "Block")}
          {link(active, "vixion", "/vixion", "Vixion")}
          <Link href="/login" className={navLinkClass}>
            Log in
          </Link>
        </nav>

        <button
          type="button"
          className="flex h-10 w-10 shrink-0 items-center justify-center text-[22px] leading-none text-white/80 transition hover:text-white min-[769px]:hidden"
          aria-expanded={menuOpen}
          aria-controls={menuOpen ? MOBILE_MENU_ID : undefined}
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          onClick={() => setMenuOpen((o) => !o)}
        >
          <span aria-hidden>{menuOpen ? "×" : "☰"}</span>
        </button>
      </div>
    </header>
  );
}
