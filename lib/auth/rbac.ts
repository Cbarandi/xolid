import { redirect } from "next/navigation";
import type { AuthSession, UserRole } from "./types";

const ROLE_RANK: Record<UserRole, number> = {
  TRADER: 1,
  ADMIN: 2,
  SUPER_ADMIN: 3,
};

export function hasRole(session: AuthSession | null, roles: UserRole | UserRole[]): boolean {
  if (!session) return false;
  const allowed = Array.isArray(roles) ? roles : [roles];
  return allowed.includes(session.role);
}

export function hasMinimumRole(session: AuthSession | null, minimum: UserRole): boolean {
  if (!session) return false;
  return ROLE_RANK[session.role] >= ROLE_RANK[minimum];
}

export function canManageUsers(session: AuthSession | null): boolean {
  return hasRole(session, "SUPER_ADMIN");
}

export function canViewAuditLogs(session: AuthSession | null): boolean {
  return canManageUsers(session);
}

export function canAccessAdminArea(session: AuthSession | null): boolean {
  return hasMinimumRole(session, "ADMIN");
}

export function canAccessRiskArea(session: AuthSession | null): boolean {
  return canAccessAdminArea(session);
}

export function canModifyGlobalRisk(session: AuthSession | null): boolean {
  return canManageUsers(session);
}

export function canAccessPath(session: AuthSession | null, pathname: string): boolean {
  if (!session) return false;

  if (pathname === "/users" || pathname.startsWith("/users/")) {
    return canManageUsers(session);
  }

  if (pathname === "/admin/logs" || pathname.startsWith("/admin/logs/")) {
    return canViewAuditLogs(session);
  }

  if (pathname === "/risk" || pathname.startsWith("/risk/")) {
    return canAccessRiskArea(session);
  }

  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    return canAccessAdminArea(session);
  }

  return true;
}

export function requireRole(session: AuthSession | null, roles: UserRole | UserRole[]): AuthSession {
  if (!session || !hasRole(session, roles)) {
    redirect("/dashboard");
  }
  return session;
}

export function requireSuperAdmin(session: AuthSession | null): AuthSession {
  return requireRole(session, "SUPER_ADMIN");
}

export function requireAdminOrAbove(session: AuthSession | null): AuthSession {
  if (!session || !hasMinimumRole(session, "ADMIN")) {
    redirect("/dashboard");
  }
  return session;
}

/** TRADER sees only own resources; ADMIN/SUPER_ADMIN see all. */
export function isOwnerScope(session: AuthSession): boolean {
  return session.role === "TRADER";
}

/** When set, DB queries should filter to this user id (TRADER only). */
export function scopeUserIdForSession(session: AuthSession): string | undefined {
  if (!isOwnerScope(session)) return undefined;
  return session.userId ?? undefined;
}

export { roleLabel } from "./labels";
