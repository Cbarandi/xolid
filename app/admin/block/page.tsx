import Link from "next/link";
import { ADMIN_LINKS } from "@/lib/admin-links";

export const metadata = {
  title: "BLOCK — Admin — XOLID",
  robots: { index: false, follow: false },
};

export default function AdminBlockPage() {
  return (
    <main className="min-h-screen bg-black text-white antialiased">
      <div className="mx-auto flex min-h-screen w-full max-w-[1400px] flex-col px-6 sm:px-10 lg:px-16">
        <section className="pb-14 pt-6 sm:pb-20 sm:pt-8 lg:pb-24">
          <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-white/38">
            <Link href="/admin" className="transition hover:text-white/70">
              ← Go back
            </Link>
          </p>
          <p className="mt-8 text-[10px] font-medium uppercase tracking-[0.42em] text-white/40">
            <Link href="/admin" className="transition hover:text-white/70">
              Admin
            </Link>
            <span className="mx-2 text-white/22">/</span>
            <span className="text-white/55">BLOCK</span>
          </p>
          <p className="mt-6 text-[10px] font-medium uppercase tracking-[0.38em] text-white/34">
            Monitoring
          </p>
          <h1 className="mt-4 text-[44px] font-medium leading-[0.96] tracking-[-0.04em] text-white sm:text-[64px] lg:text-[80px]">
            BLOCK — Admin
          </h1>
          <div className="mt-8 h-px w-14 bg-white/18" />
        </section>

        <section className="border-t border-white/8 py-14 sm:py-20 lg:py-24">
          <p className="text-[10px] font-medium uppercase tracking-[0.38em] text-white/34">STATUS</p>
          <div className="mt-8 max-w-[680px] space-y-3 text-[15px] leading-relaxed tracking-[-0.01em] text-white/50 sm:text-[16px]">
            <p>Status: Active</p>
            <p className="text-white/40">Last run: --</p>
          </div>
        </section>

        <section className="border-t border-white/8 py-14 sm:py-20 lg:py-24">
          <p className="text-[10px] font-medium uppercase tracking-[0.38em] text-white/34">ACTIONS</p>
          <div className="mt-8 flex flex-wrap gap-4">
            <a
              href={ADMIN_LINKS.BLOCK_APP}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 items-center justify-center rounded-full border border-white/16 bg-white px-8 text-[11px] font-medium uppercase tracking-[0.28em] text-black transition hover:bg-white/92"
            >
              Open BLOCK App
            </a>
            <a
              href={ADMIN_LINKS.PAPER_TRADING}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 items-center justify-center rounded-full border border-white/16 bg-transparent px-8 text-[11px] font-medium uppercase tracking-[0.28em] text-white/80 transition hover:border-white/28 hover:text-white"
            >
              Open Paper Trading
            </a>
            <a
              href={ADMIN_LINKS.BLOCK_LOGS}
              className="inline-flex h-12 items-center justify-center rounded-full border border-white/16 bg-transparent px-8 text-[11px] font-medium uppercase tracking-[0.28em] text-white/80 transition hover:border-white/28 hover:text-white"
            >
              View Logs
            </a>
          </div>
        </section>

        <section id="logs" className="scroll-mt-24 border-t border-white/8 py-14 sm:py-20 lg:pb-24">
          <p className="text-[10px] font-medium uppercase tracking-[0.38em] text-white/34">NOTES</p>
          <textarea
            name="notes"
            rows={8}
            placeholder="Notes…"
            className="mt-8 w-full max-w-[680px] resize-y border border-white/12 bg-transparent px-4 py-3 text-[15px] leading-relaxed tracking-[-0.01em] text-white outline-none transition placeholder:text-white/25 focus:border-white/28 sm:text-[16px]"
          />
        </section>
      </div>
    </main>
  );
}
