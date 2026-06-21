import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "../lib/use-auth";
import { logoutFn } from "./api/auth/-logout.ts";
import {
  ArrowDownRight,
  ArrowUpRight,
  LogOut,
  Plus,
  Search,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [{ title: "Дашборд — Ledgr" }],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const { user } = useAuth();
  const displayName = user?.name ?? user?.email?.split("@")[0] ?? "гость";
  return (
    <div className="min-h-screen bg-bg font-sans text-ink antialiased">
      <Topbar email={user?.email} name={user?.name} />
      <main className="max-w-6xl mx-auto px-6 py-10">
        {/* Greeting */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl font-extrabold tracking-tight">
              Привет, {displayName} 👋
            </h1>
            <p className="text-ink-muted text-sm mt-1">
              Вот как выглядят ваши финансы в июне 2026.
            </p>
          </div>
          <button className="inline-flex items-center gap-2 bg-brand text-white px-5 py-2.5 rounded-2xl text-sm font-bold shadow-brand hover:scale-[1.02] transition-transform">
            <Plus className="size-4" />
            Новая операция
          </button>
        </div>
        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <StatCard
            label="Баланс"
            value="₽ 248 320"
            delta="+8.2% к прошлому месяцу"
            tone="brand"
            icon={<Wallet className="size-4" />}
          />
          <StatCard
            label="Доходы"
            value="₽ 142 000"
            delta="+12.4%"
            tone="gain"
            icon={<TrendingUp className="size-4" />}
          />
          <StatCard
            label="Расходы"
            value="₽ 87 680"
            delta="-3.1%"
            tone="loss"
            icon={<TrendingDown className="size-4" />}
          />
        </div>
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Chart */}
          <section className="lg:col-span-2 bg-white rounded-3xl border border-line p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="text-xs font-medium text-ink-muted uppercase tracking-wider">
                  Динамика баланса
                </div>
                <div className="font-display text-xl font-bold mt-1">Последние 6 месяцев</div>
              </div>
              <div className="flex gap-1 text-xs font-medium">
                {["1М", "3М", "6М", "1Г"].map((p, i) => (
                  <span
                    key={p}
                    className={`px-2.5 py-1 rounded-md ${
                      i === 2 ? "bg-brand text-white" : "text-ink-muted bg-bg"
                    }`}
                  >
                    {p}
                  </span>
                ))}
              </div>
            </div>
            <BalanceChart />
          </section>
          {/* Categories */}
          <section className="bg-white rounded-3xl border border-line p-6 shadow-sm">
            <div className="font-display text-lg font-bold mb-5">Топ категорий</div>
            <div className="space-y-5">
              <CategoryBar label="Продукты" amount="₽ 24 300" percent={68} tone="brand" />
              <CategoryBar label="Подписки" amount="₽ 12 990" percent={42} tone="gain" />
              <CategoryBar label="Техника" amount="₽ 12 990" percent={36} tone="loss" />
              <CategoryBar label="Транспорт" amount="₽ 6 400" percent={20} tone="ink" />
            </div>
          </section>
        </div>
        {/* Transactions */}
        <section className="mt-6 bg-white rounded-3xl border border-line shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-line flex items-center justify-between gap-4">
            <h2 className="font-display font-bold text-lg">Последние операции</h2>
            <div className="hidden sm:flex items-center gap-2 bg-bg border border-line rounded-xl px-3 py-2 text-sm text-ink-muted">
              <Search className="size-4" />
              <input
                placeholder="Поиск…"
                className="bg-transparent outline-none placeholder:text-ink-muted w-32"
              />
            </div>
          </div>
          <TransactionList />
        </section>
      </main>
    </div>
  );
}
function Topbar({ email, name }: { email?: string; name?: string | null }) {
  const initial = (name ?? email ?? "L").charAt(0).toUpperCase();
  return (
    <header className="sticky top-0 z-10 bg-bg/80 backdrop-blur-md border-b border-line">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="size-8 bg-brand rounded-lg flex items-center justify-center shadow-brand">
            <div className="size-3.5 bg-white rounded-sm rotate-45" />
          </div>
          <span className="font-display text-xl font-bold tracking-tight">Ledgr.</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2.5">
            <div className="size-9 rounded-full bg-brand-soft text-brand flex items-center justify-center font-bold text-sm">
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
            className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-muted border border-line px-3 py-2 rounded-xl hover:bg-white hover:text-loss transition-colors"
          >
            <LogOut className="size-4" />
            <span className="hidden sm:inline">Выйти</span>
          </a>
        </div>
      </div>
    </header>
  );
}
function StatCard({
  label,
  value,
  delta,
  tone,
  icon,
}: {
  label: string;
  value: string;
  delta: string;
  tone: "brand" | "gain" | "loss";
  icon: React.ReactNode;
}) {
  const toneClass =
    tone === "brand"
      ? "text-brand bg-brand-soft"
      : tone === "gain"
        ? "text-gain bg-gain/10"
        : "text-loss bg-loss/10";
  return (
    <div className="bg-white rounded-3xl border border-line p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="text-xs font-medium text-ink-muted uppercase tracking-wider">{label}</div>
        <div className={`p-2 rounded-xl ${toneClass}`}>{icon}</div>
      </div>
      <div className="font-display text-3xl font-extrabold mt-3">{value}</div>
      <div
        className={`text-xs font-semibold mt-1.5 ${tone === "loss" ? "text-loss" : tone === "gain" ? "text-gain" : "text-brand"}`}
      >
        {delta}
      </div>
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
  amount: string;
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
function TransactionList() {
  const rows = [
    {
      tag: "З",
      name: "Зарплата",
      cat: "Доход",
      amount: 142000,
      tone: "gain" as const,
      bg: "bg-brand-soft text-brand",
    },
    {
      tag: "S",
      name: "Spotify Premium",
      cat: "Подписка",
      amount: -299,
      tone: "loss" as const,
      bg: "bg-bg",
    },
    {
      tag: "F",
      name: "Freelance проект",
      cat: "Доход",
      amount: 28500,
      tone: "gain" as const,
      bg: "bg-gain/10 text-gain",
    },
    {
      tag: "П",
      name: "Пятёрочка",
      cat: "Продукты",
      amount: -2340,
      tone: "loss" as const,
      bg: "bg-bg",
    },
    {
      tag: "A",
      name: "Apple Store",
      cat: "Техника",
      amount: -12990,
      tone: "loss" as const,
      bg: "bg-bg",
    },
  ];
  return (
    <div>
      {rows.map((r, i) => (
        <div
          key={i}
          className={`px-6 py-4 flex items-center justify-between ${i !== rows.length - 1 ? "border-b border-line/60" : ""}`}
        >
          <div className="flex items-center gap-4">
            <div
              className={`size-10 ${r.bg} rounded-xl flex items-center justify-center font-bold`}
            >
              {r.tag}
            </div>
            <div>
              <div className="font-semibold">{r.name}</div>
              <div className="text-xs text-ink-muted">{r.cat}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {r.tone === "gain" ? (
              <ArrowUpRight className="size-4 text-gain" />
            ) : (
              <ArrowDownRight className="size-4 text-loss" />
            )}
            <span
              className={`font-display font-bold ${r.tone === "gain" ? "text-gain" : "text-loss"}`}
            >
              {r.amount > 0 ? "+" : ""}
              {r.amount.toLocaleString("ru-RU")} ₽
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
function BalanceChart() {
  const points = [40, 70, 55, 90, 75, 110, 95, 140, 120, 160, 145, 185];
  const max = 200;
  const w = 600;
  const h = 180;
  const step = w / (points.length - 1);
  const path = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${i * step} ${h - (p / max) * h}`)
    .join(" ");
  const area = `${path} L ${w} ${h} L 0 ${h} Z`;
  return (
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
  );
}
