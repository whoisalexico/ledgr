import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "../lib/use-auth";
import { logoutFn } from "./api/auth/-logout.ts";

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <header className="border-b">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <span className="font-outfit font-bold text-xl">Ledgr</span>

          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">{user?.name ?? user?.email}</span>
            <a
              href={"/"}
              onClick={() => logoutFn()}
              className="text-sm px-3 py-1.5 rounded-md border hover:bg-accent transition-colors"
            >
              Выйти
            </a>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold font-outfit mb-2">
          Добро пожаловать{user?.name ? `, ${user.name}` : ""}!
        </h1>
        <p className="text-muted-foreground text-sm">
          Вы вошли как <strong>{user?.email}</strong>
        </p>
      </main>
    </div>
  );
}
