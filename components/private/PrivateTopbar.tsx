import { LogoutButton } from "@/components/auth/LogoutButton";

type Props = {
  title?: string;
};

export function PrivateTopbar({ title }: Props) {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-white/10 px-6 sm:px-8">
      <div>
        {title ? (
          <h1 className="text-[13px] font-medium uppercase tracking-[0.28em] text-white/72">{title}</h1>
        ) : (
          <p className="text-[13px] font-medium uppercase tracking-[0.28em] text-white/72">Trading</p>
        )}
      </div>
      <LogoutButton />
    </header>
  );
}
