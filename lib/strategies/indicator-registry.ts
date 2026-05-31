import type {
  IndicatorDefinition,
  IndicatorKey,
  IndicatorParameterDefinition,
  IndicatorParameters,
  OperatorKey,
} from "./types";

const PERIOD: IndicatorParameterDefinition = {
  key: "period",
  label: "Period",
  type: "integer",
  defaultValue: 14,
  min: 1,
  max: 500,
  step: 1,
};

const PERIOD_20: IndicatorParameterDefinition = {
  ...PERIOD,
  defaultValue: 20,
};

const PERIOD_50: IndicatorParameterDefinition = {
  ...PERIOD,
  defaultValue: 50,
};

const LOOKBACK: IndicatorParameterDefinition = {
  key: "lookback",
  label: "Lookback candles",
  type: "integer",
  defaultValue: 20,
  min: 2,
  max: 500,
  step: 1,
};

const NUMERIC_OPS: OperatorKey[] = [
  "greater_than",
  "less_than",
  "crosses_above",
  "crosses_below",
  "equal_to",
  "between",
  "outside_range",
  "rising",
  "falling",
  "percent_above",
  "percent_below",
];

const TREND_OPS: OperatorKey[] = [
  "greater_than",
  "less_than",
  "crosses_above",
  "crosses_below",
  "rising",
  "falling",
  "percent_above",
  "percent_below",
];

const OSCILLATOR_OPS: OperatorKey[] = [
  "greater_than",
  "less_than",
  "crosses_above",
  "crosses_below",
  "equal_to",
  "between",
  "outside_range",
  "rising",
  "falling",
];

const VOLUME_RATIO_OPS: OperatorKey[] = ["greater_than", "less_than", "equal_to"];

function defs(
  items: (Omit<IndicatorDefinition, "defaultParameters"> & {
    defaultParameters?: IndicatorParameters;
  })[],
): IndicatorDefinition[] {
  return items.map((item) => ({
    ...item,
    defaultParameters:
      item.defaultParameters ??
      Object.fromEntries(
        item.parameters.map((p) => [p.key, p.defaultValue]),
      ),
  }));
}

export const INDICATORS: IndicatorDefinition[] = defs([
  {
    key: "EMA",
    label: "EMA",
    category: "Trend",
    description: "Exponential moving average.",
    parameters: [PERIOD_20],
    compatibleOperators: TREND_OPS,
  },
  {
    key: "SMA",
    label: "SMA",
    category: "Trend",
    description: "Simple moving average.",
    parameters: [PERIOD_20],
    compatibleOperators: TREND_OPS,
  },
  {
    key: "MA",
    label: "MA",
    category: "Trend",
    description: "Moving average with selectable type.",
    parameters: [
      PERIOD_20,
      {
        key: "type",
        label: "Type",
        type: "select",
        defaultValue: "SMA",
        options: [
          { value: "SMA", label: "SMA" },
          { value: "EMA", label: "EMA" },
        ],
      },
    ],
    compatibleOperators: TREND_OPS,
  },
  {
    key: "RSI",
    label: "RSI",
    category: "Momentum",
    description: "Relative Strength Index.",
    parameters: [PERIOD],
    compatibleOperators: OSCILLATOR_OPS,
  },
  {
    key: "CCI",
    label: "CCI",
    category: "Momentum",
    description: "Commodity Channel Index.",
    parameters: [PERIOD_50],
    compatibleOperators: OSCILLATOR_OPS,
  },
  {
    key: "ATR",
    label: "ATR",
    category: "Volatility",
    description: "Average True Range.",
    parameters: [PERIOD],
    compatibleOperators: NUMERIC_OPS,
  },
  {
    key: "MACD",
    label: "MACD",
    category: "Momentum",
    description: "Moving Average Convergence Divergence.",
    parameters: [
      { key: "fast", label: "Fast", type: "integer", defaultValue: 12, min: 1, max: 100, step: 1 },
      { key: "slow", label: "Slow", type: "integer", defaultValue: 26, min: 1, max: 200, step: 1 },
      {
        key: "signal",
        label: "Signal",
        type: "integer",
        defaultValue: 9,
        min: 1,
        max: 100,
        step: 1,
      },
    ],
    compatibleOperators: [
      "greater_than",
      "less_than",
      "crosses_above",
      "crosses_below",
      "rising",
      "falling",
    ],
  },
  {
    key: "VOLUME",
    label: "Volume",
    category: "Volume",
    description: "Raw candle volume.",
    parameters: [],
    compatibleOperators: ["greater_than", "less_than", "rising", "falling", "percent_above"],
  },
  {
    key: "STOCHASTIC",
    label: "Stochastic",
    category: "Momentum",
    description: "Stochastic oscillator %K / %D.",
    parameters: [
      { key: "k", label: "%K period", type: "integer", defaultValue: 14, min: 1, max: 100, step: 1 },
      { key: "d", label: "%D period", type: "integer", defaultValue: 3, min: 1, max: 50, step: 1 },
    ],
    compatibleOperators: OSCILLATOR_OPS,
  },
  {
    key: "MFI",
    label: "MFI",
    category: "Volume",
    description: "Money Flow Index.",
    parameters: [PERIOD],
    compatibleOperators: OSCILLATOR_OPS,
  },
  {
    key: "BOLLINGER_BANDS",
    label: "Bollinger Bands",
    category: "Volatility",
    description: "Price relative to Bollinger bands.",
    parameters: [
      PERIOD_20,
      {
        key: "stdDev",
        label: "Std dev",
        type: "number",
        defaultValue: 2,
        min: 0.5,
        max: 5,
        step: 0.1,
      },
      {
        key: "band",
        label: "Band",
        type: "select",
        defaultValue: "middle",
        options: [
          { value: "upper", label: "Upper" },
          { value: "middle", label: "Middle" },
          { value: "lower", label: "Lower" },
        ],
      },
    ],
    compatibleOperators: TREND_OPS,
  },
  {
    key: "ADX",
    label: "ADX",
    category: "Trend",
    description: "Average Directional Index.",
    parameters: [PERIOD],
    compatibleOperators: OSCILLATOR_OPS,
  },
  {
    key: "DI_PLUS",
    label: "DI+",
    category: "Trend",
    description: "Positive Directional Indicator.",
    parameters: [PERIOD],
    compatibleOperators: TREND_OPS,
  },
  {
    key: "DI_MINUS",
    label: "DI−",
    category: "Trend",
    description: "Negative Directional Indicator.",
    parameters: [PERIOD],
    compatibleOperators: TREND_OPS,
  },
  {
    key: "VWAP",
    label: "VWAP",
    category: "Volume",
    description: "Volume Weighted Average Price.",
    parameters: [],
    compatibleOperators: TREND_OPS,
  },
  {
    key: "SUPERTREND",
    label: "Supertrend",
    category: "Trend",
    description: "Supertrend indicator.",
    parameters: [
      { key: "period", label: "Period", type: "integer", defaultValue: 10, min: 1, max: 100, step: 1 },
      {
        key: "multiplier",
        label: "Multiplier",
        type: "number",
        defaultValue: 3,
        min: 0.5,
        max: 10,
        step: 0.1,
      },
    ],
    compatibleOperators: TREND_OPS,
  },
  {
    key: "DONCHIAN_CHANNEL",
    label: "Donchian Channel",
    category: "Volatility",
    description: "Donchian channel boundary.",
    parameters: [
      PERIOD_20,
      {
        key: "line",
        label: "Line",
        type: "select",
        defaultValue: "upper",
        options: [
          { value: "upper", label: "Upper" },
          { value: "middle", label: "Middle" },
          { value: "lower", label: "Lower" },
        ],
      },
    ],
    compatibleOperators: TREND_OPS,
  },
  {
    key: "HIGHEST_HIGH",
    label: "Highest High",
    category: "Price Action",
    description: "Highest high over N candles.",
    parameters: [PERIOD_20],
    compatibleOperators: TREND_OPS,
  },
  {
    key: "LOWEST_LOW",
    label: "Lowest Low",
    category: "Price Action",
    description: "Lowest low over N candles.",
    parameters: [PERIOD_20],
    compatibleOperators: TREND_OPS,
  },
  {
    key: "ROC",
    label: "ROC",
    category: "Momentum",
    description: "Rate of Change.",
    parameters: [
      { key: "period", label: "Period", type: "integer", defaultValue: 12, min: 1, max: 200, step: 1 },
    ],
    compatibleOperators: OSCILLATOR_OPS,
  },
  {
    key: "MOMENTUM",
    label: "Momentum",
    category: "Momentum",
    description: "Price momentum over N candles.",
    parameters: [
      { key: "period", label: "Period", type: "integer", defaultValue: 10, min: 1, max: 200, step: 1 },
    ],
    compatibleOperators: OSCILLATOR_OPS,
  },
  {
    key: "WILLIAMS_R",
    label: "Williams %R",
    category: "Momentum",
    description: "Williams Percent Range.",
    parameters: [PERIOD],
    compatibleOperators: OSCILLATOR_OPS,
  },
  {
    key: "ATR_PCT",
    label: "ATR %",
    category: "Volatility",
    description: "ATR as percentage of price.",
    parameters: [PERIOD],
    compatibleOperators: NUMERIC_OPS,
  },
  {
    key: "PRICE_CHANGE_PCT",
    label: "Price Change %",
    category: "Price Action",
    description: "Percent price change over N candles.",
    parameters: [
      { key: "period", label: "Period", type: "integer", defaultValue: 1, min: 1, max: 100, step: 1 },
    ],
    compatibleOperators: OSCILLATOR_OPS,
  },
  {
    key: "VOLUME_RATIO",
    label: "Volume Ratio",
    category: "Volume",
    description:
      "Current candle volume vs average volume of last N candles. Value 1.5 = 50% above average.",
    parameters: [LOOKBACK],
    compatibleOperators: VOLUME_RATIO_OPS,
    defaultParameters: { lookback: 20 },
  },
  {
    key: "CANDLE_BODY_PCT",
    label: "Candle Body %",
    category: "Price Action",
    description: "Candle body size as % of range.",
    parameters: [],
    compatibleOperators: OSCILLATOR_OPS,
  },
  {
    key: "WICK_PCT",
    label: "Wick %",
    category: "Price Action",
    description: "Upper or lower wick as % of range.",
    parameters: [
      {
        key: "side",
        label: "Wick",
        type: "select",
        defaultValue: "upper",
        options: [
          { value: "upper", label: "Upper" },
          { value: "lower", label: "Lower" },
        ],
      },
    ],
    compatibleOperators: OSCILLATOR_OPS,
  },
  {
    key: "DISTANCE_TO_EMA_PCT",
    label: "Distance to EMA %",
    category: "Trend",
    description: "Price distance from EMA as percentage.",
    parameters: [PERIOD_20],
    compatibleOperators: OSCILLATOR_OPS,
  },
  {
    key: "EMA_SLOPE",
    label: "EMA Slope",
    category: "Trend",
    description: "EMA slope over N bars.",
    parameters: [
      PERIOD_20,
      { key: "bars", label: "Bars", type: "integer", defaultValue: 3, min: 1, max: 50, step: 1 },
    ],
    compatibleOperators: ["greater_than", "less_than", "rising", "falling"],
  },
]);

const INDICATOR_MAP = new Map<IndicatorKey, IndicatorDefinition>(
  INDICATORS.map((ind) => [ind.key, ind]),
);

export function getIndicator(key: IndicatorKey): IndicatorDefinition | undefined {
  return INDICATOR_MAP.get(key);
}

export function getIndicatorsByCategory(
  category: IndicatorDefinition["category"],
): IndicatorDefinition[] {
  return INDICATORS.filter((ind) => ind.category === category);
}

export const INDICATOR_CATEGORIES: IndicatorDefinition["category"][] = [
  "Trend",
  "Momentum",
  "Volatility",
  "Volume",
  "Price Action",
];
