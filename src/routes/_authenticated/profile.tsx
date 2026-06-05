import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { LogOut, Mail, RefreshCw } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { getLatestState } from "@/lib/assessment.functions";
import { getInitials } from "@/lib/assessment-calc";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const fetchState = useServerFn(getLatestState);
  const navigate = useNavigate();
  const { data } = useQuery({ queryKey: ["state"], queryFn: () => fetchState() });
  const nome = data?.profile?.nome_completo ?? "";
  const email = data?.profile?.email ?? "";
  const hasAssessment = !!data?.assessment;

  function redoAssessment() {
    const ok = window.confirm(
      "Refazer sua avaliação vai gerar uma nova versão personalizada. Suas respostas atuais ficam salvas no histórico. Continuar?",
    );
    if (!ok) return;
    try {
      window.localStorage.removeItem("shapeemv:quiz-progress:v2");
    } catch {
      // ignore
    }
    navigate({ to: "/quiz" });
  }

  return (
    <main className="min-h-screen bg-background pb-24">
      <div className="mx-auto max-w-md px-6 pt-12">
        <p className="text-xs uppercase tracking-[0.3em] text-primary/80">Conta</p>
        <h1 className="mt-1 text-3xl font-black text-foreground">Perfil</h1>

        <div className="mt-8 flex items-center gap-4 rounded-3xl border border-border bg-card p-6 shadow-card-premium">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl gold-gradient text-xl font-black text-primary-foreground shadow-gold-sm">
            {getInitials(nome, email)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-base font-bold text-foreground">{nome || "Atleta"}</p>
            <p className="flex items-center gap-1.5 truncate text-xs text-muted-foreground">
              <Mail className="h-3 w-3" /> {email}
            </p>
          </div>
        </div>

        {hasAssessment ? (
          <Button
            onClick={redoAssessment}
            className="mt-6 h-13 w-full rounded-2xl gold-gradient py-3 text-sm font-bold text-primary-foreground shadow-gold-sm"
          >
            <RefreshCw className="mr-2 h-4 w-4" /> Refazer avaliação
          </Button>
        ) : (
          <Link to="/quiz" className="mt-6 block">
            <Button className="h-13 w-full rounded-2xl gold-gradient py-3 text-sm font-bold text-primary-foreground shadow-gold-sm">
              Fazer minha avaliação
            </Button>
          </Link>
        )}

        <Button
          variant="outline"
          onClick={async () => {
            await supabase.auth.signOut();
            navigate({ to: "/", replace: true });
          }}
          className="mt-3 h-13 w-full rounded-2xl border-border bg-card py-3 text-sm font-semibold text-foreground hover:bg-secondary"
        >
          <LogOut className="mr-2 h-4 w-4" /> Sair da conta
        </Button>

        <p className="mt-10 text-center text-[11px] text-muted-foreground">
          Shape em V • Fernando Cantarelli
        </p>
      </div>
      <BottomNav />
    </main>
  );
}
