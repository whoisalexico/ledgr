import { QueryClient } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { createRootRouteWithContext, Outlet, redirect } from "@tanstack/react-router";
import { getCurrentUser } from "@/lib/auth";

const getUser = createServerFn({ method: "GET" }).handler(async () => {
  return await getCurrentUser();
});

type RouterContext = {
  queryClient: QueryClient;
};

export const Route = createRootRouteWithContext<RouterContext>()({
  beforeLoad: async ({ location }) => {
    const user = await getUser();

    const publicPaths = ["/login", "/register"];
    const isPublic = publicPaths.some((p) => location.pathname.startsWith(p));

    if (!user && !isPublic) {
      throw redirect({ href: "/login" });
    }

    if (user && isPublic) {
      throw redirect({ href: "/dashboard" });
    }

    // Возвращаем ТОЛЬКО user — queryClient не трогаем
    return { user };
  },

  component: () => <Outlet />,
});
