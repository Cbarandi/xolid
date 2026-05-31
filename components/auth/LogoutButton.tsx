"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const buttonClass =
  "text-[11px] uppercase tracking-[0.28em] text-white/50 transition hover:text-white/90 disabled:opacity-50";

export function LogoutButton({ className = "" }: { className?: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function onLogout() {
    setPending(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/");
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      onClick={onLogout}
      disabled={pending}
      className={`${buttonClass} ${className}`.trim()}
    >
      {pending ? "…" : "Logout"}
    </button>
  );
}
