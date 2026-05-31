import { requirePrivateSession } from "./private-session";
import { scopeUserIdForSession } from "./rbac";
import type { AuthSession } from "./types";

export async function getPageScope(): Promise<{ session: AuthSession; scope?: string }> {
  const session = await requirePrivateSession();
  return { session, scope: scopeUserIdForSession(session) };
}
