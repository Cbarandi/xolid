import Link from "next/link";
import { AdminPaperEnginePanel } from "@/components/bots/AdminPaperEnginePanel";
import { adminLogout } from "../actions";

export const metadata = {
  title: "Paper Bot Engine — Admin — XOLID",
  robots: { index: false, follow: false },
};

export default function AdminBotsPage() {
  return (
    <main className="min-h-screen bg-black text-white antialiased">
      <div className="mx-auto flex min-h-screen w-full max-w-[1400px] flex-col px-6 sm:px-10 lg:px-16">
        <section className="pb-14 pt-6 sm:pb-20 sm:pt-8 lg:pb-24">
          <p className="text-[10px] font-medium uppercase tracking-[0.42em] text-white/40">
            <Link href="/admin" className="transition hover:text-white/70">
              Admin
            </Link>
            <span className="mx-2 text-white/22">/</span>
            <span className="text-white/55">Bots</span>
          </p>
          <p className="mt-6 text-[10px] font-medium uppercase tracking-[0.38em] text-white/34">
            Paper engine
          </p>
          <h1 className="mt-4 text-[40px] font-medium leading-[0.96] tracking-[-0.04em] text-white sm:text-[56px]">
            Trading Bots Runner
          </h1>
          <div className="mt-8 h-px w-14 bg-white/18" />
          <p className="mt-8 max-w-[560px] text-[15px] leading-relaxed tracking-[-0.01em] text-white/46 sm:text-[16px]">
            Internal controls for XOLID paper bots. Prices from Binance public API (USDC pairs).
            Start bots from{" "}
            <Link href="/bots" className="text-white/70 underline-offset-2 hover:underline">
              /bots
            </Link>
            , then run scan and exit cycles here.
          </p>

          <AdminPaperEnginePanel />

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
