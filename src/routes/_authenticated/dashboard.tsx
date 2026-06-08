import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  Dumbbell,
  Lock,
  LogOut,
  Sparkles,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { BottomNav } from "@/components/BottomNav";
import { WelcomeModal, useWelcomeModal } from "@/components/WelcomeModal";
import { getLatestState } from "@/lib/assessment.functions";
import { calcIMC, calcScoreGeral, imcLabel } from "@/lib/assessment-calc";
import { clearSession, useSession } from "@/lib/session";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  const fetchState = useServerFn(getLatestState);
  const navigate = useNavigate();
  const session = useSession();

  const { data, isLoading } = useQuery({
    queryKey: ["state", session?.id],
    queryFn: () => fetchState({ data: { userId: session!.id } }),
    enabled: !!session?.id,
  });

  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const i = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(i);
  }, []);

  const nome = (session?.nome_completo || data?.profile?.nome_completo || "atleta").split(" ")[0];
  const hasAssessment = !!data?.assessment;
  const unlockTs = data?.workout ? new Date(data.workout.unlock_date).getTime() : null;
  const isUnlocked = !!unlockTs && now >= unlockTs;

  const diff = unlockTs ? Math.max(0, unlockTs - now) : 0;
  const h = Math.floor(diff / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  const s = Math.floor((diff % 60_000) / 1000);
  const pad = (n: number) => String(n).padStart(2, "0");
  const countdown = `${pad(h)}:${pad(m)}:${pad(s)}`;

  // Insight chave da avaliação (mostrado no card quando disponível)
  const respostas = (data?.assessment?.respostas ?? {}) as Record<string, unknown>;
  const peso = typeof respostas.peso === "number" ? respostas.peso : 0;
  const altura = typeof respostas.altura === "number" ? respostas.altura : 0;
  const imc = peso && altura ? calcIMC(peso, altura) : 0;
  const scoreGeral = hasAssessment ? calcScoreGeral(respostas) : 0;
  const objetivo = String(respostas.objetivo ?? "");
  const objetivoTxt =
    objetivo === "secar" ? "Definição" : objetivo === "crescer" ? "Hipertrofia" : "Recomposição";
  const insightAvaliacao = hasAssessment && imc
    ? `Score ${scoreGeral}/100 · IMC ${imc} · ${imcLabel(imc).label}`
    : null;
  const insightProtocolo = hasAssessment && objetivo
    ? `Foco: ${objetivoTxt}`
    : null;

  const { show, dismiss } = useWelcomeModal();

  const handleLockedTap = () => {
    if (!hasAssessment) {
      toast.info("Responda primeiro sua avaliação física para liberar.");
      return;
    }
    toast.info(`Liberação em ${countdown}`);
    navigate({ to: "/waiting" });
  };

  return (
    <>
      <WelcomeModal show={show} onDismiss={dismiss} />
      <main className="min-h-screen bg-background pb-28">
        <div className="mx-auto max-w-md px-6 pt-12">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-black text-foreground">
                Olá, {isLoading ? "…" : nome} <span className="inline-block">👋</span>
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Bem-vindo ao <span className="font-semibold text-foreground">Shape em V</span>
              </p>
            </div>
            <button
              onClick={() => {
                clearSession();
                navigate({ to: "/", replace: true });
              }}
              className="rounded-full p-2 text-muted-foreground hover:text-foreground"
              aria-label="Sair"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>

          {/* CTA quiz quando ainda não preencheu */}
          {!hasAssessment && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative mt-8 overflow-hidden rounded-3xl gold-border bg-card p-7 shadow-gold"
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
                  Perguntas rápidas para a inteligência Shape em V montar seu protocolo personalizado.
                </p>
                <Link to="/quiz" className="mt-6 block">
                  <Button className="h-14 w-full rounded-2xl gold-gradient text-base font-bold text-primary-foreground shadow-gold-sm">
                    Fazer minha avaliação <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </motion.div>
          )}

          {/* Cards principais */}
          <div className="mt-8 space-y-4">
            <HubCard
              icon={<CheckCircle2 className="h-6 w-6" />}
              title="Sua Avaliação Trinca"
              description={insightAvaliacao ?? "Confira a sua avaliação física completa."}
              to="/results"
              locked={!isUnlocked}
              hasAssessment={hasAssessment}
              countdown={countdown}
              onLockedTap={handleLockedTap}
            />

            <HubCard
              icon={<Dumbbell className="h-6 w-6" />}
              title="Seu Protocolo está Pronto"
              description={insightProtocolo ?? "Acesse seu treino personalizado."}
              to="/protocol"
              locked={!isUnlocked}
              hasAssessment={hasAssessment}
              countdown={countdown}
              onLockedTap={handleLockedTap}
            />

            {/* Countdown quando respondeu e ainda está bloqueado */}
            {hasAssessment && !isUnlocked && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-3xl border border-border bg-card/60 p-5 text-center"
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
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
              </motion.div>
            )}

            {/* Compartilhe sua Jornada */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative overflow-hidden rounded-3xl gold-border bg-card p-6 shadow-gold"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
                  <Zap className="h-5 w-5" />
                </div>
                <h3 className="pt-1.5 text-xl font-black text-foreground">
                  Compartilhe sua Jornada
                </h3>
              </div>

              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                Agora você faz parte de um grupo de pessoas diferenciadas… Que estão construindo a melhor versão de si mesmas.
              </p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                A sua evolução merece ser vista! Inspire pessoas e fortaleça o nosso movimento!
              </p>

              <div className="mt-5 rounded-2xl gold-border bg-primary/10 p-4">
                <p className="text-sm font-bold text-primary">
                  Poste stories do seu treino marcando{" "}
                  <a
                    href="https://instagram.com/shapeemv"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline-offset-2 hover:underline"
                  >
                    @fernandocantarelli_
                  </a>
                </p>
                <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Sparkles className="h-3 w-3 text-primary" />
                  Vou gostar de ver, vou repostar e você ainda ganhará seguidores!
                </p>
              </div>
            </motion.div>
          </div>

          {/* Rodapé */}
          <footer className="mt-10 text-center">
            <p className="text-[11px] text-muted-foreground/70">
              © Todos os direitos reservados · Shape em V
            </p>
            <button
              onClick={() => {
                clearSession();
                navigate({ to: "/", replace: true });
              }}
              className="mt-2 text-xs text-muted-foreground/80 underline-offset-2 hover:underline"
            >
              sair da conta
            </button>
          </footer>
        </div>
        <BottomNav />
      </main>
    </>
  );
}

function HubCard({
  icon,
  title,
  description,
  to,
  locked,
  hasAssessment,
  countdown,
  onLockedTap,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  to: "/results" | "/protocol";
  locked: boolean;
  hasAssessment: boolean;
  countdown: string;
  onLockedTap: () => void;
}) {
  const cardClass = cn(
    "group relative flex items-start gap-4 overflow-hidden rounded-3xl border bg-card p-5 text-left transition-all",
    locked
      ? "border-border opacity-80"
      : "border-primary/40 shadow-gold-sm hover:border-primary hover:shadow-gold",
  );

  const inner = (
    <>
      <div
        className={cn(
          "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl",
          locked ? "bg-background text-muted-foreground" : "bg-primary/15 text-primary",
        )}
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="text-base font-black text-foreground">{title}</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          {locked
            ? hasAssessment
              ? `Disponível em ${countdown}`
              : "Disponível após sua avaliação"
            : description}
        </p>
      </div>
      <div className="self-center text-muted-foreground">
        {locked ? <Lock className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
      </div>
    </>
  );

  if (locked) {
    return (
      <button type="button" onClick={onLockedTap} className={cardClass}>
        {inner}
      </button>
    );
  }

  return (
    <Link to={to} className={cardClass}>
      {inner}
    </Link>
  );
}

function TimeBlock({ value }: { value: string }) {
  return (
    <span className="inline-flex min-w-[56px] justify-center rounded-xl bg-background px-2 py-2.5 text-3xl text-gold-gradient">
      {value}
    </span>
  );
}
