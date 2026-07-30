import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Flame,
  ListChecks,
  Moon,
  PlayCircle,
  Scale,
  Target,
  Timer,
} from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { TREINOS, TREINOS_CASA, ABDOMEN, type Treino, type Exercicio } from "@/lib/protocol-data";
import { getLatestState } from "@/lib/assessment.functions";
import { useSession } from "@/lib/session";
import { usePageView } from "@/lib/tracking";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/protocol")({
  component: ProtocolPage,
});

type ViewKey = "index" | "instrucoes" | string; // "t{id}"

function ProtocolPage() {
  const navigate = useNavigate();
  const fetchState = useServerFn(getLatestState);
  const session = useSession();
  usePageView("protocol_viewed", "protocol");
  const { data: state, isLoading } = useQuery({
    queryKey: ["state", session?.id],
    queryFn: () => fetchState({ data: { userId: session!.id } }),
    enabled: !!session?.id,
  });

  const respostas = (state?.assessment?.respostas ?? {}) as Record<string, unknown>;
  const isCasa = respostas.treino_local === "casa";
  const treinos = isCasa ? TREINOS_CASA : TREINOS;

  const [view, setView] = useState<ViewKey>("index");

  useEffect(() => {
    if (!state) return;
    if (!state.assessment) {
      navigate({ to: "/dashboard", replace: true });
      return;
    }
    const unlockTs = state.workout ? new Date(state.workout.unlock_date).getTime() : null;
    if (!unlockTs || Date.now() < unlockTs) {
      navigate({ to: "/waiting", replace: true });
    }
  }, [state, navigate]);

  useEffect(() => {
    // Rolar ao topo quando trocar de tela
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }, [view]);

  if (
    isLoading ||
    !state ||
    !state.assessment ||
    !state.workout ||
    Date.now() < new Date(state.workout.unlock_date).getTime()
  ) {
    return <main className="min-h-screen bg-background" />;
  }

  const totalTreinos = treinos.length;

  return (
    <main className="min-h-screen bg-background pb-16 pt-24">
      <div className="mx-auto max-w-md px-6">
        <AnimatePresence mode="wait">
          {view === "index" && (
            <motion.div
              key="index"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-primary/80">
                Protocolo liberado
              </p>
              <h1 className="mt-2 text-3xl font-black leading-tight text-foreground">
                {isCasa ? (
                  <>Seus <span className="text-gold-gradient">treinos em casa</span></>
                ) : (
                  <>Seus <span className="text-gold-gradient">treinos de academia</span></>
                )}
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {totalTreinos} treinos organizados em sequência. Abra um por vez, siga a ordem e
                registre a carga.
              </p>

              {/* Guia de Suplementos — seção especial */}
              <div className="mt-8">
                <SupplementGuide />
              </div>

              {/* Card intro — Comece por aqui */}

              <button
                onClick={() => setView("instrucoes")}
                className="group mt-8 flex w-full items-center gap-4 rounded-3xl border border-primary/40 bg-card p-5 text-left shadow-gold-sm transition-all hover:border-primary hover:shadow-gold"
              >
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-primary/15 text-primary">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-black uppercase tracking-[0.25em] text-primary/80">
                    Antes de começar
                  </p>
                  <p className="mt-0.5 text-base font-black text-foreground">Comece por aqui</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Leia as regras do jogo antes do Treino 1.
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 shrink-0 text-primary transition-transform group-hover:translate-x-1" />
              </button>

              {/* Cards verticais dos treinos */}
              <ol className="mt-6 space-y-4">
                {treinos.map((t, i) => (
                  <li key={t.id}>
                    <TreinoCard
                      treino={t}
                      index={i + 1}
                      total={totalTreinos}
                      onOpen={() => setView(`t${t.id}`)}
                    />
                  </li>
                ))}
              </ol>

              <p className="mt-8 text-center text-[11px] text-muted-foreground">
                A evolução vem da sequência, não de treinos soltos.
              </p>
            </motion.div>
          )}

          {view === "instrucoes" && (
            <motion.div
              key="instrucoes"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <BackButton onClick={() => setView("index")} label="Voltar aos treinos" />
              <InstrucoesTab onStart={() => setView(`t${treinos[0].id}`)} />
            </motion.div>
          )}

          {view !== "index" && view !== "instrucoes" && (
            <motion.div
              key={view}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <BackButton onClick={() => setView("index")} label="Voltar aos treinos" />
              {(() => {
                const t = treinos.find((tr) => `t${tr.id}` === view);
                if (!t) return null;
                return <TreinoTab treino={t} showAbdomen={!isCasa} />;
              })()}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <BottomNav />
    </main>
  );
}

function BackButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground"
    >
      <ArrowLeft className="h-3.5 w-3.5" /> {label}
    </button>
  );
}

function TreinoCard({
  treino,
  index,
  total,
  onOpen,
}: {
  treino: Treino;
  index: number;
  total: number;
  onOpen: () => void;
}) {
  const isOff = !!treino.off;
  const qtd = treino.exercicios.length;
  // Estimativa simples de duração (em minutos): 5 min por exercício
  const duracaoEst = qtd > 0 ? `${qtd * 5} min` : "";

  return (
    <button
      onClick={onOpen}
      className={cn(
        "group relative flex w-full flex-col items-center gap-3 overflow-hidden rounded-3xl border bg-card p-6 text-center shadow-card-premium transition-all",
        isOff
          ? "border-border/70 opacity-90"
          : "border-primary/40 hover:border-primary hover:shadow-gold",
      )}
    >
      <div className="pointer-events-none absolute -top-16 -right-16 h-32 w-32 rounded-full bg-primary/15 blur-3xl" />
      <div className="relative flex w-full items-center justify-between text-[10px] font-black uppercase tracking-[0.25em]">
        <span className="rounded-full gold-border bg-primary/10 px-3 py-1 text-primary">
          {treino.nome}
        </span>
        <span className="text-muted-foreground tabular-nums">
          {index}/{total}
        </span>
      </div>

      <div className="relative mt-2 grid h-12 w-12 place-items-center rounded-2xl gold-gradient text-lg font-black text-primary-foreground shadow-gold-sm">
        {isOff ? <Moon className="h-5 w-5" /> : index}
      </div>

      <h3 className="relative text-lg font-black leading-tight text-foreground">
        {isOff ? "Dia OFF" : treino.foco}
      </h3>

      <p className="relative text-xs leading-relaxed text-muted-foreground">
        {isOff
          ? "Descanso planejado. Volte com tudo no próximo."
          : "Siga a ordem dos exercícios. Cada posição foi pensada para o estímulo certo."}
      </p>

      {!isOff && (
        <div className="relative mt-1 flex flex-wrap justify-center gap-2">
          <Chip icon={<ListChecks className="h-3 w-3" />} label={`${qtd} exercícios`} />
          <Chip icon={<Timer className="h-3 w-3" />} label={duracaoEst} />
          <Chip icon={<Target className="h-3 w-3" />} label="Nível indicado" />
        </div>
      )}

      <span className="relative mt-3 inline-flex w-full items-center justify-center gap-2 rounded-2xl gold-gradient py-3 text-sm font-bold text-primary-foreground shadow-gold-sm">
        {isOff ? "Ver mensagem" : "Acessar treino"}
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </span>
    </button>
  );
}

function Chip({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-foreground/80">
      {icon}
      {label}
    </span>
  );
}


function InstrucoesTab({ onStart }: { onStart: () => void }) {
  return (
    <div className="space-y-5">
      {/* CTA topo */}
      <div className="rounded-3xl gold-border bg-card p-6 shadow-gold-sm">
        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-primary/80">
          Protocolo Shape em V
        </p>
        <h2 className="mt-2 text-2xl font-black leading-tight text-foreground">
          Leia com <span className="text-gold-gradient">calma</span>, depois abra o Treino 1
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Esse é o mesmo método que uso com os alunos que buscam ombros largos, costas
          em V e cintura fina. Aqui a ordem importa — siga o passo a passo abaixo.
        </p>
        <button
          onClick={onStart}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl gold-gradient py-3.5 text-sm font-bold text-primary-foreground shadow-gold-sm"
        >
          Ir para o Treino 1 <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Como funciona — checklist vertical */}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-primary/70">
          Como funciona
        </p>
        <h3 className="mt-1 text-lg font-black text-foreground">Regras do jogo</h3>
        <div className="mt-4 space-y-3">
          {COMO_TREINAR.map((item) => (
            <div
              key={item.label}
              className="flex items-start gap-3 rounded-2xl border border-border bg-card/60 p-4"
            >
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div>
                <p className="text-sm font-black text-foreground">{item.label}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  {item.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recado do Fernando */}
      <div className="relative overflow-hidden rounded-3xl gold-border bg-background p-6 shadow-gold">
        <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-primary/20 blur-3xl" />
        <div className="relative">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl gold-gradient">
              <Flame className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary/80">
                Recado do Fernando
              </p>
              <p className="text-sm font-black text-foreground">
                @fernandocantarelli_
              </p>
            </div>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-foreground/90">
            <span className="font-black text-gold-gradient">Aqui é outro jogo.</span>{" "}
            Você treina de 3 a 4 vezes por semana, mas dentro da janela certa de
            crescimento. Nos próximos 30 dias você vai sentir o corpo mais largo,
            mais denso e com mais controle. Não pule etapas — a evolução vem da
            sequência.
          </p>
        </div>
      </div>
    </div>
  );
}

const COMO_TREINAR = [
  {
    label: "Frequência",
    text: "3 a 4 treinos por semana, com pelo menos um dia leve entre os mais intensos.",
  },
  {
    label: "Aquecimento",
    text: "Comece com 3-5 minutos de mobilidade ou cardio leve antes de puxar carga.",
  },
  {
    label: "Ordem dos exercícios",
    text: "Execute na sequência exata. Cada posição foi pensada para o estímulo certo.",
  },
  {
    label: "Execução",
    text: "Qualidade acima de tudo. Uma repetição controlada vale mais que três apressadas.",
  },
  {
    label: "Carga",
    text: "Anote a carga a cada treino e busque evoluir 1% por vez. Sem pressa, sem estagnar.",
  },
  {
    label: "Descanso",
    text: "Respeite os tempos entre séries. O descanso é parte do estímulo, não pausa perdida.",
  },
  {
    label: "Alimentação",
    text: "Combine com uma alimentação alinhada ao seu objetivo para colher o resultado real.",
  },
  {
    label: "Constância",
    text: "Faça o protocolo por 30 dias sem quebrar a sequência. É aí que o shape muda.",
  },
];

function TreinoTab({ treino, showAbdomen = true }: { treino: Treino; showAbdomen?: boolean }) {
  if (treino.off) {
    return (
      <div className="space-y-4">
        <div className="rounded-3xl gold-border bg-card p-6 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-primary/80">
            {treino.nome}
          </p>
          <p className="mt-3 text-3xl font-black text-gold-gradient">Dia OFF</p>
          <p className="mt-4 text-sm leading-relaxed text-foreground/85">
            {treino.offMessage}
          </p>
          <p className="mt-4 text-xs text-muted-foreground">
            Descanso também é treino. Volte com tudo no próximo.
          </p>
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-4">
      {/* Cabeçalho do treino */}
      <div className="rounded-3xl gold-border bg-card p-5 shadow-gold-sm">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-primary/80">
            {treino.nome}
          </span>
          <span className="rounded-full bg-primary/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
            {treino.exercicios.length} exercícios
          </span>
        </div>
        <h2 className="mt-2 text-xl font-black leading-tight text-foreground">
          <span className="text-gold-gradient">{treino.foco}</span>
        </h2>
        <p className="mt-2 text-xs text-muted-foreground">
          Siga a ordem abaixo. Não pule, não troque de posição.
        </p>
      </div>

      {/* Lista vertical de exercícios */}
      <ol className="space-y-4">
        {treino.exercicios.map((ex, i) => (
          <li key={`${treino.id}-${ex.id}`}>
            <ExercicioCard index={i + 1} total={treino.exercicios.length} ex={ex} />
          </li>
        ))}
      </ol>

      {showAbdomen && <AbdomenSection />}
    </div>
  );
}

function AbdomenSection() {
  return (
    <div className="mt-8 space-y-4">
      <div className="relative overflow-hidden rounded-3xl gold-border bg-card p-5 shadow-gold-sm">
        <div className="absolute -top-8 -right-8 h-24 w-24 rounded-full bg-primary/20 blur-3xl" />
        <p className="relative text-[11px] font-semibold uppercase tracking-[0.3em] text-primary/80">
          Bônus semanal
        </p>
        <p className="relative mt-1 text-lg font-black leading-tight text-gold-gradient">
          Abdômen — 1 a 2x por semana
        </p>
        <p className="relative mt-2 text-xs text-muted-foreground">
          Encaixe no final de qualquer treino da semana.
        </p>
      </div>
      <ol className="space-y-4">
        {ABDOMEN.map((ex, i) => (
          <li key={`abd-${ex.id}`}>
            <ExercicioCard index={i + 1} total={ABDOMEN.length} ex={ex} />
          </li>
        ))}
      </ol>
    </div>
  );
}

function ExercicioCard({
  index,
  total,
  ex,
}: {
  index: number;
  total: number;
  ex: Exercicio;
}) {
  const emBreve = ex.videoUrl === "EM BREVE";
  const storageKey = `carga:${ex.nome}`;
  const [carga, setCarga] = useState<string>("");
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) setCarga(saved);
    } catch {}
  }, [storageKey]);

  const openEditor = () => {
    setDraft(carga);
    setEditing(true);
  };

  const saveCarga = () => {
    const value = draft.trim();
    setCarga(value);
    try {
      if (value) localStorage.setItem(storageKey, value);
      else localStorage.removeItem(storageKey);
    } catch {}
    setEditing(false);
  };

  return (
    <article className="overflow-hidden rounded-3xl border border-border bg-[#18181B] shadow-card-premium">
      {/* Vídeo primeiro */}
      <div className="relative">
        {emBreve ? (
          <div className="flex aspect-video w-full items-center justify-center bg-[#1E1E1E]">
            <div className="flex flex-col items-center gap-2 text-primary/80">
              <PlayCircle className="h-8 w-8" />
              <span className="text-xs font-black uppercase tracking-[0.2em] text-gold-gradient">
                Vídeo em breve
              </span>
            </div>
          </div>
        ) : (
          <iframe
            src={ex.videoUrl}
            title={ex.nome}
            loading="lazy"
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            className="aspect-video w-full"
          />
        )}
        <div className="absolute left-3 top-3 flex items-center gap-2 rounded-full bg-black/60 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-white backdrop-blur">
          <span className="text-primary">{String(index).padStart(2, "0")}</span>
          <span className="text-white/60">/ {String(total).padStart(2, "0")}</span>
        </div>
      </div>

      <div className="p-5">
        {/* Nome + foco */}
        <h4 className="text-base font-black leading-tight text-foreground">{ex.nome}</h4>
        <div className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Target className="h-3 w-3 text-primary/80" />
          <span>{ex.foco}</span>
        </div>

        {/* Divisor sutil */}
        <div className="my-4 h-px w-full bg-border/60" />

        {/* Séries / Reps / Descanso — grade vertical clara */}
        <div className="grid grid-cols-3 gap-2">
          <Stat label="Séries" value={ex.series} />
          <Stat label="Reps" value={ex.reps} />
          <Stat label="Descanso" value={ex.descanso} />
        </div>

        {/* Observação curta */}
        <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
          Foco em execução controlada. Se a carga travar a técnica, reduza sem culpa.
        </p>

        {/* Carga */}
        {editing ? (
          <div className="mt-4 space-y-2">
            <input
              type="text"
              inputMode="decimal"
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") saveCarga();
                if (e.key === "Escape") setEditing(false);
              }}
              placeholder="Ex: 20kg"
              className="w-full rounded-xl border border-primary/60 bg-background px-4 py-3 text-sm font-bold text-foreground outline-none focus:border-primary"
            />
            <div className="flex gap-2">
              <button
                onClick={saveCarga}
                className="flex-1 rounded-xl gold-gradient py-2.5 text-sm font-bold text-primary-foreground shadow-gold-sm"
              >
                Salvar carga
              </button>
              <button
                onClick={() => setEditing(false)}
                className="flex-1 rounded-xl border border-border py-2.5 text-sm font-bold text-foreground/80"
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={openEditor}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-primary/60 bg-primary/5 py-3 text-sm font-bold text-primary transition-colors hover:bg-primary/10"
          >
            <Scale className="h-4 w-4" />
            {carga ? `Atualizar carga (${carga})` : "Anotar minha carga"}
          </button>
        )}
      </div>
    </article>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-background/60 px-2 py-2.5 text-center">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-sm font-black text-foreground">{value}</p>
    </div>
  );
}
