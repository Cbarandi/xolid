import type { Metadata } from "next";
import Link from "next/link";
import { PrivateAppShell } from "@/components/private/PrivateAppShell";
import {
  privatePrimaryButtonClass,
  privateTableClass,
  privateTableWrapClass,
  privateTdClass,
  privateThClass,
} from "@/components/private/styles";
import { getPageScope } from "@/lib/auth/page-scope";
import { requireSuperAdmin, roleLabel } from "@/lib/auth/rbac";
import { listUsers } from "@/lib/auth/users-db";

export const metadata: Metadata = {
  title: "Users — XOLID",
  robots: { index: false, follow: false },
};

function formatWhen(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default async function UsersPage() {
  const { session } = await getPageScope();
  requireSuperAdmin(session);

  let users: Awaited<ReturnType<typeof listUsers>> = [];
  let loadError: string | null = null;

  try {
    users = await listUsers();
  } catch {
    loadError = "Unable to load users. Run the users_rbac migration in Supabase.";
  }

  return (
    <PrivateAppShell title="Users">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.38em] text-white/34">
            Administration
          </p>
          <h2 className="mt-3 text-[28px] font-medium tracking-[-0.04em] text-white sm:text-[36px]">
            User management
          </h2>
          <p className="mt-4 max-w-[560px] text-[14px] leading-relaxed text-white/48">
            Create accounts, assign roles, and manage access. Super Admin only.
          </p>
        </div>
        <Link href="/users/new" className={privatePrimaryButtonClass}>
          New user
        </Link>
      </div>

      {loadError ? (
        <p className="mt-8 text-[13px] text-red-300/85" role="alert">
          {loadError}
        </p>
      ) : null}

      {users.length === 0 && !loadError ? (
        <div className="mt-12 rounded-[28px] border border-white/10 bg-white/[0.02] px-6 py-12">
          <p className="text-[14px] text-white/45">No users yet.</p>
          <Link href="/users/new" className={`${privatePrimaryButtonClass} mt-6 inline-flex`}>
            Create first user
          </Link>
        </div>
      ) : null}

      {users.length > 0 ? (
        <>
          <ul className="mt-8 space-y-3 lg:hidden">
            {users.map((user) => (
              <li
                key={user.id}
                className="rounded-[20px] border border-white/10 bg-white/[0.02] px-5 py-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Link href={`/users/${user.id}`} className="text-[15px] font-medium text-white/90">
                      {user.username}
                    </Link>
                    <p className="mt-1 text-[12px] text-white/42">{user.email}</p>
                  </div>
                  <span
                    className={`rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.16em] ${
                      user.isActive
                        ? "border-emerald-400/25 text-emerald-200/75"
                        : "border-white/15 text-white/38"
                    }`}
                  >
                    {user.isActive ? "Active" : "Disabled"}
                  </span>
                </div>
                <dl className="mt-4 grid grid-cols-2 gap-3 text-[12px] text-white/40">
                  <div>
                    <dt className="uppercase tracking-[0.14em]">Role</dt>
                    <dd className="mt-1 text-white/72">{roleLabel(user.role)}</dd>
                  </div>
                  <div>
                    <dt className="uppercase tracking-[0.14em]">Last login</dt>
                    <dd className="mt-1 text-white/72">{formatWhen(user.lastLoginAt)}</dd>
                  </div>
                </dl>
              </li>
            ))}
          </ul>

          <div className={`${privateTableWrapClass} hidden lg:block`}>
            <table className={privateTableClass}>
              <thead>
                <tr>
                  <th className={privateThClass}>Username</th>
                  <th className={privateThClass}>Email</th>
                  <th className={privateThClass}>Role</th>
                  <th className={privateThClass}>Status</th>
                  <th className={privateThClass}>Last login</th>
                  <th className={privateThClass}>Created</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className={privateTdClass}>
                      <Link href={`/users/${user.id}`} className="text-white/90 hover:underline">
                        {user.username}
                      </Link>
                    </td>
                    <td className={privateTdClass}>{user.email}</td>
                    <td className={privateTdClass}>{roleLabel(user.role)}</td>
                    <td className={privateTdClass}>{user.isActive ? "Active" : "Disabled"}</td>
                    <td className={privateTdClass}>{formatWhen(user.lastLoginAt)}</td>
                    <td className={privateTdClass}>{formatWhen(user.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : null}
    </PrivateAppShell>
  );
}
