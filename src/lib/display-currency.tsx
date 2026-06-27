import { createContext, useContext, useState, type ReactNode } from "react";
import type { SupportedCurrency } from "@/lib/currency-constants";

interface DisplayCurrencyContextValue {
  currency: SupportedCurrency;
  setCurrency: (currency: SupportedCurrency) => void;
}

const DisplayCurrencyContext = createContext<DisplayCurrencyContextValue | null>(null);

export function DisplayCurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrency] = useState<SupportedCurrency>("BYN");

  return (
    <DisplayCurrencyContext.Provider value={{ currency, setCurrency }}>
      {children}
    </DisplayCurrencyContext.Provider>
  );
}

/** Глобальная валюта отображения сумм на дашборде (не влияет на хранимые данные операций) */
export function useDisplayCurrency() {
  const ctx = useContext(DisplayCurrencyContext);
  if (!ctx) {
    throw new Error("useDisplayCurrency должен использоваться внутри DisplayCurrencyProvider");
  }
  return ctx;
}
