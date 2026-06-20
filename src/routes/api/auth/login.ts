import { createServerFn } from "@tanstack/react-start";
import { redirect } from "@tanstack/react-router";
import { prisma } from "@/lib/prisma.ts";
import { verifyPassword, createSession } from "@/lib/auth.ts";
import { loginSchema } from "@/lib/auth-schemas.ts";

export const loginFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => loginSchema.parse(data))
  .handler(async ({ data }) => {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    // Намеренно одинаковое сообщение для email и пароля (безопасность)
    const INVALID_MSG = "Неверный email или пароль";

    if (!user) {
      throw new Error(INVALID_MSG);
    }

    const passwordOk = await verifyPassword(data.password, user.password);

    if (!passwordOk) {
      throw new Error(INVALID_MSG);
    }

    await createSession(user.id);

    throw redirect({ to: "/dashboard" });
  });
