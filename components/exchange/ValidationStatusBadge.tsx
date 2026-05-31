import type { ValidationStatus } from "@/lib/exchange/types";

type Props = {
  status: ValidationStatus | null;
  isActive: boolean;
};

export function ValidationStatusBadge({ status, isActive }: Props) {
  if (!isActive) {
    return (
      <span className="rounded-full border border-white/15 px-3 py-1 text-[10px] uppercase tracking-[0.16em] text-white/38">
        Inactive
      </span>
    );
  }

  if (status === "CONNECTED") {
    return (
      <span className="rounded-full border border-emerald-400/25 px-3 py-1 text-[10px] uppercase tracking-[0.16em] text-emerald-200/75">
        Connected
      </span>
    );
  }

  if (status === "FAILED") {
    return (
      <span className="rounded-full border border-red-400/25 px-3 py-1 text-[10px] uppercase tracking-[0.16em] text-red-200/75">
        Failed
      </span>
    );
  }

  return (
    <span className="rounded-full border border-white/12 px-3 py-1 text-[10px] uppercase tracking-[0.16em] text-white/42">
      Not tested
    </span>
  );
}
