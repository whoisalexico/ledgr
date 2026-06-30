"use server";

/**
 * Получение курсов валют относительно BYN через open.er-api.com.
 * Курсы кэшируются в памяти процесса на CACHE_TTL_MS, чтобы не дёргать внешний API на каждый запрос.
 * Этот модуль выполняется только на сервере — fetch к внешнему API недопустим в браузере.
 */

import { SUPPORTED_CURRENCIES, type SupportedCurrency } from "@/lib/currency-constants.ts";

const CACHE_TTL_MS = 60 * 60 * 1000;

interface RatesCache {
  rates: Record<SupportedCurrency, number>; // курс: сколько BYN за 1 единицу валюты
  fetchedAt: number;
}

let cache: RatesCache | null = null;

const FALLBACK_RATES: Record<SupportedCurrency, number> = {
  BYN: 1,
  USD: 3.3,
  EUR: 3.5,
  RUB: 0.038,
};

async function fetchRatesFromApi(): Promise<Record<SupportedCurrency, number>> {
  const response = await fetch("https://open.er-api.com/v6/latest/BYN");

  if (!response.ok) {
    throw new Error(`Exchange rate API вернул статус ${response.status}`);
  }

  const data = await response.json();

  if (data.result !== "success" || !data.rates) {
    throw new Error("Exchange rate API вернул некорректный ответ");
  }

  // API отдаёт курс 1 BYN = X валюты, нам нужно обратное 1 валюта = X BYN
  const rates: Record<SupportedCurrency, number> = { BYN: 1 } as Record<SupportedCurrency, number>;

  for (const code of SUPPORTED_CURRENCIES) {
    if (code === "BYN") continue;
    const bynToCode = data.rates[code];
    if (typeof bynToCode !== "number" || bynToCode <= 0) {
      throw new Error(`Курс для ${code} не найден в ответе API`);
    }
    rates[code] = 1 / bynToCode;
  }

  return rates;
}

/** Возвращает курсы валют к BYN (1 единица валюты = N BYN), используя кэш если он свежий */
export async function getRatesToByn(): Promise<Record<SupportedCurrency, number>> {
  const now = Date.now();

  if (cache && now - cache.fetchedAt < CACHE_TTL_MS) {
    return cache.rates;
  }

  try {
    const rates = await fetchRatesFromApi();
    cache = { rates, fetchedAt: now };
    return rates;
  } catch (err) {
    console.error("[exchange-rates] Не удалось получить курсы, использую fallback:", err);
    if (cache) return cache.rates;
    return FALLBACK_RATES;
  }
}

/** Конвертирует сумму из указанной валюты в BYN по текущему/кэшированному курсу */
export async function convertToByn(amount: number, currency: SupportedCurrency): Promise<number> {
  if (currency === "BYN") return amount;
  const rates = await getRatesToByn();
  return amount * rates[currency];
}

/** Конвертирует сумму из BYN в указанную валюту по текущему/кэшированному курсу */
export async function convertFromByn(
  amountByn: number,
  currency: SupportedCurrency,
): Promise<number> {
  if (currency === "BYN") return amountByn;
  const rates = await getRatesToByn();
  return amountByn / rates[currency];
}
