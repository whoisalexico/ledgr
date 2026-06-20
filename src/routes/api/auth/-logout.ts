"use server";

import { createServerFn } from "@tanstack/react-start";
import { redirect } from "@tanstack/react-router";
import { destroySession } from "@/lib/auth";

export const logoutFn = createServerFn({ method: "POST" }).handler(async () => {
  await destroySession();
  throw redirect({ to: "/login" });
});
