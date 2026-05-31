-- XOLID Risk Engine & Live Trading Gate
-- Run in Supabase SQL Editor. Service role bypasses RLS.

CREATE TABLE IF NOT EXISTS public.risk_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
  max_total_live_capital_usdc numeric NOT NULL DEFAULT 0,
  max_capital_per_bot_usdc numeric NOT NULL DEFAULT 0,
  max_capital_per_trade_usdc numeric NOT NULL DEFAULT 0,
  max_open_live_trades integer NOT NULL DEFAULT 0,
  max_daily_loss_usdc numeric NOT NULL DEFAULT 0,
  live_trading_enabled boolean NOT NULL DEFAULT false,
  paper_trading_enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT risk_settings_user_id_unique UNIQUE (user_id),
  CONSTRAINT risk_settings_max_open_live_trades_nonneg CHECK (max_open_live_trades >= 0)
);

CREATE INDEX IF NOT EXISTS risk_settings_user_id_idx ON public.risk_settings (user_id);

CREATE TABLE IF NOT EXISTS public.system_risk_state (
  id text PRIMARY KEY DEFAULT 'global',
  global_kill_switch_enabled boolean NOT NULL DEFAULT true,
  live_trading_globally_enabled boolean NOT NULL DEFAULT false,
  reason text NULL,
  updated_by uuid NULL REFERENCES public.users (id) ON DELETE SET NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT system_risk_state_singleton CHECK (id = 'global')
);

INSERT INTO public.system_risk_state (
  id,
  global_kill_switch_enabled,
  live_trading_globally_enabled,
  reason
)
VALUES ('global', true, false, 'Live trading locked by default')
ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.risk_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_risk_state ENABLE ROW LEVEL SECURITY;
