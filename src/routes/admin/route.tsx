import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { adminCheck } from "@/lib/admin.functions";

export const Route = createFileRoute("/admin")({
  ssr: false,
  beforeLoad: async ({ location }) => {
    // Allow the login page without a session
    if (location.pathname === "/admin/login") return;
    try {
      const res = await adminCheck();
      if (!res.isAdmin) throw redirect({ to: "/admin/login" });
    } catch {
      throw redirect({ to: "/admin/login" });
    }
  },
  component: () => <Outlet />,
});
