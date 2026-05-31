import { privateKpiCardClass, privateKpiGridClass } from "./styles";

type Kpi = {
  label: string;
  value: string;
  tone?: "default" | "positive" | "negative";
};

export function KpiGrid({ items }: { items: Kpi[] }) {
  return (
    <div className={privateKpiGridClass}>
      {items.map((item) => (
        <div key={item.label} className={privateKpiCardClass}>
          <p className="text-[9px] uppercase tracking-[0.28em] text-white/32">{item.label}</p>
          <p
            className={`mt-2 text-[22px] font-medium tracking-[-0.03em] ${
              item.tone === "positive"
                ? "text-emerald-400/90"
                : item.tone === "negative"
                  ? "text-red-400/85"
                  : "text-white/90"
            }`}
          >
            {item.value}
          </p>
        </div>
      ))}
    </div>
  );
}
