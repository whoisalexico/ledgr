import type { SupportedCurrency } from "@/lib/currency-constants";

export const CURRENCY_SYMBOLS: Record<SupportedCurrency, string> = {
  BYN: "Br.", // новый знак Нацбанка РБ (текстовое приближение, см. BynSign для точного начертания)
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

/** Форматирует число с разделителями тысяч в русской локали, без символа валюты */
export function formatAmount(amount: number): string {
  return Math.round(amount).toLocaleString("ru-RU");
}

/** Форматирует сумму с символом валюты, например "1 234 Б" или "$ 50" */
export function formatCurrency(amount: number, currency: SupportedCurrency): string {
  const symbol = CURRENCY_SYMBOLS[currency];
  const formatted = formatAmount(amount);
  // USD/EUR обычно ставятся перед суммой, BYN/RUB — после, по локальной традиции написания
  return currency === "USD" || currency === "EUR"
    ? `${symbol} ${formatted}`
    : `${formatted} ${symbol}`;
}
