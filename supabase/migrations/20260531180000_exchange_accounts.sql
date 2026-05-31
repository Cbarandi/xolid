-- XOLID Exchange Accounts (Binance credentials, encrypted at rest)
-- Run in Supabase SQL Editor. Service role bypasses RLS.

CREATE TABLE IF NOT EXISTS public.exchange_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
  exchange text NOT NULL,
  account_name text NOT NULL,
  api_key_encrypted text NOT NULL,
  api_secret_encrypted text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  validation_status text NULL,
  last_validated_at timestamptz NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT exchange_accounts_exchange_check CHECK (exchange IN ('BINANCE')),
  CONSTRAINT exchange_accounts_validation_status_check CHECK (
    validation_status IS NULL OR validation_status IN ('CONNECTED', 'FAILED')
  )
);

CREATE INDEX IF NOT EXISTS exchange_accounts_user_id_idx ON public.exchange_accounts (user_id);
CREATE INDEX IF NOT EXISTS exchange_accounts_exchange_idx ON public.exchange_accounts (exchange);

ALTER TABLE public.exchange_accounts ENABLE ROW LEVEL SECURITY;
