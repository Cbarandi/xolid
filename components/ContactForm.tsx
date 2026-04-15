"use client";

import { FormEvent, useState } from "react";

type UiStatus = "idle" | "loading" | "success" | "error";

export function ContactForm({ className = "" }: { className?: string }) {
  const [status, setStatus] = useState<UiStatus>("idle");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const name = String(fd.get("name") ?? "");
    const email = String(fd.get("email") ?? "");
    const message = String(fd.get("message") ?? "");

    setStatus("loading");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });

      if (res.ok) {
        setStatus("success");
        form.reset();
        return;
      }

      setStatus("error");
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div
        className={`space-y-3 ${className}`.trim()}
        role="status"
        aria-live="polite"
      >
        <p className="text-[15px] font-medium leading-snug tracking-[-0.01em] text-white sm:text-[16px]">
          Message received. We will get back to you shortly.
        </p>
      </div>
    );
  }

  return (
    <div className={className.trim()}>
      <form className="space-y-4" onSubmit={onSubmit}>
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

        <div>
          <label className="mb-2 block text-[10px] uppercase tracking-[0.3em] text-white/34">
            Message
          </label>
          <textarea
            name="message"
            required
            rows={4}
            placeholder="How can we help?"
            className="w-full resize-y rounded-3xl border border-white/10 bg-white/[0.02] px-5 py-3.5 text-sm leading-relaxed text-white outline-none placeholder:text-white/24 focus:border-white/28"
          />
        </div>

        <button
          type="submit"
          disabled={status === "loading"}
          className="mt-2 inline-flex h-12 w-full items-center justify-center rounded-full bg-white text-[11px] font-medium uppercase tracking-[0.3em] text-black transition enabled:hover:bg-white/92 disabled:opacity-60"
        >
          {status === "loading" ? "Sending…" : "Send message"}
        </button>

        {status === "error" ? (
          <p className="text-[13px] leading-6 tracking-[-0.01em] text-red-300/90 sm:text-sm" role="alert">
            Something went wrong. Please try again.
          </p>
        ) : null}
      </form>
    </div>
  );
}
