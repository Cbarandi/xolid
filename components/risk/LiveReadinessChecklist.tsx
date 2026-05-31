import type { ReadinessCheckItem } from "@/lib/risk/types";

type Props = {
  items: ReadinessCheckItem[];
};

export function LiveReadinessChecklist({ items }: Props) {
  const readyCount = items.filter((i) => i.ok).length;

  return (
    <div className="mt-5">
      <p className="text-[12px] text-white/42">
        {readyCount} of {items.length} checks passing
      </p>
      <ul className="mt-4 space-y-3">
        {items.map((item) => (
          <li
            key={item.id}
            className="rounded-[20px] border border-white/10 bg-white/[0.02] px-5 py-4"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-[14px] font-medium text-white/88">{item.label}</p>
              <span
                className={`shrink-0 rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.16em] ${
                  item.ok
                    ? "border-emerald-400/25 text-emerald-200/75"
                    : "border-white/15 text-white/38"
                }`}
              >
                {item.ok ? "OK" : "Pending"}
              </span>
            </div>
            <p className="mt-2 text-[12px] leading-relaxed text-white/42">{item.detail}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
