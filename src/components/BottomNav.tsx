import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ClipboardList, Dumbbell, Home, Lock, MessageCircle, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession } from "@/lib/session";
import { getLatestState } from "@/lib/assessment.functions";
import { toast } from "sonner";

const WHATSAPP_NUMBER = "554999557290";

/**
 * Top navigation bar.
 * The file is still named `BottomNav.tsx` for import compatibility across pages,
 * but the component is now rendered fixed at the top of the screen.
 */
export function BottomNav() {
  return <TopNav />;
}

export function TopNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const session = useSession();
  const email = session?.email ?? null;

  const fetchState = useServerFn(getLatestState);
  const { data: state } = useQuery({
    queryKey: ["state", session?.id],
    queryFn: () => fetchState({ data: { userId: session!.id, token: session!.token } }),
    enabled: !!session?.id,
    refetchInterval: 30_000,
  });

  const hasAssessment = !!state?.assessment;
  const unlockTs = state?.workout ? new Date(state.workout.unlock_date).getTime() : null;
  const unlocked = !!unlockTs && Date.now() >= unlockTs;

  const supportMessage = encodeURIComponent(
    `Olá, vim do Shape em V (${email ?? "email não identificado"}) e preciso de suporte.`,
  );
  const supportHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${supportMessage}`;

  const itemBase =
    "group relative shrink-0 flex items-center gap-1.5 rounded-xl px-3 py-2 text-[11px] font-bold uppercase tracking-wider transition-colors";
  const itemFor = (active: boolean) =>
    cn(itemBase, active ? "text-primary" : "text-muted-foreground hover:text-foreground");

  const homeActive =
    pathname === "/dashboard" ||
    pathname === "/quiz" ||
    pathname === "/processing" ||
    pathname === "/waiting";
  const diagActive = unlocked && pathname === "/results";
  const treinosActive = unlocked && pathname.startsWith("/protocol");
  const profileActive = pathname.startsWith("/profile");

  const handleLockedClick = () => {
    if (!hasAssessment) {
      toast.info("Responda primeiro sua avaliação física para liberar.");
      navigate({ to: "/dashboard" });
      return;
    }
    navigate({ to: "/waiting" });
  };

  const Underline = ({ show }: { show: boolean }) =>
    show ? (
      <span className="absolute inset-x-2 -bottom-[9px] h-[2px] rounded-full gold-gradient" />
    ) : null;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 pt-[calc(env(safe-area-inset-top)+0.5rem)] pb-2">
        {/* Brand */}
        <Link
          to="/dashboard"
          className="flex shrink-0 items-center gap-2"
          aria-label="Shape em V"
        >
          <span className="grid h-8 w-8 place-items-center rounded-lg gold-gradient text-sm font-black text-primary-foreground shadow-gold-sm">
            V
          </span>
          <span className="hidden text-sm font-black uppercase tracking-[0.2em] text-gold-gradient sm:inline">
            Shape em V
          </span>
        </Link>

        {/* Scrollable nav items */}
        <div className="min-w-0 flex-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex items-center justify-end gap-1">
            <Link to="/dashboard" className={itemFor(homeActive)}>
              <Home className="h-4 w-4" />
              <span>Início</span>
              <Underline show={homeActive} />
            </Link>

            {unlocked ? (
              <Link to="/results" className={itemFor(diagActive)}>
                <ClipboardList className="h-4 w-4" />
                <span>Diagnóstico</span>
                <Underline show={diagActive} />
              </Link>
            ) : (
              <button type="button" onClick={handleLockedClick} className={itemFor(false)}>
                <span className="relative">
                  <ClipboardList className="h-4 w-4 opacity-50" />
                  <Lock className="absolute -bottom-1 -right-1 h-2.5 w-2.5 text-primary" />
                </span>
                <span>Diagnóstico</span>
              </button>
            )}

            {unlocked ? (
              <Link to="/protocol" className={itemFor(treinosActive)}>
                <Dumbbell className="h-4 w-4" />
                <span>Treinos</span>
                <Underline show={treinosActive} />
              </Link>
            ) : (
              <button type="button" onClick={handleLockedClick} className={itemFor(false)}>
                <span className="relative">
                  <Dumbbell className="h-4 w-4 opacity-50" />
                  <Lock className="absolute -bottom-1 -right-1 h-2.5 w-2.5 text-primary" />
                </span>
                <span>Treinos</span>
              </button>
            )}

            <a
              href={supportHref}
              target="_blank"
              rel="noopener noreferrer"
              className={itemFor(false)}
            >
              <MessageCircle className="h-4 w-4" />
              <span>Suporte</span>
            </a>

            <Link to="/profile" className={itemFor(profileActive)}>
              <User className="h-4 w-4" />
              <span>Perfil</span>
              <Underline show={profileActive} />
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
