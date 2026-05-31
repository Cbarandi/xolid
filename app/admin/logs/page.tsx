import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuditLogsFilters } from "@/components/audit/AuditLogsFilters";
import {
  privateTableClass,
  privateTableWrapClass,
  privateTdClass,
  privateThClass,
} from "@/components/private/styles";
import { listAuditLogs } from "@/lib/audit/db";
import { auditEventLabel, formatAuditEntity } from "@/lib/audit/labels";
import { AUDIT_EVENT_TYPES, type AuditEventType } from "@/lib/audit/types";
import { getPrivateSession } from "@/lib/auth/private-session";
import { requireSuperAdmin } from "@/lib/auth/rbac";
import { listUsers } from "@/lib/auth/users-db";

export const metadata: Metadata = {
  title: "Audit Logs — Admin — XOLID",
  robots: { index: false, follow: false },
};

type Props = {
  searchParams: Promise<{
    dateFrom?: string;
    dateTo?: string;
    userId?: string;
    eventType?: string;
  }>;
};

function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "medium",
  });
}

function parseEventType(value: string | undefined): AuditEventType | undefined {
  if (!value) return undefined;
  return AUDIT_EVENT_TYPES.includes(value as AuditEventType)
    ? (value as AuditEventType)
    : undefined;
}

export default async function AdminAuditLogsPage({ searchParams }: Props) {
  const session = await getPrivateSession();
  if (!session) redirect("/login");
  requireSuperAdmin(session);

  const params = await searchParams;
  const dateFrom = params.dateFrom?.trim() || undefined;
  const dateTo = params.dateTo?.trim() || undefined;
  const userId = params.userId?.trim() || undefined;
  const eventType = parseEventType(params.eventType?.trim());

  let logs: Awaited<ReturnType<typeof listAuditLogs>> = [];
  let users: Awaited<ReturnType<typeof listUsers>> = [];
  let loadError: string | null = null;

  try {
    [logs, users] = await Promise.all([
      listAuditLogs({ dateFrom, dateTo, userId, eventType }),
      listUsers(),
    ]);
  } catch {
    loadError = "Unable to load audit logs. Run the audit_logs migration in Supabase.";
  }

  return (
    <main className="min-h-screen bg-black text-white antialiased">
      <div className="mx-auto flex min-h-screen w-full max-w-[1400px] flex-col px-6 sm:px-10 lg:px-16">
        <section className="pb-14 pt-6 sm:pb-20 sm:pt-8 lg:pb-24">
          <p className="text-[10px] font-medium uppercase tracking-[0.42em] text-white/40">
            <Link href="/admin" className="transition hover:text-white/70">
              Admin
            </Link>
            <span className="mx-2 text-white/22">/</span>
            <span className="text-white/55">Audit Logs</span>
          </p>
          <p className="mt-6 text-[10px] font-medium uppercase tracking-[0.38em] text-white/34">
            Security
          </p>
          <h1 className="mt-4 text-[40px] font-medium leading-[0.96] tracking-[-0.04em] text-white sm:text-[56px]">
            System audit
          </h1>
          <div className="mt-8 h-px w-14 bg-white/18" />
          <p className="mt-8 max-w-[560px] text-[15px] leading-relaxed tracking-[-0.01em] text-white/46 sm:text-[16px]">
            Immutable trail of critical actions across users, bots, strategies, exchange accounts,
            and authentication. Super Admin only.
          </p>

          <AuditLogsFilters
            users={users.map((u) => ({ id: u.id, username: u.username }))}
            initial={{ dateFrom, dateTo, userId, eventType }}
          />

          {loadError ? (
            <p className="mt-8 text-[13px] text-red-300/85" role="alert">
              {loadError}
            </p>
          ) : null}

          {logs.length === 0 && !loadError ? (
            <div className="mt-10 rounded-[28px] border border-white/10 bg-white/[0.02] px-6 py-12">
              <p className="text-[14px] text-white/45">No audit records match your filters.</p>
            </div>
          ) : null}

          {logs.length > 0 ? (
            <>
              <ul className="mt-8 space-y-3 lg:hidden">
                {logs.map((log) => (
                  <li
                    key={log.id}
                    className="rounded-[20px] border border-white/10 bg-white/[0.02] px-5 py-4"
                  >
                    <p className="text-[12px] text-white/42">{formatTimestamp(log.createdAt)}</p>
                    <p className="mt-2 text-[14px] font-medium text-white/88">
                      {auditEventLabel(log.eventType)}
                    </p>
                    <p className="mt-1 text-[13px] text-white/55">
                      {log.username ?? "System / unknown"}
                    </p>
                    <p className="mt-2 text-[12px] text-white/40">
                      {formatAuditEntity(log.entityType, log.entityId, log.metadata)}
                    </p>
                  </li>
                ))}
              </ul>

              <div className={`${privateTableWrapClass} mt-8 hidden lg:block`}>
                <table className={privateTableClass}>
                  <thead>
                    <tr>
                      <th className={privateThClass}>Timestamp</th>
                      <th className={privateThClass}>User</th>
                      <th className={privateThClass}>Action</th>
                      <th className={privateThClass}>Entity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => (
                      <tr key={log.id}>
                        <td className={privateTdClass}>{formatTimestamp(log.createdAt)}</td>
                        <td className={privateTdClass}>{log.username ?? "—"}</td>
                        <td className={privateTdClass}>{auditEventLabel(log.eventType)}</td>
                        <td className={privateTdClass}>
                          {formatAuditEntity(log.entityType, log.entityId, log.metadata)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : null}
        </section>
      </div>
    </main>
  );
}
