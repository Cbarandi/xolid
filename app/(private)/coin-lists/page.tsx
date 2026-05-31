import type { Metadata } from "next";
import Link from "next/link";
import { PrivateAppShell } from "@/components/private/PrivateAppShell";
import {
  privateActionLinkClass,
  privateTableClass,
  privateTableWrapClass,
  privateTdClass,
  privateThClass,
} from "@/components/private/styles";
import { PREDEFINED_COIN_LISTS } from "@/lib/bots/coin-lists";

export const metadata: Metadata = {
  title: "Coin Lists — XOLID",
  robots: { index: false, follow: false },
};

export default function CoinListsPage() {
  return (
    <PrivateAppShell title="Coin Lists">
      <p className="text-[10px] font-medium uppercase tracking-[0.38em] text-white/34">Symbols</p>
      <h2 className="mt-3 text-[28px] font-medium tracking-[-0.04em] text-white sm:text-[36px]">
        Coin lists
      </h2>
      <p className="mt-4 max-w-[560px] text-[14px] leading-relaxed text-white/48">
        Predefined USDC symbol lists. Persistence for custom lists can be added later.
      </p>

      <div className={privateTableWrapClass}>
        <table className={privateTableClass}>
          <thead>
            <tr>
              <th className={privateThClass}>List</th>
              <th className={privateThClass}>Symbols</th>
              <th className={privateThClass}>Preview</th>
              <th className={privateThClass}>Action</th>
            </tr>
          </thead>
          <tbody>
            {PREDEFINED_COIN_LISTS.map((list) => (
              <tr key={list.key}>
                <td className={privateTdClass}>
                  <span className="text-white/88">{list.name}</span>
                  <span className="ml-2 text-[10px] uppercase tracking-[0.2em] text-white/28">
                    {list.key}
                  </span>
                </td>
                <td className={privateTdClass}>{list.symbols.length}</td>
                <td className={privateTdClass}>{list.symbols.slice(0, 5).join(", ")}</td>
                <td className={privateTdClass}>
                  <Link
                    href={`/bots/new?symbols=${encodeURIComponent(list.symbols.join(","))}`}
                    className={privateActionLinkClass}
                  >
                    Use in bot
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PrivateAppShell>
  );
}
