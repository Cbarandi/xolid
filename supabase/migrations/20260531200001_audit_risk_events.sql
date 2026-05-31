-- Extend audit_logs for risk engine events

ALTER TABLE public.audit_logs DROP CONSTRAINT IF EXISTS audit_logs_event_type_check;

ALTER TABLE public.audit_logs ADD CONSTRAINT audit_logs_event_type_check CHECK (
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
    'LOGOUT',
    'RISK_SETTINGS_UPDATED',
    'GLOBAL_KILL_SWITCH_UPDATED',
    'GLOBAL_LIVE_TRADING_UPDATED'
  )
);
