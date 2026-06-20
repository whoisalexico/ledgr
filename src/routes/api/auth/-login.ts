"use server";

import { createServerFn } from "@tanstack/react-start";
import { prisma } from "@/lib/prisma";
import { verifyPassword, createSession } from "@/lib/auth";
import { loginSchema } from "@/lib/auth-schemas";

export const loginFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => loginSchema.parse(data))
  .handler(async ({ data }) => {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    const INVALID_MSG = "Неверный email или пароль";

    if (!user) {
      throw new Error(INVALID_MSG);
    }

    const passwordOk = await verifyPassword(data.password, user.password);

    if (!passwordOk) {
      throw new Error(INVALID_MSG);
    }

    await createSession(user.id);

    // Возвращаем результат — редирект на клиенте
    return { success: true };
  });
