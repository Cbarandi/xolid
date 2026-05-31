"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  privateFieldClass,
  privateLabelClass,
  privatePrimaryButtonClass,
  privateSecondaryButtonClass,
} from "@/components/private/styles";
import { createUserAction } from "@/lib/auth/user-actions";
import type { UserRole } from "@/lib/auth/types";
import { USER_ROLES } from "@/lib/auth/types";
import { roleLabel } from "@/lib/auth/labels";

export function CreateUserForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("TRADER");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);

    const result = await createUserAction({ username, email, password, role });
    setPending(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    router.push(`/users/${result.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 max-w-lg space-y-5">
      <div>
        <label htmlFor="username" className={privateLabelClass}>
          Username
        </label>
        <input
          id="username"
          name="username"
          type="text"
          autoComplete="username"
          required
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className={privateFieldClass}
        />
      </div>

      <div>
        <label htmlFor="email" className={privateLabelClass}>
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={privateFieldClass}
        />
      </div>

      <div>
        <label htmlFor="password" className={privateLabelClass}>
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={privateFieldClass}
        />
      </div>

      <div>
        <label htmlFor="role" className={privateLabelClass}>
          Role
        </label>
        <select
          id="role"
          name="role"
          value={role}
          onChange={(e) => setRole(e.target.value as UserRole)}
          className={privateFieldClass}
        >
          {USER_ROLES.map((r) => (
            <option key={r} value={r} className="bg-black text-white">
              {roleLabel(r)}
            </option>
          ))}
        </select>
      </div>

      {error ? (
        <p className="text-[13px] text-red-300/85" role="alert">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3 pt-2">
        <button type="submit" disabled={pending} className={privatePrimaryButtonClass}>
          {pending ? "Creating…" : "Create user"}
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => router.push("/users")}
          className={privateSecondaryButtonClass}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
