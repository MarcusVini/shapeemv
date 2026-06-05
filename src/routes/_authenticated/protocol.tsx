import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { Dumbbell, Flame, Scale } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { TREINOS, type Treino } from "@/lib/protocol-data";
import { cn } from "@/lib/utils";
import welcomeCover from "@/assets/welcome-cover.jpg";

export const Route = createFileRoute("/_authenticated/protocol")({
  component: ProtocolPage,
});

type TabKey = "instrucoes" | "t1" | "t2" | "t3";

const TABS: { key: TabKey; label: string }[] = [
  { key: "instrucoes", label: "Instruções" },
  { key: "t1", label: "Treino 1" },
  { key: "t2", label: "Treino 2" },
  { key: "t3", label: "Treino 3" },
];

function ProtocolPage() {
  const [tab, setTab] = useState<TabKey>("instrucoes");

  return (
    <main className="min-h-screen bg-background pb-28">
      <div className="mx-auto max-w-md px-6 pt-10">
        <p className="text-xs uppercase tracking-[0.3em] text-primary/80">Seu protocolo</p>
        <h1 className="mt-1 text-3xl font-black text-foreground">
          Shape em V <span className="text-gold-gradient">Personalizado</span>
        </h1>
      </div>

      <div className="mt-6 overflow-x-auto px-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="mx-auto flex max-w-md gap-2 pb-1">
          {TABS.map((t) => {
            const active = tab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={cn(
                  "shrink-0 rounded-full px-5 py-2.5 text-sm font-bold transition-all",
                  active
                    ? "gold-gradient text-primary-foreground shadow-gold-sm"
                    : "bg-[#1E1E1E] text-foreground/90 hover:bg-[#262626]",
                )}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mx-auto mt-6 max-w-md px-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            {tab === "instrucoes" && <InstrucoesTab />}
            {tab === "t1" && <TreinoTab treino={TREINOS[0]} />}
            {tab === "t2" && <TreinoTab treino={TREINOS[1]} />}
            {tab === "t3" && <TreinoTab treino={TREINOS[2]} />}
          </motion.div>
        </AnimatePresence>
      </div>

      <BottomNav />
    </main>
  );
}

function InstrucoesTab() {
  return (
    <div className="space-y-5">
      <div className="relative overflow-hidden rounded-3xl gold-border shadow-gold">
        <img
          src={welcomeCover}
          alt="Shape em V"
          className="h-64 w-full object-cover"
          width={1280}
          height={832}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="absolute bottom-5 left-5 right-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-primary">
            Protocolo
          </p>
          <p className="mt-1 text-4xl font-black leading-none text-gold-gradient">
            SHAPE EM V
          </p>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-black leading-tight text-foreground">
          SEJA BEM-VINDO AO SEU PROTOCOLO PERSONALIZADO SHAPE EM V
        </h2>
        <p className="mt-3 text-sm font-bold text-gold-gradient">
          FERNANDO CANTARELLI{" "}
          <span className="font-medium text-primary/80">(@fernandocantarelli_)</span>
        </p>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          Fala mestre, seja muito bem-vindo ao seu Protocolo Personalizado do Shape em V.
        </p>
      </div>

      <TextBlock title="Quem sou eu">
        Muito prazer, meu nome é Fernando Cantarelli. Minha missão é ajudar você a
        construir o corpo que sempre sonhou, focado na verdadeira estética masculina:
        ombros largos, costas em V e cintura fina. Já ajudei milhares de alunos a
        transformarem seus físicos, e agora é a sua vez de conquistar o corpo que sempre
        quis!
      </TextBlock>

      <TextBlock title="Parabéns por estar aqui">
        Primeiramente, quero te parabenizar e te agradecer por ter confiado em nosso
        trabalho e vir fazer parte do Shape em V! Antes de começar, preciso que você
        leia isso com atenção: o que você está prestes a receber não é uma ficha de
        treino comum...
      </TextBlock>

      <TextBlock title="O método exclusivo">
        Esse é o mesmo método de treino focado em hipertrofia e proporção estética
        usado nos bastidores para construir físicos de respeito. O mesmo que os modelos
        aplicam para chegar aos físicos trincados e largos em tempo recorde... E que
        hoje, pela primeira vez, está sendo entregue de forma 100% personalizada para
        você.
      </TextBlock>

      <TextBlock title="Por que o Shape em V funciona">
        Treinos tradicionais fazem você treinar com volume excessivo e sem estratégia.
        Dessa forma seu músculo não se desenvolve. Aqui, o estímulo correto e o
        descanso são os segredos do crescimento. É esforço máximo com resultado
        estético real!
      </TextBlock>

      <div className="relative overflow-hidden rounded-3xl gold-border bg-background p-6 shadow-gold">
        <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-primary/20 blur-3xl" />
        <div className="relative flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl gold-gradient">
            <Flame className="h-5 w-5 text-primary-foreground" />
          </div>
          <p className="text-sm leading-relaxed text-foreground/95">
            <span className="font-black text-gold-gradient">
              No Shape em V é outro jogo!
            </span>{" "}
            Você vai treinar apenas de 3 a 4 vezes na semana, mas vai trabalhar todos
            os grupos musculares dentro da janela de crescimento, e sua gordura na
            janela de queima. Nos próximos 30 dias você vai ver seu esforço sendo
            recompensado na frente do espelho! Você vai se sentir mais largo, mais
            forte e com um shape que vai deixar claro pra todo mundo que você treina de
            verdade.
          </p>
        </div>
      </div>

      <TextBlock title="Instruções">
        Nós preparamos este protocolo especificamente para você. Cada exercício, cada
        série, cada repetição foram estruturados milimetricamente para fazer o Shape em
        V funcionar no seu corpo. Te garanto o máximo de resultados para a sua
        dedicação! Não menospreze nenhum dos exercícios, cada um foi detalhadamente
        colocado na sequência e posição exata. É fundamental você seguir 100% as
        instruções.
      </TextBlock>

      <div className="rounded-3xl border border-border bg-card p-6 shadow-card-premium">
        <h3 className="text-lg font-black text-foreground">
          Como <span className="text-gold-gradient">Treinar</span>
        </h3>
        <ul className="mt-4 space-y-3 text-sm leading-relaxed">
          {COMO_TREINAR.map((item) => (
            <li key={item.label} className="flex gap-2">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              <span>
                <span className="font-bold text-gold-gradient">{item.label}:</span>{" "}
                <span className="text-foreground/80">{item.text}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

const COMO_TREINAR = [
  { label: "Frequência", text: "3 a 4x por semana com pelo menos um dia de repouso entre os treinos mais intensos." },
  { label: "Repouso", text: "Nos dias de repouso, você pode fazer cardio ou outro esporte (se quiser, não é obrigatório)." },
  { label: "Aquecimento", text: "Sempre comece com 3-5 minutos de aquecimento leve ou mobilidade para preparar o corpo." },
  { label: "Execução", text: "Priorize a qualidade de execução dos exercícios. Uma repetição bem feita é melhor que várias mal executadas." },
  { label: "Progressão", text: "A cada semana, busque aumentar a carga de forma gradual. Evolua 1% a cada dia." },
  { label: "Descanso", text: "Respeite os tempos de descanso entre as séries conforme indicado em cada exercício." },
  { label: "Alimentação", text: "Para melhores resultados, combine o treino com uma alimentação adequada ao seu objetivo." },
  { label: "Consistência", text: "O segredo do sucesso é a consistência. Faça este protocolo por pelo menos 30 dias para ver resultados significativos." },
];

function TextBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-[#1E1E1E] p-5">
      <h3 className="text-sm font-black uppercase tracking-wider text-gold-gradient">
        {title}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-foreground/80">{children}</p>
    </div>
  );
}

function TreinoTab({ treino }: { treino: Treino }) {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl gold-border bg-card p-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary/80">
          {treino.nome}
        </p>
        <p className="mt-1 text-lg font-black text-foreground">
          Foco: <span className="text-gold-gradient">{treino.foco}</span>
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {treino.exercicios.length} exercícios programados
        </p>
      </div>

      {treino.exercicios.map((ex, i) => (
        <ExercicioCard key={ex.nome} index={i + 1} ex={ex} />
      ))}
    </div>
  );
}

function ExercicioCard({
  index,
  ex,
}: {
  index: number;
  ex: { nome: string; subtitulo: string; series: string; reps: string; descanso: string };
}) {
  return (
    <article className="rounded-2xl bg-[#18181B] p-5 shadow-card-premium">
      <header className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full gold-gradient text-sm font-black text-primary-foreground shadow-gold-sm">
          {index}
        </div>
        <div className="flex-1">
          <h4 className="text-base font-bold leading-tight text-foreground">{ex.nome}</h4>
          <p className="mt-0.5 text-xs text-muted-foreground">{ex.subtitulo}</p>
        </div>
      </header>

      <div className="relative mt-4 flex aspect-video items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-[#1f1f23] to-[#0f0f12]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,oklch(0.78_0.14_85/0.08),transparent_60%)]" />
        <Dumbbell className="relative h-10 w-10 text-primary/60" />
      </div>

      <div className="mt-4 flex flex-wrap justify-center gap-2">
        <Badge label="Séries" value={ex.series} />
        <Badge label="Reps" value={ex.reps} />
        <Badge label="Descanso" value={ex.descanso} />
      </div>

      <button className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-primary/60 bg-primary/5 py-3 text-sm font-bold text-primary transition-colors hover:bg-primary/10">
        Adicionar Carga <Scale className="h-4 w-4" />
      </button>
    </article>
  );
}

function Badge({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-full border border-border bg-background/60 px-3 py-1.5 text-[11px]">
      <span className="text-muted-foreground">{label}:</span>{" "}
      <span className="font-bold text-foreground">{value}</span>
    </div>
  );
}
