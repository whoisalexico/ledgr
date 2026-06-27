import { Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { OperationType } from "@/lib/operation-schemas";

export type TypeFilter = "ALL" | OperationType;
export type PeriodFilter = "ALL" | "DAY" | "WEEK" | "MONTH";

export interface OperationFiltersState {
  search: string;
  type: TypeFilter;
  categoryId: string; // "ALL" | id
  period: PeriodFilter;
}

const TYPE_OPTIONS: { value: TypeFilter; label: string }[] = [
  { value: "ALL", label: "Все" },
  { value: "EXPENSE", label: "Расход" },
  { value: "INCOME", label: "Доход" },
];

const PERIOD_OPTIONS: { value: PeriodFilter; label: string }[] = [
  { value: "ALL", label: "Всё время" },
  { value: "DAY", label: "Сегодня" },
  { value: "WEEK", label: "Неделя" },
  { value: "MONTH", label: "Месяц" },
];

export function OperationFilters({
  state,
  onChange,
  categories,
}: {
  state: OperationFiltersState;
  onChange: (next: OperationFiltersState) => void;
  categories: { id: string; name: string }[];
}) {
  return (
    <div className="px-3 sm:px-6 py-4 border-b border-line flex flex-col gap-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="font-display font-bold text-lg">Последние операции</h2>
        <div className="flex items-center gap-2 bg-bg border border-line rounded-xl px-3 py-2 text-sm text-ink-muted">
          <Search className="size-4 shrink-0" />
          <input
            value={state.search}
            onChange={(e) => onChange({ ...state, search: e.target.value })}
            placeholder="Поиск по названию…"
            className="bg-transparent outline-none placeholder:text-ink-muted w-full sm:w-40 min-w-0"
          />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-2">
        {/* Тип операции */}
        <div className="flex items-center gap-1 bg-bg rounded-xl p-1 w-full sm:w-auto">
          {TYPE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange({ ...state, type: opt.value })}
              className={cn(
                "flex-1 sm:flex-initial px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors",
                state.type === opt.value
                  ? "bg-white text-ink shadow-sm"
                  : "text-ink-muted hover:text-ink",
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Период */}
        <div className="flex items-center gap-1 bg-bg rounded-xl p-1 w-full sm:w-auto">
          {PERIOD_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange({ ...state, period: opt.value })}
              className={cn(
                "flex-1 sm:flex-initial px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors",
                state.period === opt.value
                  ? "bg-white text-ink shadow-sm"
                  : "text-ink-muted hover:text-ink",
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Категория */}
        <Select
          value={state.categoryId}
          onValueChange={(value) => onChange({ ...state, categoryId: value })}
        >
          <SelectTrigger className="h-9 w-full sm:w-auto sm:min-w-0 max-w-full rounded-xl border-line bg-bg text-xs font-semibold text-ink-muted focus:ring-brand">
            <SelectValue placeholder="Категория" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Все категории</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
