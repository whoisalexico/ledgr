import { BynSign } from "@/components/icons/byn-sign";
import { formatAmount, CURRENCY_SYMBOLS } from "@/lib/currency-format";
import type { SupportedCurrency } from "@/lib/currency-constants";

export function CurrencyAmount({
  amount,
  currency,
  className = "",
}: {
  amount: number;
  currency: SupportedCurrency;
  className?: string;
}) {
  const formatted = formatAmount(amount);

  if (currency === "BYN") {
    return (
      <span className={className}>
        {formatted} <BynSign className="inline-block size-[0.8em] -translate-y-[0.05em]" />
      </span>
    );
  }

  const symbol = CURRENCY_SYMBOLS[currency];
  return (
    <span className={className}>
      {currency === "USD" || currency === "EUR"
        ? `${symbol} ${formatted}`
        : `${formatted} ${symbol}`}
    </span>
  );
}
