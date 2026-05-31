-- XOLID Audit Logs
-- Run in Supabase SQL Editor. Service role bypasses RLS.

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NULL REFERENCES public.users (id) ON DELETE SET NULL,
  event_type text NOT NULL,
  entity_type text NULL,
  entity_id text NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT audit_logs_event_type_check CHECK (
    event_type IN (
      'USER_CREATED',
      'USER_UPDATED',
      'USER_DISABLED',
      'BOT_CREATED',
      'BOT_UPDATED',
      'BOT_STARTED',
      'BOT_PAUSED',
      'BOT_STOPPED',
      'STRATEGY_CREATED',
      'STRATEGY_UPDATED',
      'BINANCE_ACCOUNT_CREATED',
      'BINANCE_ACCOUNT_UPDATED',
      'BINANCE_ACCOUNT_VALIDATED',
      'LOGIN_SUCCESS',
      'LOGIN_FAILURE',
      'LOGOUT'
    )
  )
);

CREATE INDEX IF NOT EXISTS audit_logs_created_at_idx ON public.audit_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS audit_logs_user_id_idx ON public.audit_logs (user_id);
CREATE INDEX IF NOT EXISTS audit_logs_event_type_idx ON public.audit_logs (event_type);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
