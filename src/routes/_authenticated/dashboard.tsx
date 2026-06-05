import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { motion } from "framer-motion";
import { ArrowRight, Zap, LogOut } from "lucide-react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { BottomNav } from "@/components/BottomNav";
import { getLatestState } from "@/lib/assessment.functions";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  const fetchState = useServerFn(getLatestState);
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ["state"],
    queryFn: () => fetchState(),
  });

  useEffect(() => {
    if (!data?.workout) return;
    const unlock = new Date(data.workout.unlock_date).getTime();
    if (unlock > Date.now()) {
      navigate({ to: "/waiting", replace: true });
    } else {
      navigate({ to: "/results", replace: true });
    }
  }, [data, navigate]);

  const nome = data?.profile?.nome_completo?.split(" ")[0] ?? "atleta";

  return (
    <main className="min-h-screen bg-background pb-24">
      <div className="mx-auto max-w-md px-6 pt-12">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-primary/80">
              Bem-vindo
            </p>
            <h1 className="mt-1 text-3xl font-black text-foreground">
              Olá, {isLoading ? "…" : nome}
            </h1>
          </div>
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              navigate({ to: "/", replace: true });
            }}
            className="rounded-full p-2 text-muted-foreground hover:text-foreground"
            aria-label="Sair"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative mt-10 overflow-hidden rounded-3xl gold-border bg-card p-7 shadow-gold"
        >
          <div className="absolute -top-12 -right-12 h-40 w-40 rounded-full bg-primary/20 blur-3xl" />
          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary">
              <Zap className="h-3 w-3" /> Próximo passo
            </div>
            <h2 className="mt-4 text-2xl font-black leading-tight">
              Faça sua <span className="text-gold-gradient">avaliação física</span>
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              23 perguntas rápidas para que a inteligência Shape em V monte seu
              protocolo personalizado.
            </p>
            <Link to="/quiz" className="mt-6 block">
              <Button className="h-14 w-full rounded-2xl gold-gradient text-base font-bold text-primary-foreground shadow-gold-sm">
                Fazer minha avaliação <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </motion.div>

        <div className="mt-8 grid grid-cols-3 gap-3 text-center">
          {[
            { v: "23", l: "perguntas" },
            { v: "~5 min", l: "para concluir" },
            { v: "24h", l: "para liberar" },
          ].map((s) => (
            <div
              key={s.l}
              className="rounded-2xl border border-border bg-card/60 p-4"
            >
              <p className="text-lg font-black text-gold-gradient">{s.v}</p>
              <p className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                {s.l}
              </p>
            </div>
          ))}
        </div>
      </div>
      <BottomNav />
    </main>
  );
}
