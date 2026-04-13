const contact =
  process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() || "hello@xolid.ai";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/8 py-6 sm:py-8">
      <div className="flex flex-col gap-4 text-[11px] uppercase tracking-[0.28em] text-white/28 sm:flex-row sm:items-center sm:justify-between">
        <p>Xolid.ai</p>
        <a
          href={`mailto:${contact}`}
          className="w-fit text-white/45 transition hover:text-white/85"
        >
          {contact}
        </a>
        <p className="text-white/22">Private release · 2026</p>
      </div>
    </footer>
  );
}
