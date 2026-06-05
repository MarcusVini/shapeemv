import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { motion } from "framer-motion";
import { ArrowRight, Zap, LogOut, Lock, Dumbbell } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { BottomNav } from "@/components/BottomNav";
import { WelcomeModal, useWelcomeModal } from "@/components/WelcomeModal";
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

  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const i = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(i);
  }, []);

  const nome = data?.profile?.nome_completo?.split(" ")[0] ?? "atleta";
  const hasAssessment = !!data?.assessment;
  const unlockTs = data?.workout ? new Date(data.workout.unlock_date).getTime() : null;
  const isUnlocked = !!unlockTs && now >= unlockTs;

  const diff = unlockTs ? Math.max(0, unlockTs - now) : 0;
  const h = Math.floor(diff / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  const s = Math.floor((diff % 60_000) / 1000);
  const pad = (n: number) => String(n).padStart(2, "0");

  const { show, dismiss } = useWelcomeModal();

  return (
    <>
      <WelcomeModal show={show} onDismiss={dismiss} />
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

        {!hasAssessment && (
          <>
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

            <div className="mt-8 grid grid-cols-2 gap-3 text-center">
              {[
                { v: "23", l: "perguntas" },
                { v: "~5 min", l: "para concluir" },
              ].map((card) => (
                <div
                  key={card.l}
                  className="rounded-2xl border border-border bg-card/60 p-4"
                >
                  <p className="text-lg font-black text-gold-gradient">{card.v}</p>
                  <p className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                    {card.l}
                  </p>
                </div>
              ))}
            </div>
          </>
        )}

        {hasAssessment && !isUnlocked && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative mt-10 overflow-hidden rounded-3xl gold-border bg-card p-7 shadow-gold"
          >
            <div className="absolute -top-12 -right-12 h-40 w-40 rounded-full bg-primary/20 blur-3xl" />
            <div className="relative">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary">
                <Lock className="h-3 w-3" /> Avaliação recebida
              </div>
              <h2 className="mt-4 text-2xl font-black leading-tight">
                Seu protocolo está sendo <span className="text-gold-gradient">preparado</span>
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Salve o link deste site. O cronômetro abaixo mostra o tempo exato para a sua liberação:
              </p>

              <div className="mt-6 rounded-2xl border border-border bg-background/60 p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground text-center">
                  Liberação em
                </p>
                <div className="mt-3 flex items-center justify-center gap-2 font-black tabular-nums">
                  <TimeBlock value={pad(h)} />
                  <span className="text-3xl text-primary/40">:</span>
                  <TimeBlock value={pad(m)} />
                  <span className="text-3xl text-primary/40">:</span>
                  <TimeBlock value={pad(s)} />
                </div>
                <div className="mt-3 flex justify-around text-[10px] uppercase tracking-wider text-muted-foreground">
                  <span>horas</span>
                  <span>min</span>
                  <span>seg</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {hasAssessment && isUnlocked && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative mt-10 overflow-hidden rounded-3xl gold-border bg-card p-7 shadow-gold"
          >
            <div className="absolute -top-12 -right-12 h-40 w-40 rounded-full bg-primary/20 blur-3xl" />
            <div className="relative">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary">
                <Zap className="h-3 w-3" /> Liberado
              </div>
              <h2 className="mt-4 text-2xl font-black leading-tight">
                Seu <span className="text-gold-gradient">protocolo</span> está pronto!
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Acesse agora seu Shape em V personalizado.
              </p>
              <Link to="/protocol" className="mt-6 block">
                <Button className="h-14 w-full rounded-2xl gold-gradient text-base font-bold text-primary-foreground shadow-gold-sm">
                  Acessar meu protocolo <Dumbbell className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </div>
      <BottomNav />
    </main>
  );
}

function TimeBlock({ value }: { value: string }) {
  return (
    <span className="inline-flex min-w-[56px] justify-center rounded-xl bg-card px-2 py-2.5 text-3xl text-gold-gradient">
      {value}
    </span>
  );
}
