import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../lib/use-auth";
import { logoutFn } from "./api/auth/-logout.ts";
import { listOperationsFn, getDashboardStatsFn } from "./api/operations/-operations";
import { getTopCategoriesFn } from "./api/operations/-categories-stats";
import { getBalanceHistoryFn } from "./api/operations/-balance-history";
import { AddOperationDialog } from "@/components/operations/add-operation-dialog";
import { CurrencySelector } from "@/components/operations/currency-selector";
import { ExchangeRatesIndicator } from "@/components/operations/exchange-rates-indicator";
import {
  OperationFilters,
  type OperationFiltersState,
} from "@/components/operations/operation-filters";
import { DisplayCurrencyProvider, useDisplayCurrency } from "@/lib/display-currency";
import { CurrencyAmount } from "@/components/operations/currency-amount";
import type { SupportedCurrency } from "@/lib/currency-constants";
import {
  ArrowDownRight,
  ArrowUpRight,
  LogOut,
  Plus,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [{ title: "Дашборд — Ledgr" }],
  }),
  component: () => (
    <DisplayCurrencyProvider>
      <DashboardPage />
    </DisplayCurrencyProvider>
  ),
});

function DashboardPage() {
  const { user } = useAuth();
  const displayName = user?.name ?? user?.email?.split("@")[0] ?? "гость";
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [dialogKey, setDialogKey] = useState(0);

  return (
    <div className="min-h-screen bg-bg font-sans text-ink antialiased">
      <Topbar email={user?.email} name={user?.name} />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight">
              Привет, {displayName} 👋
            </h1>
            <p className="text-ink-muted text-sm mt-1">
              Вот как выглядят ваши финансы в июне 2026.
            </p>
          </div>
          <button
            onClick={() => {
              setDialogKey((k) => k + 1);
              setIsAddOpen(true);
            }}
            className="inline-flex items-center justify-center gap-2 bg-brand text-white px-5 py-2.5 rounded-2xl text-sm font-bold shadow-brand hover:scale-[1.02] transition-transform shrink-0"
          >
            <Plus className="size-4" />
            Новая операция
          </button>
        </div>
        <DashboardStats />
        <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
          <section className="lg:col-span-2 bg-white rounded-3xl border border-line p-4 sm:p-6 shadow-sm min-w-0">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="text-xs font-medium text-ink-muted uppercase tracking-wider">
                  Динамика баланса
                </div>
                <div className="font-display text-xl font-bold mt-1">Последние 6 месяцев</div>
              </div>
            </div>
            <BalanceChart />
          </section>
          <section className="bg-white rounded-3xl border border-line p-4 sm:p-6 shadow-sm min-w-0">
            <div className="font-display text-lg font-bold mb-5">Топ категорий</div>
            <TopCategories />
          </section>
        </div>
        <section className="mt-4 sm:mt-6 bg-white rounded-3xl border border-line shadow-sm overflow-hidden">
          <TransactionList />
        </section>
      </main>

      <AddOperationDialog key={dialogKey} open={isAddOpen} onOpenChange={setIsAddOpen} />
    </div>
  );
}

function Topbar({ email, name }: { email?: string; name?: string | null }) {
  const initial = (name ?? email ?? "L").charAt(0).toUpperCase();
  return (
    <header className="sticky top-0 z-10 bg-bg/80 backdrop-blur-md border-b border-line">
      <div className="max-w-6xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-1.5 sm:gap-2">
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <div className="size-8 bg-brand rounded-lg flex items-center justify-center shadow-brand shrink-0">
            <div className="size-3.5 bg-white rounded-sm rotate-45" />
          </div>
          <span className="hidden sm:inline font-display text-lg sm:text-xl font-bold tracking-tight">
            Ledgr.
          </span>
        </div>
        <div className="flex items-center gap-1 sm:gap-3 min-w-0 overflow-hidden">
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            <ExchangeRatesIndicator />
            <CurrencySelector />
          </div>
          <div className="hidden lg:flex items-center gap-2.5 shrink-0">
            <div className="size-9 rounded-full bg-brand-soft text-brand flex items-center justify-center font-bold text-sm shrink-0">
              {initial}
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold">{name ?? "Аккаунт"}</div>
              <div className="text-xs text-ink-muted">{email ?? "—"}</div>
            </div>
          </div>
          <a
            href="/"
            onClick={() => logoutFn()}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-muted border border-line px-2 sm:px-3 py-2 rounded-xl hover:bg-white hover:text-loss transition-colors shrink-0"
          >
            <LogOut className="size-4" />
            <span className="hidden sm:inline">Выйти</span>
          </a>
        </div>
      </div>
    </header>
  );
}

function formatDelta(percent: number | null): string | null {
  if (percent === null) return null;
  const rounded = Math.round(percent * 10) / 10;
  const sign = rounded > 0 ? "+" : "";
  return `${sign}${rounded.toLocaleString("ru-RU")}%`;
}

function DashboardStats() {
  const { currency } = useDisplayCurrency();

  const { data, isLoading } = useQuery({
    queryKey: ["dashboard-stats", currency],
    queryFn: () => getDashboardStatsFn({ data: { currency } }),
  });

  const incomeDelta = data ? formatDelta(data.incomeDeltaPercent) : null;
  const expenseDelta = data ? formatDelta(data.expenseDeltaPercent) : null;
  const balance = data?.balance ?? 0;

  const incomeDeltaTone: "gain" | "loss" | "neutral" =
    data?.incomeDeltaPercent == null ? "neutral" : data.incomeDeltaPercent >= 0 ? "gain" : "loss";

  const expenseDeltaTone: "gain" | "loss" | "neutral" =
    data?.expenseDeltaPercent == null ? "neutral" : data.expenseDeltaPercent > 0 ? "loss" : "gain";

  return (
    <div className="grid md:grid-cols-3 gap-4 mb-6">
      <StatCard
        label="Баланс"
        value={isLoading ? "…" : <CurrencyAmount amount={balance} currency={currency} />}
        delta={balance < 0 ? "Баланс отрицательный" : "Текущий доступный баланс"}
        tone="brand"
        deltaTone={balance < 0 ? "loss" : "neutral"}
        icon={<Wallet className="size-4" />}
      />
      <StatCard
        label="Доходы"
        value={isLoading ? "…" : <CurrencyAmount amount={data?.income ?? 0} currency={currency} />}
        delta={incomeDelta ? `${incomeDelta} к прошлому месяцу` : "За текущий месяц"}
        tone="gain"
        deltaTone={incomeDeltaTone}
        icon={<TrendingUp className="size-4" />}
      />
      <StatCard
        label="Расходы"
        value={isLoading ? "…" : <CurrencyAmount amount={data?.expense ?? 0} currency={currency} />}
        delta={expenseDelta ? `${expenseDelta} к прошлому месяцу` : "За текущий месяц"}
        tone="loss"
        deltaTone={expenseDeltaTone}
        icon={<TrendingDown className="size-4" />}
      />
    </div>
  );
}

function StatCard({
  label,
  value,
  delta,
  tone,
  deltaTone,
  icon,
}: {
  label: string;
  value: React.ReactNode;
  delta: string;
  tone: "brand" | "gain" | "loss";
  deltaTone?: "brand" | "gain" | "loss" | "neutral";
  icon: React.ReactNode;
}) {
  const toneClass =
    tone === "brand"
      ? "text-brand bg-brand-soft"
      : tone === "gain"
        ? "text-gain bg-gain/10"
        : "text-loss bg-loss/10";

  const resolvedDeltaTone = deltaTone ?? tone;
  const deltaClass =
    resolvedDeltaTone === "loss"
      ? "text-loss"
      : resolvedDeltaTone === "gain"
        ? "text-gain"
        : resolvedDeltaTone === "neutral"
          ? "text-ink-muted"
          : "text-brand";

  return (
    <div className="bg-white rounded-3xl border border-line p-4 sm:p-6 shadow-sm min-w-0">
      <div className="flex items-center justify-between gap-2">
        <div className="text-xs font-medium text-ink-muted uppercase tracking-wider truncate">
          {label}
        </div>
        <div className={`p-2 rounded-xl shrink-0 ${toneClass}`}>{icon}</div>
      </div>
      <div className="font-display text-2xl sm:text-3xl font-extrabold mt-3 truncate">{value}</div>
      <div className={`text-xs font-semibold mt-1.5 truncate ${deltaClass}`}>{delta}</div>
    </div>
  );
}

function TopCategories() {
  const { currency } = useDisplayCurrency();

  const { data, isLoading } = useQuery({
    queryKey: ["top-categories", currency],
    queryFn: () => getTopCategoriesFn({ data: { currency } }),
  });

  const palette: Array<"brand" | "gain" | "loss" | "ink"> = ["brand", "gain", "loss", "ink"];

  if (isLoading) {
    return <p className="text-sm text-ink-muted">Загружаем…</p>;
  }

  if (!data || data.length === 0) {
    return <p className="text-sm text-ink-muted">Пока нет расходов в этом месяце</p>;
  }

  return (
    <div className="space-y-5">
      {data.map((cat, i) => (
        <CategoryBar
          key={cat.categoryId}
          label={cat.name}
          amount={<CurrencyAmount amount={cat.amount} currency={currency} />}
          percent={cat.percent}
          tone={palette[i % palette.length]}
        />
      ))}
    </div>
  );
}

function CategoryBar({
  label,
  amount,
  percent,
  tone,
}: {
  label: string;
  amount: React.ReactNode;
  percent: number;
  tone: "brand" | "gain" | "loss" | "ink";
}) {
  const barClass =
    tone === "brand"
      ? "bg-brand"
      : tone === "gain"
        ? "bg-gain"
        : tone === "loss"
          ? "bg-loss"
          : "bg-ink";
  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-2">
        <span className="font-medium">{label}</span>
        <span className="font-display font-bold">{amount}</span>
      </div>
      <div className="h-2 rounded-full bg-bg overflow-hidden">
        <div className={`h-full rounded-full ${barClass}`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

function isWithinPeriod(date: Date, period: OperationFiltersState["period"]): boolean {
  if (period === "ALL") return true;

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (period === "DAY") {
    return date >= startOfToday;
  }

  if (period === "WEEK") {
    const startOfWeek = new Date(startOfToday);
    // Понедельник как начало недели
    const dow = (startOfToday.getDay() + 6) % 7;
    startOfWeek.setDate(startOfToday.getDate() - dow);
    return date >= startOfWeek;
  }

  // MONTH
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  return date >= startOfMonth;
}

function TransactionList() {
  const [filters, setFilters] = useState<OperationFiltersState>({
    search: "",
    type: "ALL",
    categoryId: "ALL",
    period: "ALL",
  });

  const {
    data: operations,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["operations"],
    queryFn: () => listOperationsFn(),
  });

  const categories = useMemo(() => {
    if (!operations) return [];
    const map = new Map<string, { id: string; name: string }>();
    for (const op of operations) {
      map.set(op.category.id, { id: op.category.id, name: op.category.name });
    }
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name, "ru"));
  }, [operations]);

  const filtered = useMemo(() => {
    if (!operations) return [];
    const search = filters.search.trim().toLowerCase();

    return operations.filter((op) => {
      if (filters.type !== "ALL" && op.type !== filters.type) return false;
      if (filters.categoryId !== "ALL" && op.category.id !== filters.categoryId) return false;
      if (search && !op.title.toLowerCase().includes(search)) return false;
      if (!isWithinPeriod(new Date(op.date), filters.period)) return false;
      return true;
    });
  }, [operations, filters]);

  return (
    <>
      <OperationFilters state={filters} onChange={setFilters} categories={categories} />

      {isLoading && (
        <div className="px-6 py-10 text-center text-sm text-ink-muted">Загружаем операции…</div>
      )}

      {isError && (
        <div className="px-6 py-10 text-center text-sm text-loss">
          Не удалось загрузить операции
        </div>
      )}

      {!isLoading && !isError && operations && operations.length === 0 && (
        <div className="px-6 py-12 text-center">
          <p className="text-sm text-ink-muted">Операций пока нет</p>
          <p className="text-xs text-ink-muted/70 mt-1">
            Нажмите «Новая операция», чтобы добавить первую запись
          </p>
        </div>
      )}

      {!isLoading && !isError && operations && operations.length > 0 && filtered.length === 0 && (
        <div className="px-6 py-12 text-center">
          <p className="text-sm text-ink-muted">Ничего не найдено</p>
          <p className="text-xs text-ink-muted/70 mt-1">Попробуйте изменить фильтры или поиск</p>
        </div>
      )}

      {!isLoading && !isError && filtered.length > 0 && (
        <div>
          {filtered.map((op, i) => {
            const isIncome = op.type === "INCOME";
            const amount = Number(op.amount);
            const opCurrency = op.currency as SupportedCurrency;
            const tag = op.title.charAt(0).toUpperCase();
            const bg = isIncome ? "bg-gain/10 text-gain" : "bg-bg text-ink";
            const formattedDate = new Date(op.date).toLocaleDateString("ru-RU", {
              day: "numeric",
              month: "short",
            });

            return (
              <div
                key={op.id}
                className={`px-3 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-2 ${
                  i !== filtered.length - 1 ? "border-b border-line/60" : ""
                }`}
              >
                <div className="flex items-center gap-2.5 sm:gap-4 min-w-0">
                  <div
                    className={`size-9 sm:size-10 ${bg} rounded-xl flex items-center justify-center font-bold shrink-0`}
                  >
                    {tag}
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold truncate">{op.title}</div>
                    <div className="text-xs text-ink-muted truncate">
                      {op.category.name} · {formattedDate}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                  {isIncome ? (
                    <ArrowUpRight className="size-4 text-gain shrink-0" />
                  ) : (
                    <ArrowDownRight className="size-4 text-loss shrink-0" />
                  )}
                  <span
                    className={`font-display font-bold whitespace-nowrap ${isIncome ? "text-gain" : "text-loss"}`}
                  >
                    {isIncome ? "+" : "-"}
                    <CurrencyAmount amount={amount} currency={opCurrency} />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

function BalanceChart() {
  const { currency } = useDisplayCurrency();

  const { data, isLoading } = useQuery({
    queryKey: ["balance-history", currency],
    queryFn: () => getBalanceHistoryFn({ data: { currency } }),
  });

  if (isLoading || !data) {
    return (
      <div className="w-full h-48 flex items-center justify-center text-sm text-ink-muted">
        Загружаем…
      </div>
    );
  }

  const points = data.values;
  const min = Math.min(...points, 0);
  const max = Math.max(...points, 1);
  const range = max - min || 1;
  const w = 600;
  const h = 180;
  const step = points.length > 1 ? w / (points.length - 1) : w;
  const path = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${i * step} ${h - ((p - min) / range) * h}`)
    .join(" ");
  const area = `${path} L ${w} ${h} L 0 ${h} Z`;

  return (
    <div>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-48">
        <defs>
          <linearGradient id="dash-g" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="oklch(0.585 0.214 277)" stopOpacity="0.35" />
            <stop offset="100%" stopColor="oklch(0.585 0.214 277)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#dash-g)" />
        <path
          d={path}
          fill="none"
          stroke="oklch(0.585 0.214 277)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <div className="flex justify-between text-xs text-ink-muted mt-2 px-1">
        {data.labels.map((label, i) => (
          <span key={`${label}-${i}`}>{label}</span>
        ))}
      </div>
    </div>
  );
}
