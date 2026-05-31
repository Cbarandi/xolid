import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PrivateAppShell } from "@/components/private/PrivateAppShell";
import { privateSecondaryButtonClass, privateSectionLabelClass } from "@/components/private/styles";
import { ResetPasswordForm } from "@/components/users/ResetPasswordForm";
import { UserStatusActions } from "@/components/users/UserStatusActions";
import { getPageScope } from "@/lib/auth/page-scope";
import { requireSuperAdmin, roleLabel } from "@/lib/auth/rbac";
import { getUserById } from "@/lib/auth/users-db";

type Props = {
  params: Promise<{ id: string }>;
};

function formatWhen(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const user = await getUserById(id);
  return { title: user ? `${user.username} — Users — XOLID` : "User — XOLID" };
}

export default async function UserDetailPage({ params }: Props) {
  const { session } = await getPageScope();
  requireSuperAdmin(session);

  const { id } = await params;
  const user = await getUserById(id);
  if (!user) notFound();

  const isSelf = session.userId === user.id;

  return (
    <PrivateAppShell title="User">
      <Link href="/users" className={`${privateSecondaryButtonClass} inline-flex`}>
        Back to users
      </Link>

      <div className="mt-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.38em] text-white/34">
            User
          </p>
          <h2 className="mt-3 text-[28px] font-medium tracking-[-0.04em] text-white sm:text-[36px]">
            {user.username}
          </h2>
          <p className="mt-2 text-[14px] text-white/48">{user.email}</p>
        </div>
        <span
          className={`rounded-full border px-4 py-2 text-[10px] uppercase tracking-[0.18em] ${
            user.isActive
              ? "border-emerald-400/25 text-emerald-200/75"
              : "border-white/15 text-white/38"
          }`}
        >
          {user.isActive ? "Active" : "Disabled"}
        </span>
      </div>

      <section className="mt-10 rounded-[28px] border border-white/10 bg-white/[0.02] px-6 py-6 sm:px-8">
        <p className={privateSectionLabelClass}>Details</p>
        <dl className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-[10px] uppercase tracking-[0.28em] text-white/32">Role</dt>
            <dd className="mt-2 text-[15px] text-white/88">{roleLabel(user.role)}</dd>
          </div>
          <div>
            <dt className="text-[10px] uppercase tracking-[0.28em] text-white/32">Last login</dt>
            <dd className="mt-2 text-[15px] text-white/88">{formatWhen(user.lastLoginAt)}</dd>
          </div>
          <div>
            <dt className="text-[10px] uppercase tracking-[0.28em] text-white/32">Created</dt>
            <dd className="mt-2 text-[15px] text-white/88">{formatWhen(user.createdAt)}</dd>
          </div>
          <div>
            <dt className="text-[10px] uppercase tracking-[0.28em] text-white/32">Updated</dt>
            <dd className="mt-2 text-[15px] text-white/88">{formatWhen(user.updatedAt)}</dd>
          </div>
        </dl>
      </section>

      <section className="mt-6 rounded-[28px] border border-white/10 bg-white/[0.02] px-6 py-6 sm:px-8">
        <p className={privateSectionLabelClass}>Account status</p>
        <p className="mt-3 max-w-[560px] text-[13px] leading-relaxed text-white/45">
          Disabled users cannot sign in. You cannot disable your own account while signed in.
        </p>
        <div className="mt-5">
          <UserStatusActions userId={user.id} isActive={user.isActive} isSelf={isSelf} />
        </div>
      </section>

      <section className="mt-6 rounded-[28px] border border-white/10 bg-white/[0.02] px-6 py-6 sm:px-8">
        <p className={privateSectionLabelClass}>Reset password</p>
        <p className="mt-3 max-w-[560px] text-[13px] leading-relaxed text-white/45">
          Set a new password for this user. Minimum 8 characters.
        </p>
        <ResetPasswordForm userId={user.id} />
      </section>
    </PrivateAppShell>
  );
}
