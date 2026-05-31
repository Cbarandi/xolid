/** Safe post-login redirect — only private app paths allowed. */
export function safeNextPath(next: string | null | undefined): string {
  if (!next) return "/dashboard";
  if (!next.startsWith("/") || next.startsWith("//") || next.includes(":")) {
    return "/dashboard";
  }

  const allowedPrefixes = [
    "/dashboard",
    "/bots",
    "/admin",
    "/strategies",
    "/coin-lists",
    "/deals",
    "/exchange",
    "/risk",
    "/users",
  ];

  if (allowedPrefixes.some((p) => next === p || next.startsWith(`${p}/`))) {
    return next;
  }

  return "/dashboard";
}

/** Paths that require private authentication. */
export function isProtectedPath(pathname: string): boolean {
  const protectedPrefixes = [
    "/dashboard",
    "/bots",
    "/strategies",
    "/coin-lists",
    "/deals",
    "/admin",
    "/exchange",
    "/risk",
    "/users",
  ];
  return protectedPrefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}
