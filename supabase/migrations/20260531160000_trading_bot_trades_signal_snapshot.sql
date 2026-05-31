-- Store custom strategy evaluation snapshot on paper trades
ALTER TABLE public.trading_bot_trades
  ADD COLUMN IF NOT EXISTS signal_snapshot jsonb NULL;
