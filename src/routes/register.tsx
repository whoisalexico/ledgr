import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { registerSchema, type RegisterInput } from "../lib/auth-schemas";
import { registerFn } from "./api/auth/-register.ts";
import { ArrowRight, Eye, EyeOff, Tags, Zap } from "lucide-react";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Регистрация — Ledgr" },
      {
        name: "description",
        content: "Создайте бесплатный аккаунт Ledgr и начните учёт финансов.",
      },
    ],
  }),
  component: RegisterPage,
});

function RegisterPage() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterInput) => {
    setServerError(null);
    try {
      await registerFn({ data });
      await navigate({ to: "/dashboard" });
    } catch (err) {
      if (err instanceof Error) {
        setServerError(err.message);
      }
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-bg font-sans text-ink antialiased">
      <BrandPanel />

      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="lg:hidden mb-8">
            <Logo />
          </div>

          <h1 className="font-display text-3xl font-extrabold tracking-tight">Создайте аккаунт</h1>
          <p className="text-ink-muted text-sm mt-2 mb-8">
            Бесплатно, без рекламы и подписок. Меньше минуты.
          </p>

          {serverError && (
            <div className="mb-5 rounded-xl bg-loss/10 border border-loss/20 px-4 py-3 text-sm text-loss">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Field label="Имя" error={errors.name?.message}>
              <input
                id="name"
                type="text"
                autoComplete="name"
                placeholder="Иван Иванов"
                className="ledgr-input"
                {...register("name")}
              />
            </Field>

            <Field label="Email" error={errors.email?.message}>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                className="ledgr-input"
                {...register("email")}
              />
            </Field>

            <Field label="Пароль" error={errors.password?.message}>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Минимум 8 символов"
                  className="ledgr-input pr-10"
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink transition-colors"
                  aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </Field>

            <Field label="Повторите пароль" error={errors.confirmPassword?.message}>
              <input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="••••••••"
                className="ledgr-input"
                {...register("confirmPassword")}
              />
            </Field>

            <button
              type="submit"
              disabled={isSubmitting}
              className="group w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-brand text-white px-4 py-3.5 text-sm font-bold shadow-brand hover:scale-[1.01] transition-transform disabled:pointer-events-none disabled:opacity-60"
            >
              {isSubmitting ? "Создаём аккаунт…" : "Зарегистрироваться"}
              {!isSubmitting && (
                <ArrowRight className="size-4 group-hover:translate-x-0.5 transition-transform" />
              )}
            </button>
          </form>

          <p className="text-center text-sm text-ink-muted mt-8">
            Уже есть аккаунт?{" "}
            <Link
              to="/login"
              className="font-semibold text-brand hover:underline underline-offset-4"
            >
              Войти
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-semibold text-ink">{label}</label>
      {children}
      {error && <p className="text-xs text-loss font-medium">{error}</p>}
    </div>
  );
}

function Logo() {
  return (
    <div className="flex items-center gap-2">
      <div className="size-8 bg-brand rounded-lg flex items-center justify-center shadow-brand">
        <div className="size-3.5 bg-white rounded-sm rotate-45" />
      </div>
      <span className="font-display text-xl font-bold tracking-tight">Ledgr.</span>
    </div>
  );
}

function BrandPanel() {
  return (
    <div className="hidden lg:flex relative flex-col justify-between overflow-hidden bg-ink p-12 text-white">
      <div className="absolute -top-24 -right-24 size-72 rounded-full bg-brand/40 blur-3xl" />
      <div className="absolute -bottom-32 -left-24 size-80 rounded-full bg-brand/20 blur-3xl" />

      <div className="relative">
        <Link to="/" className="inline-flex items-center gap-2">
          <div className="size-8 bg-brand rounded-lg flex items-center justify-center">
            <div className="size-3.5 bg-white rounded-sm rotate-45" />
          </div>
          <span className="font-display text-xl font-bold tracking-tight">Ledgr.</span>
        </Link>
      </div>

      <div className="relative max-w-sm">
        <h2 className="font-display text-4xl font-extrabold leading-tight tracking-tight">
          Начни вести бюджет <span className="text-brand">уже сегодня.</span>
        </h2>
        <p className="text-white/60 mt-4 leading-relaxed">
          Присоединяйся к тем, кто перестал считать деньги в таблицах и заметках.
        </p>

        <div className="mt-10 space-y-3">
          <Highlight icon={<Zap className="size-4" />} text="Мгновенный ввод транзакций" />
          <Highlight icon={<Tags className="size-4" />} text="Умные категории расходов" />
        </div>
      </div>

      <div className="relative text-white/40 text-xs font-medium">
        © 2026 Ledgr · Pet-проект на React
      </div>
    </div>
  );
}

function Highlight({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-3 text-sm text-white/80">
      <span className="size-8 rounded-xl bg-white/10 flex items-center justify-center text-brand">
        {icon}
      </span>
      {text}
    </div>
  );
}
