import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { motion } from "framer-motion";
import { useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  Compass,
  Sparkles,
  Target,
} from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { getLatestState } from "@/lib/assessment.functions";
import { useSession } from "@/lib/session";
import {
  buildLevers,
  calcComposicaoScore,
  calcExecucaoScore,
  calcExperienciaScore,
  calcNutricaoScore,
  calcRecuperacaoScore,
  calcScoreGeral,
  getInitials,
} from "@/lib/assessment-calc";

export const Route = createFileRoute("/_authenticated/results")({
  component: ResultsPage,
});

const LABEL = {
  objetivo: {
    crescer: "Hipertrofia",
    crescer_secar: "Recomposição",
    secar: "Definição",
  },
  composicao: {
    muito_magro: "Muito magro",
    magro: "Magro",
    magro_barriga: "Magro com barriga",
    medio: "Mediano",
    acima_peso: "Acima do peso",
    muito_acima_peso: "Muito acima do peso",
    musculoso: "Musculoso",
  },
  local: {
    casa: "Em casa",
    academia: "Na academia",
  },
  execucao: {
    iniciante: "Iniciante",
    intermediario: "Intermediário",
    avancado: "Avançado",
  },
} as const;

function ResultsPage() {
  const fetchState = useServerFn(getLatestState);
  const navigate = useNavigate();
  const session = useSession();
  const { data, isLoading } = useQuery({
    queryKey: ["state", session?.id],
    queryFn: () => fetchState({ data: { userId: session!.id } }),
    enabled: !!session?.id,
  });

  useEffect(() => {
    if (!data?.workout) return;
    const ts = new Date(data.workout.unlock_date).getTime();
    if (ts > Date.now()) navigate({ to: "/waiting", replace: true });
  }, [data, navigate]);

  if (isLoading || !data?.assessment) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Carregando…</p>
      </main>
    );
  }

  const a = data.assessment.respostas as Record<string, unknown>;
  const nome = session?.nome_completo ?? data.profile?.nome_completo ?? "";
  const email = session?.email ?? data.profile?.email ?? "";

  const objetivo = (a.objetivo as keyof typeof LABEL.objetivo) ?? "crescer_secar";
  const composicao = (a.composicao as keyof typeof LABEL.composicao) ?? "medio";
  const local = (a.treino_local as keyof typeof LABEL.local) ?? "academia";
  const execucao = (a.execucao as keyof typeof LABEL.execucao) ?? "iniciante";
  const idade = (a.idade as number) ?? 30;

  // --------- Percentuais derivados para os donuts ---------
  const scoreGeral = calcScoreGeral(a);
  const sExec = calcExecucaoScore(a);
  const sRec = calcRecuperacaoScore(a);
  const sNut = calcNutricaoScore(a);
  const sExp = calcExperienciaScore(a);
  const sComp = calcComposicaoScore(a);

  // Foco no objetivo: quão claro é o alvo (execução + composição definida)
  const focoObjetivo = Math.min(100, Math.round(sExec * 0.5 + sComp * 0.5 + 15));
  // Consistência estimada: recuperação + nutrição
  const consistencia = Math.min(100, Math.round(sRec * 0.55 + sNut * 0.45));
  // Potencial de evolução: quanto mais baixo o score atual, maior o potencial
  const potencial = Math.min(100, Math.max(55, 100 - Math.round(scoreGeral * 0.55) + 20));
  // Aderência ao protocolo: experiência + execução
  const aderencia = Math.min(100, Math.round(sExp * 0.4 + sExec * 0.6));

  const levers = buildLevers(a);
  const primeiro = (nome || "atleta").trim().split(/\s+/)[0];

  // Pontos de atenção — 2 primeiros levers
  const atencao = levers.slice(0, 2);

  const proximoPassoAcoes = [
    "Abra os treinos e comece pela primeira etapa do protocolo.",
    "Registre a carga a cada treino para acompanhar sua evolução.",
    "Mantenha a sequência por 30 dias antes de mudar qualquer coisa.",
  ];

  return (
    <main className="min-h-screen bg-background pb-16 pt-24">
      {/* Header */}
      <header className="mx-auto max-w-md px-6">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary/80">
            Etapa 03 · Diagnóstico
          </p>
          <span className="inline-flex items-center gap-1 rounded-full gold-border bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">
            <BadgeCheck className="h-3 w-3" /> Liberado
          </span>
        </div>
        <div className="mt-5 flex items-center gap-4">
          <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl gold-gradient text-xl font-black text-primary-foreground shadow-gold-sm">
            {getInitials(nome, email)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-base font-black text-foreground">{nome || "Atleta"}</p>
            <p className="truncate text-xs text-muted-foreground">{email}</p>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-md space-y-5 px-6 pt-8">
        {/* 1. Card resumo — Diagnóstico gerado */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl gold-border bg-card p-6 shadow-gold"
        >
          <div className="pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full bg-primary/20 blur-3xl" />
          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/15 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
              <Sparkles className="h-3 w-3" /> Análise inteligente
            </div>
            <h1 className="mt-4 text-2xl font-black leading-tight text-foreground">
              Seu diagnóstico foi <span className="text-gold-gradient">gerado</span>
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              A análise foi criada com base nas respostas da sua avaliação. Identificamos seu ponto
              de partida, seu objetivo principal e os fatores que mais podem influenciar sua
              evolução.
            </p>
          </div>
        </motion.section>

        {/* 2. Perfil identificado */}
        <Card icon={<Target className="h-4 w-4" />} eyebrow="Análise" title="Perfil identificado">
          <p className="text-sm leading-relaxed text-foreground/90">
            <span className="font-bold text-foreground">{primeiro}</span>, seu perfil aponta para{" "}
            <span className="font-bold text-primary">{LABEL.objetivo[objetivo]}</span>, partindo de
            um shape{" "}
            <span className="font-bold text-primary">
              {(LABEL.composicao[composicao] ?? composicao).toLowerCase()}
            </span>{" "}
            e treinando <span className="font-bold text-primary">{LABEL.local[local].toLowerCase()}</span>.
          </p>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <MiniCard label="Objetivo principal" value={LABEL.objetivo[objetivo]} />
            <MiniCard label="Nível atual" value={LABEL.execucao[execucao] ?? String(execucao)} />
            <MiniCard label="Frequência recomendada" value="3 a 4x / semana" />
            <MiniCard label="Faixa etária" value={`${idade} anos`} />
          </div>
        </Card>

        {/* 3. Gráficos circulares */}
        <Card
          icon={<Activity className="h-4 w-4" />}
          eyebrow="Indicadores"
          title="Sua leitura em números"
          subtitle="Percentuais gerados a partir das suas respostas."
        >
          <div className="grid grid-cols-2 gap-3">
            <DonutCard
              label="Foco no objetivo"
              value={focoObjetivo}
              color="oklch(0.78 0.14 85)"
            />
            <DonutCard
              label="Consistência estimada"
              value={consistencia}
              color="oklch(0.7 0.18 145)"
            />
            <DonutCard
              label="Potencial de evolução"
              value={potencial}
              color="oklch(0.65 0.2 295)"
            />
            <DonutCard
              label="Aderência ao protocolo"
              value={aderencia}
              color="oklch(0.7 0.18 220)"
            />
          </div>

          {/* Score geral em destaque como donut grande */}
          <div className="mt-5 rounded-2xl border border-border bg-background p-5">
            <div className="flex items-center gap-5">
              <div className="relative h-28 w-28 shrink-0">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={[{ value: scoreGeral }, { value: 100 - scoreGeral }]}
                      innerRadius={38}
                      outerRadius={54}
                      startAngle={90}
                      endAngle={-270}
                      dataKey="value"
                      stroke="none"
                      isAnimationActive
                    >
                      <Cell fill="oklch(0.78 0.14 85)" />
                      <Cell fill="oklch(0.24 0.006 60)" />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <p className="text-2xl font-black tabular-nums text-foreground">{scoreGeral}</p>
                  <p className="text-[9px] uppercase tracking-wider text-muted-foreground">/ 100</p>
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-primary/80">
                  Score físico geral
                </p>
                <p className="mt-1 text-sm font-bold text-foreground">
                  Ponto de partida da sua jornada.
                </p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  Esse número reflete o seu momento atual. A evolução aparece na consistência.
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* 4. Pontos de atenção */}
        <Card
          icon={<AlertTriangle className="h-4 w-4" />}
          eyebrow="Cuidados"
          title="Pontos de atenção"
        >
          <div className="space-y-3">
            {atencao.map((l, i) => (
              <div
                key={i}
                className="flex items-start gap-3 rounded-2xl border border-border/60 bg-background p-4"
              >
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary/15 text-sm font-black text-primary">
                  {i + 1}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-foreground">{l.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{l.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* 5. O que fazer agora */}
        <Card
          icon={<Compass className="h-4 w-4" />}
          eyebrow="Direção"
          title="O que fazer agora"
        >
          <ul className="space-y-2">
            {proximoPassoAcoes.map((txt) => (
              <li
                key={txt}
                className="flex items-start gap-3 rounded-2xl border border-border/60 bg-background p-3.5"
              >
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                <p className="text-sm leading-relaxed text-foreground/90">{txt}</p>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex items-center gap-2 rounded-2xl border border-border/60 bg-background p-3.5">
            <CalendarDays className="h-4 w-4 shrink-0 text-primary" />
            <p className="text-xs leading-relaxed text-muted-foreground">
              O foco agora é executar o treino com consistência, acompanhar sua evolução e ajustar
              sua rotina com mais direção.
            </p>
          </div>
        </Card>

        {/* 6. Seu próximo passo */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl gold-border bg-card p-6 shadow-gold"
        >
          <div className="pointer-events-none absolute -bottom-16 -left-16 h-40 w-40 rounded-full bg-primary/20 blur-3xl" />
          <div className="relative">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary/80">
              Seu próximo passo
            </p>
            <h2 className="mt-2 text-xl font-black leading-tight text-foreground">
              Agora que seu diagnóstico foi <span className="text-gold-gradient">liberado</span>
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Siga para os treinos e comece pela primeira etapa. A evolução vem da sequência, não
              de treinos soltos.
            </p>
            <Link to="/protocol" className="mt-5 block">
              <Button className="h-14 w-full rounded-2xl gold-gradient text-base font-bold text-primary-foreground shadow-gold-sm">
                Ir para meus treinos <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </motion.section>
      </div>

      <BottomNav />
    </main>
  );
}

// ============ helpers ============

function Card({
  icon,
  eyebrow,
  title,
  subtitle,
  children,
}: {
  icon: React.ReactNode;
  eyebrow: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-border bg-card p-6 shadow-card-premium">
      <div className="flex items-start gap-3">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary">
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary/70">
            {eyebrow}
          </p>
          <h2 className="mt-0.5 text-lg font-black leading-tight text-foreground">{title}</h2>
          {subtitle && <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>}
        </div>
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function MiniCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-background p-3">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-sm font-bold text-foreground">{value}</p>
    </div>
  );
}

function DonutCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  const data = [{ value }, { value: 100 - value }];
  return (
    <div className="rounded-2xl border border-border/60 bg-background p-4">
      <div className="relative mx-auto h-24 w-24">
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              innerRadius={30}
              outerRadius={44}
              startAngle={90}
              endAngle={-270}
              dataKey="value"
              stroke="none"
              isAnimationActive
            >
              <Cell fill={color} />
              <Cell fill="oklch(0.22 0.006 60)" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <p className="text-lg font-black tabular-nums text-foreground">{value}%</p>
        </div>
      </div>
      <p className="mt-2 text-center text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
    </div>
  );
}
