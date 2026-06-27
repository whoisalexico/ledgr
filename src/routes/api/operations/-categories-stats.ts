"use server";

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { currencySchema } from "@/lib/operation-schemas";
import { convertFromByn } from "@/lib/exchange-rates";

/** Топ категорий расходов за текущий календарный месяц, в запрошенной валюте */
export const getTopCategoriesFn = createServerFn({ method: "GET" })
  .validator((data: unknown) => z.object({ currency: currencySchema }).parse(data ?? {}))
  .handler(async ({ data }) => {
    const user = await getCurrentUser();
    if (!user) throw new Error("Не авторизован");

    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const grouped = await prisma.operation.groupBy({
      by: ["categoryId"],
      where: { userId: user.id, type: "EXPENSE", date: { gte: startOfThisMonth } },
      _sum: { amountByn: true },
      orderBy: { _sum: { amountByn: "desc" } },
      take: 5,
    });

    if (grouped.length === 0) return [];

    const categories = await prisma.category.findMany({
      where: { id: { in: grouped.map((g) => g.categoryId) } },
      select: { id: true, name: true },
    });
    const nameById = new Map(categories.map((c) => [c.id, c.name]));

    const maxByn = Math.max(...grouped.map((g) => Number(g._sum.amountByn ?? 0)));

    const result = await Promise.all(
      grouped.map(async (g) => {
        const amountByn = Number(g._sum.amountByn ?? 0);
        const amount = await convertFromByn(amountByn, data.currency);
        return {
          categoryId: g.categoryId,
          name: nameById.get(g.categoryId) ?? "Без категории",
          amount,
          percent: maxByn > 0 ? Math.round((amountByn / maxByn) * 100) : 0,
        };
      }),
    );

    return result;
  });
