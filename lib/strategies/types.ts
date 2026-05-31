export type Timeframe = "5m" | "15m" | "1h" | "4h" | "1d";

export const TIMEFRAMES: Timeframe[] = ["5m", "15m", "1h", "4h", "1d"];

export type OperatorKey =
  | "greater_than"
  | "less_than"
  | "crosses_above"
  | "crosses_below"
  | "equal_to"
  | "between"
  | "outside_range"
  | "rising"
  | "falling"
  | "percent_above"
  | "percent_below";

export type IndicatorCategory =
  | "Trend"
  | "Momentum"
  | "Volatility"
  | "Volume"
  | "Price Action";

export type IndicatorKey =
  | "EMA"
  | "SMA"
  | "MA"
  | "RSI"
  | "CCI"
  | "ATR"
  | "MACD"
  | "VOLUME"
  | "STOCHASTIC"
  | "MFI"
  | "BOLLINGER_BANDS"
  | "ADX"
  | "DI_PLUS"
  | "DI_MINUS"
  | "VWAP"
  | "SUPERTREND"
  | "DONCHIAN_CHANNEL"
  | "HIGHEST_HIGH"
  | "LOWEST_LOW"
  | "ROC"
  | "MOMENTUM"
  | "WILLIAMS_R"
  | "ATR_PCT"
  | "PRICE_CHANGE_PCT"
  | "VOLUME_RATIO"
  | "CANDLE_BODY_PCT"
  | "WICK_PCT"
  | "DISTANCE_TO_EMA_PCT"
  | "EMA_SLOPE";

export type ParameterType = "number" | "integer" | "select";

export type IndicatorParameterDefinition = {
  key: string;
  label: string;
  type: ParameterType;
  defaultValue: number | string;
  min?: number;
  max?: number;
  step?: number;
  options?: { value: string | number; label: string }[];
};

export type IndicatorParameters = Record<string, number | string>;

export type CompareTarget = "value" | "indicator" | "price";

export type OperatorDefinition = {
  key: OperatorKey;
  label: string;
  shortLabel: string;
  requiresValue: boolean;
  requiresSecondaryValue: boolean;
  requiresCompareIndicator: boolean;
  supportsPercent: boolean;
};

export type IndicatorDefinition = {
  key: IndicatorKey;
  label: string;
  category: IndicatorCategory;
  description: string;
  parameters: IndicatorParameterDefinition[];
  compatibleOperators: OperatorKey[];
  defaultParameters: IndicatorParameters;
};

export type StrategyRule = {
  id: string;
  timeframe: Timeframe;
  indicatorKey: IndicatorKey;
  parameters: IndicatorParameters;
  operator: OperatorKey;
  value?: number;
  valueSecondary?: number;
  compareTarget: CompareTarget;
  compareIndicatorKey?: IndicatorKey;
  compareParameters?: IndicatorParameters;
  /** Volume ratio: average volume lookback (N candles). */
  lookback?: number;
};

export type StrategyRuleGroup = {
  id: string;
  name: string;
  matchMode: "all" | "any";
  rules: StrategyRule[];
  collapsed?: boolean;
};

export type StrategyDefinition = {
  id: string;
  name: string;
  description?: string;
  version: 1;
  ruleGroups: StrategyRuleGroup[];
  groupMatchMode: "all" | "any";
  createdAt?: string;
  updatedAt?: string;
};

export type CustomStrategyRecord = {
  id: string;
  name: string;
  description: string | null;
  definition: StrategyDefinition;
  status: "DRAFT" | "ACTIVE" | "ARCHIVED";
  createdAt: string;
  updatedAt: string;
};

export type StrategyBuilderInput = {
  name: string;
  description?: string;
  definition: Omit<StrategyDefinition, "id" | "name" | "description" | "createdAt" | "updatedAt">;
};
