"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setError(data.error ?? "Invalid credentials");
        return;
      }
      const from = searchParams.get("from");
      const dest =
        from && from.startsWith("/admin") && !from.includes("//") && !from.includes(":")
          ? from
          : "/admin";
      router.push(dest);
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mx-auto w-full max-w-[360px] space-y-8 text-left"
      autoComplete="on"
    >
      <div className="space-y-2">
        <label htmlFor="email" className="block text-[10px] font-medium uppercase tracking-[0.38em] text-white/40">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full border border-white/12 bg-transparent px-4 py-3 text-[15px] tracking-[-0.01em] text-white outline-none transition placeholder:text-white/25 focus:border-white/28"
          placeholder="you@company.com"
        />
      </div>
      <div className="space-y-2">
        <label
          htmlFor="password"
          className="block text-[10px] font-medium uppercase tracking-[0.38em] text-white/40"
        >
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full border border-white/12 bg-transparent px-4 py-3 text-[15px] tracking-[-0.01em] text-white outline-none transition placeholder:text-white/25 focus:border-white/28"
        />
      </div>
      {error ? (
        <p className="text-[13px] tracking-[-0.01em] text-red-400/90" role="alert">
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-12 w-full items-center justify-center rounded-full border border-white/16 bg-white px-8 text-[11px] font-medium uppercase tracking-[0.28em] text-black transition hover:bg-white/92 disabled:opacity-50"
      >
        {pending ? "…" : "Log in"}
      </button>
    </form>
  );
}
