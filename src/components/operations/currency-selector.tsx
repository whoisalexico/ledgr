import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDisplayCurrency } from "@/lib/display-currency";
import { SUPPORTED_CURRENCIES } from "@/lib/currency-constants";
import { CURRENCY_SYMBOLS } from "@/lib/currency-format";

export function CurrencySelector() {
  const { currency, setCurrency } = useDisplayCurrency();

  return (
    <Select value={currency} onValueChange={(v) => setCurrency(v as typeof currency)}>
      <SelectTrigger className="h-9 w-auto min-w-0 px-2.5 sm:px-3 rounded-xl border-line bg-white text-xs sm:text-sm font-semibold focus:ring-brand gap-1">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {SUPPORTED_CURRENCIES.map((code) => (
          <SelectItem key={code} value={code}>
            {CURRENCY_SYMBOLS[code]} {code}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
