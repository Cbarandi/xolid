"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "@/components/auth/SessionProvider";
import { canAccessAdminArea, canAccessRiskArea, canManageUsers, canViewAuditLogs } from "@/lib/auth/rbac";

type NavItem = {
  href: string;
  label: string;
  match: (p: string) => boolean;
  visible?: (session: ReturnType<typeof useSession>) => boolean;
};

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", match: (p) => p === "/dashboard" },
  { href: "/bots", label: "Bots", match: (p) => p === "/bots" },
  { href: "/bots/new", label: "Create Bot", match: (p) => p === "/bots/new" },
  { href: "/strategies", label: "Strategies", match: (p) => p.startsWith("/strategies") },
  { href: "/coin-lists", label: "Coin Lists", match: (p) => p.startsWith("/coin-lists") },
  {
    href: "/deals/active",
    label: "Active Deals",
    match: (p) => p.startsWith("/deals/active"),
  },
  {
    href: "/deals/closed",
    label: "Closed Deals",
    match: (p) => p.startsWith("/deals/closed"),
  },
  {
    href: "/exchange",
    label: "Exchange",
    match: (p) => p.startsWith("/exchange"),
  },
  {
    href: "/risk",
    label: "Risk",
    match: (p) => p.startsWith("/risk"),
    visible: (s) => canAccessRiskArea(s),
  },
  {
    href: "/admin/bots",
    label: "Admin",
    match: (p) => p.startsWith("/admin"),
    visible: (s) => canAccessAdminArea(s),
  },
  {
    href: "/users",
    label: "Users",
    match: (p) => p.startsWith("/users"),
    visible: (s) => canManageUsers(s),
  },
  {
    href: "/admin/logs",
    label: "Audit Logs",
    match: (p) => p.startsWith("/admin/logs"),
    visible: (s) => canViewAuditLogs(s),
  },
];

export function PrivateSidebar() {
  const pathname = usePathname();
  const session = useSession();
  const items = NAV_ITEMS.filter((item) => !item.visible || item.visible(session));

  return (
    <aside className="hidden w-[220px] shrink-0 border-r border-white/10 bg-black lg:flex lg:flex-col">
      <div className="px-6 py-8">
        <Link href="/dashboard" className="text-[11px] font-medium uppercase tracking-[0.42em] text-white/88">
          XOLID
        </Link>
        <p className="mt-2 text-[9px] uppercase tracking-[0.32em] text-white/28">Paper Trading</p>
      </div>
      <nav className="flex flex-1 flex-col gap-0.5 px-3 pb-8">
        {items.map((item) => {
          const active =
            item.href === "/bots"
              ? pathname === "/bots" || (pathname.startsWith("/bots/") && pathname !== "/bots/new")
              : item.match(pathname);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-full px-4 py-2.5 text-[11px] uppercase tracking-[0.22em] transition ${
                active
                  ? "bg-white/[0.08] text-white"
                  : "text-white/42 hover:bg-white/[0.04] hover:text-white/72"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
