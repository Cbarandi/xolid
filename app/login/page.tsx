import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/admin-session";
import { LoginForm } from "./LoginForm";

export const metadata = {
  title: "Log in — XOLID",
  description: "Admin sign-in",
};

export default async function LoginPage() {
  const token = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  if (token && (await verifySessionToken(token))) {
    redirect("/admin");
  }

  return (
    <main className="min-h-screen bg-black text-white antialiased">
      <div className="mx-auto flex min-h-screen w-full max-w-[1100px] flex-col px-6 sm:px-10 lg:px-16">
        <section className="flex flex-1 flex-col items-center justify-center py-16 sm:py-20 lg:py-24">
          <div className="w-full max-w-[920px] text-center">
            <h1 className="text-[40px] font-medium leading-[0.96] tracking-[-0.04em] text-white sm:text-[56px]">
              Log in
            </h1>
            <div className="mx-auto mt-8 h-px w-14 bg-white/18 sm:mt-10" />
            <div className="mx-auto mt-10 max-w-[420px] sm:mt-12">
              <Suspense fallback={<div className="h-48" />}>
                <LoginForm />
              </Suspense>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
