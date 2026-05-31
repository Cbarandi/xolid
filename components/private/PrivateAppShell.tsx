import type { ReactNode } from "react";
import { PrivateSidebar } from "./PrivateSidebar";
import { PrivateTopbar } from "./PrivateTopbar";

type Props = {
  title?: string;
  children: ReactNode;
};

export function PrivateAppShell({ title, children }: Props) {
  return (
    <div className="flex min-h-screen bg-black text-white antialiased">
      <PrivateSidebar />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <PrivateTopbar title={title} />
        <main className="flex-1 overflow-x-hidden px-6 py-8 sm:px-10">{children}</main>
      </div>
    </div>
  );
}
