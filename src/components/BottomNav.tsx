import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ClipboardList, Dumbbell, Home, Lock, MessageCircle, User } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { getLatestState } from "@/lib/assessment.functions";
import { toast } from "sonner";

const WHATSAPP_NUMBER = "554999557290";

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setEmail(session?.user?.email ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const fetchState = useServerFn(getLatestState);
  const { data: state } = useQuery({
    queryKey: ["state"],
    queryFn: () => fetchState(),
    refetchInterval: 30_000,
  });

  const hasAssessment = !!state?.assessment;
  const unlockTs = state?.workout ? new Date(state.workout.unlock_date).getTime() : null;
  const unlocked = !!unlockTs && Date.now() >= unlockTs;

  const supportMessage = encodeURIComponent(
    `Olá, vim do Shape em V (${email ?? "email não identificado"}) e preciso de suporte.`,
  );
  const supportHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${supportMessage}`;

  const linkClasses = (active: boolean) =>
    cn(
      "flex flex-1 flex-col items-center gap-1 rounded-xl py-2 text-[10px] font-medium transition-colors",
      active ? "text-primary" : "text-muted-foreground",
    );

  const homeActive = pathname === "/dashboard" || pathname === "/quiz" || pathname === "/processing" || pathname === "/waiting";
  const avaliacaoActive = unlocked && pathname === "/results";
  const protocoloActive = unlocked && pathname.startsWith("/protocol");

  const handleLockedClick = () => {
    if (!hasAssessment) {
      toast.info("Responda primeiro sua avaliação física para liberar.");
      navigate({ to: "/dashboard" });
      return;
    }
    navigate({ to: "/waiting" });
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card/95 backdrop-blur-xl">
      <div className="mx-auto flex max-w-md items-center justify-around px-2 py-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)]">
        <Link to="/dashboard" className={linkClasses(homeActive)}>
          <Home
            className={cn("h-5 w-5", homeActive && "drop-shadow-[0_0_8px_oklch(0.78_0.14_85)]")}
          />
          Início
        </Link>

        {unlocked ? (
          <Link to="/results" className={linkClasses(avaliacaoActive)}>
            <ClipboardList
              className={cn("h-5 w-5", avaliacaoActive && "drop-shadow-[0_0_8px_oklch(0.78_0.14_85)]")}
            />
            Avaliação
          </Link>
        ) : (
          <button type="button" onClick={handleLockedClick} className={linkClasses(false)}>
            <div className="relative">
              <ClipboardList className="h-5 w-5 opacity-50" />
              <Lock className="absolute -bottom-1 -right-1 h-3 w-3 text-primary" />
            </div>
            Avaliação
          </button>
        )}

        {unlocked ? (
          <Link to="/protocol" className={linkClasses(protocoloActive)}>
            <Dumbbell
              className={cn("h-5 w-5", protocoloActive && "drop-shadow-[0_0_8px_oklch(0.78_0.14_85)]")}
            />
            Protocolo
          </Link>
        ) : (
          <button type="button" onClick={handleLockedClick} className={linkClasses(false)}>
            <div className="relative">
              <Dumbbell className="h-5 w-5 opacity-50" />
              <Lock className="absolute -bottom-1 -right-1 h-3 w-3 text-primary" />
            </div>
            Protocolo
          </button>
        )}

        <a
          href={supportHref}
          target="_blank"
          rel="noopener noreferrer"
          className={linkClasses(false)}
        >
          <MessageCircle className="h-5 w-5" />
          Suporte
        </a>

        <Link to="/profile" className={linkClasses(pathname.startsWith("/profile"))}>
          <User
            className={cn(
              "h-5 w-5",
              pathname.startsWith("/profile") && "drop-shadow-[0_0_8px_oklch(0.78_0.14_85)]",
            )}
          />
          Perfil
        </Link>
      </div>
    </nav>
  );
}
