"use server";

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { createOperationSchema, currencySchema } from "@/lib/operation-schemas";
import { convertToByn, convertFromByn } from "@/lib/exchange-rates";
import type { SupportedCurrency } from "@/lib/currency-constants";

function percentDelta(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? 0 : null; // нет базы для сравнения
  return ((current - previous) / previous) * 100;
}

/** Баланс + доходы/расходы текущего и прошлого месяца для карточек на дашборде, в запрошенной валюте */
export const getDashboardStatsFn = createServerFn({ method: "GET" })
  .validator((data: unknown) => z.object({ currency: currencySchema }).parse(data ?? {}))
  .handler(async ({ data }) => {
    const user = await getCurrentUser();
    if (!user) throw new Error("Не авторизован");

    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const [userRecord, thisMonthSums, lastMonthSums] = await Promise.all([
      prisma.user.findUnique({ where: { id: user.id }, select: { balance: true } }),
      prisma.operation.groupBy({
        by: ["type"],
        where: { userId: user.id, date: { gte: startOfThisMonth } },
        _sum: { amountByn: true },
      }),
      prisma.operation.groupBy({
        by: ["type"],
        where: { userId: user.id, date: { gte: startOfLastMonth, lt: startOfThisMonth } },
        _sum: { amountByn: true },
      }),
    ]);

    const sumFor = (rows: typeof thisMonthSums, type: "INCOME" | "EXPENSE") =>
      Number(rows.find((r) => r.type === type)?._sum.amountByn ?? 0);

    const incomeByn = sumFor(thisMonthSums, "INCOME");
    const expenseByn = sumFor(thisMonthSums, "EXPENSE");
    const lastIncomeByn = sumFor(lastMonthSums, "INCOME");
    const lastExpenseByn = sumFor(lastMonthSums, "EXPENSE");
    const balanceByn = Number(userRecord?.balance ?? 0);

    const currency = data.currency;
    const [balance, income, expense] = await Promise.all([
      convertFromByn(balanceByn, currency),
      convertFromByn(incomeByn, currency),
      convertFromByn(expenseByn, currency),
    ]);

    return {
      balance,
      income,
      expense,
      currency,
      // % изменения не зависит от валюты отображения, считаем по BYN-суммам
      incomeDeltaPercent: percentDelta(incomeByn, lastIncomeByn),
      expenseDeltaPercent: percentDelta(expenseByn, lastExpenseByn),
    };
  });

/** Список операций текущего пользователя, последние сверху. Суммы отдаются в исходной валюте операции */
export const listOperationsFn = createServerFn({ method: "GET" }).handler(async () => {
  const user = await getCurrentUser();
  if (!user) throw new Error("Не авторизован");

  const operations = await prisma.operation.findMany({
    where: { userId: user.id },
    include: { category: true },
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    take: 100,
  });

  return operations.map((op) => ({
    ...op,
    amount: op.amount.toString(),
    amountByn: op.amountByn.toString(),
  }));
});

export const createOperationFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => createOperationSchema.parse(data))
  .handler(async ({ data }) => {
    const user = await getCurrentUser();
    if (!user) throw new Error("Не авторизован");

    const category = await prisma.category.findFirst({
      where: {
        id: data.categoryId,
        type: data.type,
        OR: [{ userId: null }, { userId: user.id }],
      },
    });

    if (!category) {
      throw new Error("Категория не найдена");
    }

    // Конвертируем сумму операции в BYN по курсу на момент совершения операции —
    // именно эта сумма используется для баланса и статистики
    const amountByn = await convertToByn(data.amount, data.currency as SupportedCurrency);
    const balanceDeltaByn = data.type === "INCOME" ? amountByn : -amountByn;

    const [operation] = await prisma.$transaction([
      prisma.operation.create({
        data: {
          title: data.title,
          amount: data.amount,
          currency: data.currency,
          amountByn,
          type: data.type,
          date: new Date(data.date),
          categoryId: category.id,
          userId: user.id,
        },
        include: { category: true },
      }),
      prisma.user.update({
        where: { id: user.id },
        data: { balance: { increment: balanceDeltaByn } },
      }),
    ]);

    return {
      ...operation,
      amount: operation.amount.toString(),
      amountByn: operation.amountByn.toString(),
    };
  });
