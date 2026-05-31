import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  canAccessPath,
  canManageUsers,
  hasMinimumRole,
  hasRole,
  scopeUserIdForSession,
} from "./rbac";
import type { AuthSession } from "./types";

function session(role: AuthSession["role"], userId: string | null = "u1"): AuthSession {
  return { userId, username: "test", email: "test@xolid.local", role };
}

describe("rbac", () => {
  it("hasRole checks exact roles", () => {
    assert.equal(hasRole(session("ADMIN"), "ADMIN"), true);
    assert.equal(hasRole(session("ADMIN"), "SUPER_ADMIN"), false);
    assert.equal(hasRole(session("TRADER"), ["ADMIN", "TRADER"]), true);
    assert.equal(hasRole(null, "ADMIN"), false);
  });

  it("hasMinimumRole respects rank", () => {
    assert.equal(hasMinimumRole(session("SUPER_ADMIN"), "ADMIN"), true);
    assert.equal(hasMinimumRole(session("ADMIN"), "ADMIN"), true);
    assert.equal(hasMinimumRole(session("TRADER"), "ADMIN"), false);
  });

  it("canManageUsers is SUPER_ADMIN only", () => {
    assert.equal(canManageUsers(session("SUPER_ADMIN")), true);
    assert.equal(canManageUsers(session("ADMIN")), false);
    assert.equal(canManageUsers(session("TRADER")), false);
  });

  it("canAccessPath protects users and admin", () => {
    assert.equal(canAccessPath(session("SUPER_ADMIN"), "/users"), true);
    assert.equal(canAccessPath(session("ADMIN"), "/users"), false);
    assert.equal(canAccessPath(session("TRADER"), "/users/new"), false);

    assert.equal(canAccessPath(session("SUPER_ADMIN"), "/admin/logs"), true);
    assert.equal(canAccessPath(session("ADMIN"), "/admin/logs"), false);
    assert.equal(canAccessPath(session("TRADER"), "/admin/logs"), false);

    assert.equal(canAccessPath(session("ADMIN"), "/admin/bots"), true);
    assert.equal(canAccessPath(session("TRADER"), "/admin/bots"), false);

    assert.equal(canAccessPath(session("SUPER_ADMIN"), "/risk"), true);
    assert.equal(canAccessPath(session("ADMIN"), "/risk"), true);
    assert.equal(canAccessPath(session("TRADER"), "/risk"), false);

    assert.equal(canAccessPath(session("TRADER"), "/bots"), true);
    assert.equal(canAccessPath(session("ADMIN"), "/dashboard"), true);
  });

  it("scopeUserIdForSession applies only to TRADER", () => {
    assert.equal(scopeUserIdForSession(session("TRADER", "uid-1")), "uid-1");
    assert.equal(scopeUserIdForSession(session("ADMIN", "uid-2")), undefined);
    assert.equal(scopeUserIdForSession(session("SUPER_ADMIN", "uid-3")), undefined);
  });
});
