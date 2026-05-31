export type UserRole = "SUPER_ADMIN" | "ADMIN" | "TRADER";

export const USER_ROLES: UserRole[] = ["SUPER_ADMIN", "ADMIN", "TRADER"];

export type AuthSession = {
  userId: string | null;
  username: string;
  email: string | null;
  role: UserRole;
};

export type UserRecord = {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string | null;
};
