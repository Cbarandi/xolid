import type { StrategySource } from "./types";

export function isCustomStrategy(source: StrategySource): boolean {
  return source === "CUSTOM";
}

export function strategySourceLabel(source: StrategySource): "System" | "Custom" {
  return source === "CUSTOM" ? "Custom" : "System";
}
