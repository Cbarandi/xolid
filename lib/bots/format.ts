export function formatDuration(ms: number): string {
  if (ms <= 0) return "—";
  const sec = Math.floor(ms / 1000);
  const min = Math.floor(sec / 60);
  const hr = Math.floor(min / 60);
  const day = Math.floor(hr / 24);
  if (day > 0) return `${day}d ${hr % 24}h`;
  if (hr > 0) return `${hr}h ${min % 60}m`;
  if (min > 0) return `${min}m`;
  return `${sec}s`;
}

export function formatPnlPct(value: number): string {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

export function formatPnlQuote(value: number): string {
  const sign = value >= 0 ? "+" : "";
  return `${sign}$${value.toFixed(2)}`;
}

export function formatActiveTime(sinceIso: string | null, isActive: boolean): string {
  if (!sinceIso) return "—";
  const start = new Date(sinceIso).getTime();
  if (!Number.isFinite(start)) return "—";
  const end = isActive ? Date.now() : start;
  return formatDuration(end - start);
}
