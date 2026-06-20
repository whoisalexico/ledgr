import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Zap,
  Tags,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  Sparkles,
  Github,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ledgr — Pet-проект для учёта доходов и расходов" },
      {
        name: "description",
        content:
          "Минималистичный трекер личных финансов на React. Фиксируй приход/расход за секунды, следи за бюджетом и привычками.",
      },
      { property: "og:title", content: "Ledgr — учёт доходов и расходов" },
      {
        property: "og:description",
        content: "Минималистичный трекер личных финансов на React. Pet-проект с открытым кодом.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-bg font-sans text-ink antialiased">
      <Nav />
      <main>
        <Hero />
        <DashboardPreview />
        <Features />
        <Transactions />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}

function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="size-8 bg-brand rounded-lg flex items-center justify-center shadow-brand">
        <div className="size-3.5 bg-white rounded-sm rotate-45" />
      </div>
      <span className="font-display text-xl font-bold tracking-tight">Ledgr.</span>
    </div>
  );
}

function Nav() {
  return (
    <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
      <Logo />
      <div className="hidden md:flex items-center gap-8 text-sm font-medium text-ink-muted">
        <a href="#features" className="hover:text-brand transition-colors">
          Возможности
        </a>
        <a href="#preview" className="hover:text-brand transition-colors">
          Интерфейс
        </a>
        <a href="https://github.com" className="hover:text-brand transition-colors">
          GitHub
        </a>
      </div>
      <Link
        to="/login"
        className="bg-ink text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-ink/90 transition-all"
      >
        Начать
      </Link>
    </nav>
  );
}

function Hero() {
  return (
    <header className="pt-16 pb-24 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 bg-brand-soft text-brand px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-6">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-brand" />
          </span>
          Pet-проект · Открытая бета
        </div>
        <h1 className="font-display text-5xl md:text-7xl font-extrabold tracking-tight text-ink mb-6 leading-[1.05]">
          Управляй деньгами <br />
          <span className="text-brand">без таблиц и хаоса.</span>
        </h1>
        <p className="text-lg text-ink-muted max-w-xl mx-auto mb-10 leading-relaxed">
          Минималистичный трекер личных финансов на React. Записывай приход и расход за секунды,
          следи за бюджетом и достигай целей быстрее.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="/register"
            className="w-full sm:w-auto bg-brand text-white px-8 py-4 rounded-2xl font-bold shadow-brand hover:scale-[1.02] transition-transform inline-flex items-center justify-center gap-2"
          >
            Создать аккаунт
            <ArrowRight className="size-4" />
          </a>
          <a
            href="#preview"
            className="w-full sm:w-auto bg-white border border-line text-ink-muted px-8 py-4 rounded-2xl font-bold hover:bg-bg transition-colors"
          >
            Живое демо
          </a>
        </div>
      </div>
    </header>
  );
}

function DashboardPreview() {
  return (
    <section id="preview" className="px-6 -mt-12">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-[2rem] p-4 shadow-2xl border border-line/60">
          <div className="rounded-[1.5rem] overflow-hidden border border-line/60 bg-bg">
            {/* Window chrome */}
            <div className="flex items-center gap-2 px-5 py-3 border-b border-line/70 bg-white">
              <span className="size-2.5 rounded-full bg-loss/40" />
              <span className="size-2.5 rounded-full bg-amber-300/60" />
              <span className="size-2.5 rounded-full bg-gain/40" />
              <span className="ml-4 text-[11px] font-medium text-ink-muted">
                ledgr.app / dashboard
              </span>
            </div>

            <div className="grid md:grid-cols-3 gap-4 p-5">
              <StatCard
                label="Баланс"
                value="₽ 248 320"
                delta="+8.2% к прошлому месяцу"
                tone="brand"
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

            <div className="px-5 pb-5">
              <div className="bg-white rounded-2xl border border-line/70 p-5">
                <div className="flex items-center justify-between mb-4">
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
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
  icon?: React.ReactNode;
}) {
  const toneClass =
    tone === "brand"
      ? "text-brand bg-brand-soft"
      : tone === "gain"
        ? "text-gain bg-gain/10"
        : "text-loss bg-loss/10";
  return (
    <div className="bg-white rounded-2xl border border-line/70 p-5">
      <div className="flex items-center justify-between">
        <div className="text-xs font-medium text-ink-muted uppercase tracking-wider">{label}</div>
        {icon && <div className={`p-1.5 rounded-md ${toneClass}`}>{icon}</div>}
      </div>
      <div className="font-display text-2xl font-bold mt-2">{value}</div>
      <div
        className={`text-xs font-semibold mt-1 ${tone === "loss" ? "text-loss" : tone === "gain" ? "text-gain" : "text-brand"}`}
      >
        {delta}
      </div>
    </div>
  );
}

function BalanceChart() {
  // Simple SVG area chart
  const points = [40, 70, 55, 90, 75, 110, 95, 140, 120, 160, 145, 185];
  const max = 200;
  const w = 600;
  const h = 160;
  const step = w / (points.length - 1);
  const path = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${i * step} ${h - (p / max) * h}`)
    .join(" ");
  const area = `${path} L ${w} ${h} L 0 ${h} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-40">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="oklch(0.585 0.214 277)" stopOpacity="0.35" />
          <stop offset="100%" stopColor="oklch(0.585 0.214 277)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#g)" />
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

function Features() {
  const items = [
    {
      icon: <Zap className="size-5 text-gain" />,
      bg: "bg-gain/10",
      title: "Мгновенный ввод",
      text: "Командный интерфейс: записывай транзакцию быстрее, чем тратишь на кофе. Никаких громоздких форм.",
    },
    {
      icon: <Tags className="size-5 text-brand" />,
      bg: "bg-brand-soft",
      title: "Умные категории",
      text: "Автоматически сортирует расходы по группам — продукты, техника, подписки — по простым правилам.",
    },
    {
      icon: <ShieldCheck className="size-5 text-loss" />,
      bg: "bg-loss/10",
      title: "Без компромиссов",
      text: "Open-source и privacy-first. Данные остаются у тебя — на устройстве или в собственном облаке.",
    },
  ];
  return (
    <section id="features" className="py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-3 gap-12">
          {items.map((f) => (
            <div key={f.title} className="group">
              <div
                className={`size-12 ${f.bg} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}
              >
                {f.icon}
              </div>
              <h3 className="font-display text-xl font-bold mb-3">{f.title}</h3>
              <p className="text-ink-muted leading-relaxed">{f.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Transactions() {
  const rows = [
    {
      tag: "S",
      name: "Spotify Premium",
      cat: "Подписка",
      amount: -299,
      tone: "loss" as const,
      bg: "bg-bg",
    },
    {
      tag: "З",
      name: "Зарплата",
      cat: "Доход",
      amount: 142000,
      tone: "gain" as const,
      bg: "bg-brand-soft text-brand",
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
      tag: "F",
      name: "Freelance проект",
      cat: "Доход",
      amount: 28500,
      tone: "gain" as const,
      bg: "bg-gain/10 text-gain",
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
    <section className="pb-32 px-6">
      <div className="max-w-3xl mx-auto bg-white border border-line rounded-3xl overflow-hidden shadow-sm">
        <div className="px-8 py-6 border-b border-line flex justify-between items-center">
          <h4 className="font-display font-bold text-lg">Последние операции</h4>
          <span className="text-xs font-semibold text-ink-muted tracking-wider">ИЮНЬ 2026</span>
        </div>
        {rows.map((r, i) => (
          <div
            key={i}
            className={`px-8 py-5 flex items-center justify-between ${i !== rows.length - 1 ? "border-b border-line/60" : ""}`}
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
            <div
              className={`font-display font-bold ${r.tone === "gain" ? "text-gain" : "text-loss"}`}
            >
              {r.amount > 0 ? "+" : ""}
              {r.amount.toLocaleString("ru-RU")} ₽
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="px-6 pb-32">
      <div className="max-w-5xl mx-auto bg-ink rounded-[2rem] p-12 md:p-16 text-center relative overflow-hidden">
        <div className="absolute -top-20 -right-20 size-64 rounded-full bg-brand/30 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 size-64 rounded-full bg-brand/20 blur-3xl" />
        <div className="relative">
          <Sparkles className="size-8 text-brand mx-auto mb-4" />
          <h2 className="font-display text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4">
            Возьми финансы под контроль
          </h2>
          <p className="text-white/70 max-w-lg mx-auto mb-8">
            Бесплатно, без рекламы и подписок. Pet-проект, который реально работает.
          </p>
          <a
            href="/register.tsx"
            className="inline-flex items-center gap-2 bg-brand text-white px-8 py-4 rounded-2xl font-bold shadow-brand hover:scale-[1.02] transition-transform"
          >
            Начать бесплатно
            <ArrowRight className="size-4" />
          </a>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-line py-12 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        <Logo />
        <p className="text-ink-muted text-sm">© 2026 Ledgr · Pet-проект на React</p>
        <div className="flex gap-6 text-sm font-medium text-ink-muted">
          <a
            href="https://github.com"
            className="hover:text-brand inline-flex items-center gap-1.5"
          >
            <Github className="size-4" /> GitHub
          </a>
          <a href="#" className="hover:text-brand">
            Приватность
          </a>
          <a href="#" className="hover:text-brand">
            Контакты
          </a>
        </div>
      </div>
    </footer>
  );
}
