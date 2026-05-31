-- XOLID Trading Bots — custom strategy references
-- Run after custom_strategies migration. Service role bypasses RLS.

ALTER TABLE public.trading_bots
  DROP CONSTRAINT IF EXISTS trading_bots_strategy_key_check;

ALTER TABLE public.trading_bots
  ADD COLUMN IF NOT EXISTS strategy_source text NOT NULL DEFAULT 'SYSTEM',
  ADD COLUMN IF NOT EXISTS custom_strategy_id uuid NULL REFERENCES public.custom_strategies(id),
  ADD COLUMN IF NOT EXISTS strategy_name text NULL;

UPDATE public.trading_bots
SET strategy_name = strategy_key
WHERE strategy_name IS NULL AND strategy_key IS NOT NULL;

ALTER TABLE public.trading_bots
  ALTER COLUMN strategy_key DROP NOT NULL;

ALTER TABLE public.trading_bots
  DROP CONSTRAINT IF EXISTS trading_bots_strategy_source_check;

ALTER TABLE public.trading_bots
  ADD CONSTRAINT trading_bots_strategy_source_check
    CHECK (strategy_source IN ('SYSTEM', 'CUSTOM'));

ALTER TABLE public.trading_bots
  DROP CONSTRAINT IF EXISTS trading_bots_system_strategy_check;

ALTER TABLE public.trading_bots
  ADD CONSTRAINT trading_bots_system_strategy_check
    CHECK (strategy_source <> 'SYSTEM' OR strategy_key IS NOT NULL);

ALTER TABLE public.trading_bots
  DROP CONSTRAINT IF EXISTS trading_bots_custom_strategy_check;

ALTER TABLE public.trading_bots
  ADD CONSTRAINT trading_bots_custom_strategy_check
    CHECK (strategy_source <> 'CUSTOM' OR custom_strategy_id IS NOT NULL);

ALTER TABLE public.trading_bots
  ADD CONSTRAINT trading_bots_strategy_key_check
    CHECK (strategy_key IS NULL OR strategy_key IN ('BITE_CCI_V1', 'CONTINENTAL_V1'));

CREATE INDEX IF NOT EXISTS trading_bots_custom_strategy_id_idx
  ON public.trading_bots (custom_strategy_id)
  WHERE custom_strategy_id IS NOT NULL;
