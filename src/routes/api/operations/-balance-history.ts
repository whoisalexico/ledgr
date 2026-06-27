"use server";

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { currencySchema } from "@/lib/operation-schemas";
import { convertFromByn } from "@/lib/exchange-rates";

const MONTHS_BACK = 6;

/** Динамика баланса (нарастающим итогом) за последние 6 месяцев, в запрошенной валюте */
export const getBalanceHistoryFn = createServerFn({ method: "GET" })
  .validator((data: unknown) => z.object({ currency: currencySchema }).parse(data ?? {}))
  .handler(async ({ data }) => {
    const user = await getCurrentUser();
    if (!user) throw new Error("Не авторизован");

    const now = new Date();
    const rangeStart = new Date(now.getFullYear(), now.getMonth() - (MONTHS_BACK - 1), 1);

    const [userRecord, operationsBeforeRange, operationsInRange] = await Promise.all([
      prisma.user.findUnique({ where: { id: user.id }, select: { balance: true } }),
      prisma.operation.aggregate({
        where: { userId: user.id, date: { lt: rangeStart } },
        _sum: { amountByn: true },
      }),
      prisma.operation.findMany({
        where: { userId: user.id, date: { gte: rangeStart } },
        select: { amountByn: true, type: true, date: true },
        orderBy: { date: "asc" },
      }),
    ]);

    const currentBalanceByn = Number(userRecord?.balance ?? 0);

    // Баланс на начало диапазона = текущий баланс минус всё, что произошло внутри диапазона
    const netInRangeByn = operationsInRange.reduce((sum, op) => {
      const signed = op.type === "INCOME" ? Number(op.amountByn) : -Number(op.amountByn);
      return sum + signed;
    }, 0);
    const balanceAtRangeStartByn = currentBalanceByn - netInRangeByn;

    // Помесячные net-изменения внутри диапазона
    const monthKeys: string[] = [];
    const monthLabels: string[] = [];
    for (let i = MONTHS_BACK - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      monthKeys.push(`${d.getFullYear()}-${d.getMonth()}`);
      monthLabels.push(d.toLocaleDateString("ru-RU", { month: "short" }));
    }

    const netByMonth = new Map<string, number>(monthKeys.map((k) => [k, 0]));
    for (const op of operationsInRange) {
      const d = new Date(op.date);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const signed = op.type === "INCOME" ? Number(op.amountByn) : -Number(op.amountByn);
      netByMonth.set(key, (netByMonth.get(key) ?? 0) + signed);
    }

    // Нарастающий итог баланса на конец каждого месяца, в BYN
    let runningByn = balanceAtRangeStartByn;
    const pointsByn = monthKeys.map((key) => {
      runningByn += netByMonth.get(key) ?? 0;
      return runningByn;
    });

    const points = await Promise.all(pointsByn.map((v) => convertFromByn(v, data.currency)));

    return {
      labels: monthLabels,
      values: points,
    };
  });
