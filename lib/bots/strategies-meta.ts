import type { BotStrategy } from "./types";

export type StrategyMeta = {
  key: BotStrategy;
  name: string;
  description: string;
  defaultTp: number;
  defaultSl: number;
  defaultTimeoutMinutes: number;
  allowedSides: ("LONG" | "SHORT")[];
  status: "available" | "coming_soon";
};

export const STRATEGIES_META: StrategyMeta[] = [
  {
    key: "BITE_CCI_V1",
    name: "BITE CCI v1",
    description: "Momentum reversion using CCI extremes on USDC pairs.",
    defaultTp: 2.5,
    defaultSl: 1.2,
    defaultTimeoutMinutes: 240,
    allowedSides: ["LONG", "SHORT"],
    status: "available",
  },
  {
    key: "CONTINENTAL_V1",
    name: "Continental v1",
    description: "Placeholder strategy for broader trend continuation setups.",
    defaultTp: 3,
    defaultSl: 1.5,
    defaultTimeoutMinutes: 360,
    allowedSides: ["LONG", "SHORT"],
    status: "coming_soon",
  },
];
