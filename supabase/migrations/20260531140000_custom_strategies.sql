-- XOLID Custom Strategies — builder definitions (paper mode, no execution)
-- Run in Supabase SQL Editor. Service role (server) bypasses RLS.

CREATE TABLE IF NOT EXISTS public.custom_strategies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NULL,
  definition jsonb NOT NULL,
  status text NOT NULL DEFAULT 'DRAFT',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT custom_strategies_status_check CHECK (status IN ('DRAFT', 'ACTIVE', 'ARCHIVED'))
);

CREATE INDEX IF NOT EXISTS custom_strategies_updated_at_idx
  ON public.custom_strategies (updated_at DESC);

ALTER TABLE public.custom_strategies ENABLE ROW LEVEL SECURITY;

-- No policies: anon/authenticated blocked; service role used server-side only.
