"use server";

import { createServerFn } from "@tanstack/react-start";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { createCategorySchema } from "@/lib/operation-schemas";

/** Список категорий, доступных текущему пользователю: дефолтные (userId = null) + свои */
export const listCategoriesFn = createServerFn({ method: "GET" }).handler(async () => {
  const user = await getCurrentUser();
  if (!user) throw new Error("Не авторизован");

  const categories = await prisma.category.findMany({
    where: {
      OR: [{ userId: null }, { userId: user.id }],
    },
    orderBy: [{ userId: "asc" }, { createdAt: "asc" }],
  });

  return categories;
});

export const createCategoryFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => createCategorySchema.parse(data))
  .handler(async ({ data }) => {
    const user = await getCurrentUser();
    if (!user) throw new Error("Не авторизован");

    const existing = await prisma.category.findFirst({
      where: {
        name: { equals: data.name, mode: "insensitive" },
        type: data.type,
        OR: [{ userId: null }, { userId: user.id }],
      },
    });

    if (existing) {
      throw new Error("Такая категория уже существует");
    }

    const category = await prisma.category.create({
      data: {
        name: data.name,
        type: data.type,
        userId: user.id,
      },
    });

    return category;
  });
