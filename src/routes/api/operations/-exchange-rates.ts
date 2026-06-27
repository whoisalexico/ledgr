"use server";

import { createServerFn } from "@tanstack/react-start";
import { getRatesToByn } from "@/lib/exchange-rates";

/** Текущие курсы валют к BYN (1 единица валюты = N BYN), для отображения на дашборде */
export const getExchangeRatesFn = createServerFn({ method: "GET" }).handler(async () => {
  const rates = await getRatesToByn();
  return rates;
});
