"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { privatePrimaryButtonClass, privateSecondaryButtonClass } from "@/components/private/styles";
import { setUserActiveAction } from "@/lib/auth/user-actions";

type Props = {
  userId: string;
  isActive: boolean;
  isSelf: boolean;
};

export function UserStatusActions({ userId, isActive, isSelf }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function toggleActive() {
    setError(null);
    setPending(true);
    const result = await setUserActiveAction(userId, !isActive);
    setPending(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    router.refresh();
  }

  return (
    <div className="space-y-3">
      {isActive ? (
        <button
          type="button"
          disabled={pending || isSelf}
          onClick={toggleActive}
          className={privateSecondaryButtonClass}
          title={isSelf ? "You cannot disable your own account" : undefined}
        >
          {pending ? "Updating…" : "Disable user"}
        </button>
      ) : (
        <button
          type="button"
          disabled={pending}
          onClick={toggleActive}
          className={privatePrimaryButtonClass}
        >
          {pending ? "Updating…" : "Enable user"}
        </button>
      )}
      {error ? (
        <p className="text-[13px] text-red-300/85" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
