"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { logEvent } from "@/lib/audit/logger";
import { requireSuperAdmin } from "@/lib/auth/rbac";
import { getPrivateSession } from "@/lib/auth/private-session";
import type { UserRole } from "@/lib/auth/types";
import {
  createUser,
  emailExists,
  getUserById,
  setUserActive,
  updateUserPassword,
  usernameExists,
} from "@/lib/auth/users-db";

export type UserActionResult = { ok: true } | { ok: false; error: string };

export type CreateUserActionResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

async function assertSuperAdmin() {
  const session = await getPrivateSession();
  requireSuperAdmin(session);
  return session!;
}

export async function createUserAction(input: {
  username: string;
  email: string;
  password: string;
  role: UserRole;
}): Promise<CreateUserActionResult> {
  const session = await assertSuperAdmin();

  const username = input.username.trim();
  const email = input.email.trim().toLowerCase();
  const password = input.password;

  if (!username || username.length < 2) {
    return { ok: false, error: "Username is required" };
  }
  if (!email.includes("@")) {
    return { ok: false, error: "Valid email is required" };
  }
  if (password.length < 8) {
    return { ok: false, error: "Password must be at least 8 characters" };
  }
  if (!["SUPER_ADMIN", "ADMIN", "TRADER"].includes(input.role)) {
    return { ok: false, error: "Invalid role" };
  }

  if (await usernameExists(username)) {
    return { ok: false, error: "Username already exists" };
  }
  if (await emailExists(email)) {
    return { ok: false, error: "Email already exists" };
  }

  try {
    const passwordHash = await bcrypt.hash(password, 12);
    const { id } = await createUser({ username, email, passwordHash, role: input.role });
    await logEvent({
      userId: session.userId,
      eventType: "USER_CREATED",
      entityType: "user",
      entityId: id,
      metadata: { username, email, role: input.role },
    });
    revalidatePath("/users");
    return { ok: true, id };
  } catch {
    return { ok: false, error: "Could not create user" };
  }
}

export async function setUserActiveAction(id: string, isActive: boolean): Promise<UserActionResult> {
  const session = await assertSuperAdmin();

  if (session.userId === id && !isActive) {
    return { ok: false, error: "You cannot disable your own account" };
  }

  try {
    await setUserActive(id, isActive);
    await logEvent({
      userId: session.userId,
      eventType: isActive ? "USER_UPDATED" : "USER_DISABLED",
      entityType: "user",
      entityId: id,
      metadata: { isActive },
    });
    revalidatePath("/users");
    revalidatePath(`/users/${id}`);
    return { ok: true };
  } catch {
    return { ok: false, error: "Could not update user status" };
  }
}

export async function resetUserPasswordAction(
  id: string,
  password: string,
): Promise<UserActionResult> {
  const session = await assertSuperAdmin();

  if (password.length < 8) {
    return { ok: false, error: "Password must be at least 8 characters" };
  }

  const user = await getUserById(id);
  if (!user) {
    return { ok: false, error: "User not found" };
  }

  try {
    const passwordHash = await bcrypt.hash(password, 12);
    await updateUserPassword(id, passwordHash);
    await logEvent({
      userId: session.userId,
      eventType: "USER_UPDATED",
      entityType: "user",
      entityId: id,
      metadata: { action: "password_reset", username: user.username },
    });
    revalidatePath(`/users/${id}`);
    return { ok: true };
  } catch {
    return { ok: false, error: "Could not reset password" };
  }
}
