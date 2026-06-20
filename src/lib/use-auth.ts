import { useRouteContext } from "@tanstack/react-router";

/**
 * Используется в компонентах защищённых маршрутов.
 * Данные попадают сюда через beforeLoad в __root.tsx.
 *
 * @example
 * const { user } = useAuth();
 * if (!user) return null; // не должно случиться на защищённом роуте
 */
export function useAuth() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const context = useRouteContext({ from: "__root__" }) as any;
  return { user: context?.user ?? null };
}
