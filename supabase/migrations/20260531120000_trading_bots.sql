-- XOLID Trading Bots v0 — paper mode only
-- Run in Supabase SQL Editor. Service role (server) bypasses RLS.

-- =============================================================================
-- trading_bots
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.trading_bots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NULL,
  name text NOT NULL,
  strategy_key text NOT NULL,
  mode text NOT NULL DEFAULT 'PAPER',
  side text NOT NULL,
  symbols text[] NOT NULL DEFAULT '{}',
  capital_per_trade numeric NOT NULL,
  max_open_trades integer NOT NULL,
  take_profit_pct numeric NOT NULL,
  stop_loss_pct numeric NOT NULL,
  timeout_minutes integer NOT NULL,
  status text NOT NULL DEFAULT 'DRAFT',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT trading_bots_mode_check CHECK (mode IN ('PAPER')),
  CONSTRAINT trading_bots_side_check CHECK (side IN ('LONG', 'SHORT')),
  CONSTRAINT trading_bots_status_check CHECK (status IN ('DRAFT', 'ACTIVE', 'PAUSED', 'STOPPED')),
  CONSTRAINT trading_bots_strategy_key_check CHECK (strategy_key IN ('BITE_CCI_V1', 'CONTINENTAL_V1')),
  CONSTRAINT trading_bots_capital_positive CHECK (capital_per_trade > 0),
  CONSTRAINT trading_bots_max_open_positive CHECK (max_open_trades > 0),
  CONSTRAINT trading_bots_tp_positive CHECK (take_profit_pct > 0),
  CONSTRAINT trading_bots_sl_positive CHECK (stop_loss_pct > 0),
  CONSTRAINT trading_bots_timeout_positive CHECK (timeout_minutes > 0)
);

CREATE INDEX IF NOT EXISTS trading_bots_created_at_idx ON public.trading_bots (created_at DESC);

-- =============================================================================
-- trading_bot_trades
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.trading_bot_trades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bot_id uuid NOT NULL REFERENCES public.trading_bots (id) ON DELETE CASCADE,
  symbol text NOT NULL,
  side text NOT NULL,
  entry_price numeric,
  exit_price numeric,
  quantity numeric,
  status text NOT NULL DEFAULT 'OPEN',
  opened_at timestamptz,
  closed_at timestamptz,
  pnl_quote numeric,
  pnl_pct numeric,
  exit_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT trading_bot_trades_side_check CHECK (side IN ('LONG', 'SHORT')),
  CONSTRAINT trading_bot_trades_status_check CHECK (status IN ('OPEN', 'CLOSED', 'CANCELLED')),
  CONSTRAINT trading_bot_trades_exit_reason_check CHECK (
    exit_reason IS NULL OR exit_reason IN ('TP', 'SL', 'TIMEOUT', 'MANUAL')
  )
);

CREATE INDEX IF NOT EXISTS trading_bot_trades_bot_id_idx ON public.trading_bot_trades (bot_id);

-- =============================================================================
-- RLS: enabled, no policies (server service role only for now)
-- =============================================================================

ALTER TABLE public.trading_bots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trading_bot_trades ENABLE ROW LEVEL SECURITY;
