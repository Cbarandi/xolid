import { createSupabaseServerClient } from "@/lib/supabase-server";
import type { UserRecord, UserRole } from "./types";

type UserRow = {
  id: string;
  username: string;
  email: string;
  password_hash: string | null;
  role: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_login_at: string | null;
};

function mapUser(row: UserRow): UserRecord {
  return {
    id: row.id,
    username: row.username,
    email: row.email,
    role: row.role as UserRole,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    lastLoginAt: row.last_login_at,
  };
}

function getClient() {
  return createSupabaseServerClient();
}

export async function getUserByUsername(username: string): Promise<(UserRecord & { passwordHash: string | null }) | null> {
  const supabase = getClient();
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("username", username.trim())
    .maybeSingle();

  if (error) {
    console.error("[auth] getUserByUsername failed", error);
    return null;
  }
  if (!data) return null;

  const row = data as UserRow;
  return { ...mapUser(row), passwordHash: row.password_hash };
}

export async function getUserById(id: string): Promise<UserRecord | null> {
  const supabase = getClient();
  const { data, error } = await supabase.from("users").select("*").eq("id", id).maybeSingle();
  if (error || !data) return null;
  return mapUser(data as UserRow);
}

export async function listUsers(): Promise<UserRecord[]> {
  const supabase = getClient();
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[auth] listUsers failed", error);
    throw new Error("Failed to load users");
  }

  return ((data ?? []) as UserRow[]).map(mapUser);
}

export async function createUser(input: {
  username: string;
  email: string;
  passwordHash: string;
  role: UserRole;
}): Promise<{ id: string }> {
  const supabase = getClient();
  const { data, error } = await supabase
    .from("users")
    .insert({
      username: input.username.trim(),
      email: input.email.trim().toLowerCase(),
      password_hash: input.passwordHash,
      role: input.role,
      is_active: true,
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error("[auth] createUser failed", error);
    throw new Error("Failed to create user");
  }

  return { id: data.id as string };
}

export async function setUserActive(id: string, isActive: boolean): Promise<void> {
  const supabase = getClient();
  const { error } = await supabase
    .from("users")
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    console.error("[auth] setUserActive failed", error);
    throw new Error("Failed to update user status");
  }
}

export async function updateUserPassword(id: string, passwordHash: string): Promise<void> {
  const supabase = getClient();
  const { error } = await supabase
    .from("users")
    .update({ password_hash: passwordHash, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    console.error("[auth] updateUserPassword failed", error);
    throw new Error("Failed to reset password");
  }
}

export async function touchLastLogin(id: string): Promise<void> {
  const supabase = getClient();
  await supabase
    .from("users")
    .update({ last_login_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq("id", id);
}

export async function usernameExists(username: string): Promise<boolean> {
  const user = await getUserByUsername(username);
  return user != null;
}

export async function emailExists(email: string): Promise<boolean> {
  const supabase = getClient();
  const { data } = await supabase
    .from("users")
    .select("id")
    .eq("email", email.trim().toLowerCase())
    .maybeSingle();
  return data != null;
}
