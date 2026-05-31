"use server";

import { redirect } from "next/navigation";
import { destroyPrivateSession } from "@/lib/auth/private-session";

export async function adminLogout() {
  await destroyPrivateSession();
  redirect("/login");
}
