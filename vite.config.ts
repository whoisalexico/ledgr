import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import path from "node:path";

export default defineConfig({
  plugins: [
    // Алиасы из tsconfig.json (например, "@/components/..." → "src/components/...")
    tsConfigPaths(),

    // Tailwind v4 — берёт настройки из src/styles.css (@theme, @import "tailwindcss" и т.п.)
    tailwindcss(),

    // TanStack Start: file-based роутинг (src/routes/**), SSR, server functions.
    // server.entry указывает на src/server.ts — наш SSR-враппер с обработкой ошибок.
    // Платформа сборки задаётся через Nitro (NITRO_PRESET=cloudflare-module и т.п.),
    // НЕ через опцию плагина — у tanstackStart() такого поля нет.
    tanstackStart({
      server: { entry: "server" },
    }),

    // React + Fast Refresh. Ставим ПОСЛЕ tanstackStart — так требует TanStack Start.
    viteReact(),
  ],

  resolve: {
    // Дублируем алиас на случай, если tsconfig-paths не подхватится в каком-то env.
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    // Дедупликация — критично для React 19 и TanStack, иначе ловишь
    // "Invalid hook call" или несколько копий роутера в бандле.
    dedupe: [
      "react",
      "react-dom",
      "@tanstack/react-router",
      "@tanstack/react-start",
      "@tanstack/react-query",
    ],
  },

  server: {
    port: 5173,
    host: true, // слушать на 0.0.0.0 (нужно для Docker / тестов с других устройств)
  },

  preview: {
    port: 4173,
    host: true,
  },
});
