-- XOLID Users & RBAC
-- Run in Supabase SQL Editor. Service role bypasses RLS.

CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text NOT NULL,
  email text NOT NULL,
  password_hash text NULL,
  role text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  last_login_at timestamptz NULL,
  CONSTRAINT users_username_unique UNIQUE (username),
  CONSTRAINT users_email_unique UNIQUE (email),
  CONSTRAINT users_role_check CHECK (role IN ('SUPER_ADMIN', 'ADMIN', 'TRADER'))
);

CREATE INDEX IF NOT EXISTS users_username_idx ON public.users (username);
CREATE INDEX IF NOT EXISTS users_role_idx ON public.users (role);

-- Seed bootstrap super admin (password via env fallback until set in DB)
INSERT INTO public.users (username, email, role, is_active, password_hash)
VALUES ('cristian', 'cristian@xolid.local', 'SUPER_ADMIN', true, NULL)
ON CONFLICT (username) DO NOTHING;

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Link bots & strategies to owners
ALTER TABLE public.trading_bots
  DROP CONSTRAINT IF EXISTS trading_bots_user_id_fkey;

ALTER TABLE public.trading_bots
  ADD CONSTRAINT trading_bots_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.users (id) ON DELETE SET NULL;

ALTER TABLE public.custom_strategies
  ADD COLUMN IF NOT EXISTS user_id uuid NULL REFERENCES public.users (id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS trading_bots_user_id_idx ON public.trading_bots (user_id);
CREATE INDEX IF NOT EXISTS custom_strategies_user_id_idx ON public.custom_strategies (user_id);
