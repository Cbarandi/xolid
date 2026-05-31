import type { ReactNode } from "react";
import { SessionProvider } from "@/components/auth/SessionProvider";
import { requirePrivateSession } from "@/lib/auth/private-session";

export default async function PrivateLayout({ children }: { children: ReactNode }) {
  const session = await requirePrivateSession();
  return <SessionProvider session={session}>{children}</SessionProvider>;
}
