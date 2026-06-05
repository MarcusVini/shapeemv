import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ClipboardList, Dumbbell, Lock, MessageCircle, User } from "lucide-react";
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
  const protocolUnlocked = !!unlockTs && Date.now() >= unlockTs;

  const supportMessage = encodeURIComponent(
    `Olá, vim do Shape em V (${email ?? "email não identificado"}) e preciso de suporte.`,
  );
  const supportHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${supportMessage}`;

  const linkClasses = (active: boolean) =>
    cn(
      "flex flex-1 flex-col items-center gap-1 rounded-xl py-2 text-[11px] font-medium transition-colors",
      active ? "text-primary" : "text-muted-foreground",
    );

  const protocolActive =
    protocolUnlocked && (pathname.startsWith("/protocol") || pathname === "/results");
  const avaliacaoActive = pathname === "/dashboard" || pathname === "/quiz" || pathname === "/processing";

  const handleProtocolClick = () => {
    if (protocolUnlocked) return; // Link navigates normally
    if (!hasAssessment) {
      toast.info("Responda primeiro sua avaliação física para liberar o protocolo.");
      navigate({ to: "/dashboard" });
      return;
    }
    navigate({ to: "/waiting" });
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card/95 backdrop-blur-xl">
      <div className="mx-auto flex max-w-md items-center justify-around px-4 py-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)]">
        <Link to="/dashboard" className={linkClasses(avaliacaoActive)}>
          <ClipboardList
            className={cn("h-5 w-5", avaliacaoActive && "drop-shadow-[0_0_8px_oklch(0.78_0.14_85)]")}
          />
          Avaliação
        </Link>

        {protocolUnlocked ? (
          <Link to="/protocol" className={linkClasses(protocolActive)}>
            <Dumbbell
              className={cn("h-5 w-5", protocolActive && "drop-shadow-[0_0_8px_oklch(0.78_0.14_85)]")}
            />
            Protocolo
          </Link>
        ) : (
          <button type="button" onClick={handleProtocolClick} className={linkClasses(false)}>
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
