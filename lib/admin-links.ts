/** Central admin cockpit URLs — edit `ADMIN_LINKS` to rewire BLOCK / VIXION. */

export const ADMIN_LINKS = {
  BLOCK_APP: "https://app.block-trading.com",
  PAPER_TRADING: "https://app.block-trading.com/paper-lab",
  VIXION_MONITOR: "/admin/vixion",
  VIXION_RUNS: "/admin/vixion#recent-runs",
  BLOCK_LOGS: "#logs",
  VIXION_LOGS: "#vixion-logs",
  VIXION_NARRATIVES: "#live-narratives",
} as const;
