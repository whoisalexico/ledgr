/** Клиент-безопасные константы валют. Не содержит fetch/серверной логики — безопасно для импорта в браузерный бандл. */

export const SUPPORTED_CURRENCIES = ["BYN", "USD", "EUR", "RUB"] as const;
export type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number];
