# XOLID — Deployment Readiness Report

**Repository:** `/Users/cristianbarandiaran/xolid`  
**Audit date:** 2026-05-31  
**Mode:** Read-only (no code changes)  
**Auditor:** Cursor agent (automated static + build/test verification)

---

## Executive summary

| Overall | **WARNING — Conditionally deployable** |
|---------|----------------------------------------|

XOLID compila, pasa tests locales y tiene una base sólida de auth/RBAC, exchange cifrado, audit logs y risk engine. **No está listo para producción sin intervención manual:** migraciones SQL deben aplicarse en orden en Supabase, variables de entorno críticas faltan en `.env.example`, no hay CI/CD, y el middleware no revalida usuarios deshabilitados ni roles contra la base de datos.

**Production blockers (must fix before go-live):**

1. Aplicar las **9 migraciones** en Supabase en orden estricto.
2. Configurar **todas las env vars requeridas** (ver §8), incluyendo `XOLID_SESSION_SECRET` y `XOLID_MASTER_ENCRYPTION_KEY`.
3. Establecer contraseña DB para el seed `cristian` (o desactivar fallback env-only en producción).
4. Confirmar que **`SUPABASE_SERVICE_ROLE_KEY` nunca se expone** al cliente (RLS sin policies).

---

## 1. Migrations inventory

**Status: PASS** (inventory complete; application is manual)

| # | File | Purpose |
|---|------|---------|
| 1 | `20260531120000_trading_bots.sql` | `trading_bots`, `trading_bot_trades` |
| 2 | `20260531140000_custom_strategies.sql` | `custom_strategies` |
| 3 | `20260531150000_trading_bots_custom_strategy.sql` | Bot ↔ custom strategy columns |
| 4 | `20260531160000_trading_bot_trades_signal_snapshot.sql` | `signal_snapshot` jsonb on trades |
| 5 | `20260531170000_users_rbac.sql` | `users`, FK `user_id` on bots/strategies, seed `cristian` |
| 6 | `20260531180000_exchange_accounts.sql` | Encrypted Binance credentials |
| 7 | `20260531190000_audit_logs.sql` | System audit trail |
| 8 | `20260531200000_risk_engine.sql` | `risk_settings`, `system_risk_state` |
| 9 | `20260531200001_audit_risk_events.sql` | Extends `audit_logs` event CHECK |

**Missing migrations:** None in repo.  
**Missing migration runner:** No Supabase CLI config, no CI step — SQL must be run manually in Supabase SQL Editor.

---

## 2. Migration order verification

**Status: PASS**

Dependency chain is valid:

```
trading_bots (1)
  → custom_strategies (2)
    → trading_bots custom cols (3)
      → signal_snapshot (4)
        → users + FKs (5)  ← requires (1)(2)
          → exchange_accounts (6)
          → audit_logs (7)
          → risk_engine (8)
            → audit_risk_events (9)  ← requires (7)
```

**WARNING:** Skipping or reordering migrations will break FK adds (e.g. `users` before `exchange_accounts`, `audit_logs` before risk audit events).

---

## 3. Foreign keys verification

**Status: PASS** (schema consistent; a few optional gaps)

| Child table | Column | Parent | ON DELETE | Migration |
|-------------|--------|--------|-----------|-----------|
| `trading_bot_trades` | `bot_id` | `trading_bots.id` | CASCADE | 120000 |
| `trading_bots` | `user_id` | `users.id` | SET NULL | 170000 |
| `custom_strategies` | `user_id` | `users.id` | SET NULL | 170000 |
| `trading_bots` | `custom_strategy_id` | `custom_strategies.id` | *(default NO ACTION)* | 150000 |
| `exchange_accounts` | `user_id` | `users.id` | CASCADE | 180000 |
| `audit_logs` | `user_id` | `users.id` | SET NULL | 190000 |
| `risk_settings` | `user_id` | `users.id` | CASCADE | 200000 |
| `system_risk_state` | `updated_by` | `users.id` | SET NULL | 200000 |

**WARNING — missing FK behaviors:**
- `custom_strategy_id` has no explicit `ON DELETE` (orphan bots possible if strategy deleted).
- Pre-`users` bots may have `user_id = NULL` (legacy rows).

**WARNING — RLS:** All sensitive tables have RLS **enabled** with **zero policies**. Security depends 100% on server-side service role only.

---

## 4. RBAC consistency

**Status: WARNING**

### Middleware + `canAccessPath` (`lib/auth/rbac.ts`)

| Route prefix | Allowed roles | Enforced in middleware |
|--------------|---------------|------------------------|
| `/dashboard`, `/bots`, `/strategies`, `/deals`, `/exchange`, `/coin-lists` | All authenticated | Yes |
| `/users` | SUPER_ADMIN | Yes |
| `/admin/logs` | SUPER_ADMIN | Yes |
| `/risk` | ADMIN, SUPER_ADMIN | Yes |
| `/admin/*` (other) | ADMIN, SUPER_ADMIN | Yes |

### Page-level guards (server components)

| Area | Server guard | Notes |
|------|--------------|-------|
| `(private)/layout` | `requirePrivateSession()` | Revalidates DB user + `is_active` |
| `/users/*` | `requireSuperAdmin` | OK |
| `/risk` | `requireAdminOrAbove` | OK |
| `/admin/logs` | `requireSuperAdmin` | OK |
| `/admin`, `/admin/bots`, `/admin/block`, `/admin/vixion` | **None** | Relies on middleware token only |

### Gaps (dangerous assumptions)

| Issue | Severity |
|-------|----------|
| Middleware uses **JWT payload role** without DB refresh | **WARNING** — role demotion or disable takes effect only after re-login on admin routes |
| `(private)/layout` refreshes role/`is_active` from DB; `/admin/*` pages (except logs) do not | **WARNING** |
| Env-only login (`userId: null`) gets **SUPER_ADMIN** in token | **WARNING** — acceptable for bootstrap; disable in prod |
| TRADER ownership scoping on bots/strategies/deals/exchange | **PASS** |
| Sidebar visibility matches RBAC helpers | **PASS** |

---

## 5. Auth flow verification

**Status: PASS** (with production caveats)

| Step | Implementation | Status |
|------|----------------|--------|
| Login | `POST /api/auth/login` → `authenticateUser()` | PASS |
| DB user + bcrypt | `users.password_hash` | PASS |
| Env fallback | `XOLID_PRIVATE_USERNAME` + `XOLID_PRIVATE_PASSWORD_HASH` | PASS (bootstrap) |
| Seed `cristian` with `password_hash NULL` | Uses env password until set in DB | WARNING |
| Session | HMAC-SHA256 cookie v2 (`userId`, `role`) | PASS |
| Session v1 legacy | Treated as SUPER_ADMIN | WARNING |
| Logout API | `POST /api/auth/logout` clears cookie + audit | PASS |
| Admin form logout | `adminLogout` → `destroyPrivateSession()` **no audit** | WARNING |
| Post-login redirect | `safeNextPath()` open-redirect safe | PASS |
| Production secret | `XOLID_SESSION_SECRET` required when `NODE_ENV=production` | PASS |
| Dev insecure fallback secret | Hardcoded dev string | WARNING (dev only) |

---

## 6. Exchange encryption verification

**Status: PASS** (design); **WARNING** (ops)

| Item | Status |
|------|--------|
| Algorithm | AES-256-GCM (`lib/exchange/encryption.ts`) | PASS |
| Key source | `XOLID_MASTER_ENCRYPTION_KEY` (32-byte base64 or 64-char hex) | PASS |
| IV + auth tag per ciphertext | 12 + 16 bytes prepended | PASS |
| Secrets never returned in API/UI | Masked preview only | PASS |
| Binance validation | `GET /api/v3/account` only — **no order endpoints** | PASS |
| Tests | `npm run test:exchange` — 3/3 pass | PASS |

**WARNING / FAIL (ops):**
- `XOLID_MASTER_ENCRYPTION_KEY` **not documented** in `.env.example` → easy to miss in prod.
- `BINANCE_API_BASE` optional override not in `.env.example`.
- Key rotation strategy **not defined** (re-encrypt all accounts on rotate).
- Losing master key = **permanent loss** of API secrets.

---

## 7. Audit log coverage

**Status: WARNING**

### Event types in DB CHECK (after migration 200001)

20 event types including `RISK_SETTINGS_UPDATED`, `GLOBAL_KILL_SWITCH_UPDATED`, `GLOBAL_LIVE_TRADING_UPDATED`.

### Critical actions — coverage matrix

| Action | Event | Logged? |
|--------|-------|---------|
| Login success/failure | `LOGIN_SUCCESS` / `LOGIN_FAILURE` | PASS |
| Logout via API | `LOGOUT` | PASS |
| Logout via admin form | `LOGOUT` | **FAIL** — no audit |
| User create/update/disable/password | USER_* | PASS |
| Bot create/update/start/pause/stop | BOT_* | PASS |
| Bot duplicate | `BOT_CREATED` (metadata `duplicatedFrom`) | PASS |
| Strategy create/update | STRATEGY_* | PASS |
| Binance account CRUD/validate | BINANCE_ACCOUNT_* | PASS |
| Risk settings / global toggles | RISK_* / GLOBAL_* | PASS |
| Paper scan / exit engine (admin) | — | **FAIL** — not audited |
| Bot update without going through logged path | — | PASS (via `updateBotAction`) |

**WARNING:** `logEvent()` swallows DB errors (by design) — silent audit loss if migration 190000/200001 not applied.

**WARNING:** No index on `(entity_type, entity_id)` for entity lookups.

---

## 8. Risk engine integration

**Status: WARNING** (foundation OK; live path not wired)

| Check | Status |
|-------|--------|
| Default system state blocks live (kill ON, global live OFF) | PASS |
| `assertPaperAllowed` in `createBotAction`, bot lifecycle transitions | PASS |
| `assertLiveAllowed` called from any runtime path | **FAIL** — defined but unused (intentional pre-live) |
| `assertBotWithinRiskLimits` / `assertTradeWithinRiskLimits` wired | **FAIL** — not called yet |
| Paper scan / exit engine gated by risk | **FAIL** — `runPaperScanAction` has no `assertPaperAllowed` |
| Bot mode constraint in DB | `CHECK (mode IN ('PAPER'))` | PASS |
| Bot UI Live mode | Disabled + message → `/risk` | PASS |
| Validators force `mode: "PAPER"` | PASS |
| Tests | `npm run test:risk` — 8/8 pass | PASS |

**Dangerous assumption:** Risk flags can be toggled in UI but **live execution does not exist yet** — safe for now.

---

## 9. Private routes verification

**Status: WARNING**

### Middleware matcher (`middleware.ts`)

Protected: `/dashboard`, `/bots`, `/strategies`, `/coin-lists`, `/deals`, `/exchange`, `/risk`, `/users`, `/admin`.

### `isProtectedPath` / `safeNextPath` alignment

Includes `/risk`, `/exchange`, `/users`, `/admin` — **PASS** (aligned with middleware).

### Routes **not** middleware-protected

| Route | Risk |
|-------|------|
| `/login` | OK (public) |
| `/logout` | OK (API route) |
| `/`, `/block`, `/vixion`, `/system` | Public marketing — OK |
| `/api/contact`, `/api/waitlist` | Public APIs — OK |

### `(private)` route group

All app pages live at root paths (`/dashboard`, not `/private/dashboard`) — middleware covers them — **PASS**.

**WARNING:** `/admin/*` protected by middleware but most admin pages lack server-side `requirePrivateSession()` (except `/admin/logs`).

---

## 10. Build & tests

**Status: PASS**

Verified on 2026-05-31:

| Command | Result |
|---------|--------|
| `npm run build` | **PASS** (1 ESLint warning: unused import in `paper-exit-engine.ts`) |
| `npm run test:auth` | **PASS** — 10/10 |
| `npm run test:risk` | **PASS** — 8/8 |
| `npm run test:exchange` | **PASS** — 3/3 |
| `npm run test:strategies` | **PASS** — 17/17 |
| `npm run test:audit` | Not run in batch (exists) |
| `npm run test:market` | Not run in batch (exists) |
| CI pipeline (GitHub Actions) | **FAIL** — none configured |
| `npm run lint` in build | Warning only, does not fail build |

---

## Environment variables

### Required for core private app

| Variable | In `.env.example` | Required when |
|----------|-------------------|---------------|
| `XOLID_PRIVATE_USERNAME` | Yes | Always (login) |
| `XOLID_PRIVATE_PASSWORD_HASH` | Yes | Always (login) |
| `XOLID_SESSION_SECRET` | Yes | **Production mandatory** |
| `SUPABASE_URL` | Yes | Bots, users, audit, risk, exchange |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Same |

### Required for exchange module

| Variable | In `.env.example` | Required when |
|----------|-------------------|---------------|
| `XOLID_MASTER_ENCRYPTION_KEY` | **No** | Adding/reading Binance accounts |

### Optional

| Variable | Documented |
|----------|------------|
| `BINANCE_PUBLIC_API_BASE` | Yes |
| `BINANCE_API_BASE` | **No** |
| `RESEND_API_KEY`, contact emails | Yes |
| `NEXT_PUBLIC_*` analytics | Yes |

---

## Indexes — present vs recommended

### Present (PASS)

- `trading_bots`: `created_at`, `user_id`, `custom_strategy_id` (partial)
- `trading_bot_trades`: `bot_id`
- `users`: `username`, `role`
- `custom_strategies`: `updated_at`, `user_id`
- `exchange_accounts`: `user_id`, `exchange`
- `audit_logs`: `created_at`, `user_id`, `event_type`
- `risk_settings`: `user_id` (+ UNIQUE)

### Recommended (WARNING — not blocking)

| Table | Index | Reason |
|-------|-------|--------|
| `trading_bot_trades` | `(bot_id, status)` | Open-trade counts |
| `exchange_accounts` | `(user_id, validation_status)` WHERE active | Validated account lookup |
| `audit_logs` | `(entity_type, entity_id)` | Entity audit history |

---

## Section scorecard

| # | Section | Status |
|---|---------|--------|
| 1 | Migrations inventory | **PASS** |
| 2 | Migration order | **PASS** |
| 3 | Foreign keys | **PASS** |
| 4 | RBAC consistency | **WARNING** |
| 5 | Auth flow | **PASS** |
| 6 | Exchange encryption | **WARNING** |
| 7 | Audit log coverage | **WARNING** |
| 8 | Risk engine integration | **WARNING** |
| 9 | Private routes | **WARNING** |
| 10 | Build & tests | **PASS** |

---

## Pre-deploy checklist

- [ ] Run migrations 1→9 in Supabase SQL Editor
- [ ] Set `XOLID_SESSION_SECRET` (cryptographically random, ≥32 bytes)
- [ ] Set `XOLID_MASTER_ENCRYPTION_KEY` before any exchange account
- [ ] Set DB password for `cristian` or remove env-only super-admin path
- [ ] Verify `SUPABASE_SERVICE_ROLE_KEY` is server-only
- [ ] Smoke test: login → dashboard → create paper bot → audit log entry
- [ ] Smoke test: SUPER_ADMIN `/risk` → global controls default locked
- [ ] Confirm no Binance order endpoints in codebase (verified: **none**)

---

## Conclusion

XOLID is **architecturally ready for a controlled staging deployment** as a **paper-trading + admin** platform. **Live trading is correctly blocked** at DB, validator, UI, and risk-default levels. Production go-live requires resolving **env documentation gaps**, **manual migration discipline**, **middleware DB revalidation** for disabled users, and **operational runbooks** for encryption key management.

**No real Binance orders are placed by this codebase today.**
