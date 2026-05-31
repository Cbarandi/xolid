"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  privateFieldClass,
  privateLabelClass,
  privatePrimaryButtonClass,
} from "@/components/private/styles";
import { resetUserPasswordAction } from "@/lib/auth/user-actions";

type Props = {
  userId: string;
};

export function ResetPasswordForm({ userId }: Props) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }

    setPending(true);
    const result = await resetUserPasswordAction(userId, password);
    setPending(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    setPassword("");
    setConfirm("");
    setSuccess(true);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-5 max-w-lg space-y-4">
      <div>
        <label htmlFor="new-password" className={privateLabelClass}>
          New password
        </label>
        <input
          id="new-password"
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
        <label htmlFor="confirm-password" className={privateLabelClass}>
          Confirm password
        </label>
        <input
          id="confirm-password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className={privateFieldClass}
        />
      </div>

      {error ? (
        <p className="text-[13px] text-red-300/85" role="alert">
          {error}
        </p>
      ) : null}
      {success ? (
        <p className="text-[13px] text-emerald-300/85" role="status">
          Password updated.
        </p>
      ) : null}

      <button type="submit" disabled={pending} className={privatePrimaryButtonClass}>
        {pending ? "Saving…" : "Reset password"}
      </button>
    </form>
  );
}
