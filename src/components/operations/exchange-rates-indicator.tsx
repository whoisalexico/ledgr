import { useQuery } from "@tanstack/react-query";
import { TrendingUp } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { BynSign } from "@/components/icons/byn-sign";
import { getExchangeRatesFn } from "@/routes/api/operations/-exchange-rates";
import { SUPPORTED_CURRENCIES } from "@/lib/currency-constants";
import { CURRENCY_SYMBOLS, CURRENCY_LABELS } from "@/lib/currency-format";

export function ExchangeRatesIndicator() {
  const { data, isLoading } = useQuery({
    queryKey: ["exchange-rates"],
    queryFn: () => getExchangeRatesFn(),
    staleTime: 60 * 60 * 1000,
  });

  const otherCurrencies = SUPPORTED_CURRENCIES.filter((c) => c !== "BYN");

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 h-9 px-2.5 sm:px-3 rounded-xl border border-line bg-white text-sm font-medium text-ink-muted hover:text-ink hover:bg-bg transition-colors shrink-0"
        >
          <TrendingUp className="size-3.5 shrink-0" />
          <span className="hidden sm:inline">Курсы</span>
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-64 max-w-[calc(100vw-2rem)] rounded-2xl border-line p-4"
        align="end"
        collisionPadding={16}
      >
        <div className="flex items-center gap-1.5 text-xs font-semibold text-ink-muted uppercase tracking-wider mb-3">
          <BynSign className="size-3.5" />
          Курсы к белорусскому рублю
        </div>
        {isLoading && <p className="text-sm text-ink-muted">Загружаем…</p>}
        {!isLoading && data && (
          <div className="space-y-2.5">
            {otherCurrencies.map((code) => (
              <div key={code} className="flex items-center justify-between text-sm">
                <span className="text-ink-muted">{CURRENCY_LABELS[code]}</span>
                <span className="font-display font-bold inline-flex items-center gap-1">
                  {CURRENCY_SYMBOLS[code]}1 = {data[code].toFixed(3)}
                  <BynSign className="size-3" />
                </span>
              </div>
            ))}
          </div>
        )}
        <p className="text-[11px] text-ink-muted/70 mt-3 pt-3 border-t border-line">
          Курс обновляется раз в час
        </p>
      </PopoverContent>
    </Popover>
  );
}
