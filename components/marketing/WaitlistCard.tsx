import { WaitlistForm } from "@/components/WaitlistForm";

type WaitlistCardProps = {
  id?: string;
  eyebrow?: string;
  title: string;
  description: string;
};

export function WaitlistCard({
  id = "waitlist",
  eyebrow = "Request early access",
  title,
  description,
}: WaitlistCardProps) {
  return (
    <div
      id={id}
      className="w-full max-w-[460px] rounded-[28px] border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm sm:p-8"
    >
      <p className="text-[10px] font-medium uppercase tracking-[0.34em] text-white/42">{eyebrow}</p>
      <h2 className="mt-4 text-[26px] font-medium leading-[1.05] tracking-[-0.04em] text-white sm:text-[32px]">
        {title}
      </h2>
      <p className="mt-4 max-w-[36ch] text-[14px] leading-7 text-white/52 sm:text-[15px]">{description}</p>
      <WaitlistForm className="mt-8" />
    </div>
  );
}
