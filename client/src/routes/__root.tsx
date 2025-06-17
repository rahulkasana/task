import { Outlet, createRootRouteWithContext, redirect } from "@tanstack/react-router";
import type { AuthContextProps } from "@/context/AuthContext.tsx";

interface MyRouterContext {
  auth: AuthContextProps
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: RootComponent,
  beforeLoad: ({ context, location }) => {
    // if (!context.auth.user) {
    //   throw redirect({
    //     to: '/login',
    //     search: {
    //       redirect: location.href,
    //     },
    //   })
    // }
  },
});

function RootComponent() {
  return <Outlet />
}
