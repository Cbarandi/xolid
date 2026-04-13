"use client";

import { FormEvent, useState } from "react";

type WaitlistFormProps = {
  /** Button label (default matches marketing modal). */
  submitLabel?: string;
  className?: string;
};

export function WaitlistForm({
  submitLabel = "Join the waitlist",
  className = "",
}: WaitlistFormProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const name = String(fd.get("name") ?? "");
    const country = String(fd.get("country") ?? "");
    const email = String(fd.get("email") ?? "");

    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, country, email }),
      });
      if (!res.ok) {
        setStatus("error");
        setMessage("No se pudo enviar. Inténtalo de nuevo.");
        return;
      }
      setStatus("done");
      setMessage("Listo. Te contactamos si hay hueco.");
      form.reset();
    } catch {
      setStatus("error");
      setMessage("Error de red. Revisa la conexión.");
    }
  }

  return (
    <form className={`space-y-4 ${className}`.trim()} onSubmit={onSubmit}>
      <div>
        <label className="mb-2 block text-[10px] uppercase tracking-[0.3em] text-white/34">
          Name
        </label>
        <input
          name="name"
          type="text"
          autoComplete="name"
          placeholder="Your name"
          className="h-12 w-full rounded-full border border-white/10 bg-white/[0.02] px-5 text-sm text-white outline-none placeholder:text-white/24 focus:border-white/28"
        />
      </div>

      <div>
        <label className="mb-2 block text-[10px] uppercase tracking-[0.3em] text-white/34">
          Country
        </label>
        <input
          name="country"
          type="text"
          autoComplete="country-name"
          placeholder="Your country"
          className="h-12 w-full rounded-full border border-white/10 bg-white/[0.02] px-5 text-sm text-white outline-none placeholder:text-white/24 focus:border-white/28"
        />
      </div>

      <div>
        <label className="mb-2 block text-[10px] uppercase tracking-[0.3em] text-white/34">
          Email
        </label>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="name@email.com"
          className="h-12 w-full rounded-full border border-white/10 bg-white/[0.02] px-5 text-sm text-white outline-none placeholder:text-white/24 focus:border-white/28"
        />
      </div>

      <button
        type="submit"
        disabled={status === "loading"}
        className="mt-2 inline-flex h-12 w-full items-center justify-center rounded-full bg-white text-[11px] font-medium uppercase tracking-[0.3em] text-black transition enabled:hover:bg-white/92 disabled:opacity-60"
      >
        {status === "loading" ? "Sending…" : submitLabel}
      </button>

      {message ? (
        <p
          className={`text-xs leading-6 ${status === "error" ? "text-red-300/90" : "text-white/40"}`}
        >
          {message}
        </p>
      ) : (
        <p className="mt-1 text-xs leading-6 text-white/32">
          Early access is limited. Priority may be given based on profile, geography, and demand.
        </p>
      )}
    </form>
  );
}
