import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ClipboardCheck,
  Compass,
  Dumbbell,
  Instagram,
  Lock,
  LogOut,
  Timer,
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

  const respostas = (data?.assessment?.respostas ?? {}) as Record<string, unknown>;
  const peso = typeof respostas.peso === "number" ? respostas.peso : 0;
  const altura = typeof respostas.altura === "number" ? respostas.altura : 0;
  const imc = peso && altura ? calcIMC(peso, altura) : 0;
  const scoreGeral = hasAssessment ? calcScoreGeral(respostas) : 0;
  const objetivo = String(respostas.objetivo ?? "");
  const objetivoTxt =
    objetivo === "secar" ? "Definição" : objetivo === "crescer" ? "Hipertrofia" : "Recomposição";
  const local = respostas.treino_local === "casa" ? "em casa" : "na academia";

  const insightAvaliacao = hasAssessment && imc
    ? `Score ${scoreGeral}/100 · IMC ${imc} · ${imcLabel(imc).label}`
    : null;
  const insightProtocolo = hasAssessment && objetivo
    ? `Foco em ${objetivoTxt} · treino ${local}`
    : null;

  const { show, dismiss } = useWelcomeModal();

  // Etapa atual da jornada
  const currentStep = !hasAssessment ? 1 : !isUnlocked ? 2 : 3;

  const nextStep = !hasAssessment
    ? {
        title: "Responda sua avaliação",
        hint: "Menos de 3 minutos para destravar tudo.",
      }
    : !isUnlocked
      ? {
          title: "Aguardando liberação",
          hint: `Seu protocolo abre em ${countdown}.`,
        }
      : {
          title: "Abra o treino de hoje",
          hint: "Execute na ordem e registre a carga.",
        };

  const handleLockedTap = () => {
    if (!hasAssessment) {
      toast.info("Responda primeiro sua avaliação para destravar essa etapa.");
      return;
    }
    toast.info(`Liberação em ${countdown}`);
    navigate({ to: "/waiting" });
  };

  return (
    <>
      <WelcomeModal show={show} onDismiss={dismiss} />
      <main className="min-h-screen bg-background pb-10">
        <div className="mx-auto max-w-md px-6 pt-24">

          {/* Boas-vindas */}
          <div className="flex items-start justify-between">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-primary/80">
                Shape em V
              </p>
              <h1 className="mt-2 truncate text-3xl font-black text-foreground">
                E aí, {isLoading ? "…" : nome}.
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Sua jornada continua abaixo. Um passo por vez.
              </p>
            </div>
            <button
              onClick={() => {
                clearSession();
                navigate({ to: "/", replace: true });
              }}
              className="ml-2 shrink-0 rounded-full p-2 text-muted-foreground hover:text-foreground"
              aria-label="Sair"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>

          {/* Próximo passo — bloco em destaque */}
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative mt-8 overflow-hidden rounded-3xl gold-border bg-card p-6 shadow-gold"
          >
            <div className="absolute -top-16 -right-16 h-44 w-44 rounded-full bg-primary/20 blur-3xl" />
            <div className="relative">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
                <Compass className="h-3 w-3" /> Seu próximo passo
              </div>
              <h2 className="mt-4 text-2xl font-black leading-tight text-foreground">
                {nextStep.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {nextStep.hint}
              </p>

              {!hasAssessment && (
                <Link to="/quiz" className="mt-6 block">
                  <Button className="h-14 w-full rounded-2xl gold-gradient text-base font-bold text-primary-foreground shadow-gold-sm">
                    Começar minha avaliação <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              )}

              {hasAssessment && !isUnlocked && (
                <div className="mt-6 rounded-2xl border border-border bg-background/50 p-4 text-center">
                  <div className="flex items-center justify-center gap-2 text-[11px] font-semibold uppercase tracking-[0.25em] text-muted-foreground">
                    <Timer className="h-3 w-3 text-primary" /> Abre em
                  </div>
                  <div className="mt-2 flex items-center justify-center gap-1.5 font-black tabular-nums">
                    <TimeBlock value={pad(h)} unit="h" />
                    <TimeBlock value={pad(m)} unit="min" />
                    <TimeBlock value={pad(s)} unit="s" />
                  </div>
                </div>
              )}

              {isUnlocked && (
                <Link to="/protocol" className="mt-6 block">
                  <Button className="h-14 w-full rounded-2xl gold-gradient text-base font-bold text-primary-foreground shadow-gold-sm">
                    Abrir meu treino <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              )}
            </div>
          </motion.section>

          {/* Jornada em 3 passos — checklist vertical */}
          <section className="mt-8">
            <SectionTitle eyebrow="Sua jornada" title="Como funciona por aqui" />
            <div className="mt-4 space-y-3">
              <JourneyStep
                index={1}
                title="Avaliação Shape em V"
                subtitle="Base para calibrar seu protocolo."
                state={currentStep > 1 ? "done" : currentStep === 1 ? "current" : "locked"}
              />
              <JourneyStep
                index={2}
                title="Análise do método"
                subtitle="Cruzamos suas respostas com o método Cantarelli."
                state={currentStep > 2 ? "done" : currentStep === 2 ? "current" : "locked"}
              />
              <JourneyStep
                index={3}
                title="Protocolo liberado"
                subtitle="Treinos organizados por dia, com vídeo e carga."
                state={currentStep === 3 ? "current" : "locked"}
              />
            </div>
          </section>

          {/* Acessos principais — cards verticais */}
          <section className="mt-10">
            <SectionTitle eyebrow="Acessos" title="Seu material liberado" />

            <div className="mt-4 space-y-4">
              <AccessCard
                step="01"
                icon={<ClipboardCheck className="h-5 w-5" />}
                title="Sua avaliação completa"
                description={insightAvaliacao ?? "Diagnóstico de shape, IMC e prioridades."}
                to="/results"
                locked={!isUnlocked}
                hasAssessment={hasAssessment}
                countdown={countdown}
                onLockedTap={handleLockedTap}
              />

              <AccessCard
                step="02"
                icon={<Dumbbell className="h-5 w-5" />}
                title="Protocolo de treino"
                description={insightProtocolo ?? "Sequência de treinos e execução guiada."}
                to="/protocol"
                locked={!isUnlocked}
                hasAssessment={hasAssessment}
                countdown={countdown}
                onLockedTap={handleLockedTap}
              />
            </div>
          </section>

          {/* Orientações importantes */}
          <section className="mt-10">
            <SectionTitle eyebrow="Orientações" title="Antes de treinar, lembre" />
            <div className="mt-4 space-y-3">
              <TipRow text="Siga a ordem dos exercícios. Cada posição foi pensada." />
              <TipRow text="Anote sua carga a cada treino e tente evoluir aos poucos." />
              <TipRow text="Descanso é parte do plano. Respeite os dias OFF." />
            </div>
          </section>

          {/* Compartilhe */}
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative mt-10 overflow-hidden rounded-3xl border border-border bg-card p-6"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <Instagram className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary/80">
                  Faça parte
                </p>
                <h3 className="mt-1 text-lg font-black text-foreground">
                  Mostre a sua evolução
                </h3>
              </div>
            </div>

            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Poste um story do seu treino e marque{" "}
              <a
                href="https://instagram.com/shapeemv"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-primary underline-offset-2 hover:underline"
              >
                @fernandocantarelli_
              </a>
              . Eu curto acompanhar de perto e costumo repostar quem chega junto.
            </p>
          </motion.section>

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

function SectionTitle({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-primary/70">
        {eyebrow}
      </p>
      <h2 className="mt-1 text-lg font-black text-foreground">{title}</h2>
    </div>
  );
}

function JourneyStep({
  index,
  title,
  subtitle,
  state,
}: {
  index: number;
  title: string;
  subtitle: string;
  state: "done" | "current" | "locked";
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-4 rounded-2xl border p-4 transition-colors",
        state === "current"
          ? "border-primary/50 bg-primary/[0.06]"
          : state === "done"
            ? "border-border bg-card/60"
            : "border-border bg-card/30 opacity-70",
      )}
    >
      <div
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-black",
          state === "done"
            ? "bg-primary/20 text-primary"
            : state === "current"
              ? "gold-gradient text-primary-foreground shadow-gold-sm"
              : "bg-background text-muted-foreground",
        )}
      >
        {state === "done" ? "✓" : index}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-foreground">{title}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
      </div>
      {state === "current" && (
        <span className="shrink-0 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
          agora
        </span>
      )}
    </div>
  );
}

function AccessCard({
  step,
  icon,
  title,
  description,
  to,
  locked,
  hasAssessment,
  countdown,
  onLockedTap,
}: {
  step: string;
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
    "group relative block w-full overflow-hidden rounded-3xl border bg-card p-5 text-left transition-all",
    locked
      ? "border-border opacity-90"
      : "border-primary/40 shadow-gold-sm hover:border-primary hover:shadow-gold",
  );

  const inner = (
    <>
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-black uppercase tracking-[0.3em] text-primary/70">
          Etapa {step}
        </span>
        <div className="text-muted-foreground">
          {locked ? <Lock className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
        </div>
      </div>

      <div className="mt-4 flex items-start gap-4">
        <div
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl",
            locked ? "bg-background text-muted-foreground" : "bg-primary/15 text-primary",
          )}
        >
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-black leading-tight text-foreground">{title}</h3>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            {locked
              ? hasAssessment
                ? `Abre em ${countdown}`
                : "Destrave respondendo sua avaliação"
              : description}
          </p>
        </div>
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

function TipRow({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-border bg-card/50 p-4">
      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
      <p className="text-sm leading-relaxed text-foreground/85">{text}</p>
    </div>
  );
}

function TimeBlock({ value, unit }: { value: string; unit: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="inline-flex min-w-[52px] justify-center rounded-xl bg-background px-2 py-2 text-2xl text-gold-gradient">
        {value}
      </span>
      <span className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">
        {unit}
      </span>
    </div>
  );
}
