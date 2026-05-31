import type { Metadata } from "next";
import { PrivateAppShell } from "@/components/private/PrivateAppShell";
import { GlobalRiskControls } from "@/components/risk/GlobalRiskControls";
import { LiveReadinessChecklist } from "@/components/risk/LiveReadinessChecklist";
import { UserRiskSettingsForm } from "@/components/risk/UserRiskSettingsForm";
import { privateSectionLabelClass } from "@/components/private/styles";
import { getPageScope } from "@/lib/auth/page-scope";
import { requireAdminOrAbove } from "@/lib/auth/rbac";
import { listUsers } from "@/lib/auth/users-db";
import { getLiveReadinessForUser } from "@/lib/risk/checks";
import { getSystemRiskState, getUserRiskSettings } from "@/lib/risk/db";

export const metadata: Metadata = {
  title: "Risk — XOLID",
  robots: { index: false, follow: false },
};

type Props = {
  searchParams: Promise<{ userId?: string }>;
};

export default async function RiskPage({ searchParams }: Props) {
  const { session } = await getPageScope();
  requireAdminOrAbove(session);

  const params = await searchParams;
  let users: Awaited<ReturnType<typeof listUsers>> = [];
  let loadError: string | null = null;

  try {
    users = await listUsers();
  } catch {
    loadError = "Unable to load users. Run the risk_engine migration in Supabase.";
  }

  const selectedUserId =
    params.userId?.trim() ||
    session.userId ||
    users[0]?.id ||
    "";

  if (!selectedUserId && session.role !== "TRADER") {
    /* admin without users yet */
  }

  let system = await getSystemRiskState().catch(() => null);
  let userSettings = null;
  let readiness: Awaited<ReturnType<typeof getLiveReadinessForUser>> = [];

  if (selectedUserId) {
    try {
      [userSettings, readiness] = await Promise.all([
        getUserRiskSettings(selectedUserId),
        getLiveReadinessForUser(selectedUserId),
      ]);
    } catch {
      if (!loadError) {
        loadError = "Unable to load risk settings. Run the risk_engine migration in Supabase.";
      }
    }
  }

  if (!system) {
    loadError = loadError ?? "Unable to load system risk state.";
    system = {
      id: "global",
      globalKillSwitchEnabled: true,
      liveTradingGloballyEnabled: false,
      reason: "Live trading locked by default",
      updatedBy: null,
      updatedAt: new Date().toISOString(),
    };
  }

  const canEditGlobal = session.role === "SUPER_ADMIN";

  return (
    <PrivateAppShell title="Risk">
      <div>
        <p className="text-[10px] font-medium uppercase tracking-[0.38em] text-white/34">Safety</p>
        <h2 className="mt-3 text-[28px] font-medium tracking-[-0.04em] text-white sm:text-[36px]">
          Risk engine
        </h2>
        <p className="mt-4 max-w-[560px] text-[14px] leading-relaxed text-white/48">
          Hard gates for future live trading. Default state blocks all live activity. Paper trading
          continues unless disabled per user. XOLID does not place real Binance orders.
        </p>
      </div>

      {loadError ? (
        <p className="mt-8 text-[13px] text-red-300/85" role="alert">
          {loadError}
        </p>
      ) : null}

      <section className="mt-10 rounded-[28px] border border-white/10 bg-white/[0.02] px-6 py-6 sm:px-8">
        <p className={privateSectionLabelClass}>Global risk controls</p>
        <GlobalRiskControls system={system} canEdit={canEditGlobal} />
      </section>

      <section className="mt-6 rounded-[28px] border border-white/10 bg-white/[0.02] px-6 py-6 sm:px-8">
        <p className={privateSectionLabelClass}>User risk settings</p>
        {users.length > 0 && selectedUserId && userSettings ? (
          <UserRiskSettingsForm
            users={users.map((u) => ({ id: u.id, username: u.username }))}
            selectedUserId={selectedUserId}
            settings={userSettings}
          />
        ) : (
          <p className="mt-4 text-[13px] text-white/42">No users available for risk configuration.</p>
        )}
      </section>

      <section className="mt-6 rounded-[28px] border border-white/10 bg-white/[0.02] px-6 py-6 sm:px-8">
        <p className={privateSectionLabelClass}>Live readiness checklist</p>
        <p className="mt-3 max-w-[560px] text-[13px] leading-relaxed text-white/45">
          All items must pass before LIVE bots could operate in a future release.
        </p>
        {selectedUserId ? (
          <LiveReadinessChecklist items={readiness} />
        ) : (
          <p className="mt-4 text-[13px] text-white/42">Select a user to view readiness.</p>
        )}
      </section>
    </PrivateAppShell>
  );
}
