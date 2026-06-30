import type { SupportedCurrency } from "@/lib/currency-constants";

export const CURRENCY_SYMBOLS: Record<SupportedCurrency, string> = {
  BYN: "Br.",
  USD: "$",
  EUR: "€",
  RUB: "₽",
};

export const CURRENCY_LABELS: Record<SupportedCurrency, string> = {
  BYN: "Белорусский рубль",
  USD: "Доллар США",
  EUR: "Евро",
  RUB: "Российский рубль",
};


export function formatAmount(amount: number): string {
  return Math.round(amount).toLocaleString("ru-RU");
}

/** Форматирует сумму с символом валюты, например "1 234 Br." или "$ 50" */
export function formatCurrency(amount: number, currency: SupportedCurrency): string {
  const symbol = CURRENCY_SYMBOLS[currency];
  const formatted = formatAmount(amount);
  return currency === "USD" || currency === "EUR"
    ? `${symbol} ${formatted}`
    : `${formatted} ${symbol}`;
}
