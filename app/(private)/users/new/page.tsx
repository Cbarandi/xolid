import type { Metadata } from "next";
import Link from "next/link";
import { PrivateAppShell } from "@/components/private/PrivateAppShell";
import { CreateUserForm } from "@/components/users/CreateUserForm";
import { privateSecondaryButtonClass } from "@/components/private/styles";
import { getPageScope } from "@/lib/auth/page-scope";
import { requireSuperAdmin } from "@/lib/auth/rbac";

export const metadata: Metadata = {
  title: "New User — XOLID",
  robots: { index: false, follow: false },
};

export default async function NewUserPage() {
  const { session } = await getPageScope();
  requireSuperAdmin(session);

  return (
    <PrivateAppShell title="New User">
      <Link href="/users" className={`${privateSecondaryButtonClass} inline-flex`}>
        Back to users
      </Link>

      <div className="mt-8">
        <p className="text-[10px] font-medium uppercase tracking-[0.38em] text-white/34">
          Administration
        </p>
        <h2 className="mt-3 text-[28px] font-medium tracking-[-0.04em] text-white sm:text-[36px]">
          Create user
        </h2>
        <p className="mt-4 max-w-[560px] text-[14px] leading-relaxed text-white/48">
          Assign a role and initial password. The user can sign in immediately.
        </p>
      </div>

      <CreateUserForm />
    </PrivateAppShell>
  );
}
