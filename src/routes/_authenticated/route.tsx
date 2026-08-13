import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { getSession, clearSession } from "@/lib/session";
import { ensureUserSession } from "@/lib/auth.functions";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const session = getSession();
    if (!session) throw redirect({ to: "/" });
    // Re-establish the signed httpOnly server session so data functions can
    // verify ownership server-side instead of trusting a client-sent user id.
    try {
      const res = await ensureUserSession({ data: { id: session.id, email: session.email } });
      if (!res.ok) {
        clearSession();
        throw redirect({ to: "/" });
      }
    } catch (err) {
      if (err && typeof err === "object" && "to" in err) throw err;
    }
    return { user: session };
  },
  component: () => <Outlet />,
});
