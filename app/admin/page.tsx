import Link from "next/link";
import { adminLogout } from "./actions";
import { ADMIN_LINKS } from "@/lib/admin-links";

export const metadata = {
  title: "Admin — XOLID",
  robots: { index: false, follow: false },
};

type CockpitEntry = {
  title: string;
  description: string;
  href: string;
  external?: boolean;
};

const COCKPIT: CockpitEntry[] = [
  {
    title: "BLOCK App",
    description: "Execution and strategy interface",
    href: ADMIN_LINKS.BLOCK_APP,
    external: true,
  },
  {
    title: "Paper Trading",
    description: "Simulated trading environment",
    href: ADMIN_LINKS.PAPER_TRADING,
    external: true,
  },
  {
    title: "VIXION Monitor",
    description: "Narratives and signal engine",
    href: ADMIN_LINKS.VIXION_MONITOR,
  },
  {
    title: "VIXION Runs",
    description: "Historical runs and outputs",
    href: ADMIN_LINKS.VIXION_RUNS,
  },
];

const cardClass =
  "group block border border-white/10 bg-white/[0.02] px-5 py-5 transition hover:border-white/18 hover:bg-white/[0.04] hover:opacity-[0.97] sm:px-6 sm:py-6";

export default function AdminDashboardPage() {
  return (
    <main className="min-h-screen bg-black text-white antialiased">
      <div className="mx-auto flex min-h-screen w-full max-w-[1400px] flex-col px-6 sm:px-10 lg:px-16">
        <section className="pb-14 pt-6 sm:pb-20 sm:pt-8 lg:pb-24">
          <p className="text-[10px] font-medium uppercase tracking-[0.38em] text-white/34">
            Control
          </p>
          <h1 className="mt-4 text-[40px] font-medium leading-[0.96] tracking-[-0.04em] text-white sm:text-[56px] lg:text-[64px]">
            Admin
          </h1>
          <div className="mt-8 h-px w-14 bg-white/18" />
          <p className="mt-8 max-w-[560px] text-[15px] leading-relaxed tracking-[-0.01em] text-white/46 sm:text-[16px]">
            Internal cockpit — quick access to BLOCK, paper trading, and VIXION monitoring.
          </p>

          <ul className="mt-12 grid gap-4 sm:grid-cols-2 sm:gap-5 lg:max-w-[920px]">
            {COCKPIT.map((item) => (
              <li key={item.title}>
                {item.external ? (
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cardClass}
                  >
                    <p className="text-[15px] font-medium leading-snug tracking-[-0.02em] text-white sm:text-[16px]">
                      {item.title}
                    </p>
                    <p className="mt-2 text-[14px] leading-relaxed tracking-[-0.01em] text-white/40 sm:text-[15px]">
                      {item.description}
                    </p>
                    <p className="mt-4 text-[10px] font-medium uppercase tracking-[0.32em] text-white/30">
                      Open →
                    </p>
                  </a>
                ) : (
                  <Link href={item.href} className={cardClass}>
                    <p className="text-[15px] font-medium leading-snug tracking-[-0.02em] text-white sm:text-[16px]">
                      {item.title}
                    </p>
                    <p className="mt-2 text-[14px] leading-relaxed tracking-[-0.01em] text-white/40 sm:text-[15px]">
                      {item.description}
                    </p>
                    <p className="mt-4 text-[10px] font-medium uppercase tracking-[0.32em] text-white/30">
                      Open →
                    </p>
                  </Link>
                )}
              </li>
            ))}
          </ul>

          <form action={adminLogout} className="mt-16 border-t border-white/8 pt-12">
            <button
              type="submit"
              className="text-[11px] font-medium uppercase tracking-[0.28em] text-white/35 transition hover:text-white/60"
            >
              Log out
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
