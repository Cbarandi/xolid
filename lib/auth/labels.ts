import type { UserRole } from "./types";

export function roleLabel(role: UserRole): string {
  switch (role) {
    case "SUPER_ADMIN":
      return "Super Admin";
    case "ADMIN":
      return "Admin";
    case "TRADER":
      return "Trader";
  }
}
