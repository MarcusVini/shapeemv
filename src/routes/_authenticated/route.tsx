import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { getSession, setSession } from "@/lib/session";
import { ensureUserSession } from "@/lib/auth.functions";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const session = getSession();
    if (!session) throw redirect({ to: "/" });
    // Refresh the signed token (and the httpOnly cookie when the browser
    // accepts it) so data functions can verify ownership server-side.
    // Network/verification failures must never log the user out.
    try {
      const res = await ensureUserSession({ data: { id: session.id, email: session.email } });
      if (res.ok && res.token && res.token !== session.token) {
        setSession({ ...session, token: res.token });
      }
    } catch {
      /* keep the local session; data calls still carry the stored token */
    }
    return { user: session };
  },
  component: () => <Outlet />,
});
