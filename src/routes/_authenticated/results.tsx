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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import { ArrowRight, Flame, Info, Sparkles, Target } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { getLatestState } from "@/lib/assessment.functions";
import {
  buildDiagnostico,
  buildLevers,
  buildTags,
  calcComposicaoScore,
  calcExecucaoScore,
  calcExperienciaScore,
  calcForcaScore,
  calcIMC,
  calcMetabolism,
  calcNutricaoScore,
  calcRecuperacaoScore,
  calcResistenciaScore,
  calcScoreGeral,
  getInitials,
  imcContextNote,
  imcLabel,
  project28DaysPhysical,
  project28DaysWellbeing,
  type ConditionalAnswer,
} from "@/lib/assessment-calc";

export const Route = createFileRoute("/_authenticated/results")({
  component: ResultsPage,
});

const LABEL = {
  genero: { masculino: "Masculino", feminino: "Feminino" },
  composicao: {
    muito_magro: "Muito magro",
    magro: "Magro",
    magro_barriga: "Magro com barriga",
    medio: "Mediano",
    acima_peso: "Acima do peso",
    muito_acima_peso: "Muito acima do peso",
    musculoso: "Musculoso",
  },
  objetivo: {
    crescer: "Crescer (hipertrofia)",
    crescer_secar: "Crescer e secar",
    secar: "Secar (emagrecer)",
  },
  areas: {
    barriga: "Barriga",
    abdomen_definido: "Abdômen definido",
    bracos: "Braços",
    peito: "Peito",
    costas: "Costas",
    pernas: "Pernas",
    gluteos: "Glúteos",
    ombros: "Ombros",
    postura: "Postura",
  },
} as const;

function ResultsPage() {
  const fetchState = useServerFn(getLatestState);
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({
    queryKey: ["state"],
    queryFn: () => fetchState(),
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
  const nome = data.profile?.nome_completo ?? "";
  const email = data.profile?.email ?? "";

  const peso = (a.peso as number) ?? 75;
  const altura = (a.altura as number) ?? 175;
  const idade = (a.idade as number) ?? 30;
  const genero = (a.genero as keyof typeof LABEL.genero) ?? "masculino";
  const composicao = (a.composicao as keyof typeof LABEL.composicao) ?? "medio";
  const objetivo = (a.objetivo as keyof typeof LABEL.objetivo) ?? "crescer_secar";
  const areas = ((a.areas_incomodam as string[]) ?? []) as (keyof typeof LABEL.areas)[];
  const dor = a.dor_lesao as ConditionalAnswer | undefined;
  const dificuldade = (a.dificuldade as string) ?? "";
  const motivacao = (a.motivacao_atual as string) ?? "";
  const sonho = (a.vida_dos_sonhos as string) ?? "";

  const imc = calcIMC(peso, altura);
  const imcInfo = imcLabel(imc);
  const imcNote = imcContextNote(a, imc);
  const score = calcScoreGeral(a);
  const sExp = calcExperienciaScore(a);
  const sExec = calcExecucaoScore(a);
  const sComp = calcComposicaoScore(a);
  const sForca = calcForcaScore(a);
  const sResist = calcResistenciaScore(a);
  const sRec = calcRecuperacaoScore(a);
  const sNut = calcNutricaoScore(a);

  const diagnostico = buildDiagnostico(a, nome);
  const tags = buildTags(a);
  const levers = buildLevers(a);
  const metab = calcMetabolism(a);

  const radarData = [
    { axis: "Força", value: sForca, full: 100 },
    { axis: "Resistência", value: sResist, full: 100 },
    { axis: "Execução", value: sExec, full: 100 },
    { axis: "Recuperação", value: sRec, full: 100 },
    { axis: "Nutrição", value: sNut, full: 100 },
  ];

  const physical28 = project28DaysPhysical(a);
  const wellbeing28 = project28DaysWellbeing(a);
  const lifestyleData = [
    { name: "Treino", value: sExp, fill: "oklch(0.7 0.18 145)" },
    { name: "Técnica", value: sExec, fill: "oklch(0.78 0.17 75)" },
    { name: "Composição", value: sComp, fill: "oklch(0.65 0.2 295)" },
    { name: "Recuperação", value: sRec, fill: "oklch(0.7 0.18 220)" },
    { name: "Nutrição", value: sNut, fill: "oklch(0.78 0.14 85)" },
  ];

  const donutData = [
    { name: "Score", value: score },
    { name: "Resto", value: 100 - score },
  ];

  return (
    <main className="min-h-screen bg-background pb-40">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-xl">
        <div className="mx-auto flex max-w-md items-center gap-4 px-6 pt-12 pb-6">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl gold-gradient text-xl font-black text-primary-foreground shadow-gold-sm">
            {getInitials(nome, email)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-foreground">{nome || "Atleta"}</p>
            <p className="truncate text-xs text-muted-foreground">{email}</p>
          </div>
        </div>
        <div className="mx-auto max-w-md px-6 pb-5">
          <div className="inline-flex items-center gap-2 rounded-full gold-border bg-primary/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-primary">
            <Sparkles className="h-3 w-3" /> Avaliação Personalizada
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-md space-y-6 px-6 pt-8">
        {/* HERO - Diagnóstico personalizado */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl gold-border bg-card p-6 shadow-gold"
        >
          <div className="absolute -top-16 -right-16 h-40 w-40 rounded-full bg-primary/20 blur-3xl" />
          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/15 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">
              <Target className="h-3 w-3" /> Diagnóstico
            </div>
            <p className="mt-4 text-sm leading-relaxed text-foreground">{diagnostico}</p>
            {tags.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2">
                {tags.map((t) => (
                  <span
                    key={t}
                    className="rounded-full bg-background px-3 py-1 text-[11px] font-semibold text-foreground border border-border"
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Section 1 - Dados Pessoais */}
        <Section title="Dados pessoais">
          <div className="grid grid-cols-2 gap-3">
            <DataCell label="Gênero" value={LABEL.genero[genero]} />
            <DataCell label="Idade" value={`${idade} anos`} />
            <DataCell label="Altura" value={`${altura} cm`} />
            <DataCell label="Peso" value={`${peso} kg`} />
            <DataCell
              label="Composição"
              value={LABEL.composicao[composicao] ?? composicao}
              className="col-span-2"
            />
          </div>
        </Section>

        {/* Section 2 - IMC */}
        <Section title="Índice de massa corporal">
          <div className="text-center">
            <p className="text-6xl font-black text-gold-gradient tabular-nums">{imc}</p>
            <p className="mt-1 text-sm font-semibold" style={{ color: imcInfo.color }}>
              {imcInfo.label}
            </p>
          </div>
          <div className="mt-6 space-y-2">
            <div
              className="relative h-3 overflow-hidden rounded-full"
              style={{ background: "var(--gradient-imc)" }}
            >
              <motion.div
                initial={{ left: "0%" }}
                animate={{ left: `${imcInfo.pct}%` }}
                transition={{ type: "spring", duration: 1, bounce: 0.3 }}
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2"
              >
                <div className="h-5 w-5 rounded-full border-2 border-background bg-foreground shadow-lg" />
              </motion.div>
            </div>
            <div className="flex justify-between text-[10px] font-medium text-muted-foreground">
              <span>Baixo</span>
              <span>Normal</span>
              <span>Sobrep.</span>
              <span>Obeso</span>
            </div>
          </div>
          {imcNote && (
            <div className="mt-4 flex items-start gap-2 rounded-2xl bg-background p-3">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <p className="text-xs leading-relaxed text-muted-foreground">{imcNote}</p>
            </div>
          )}
        </Section>

        {/* Section - Alavancas (top 3 ações) */}
        <Section title="Suas 3 alavancas" subtitle="Onde mexer primeiro para o maior salto em 28 dias">
          <div className="space-y-3">
            {levers.map((l, i) => (
              <div
                key={i}
                className="flex items-start gap-3 rounded-2xl bg-background p-4"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full gold-gradient text-sm font-black text-primary-foreground">
                  {i + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-foreground">{l.title}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{l.detail}</p>
                  <p className="mt-2 inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                    <Flame className="h-3 w-3" /> {l.impact}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Section - Metabolismo & Calorias */}
        <Section title="Metabolismo & calorias" subtitle="Estimativa pelo método Mifflin-St Jeor">
          <div className="grid grid-cols-2 gap-3">
            <DataCell label="Gasto em repouso" value={`${metab.tmb} kcal`} />
            <DataCell label="Gasto total/dia" value={`${metab.gastoTotal} kcal`} />
            <DataCell
              label="Meta calórica"
              value={`${metab.metaCalorica} kcal`}
              className="col-span-2"
            />
          </div>
          <div className="mt-4 rounded-2xl bg-background p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Macronutrientes alvo
            </p>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-xl font-black text-gold-gradient tabular-nums">
                  {metab.proteinaG}g
                </p>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Proteína
                </p>
              </div>
              <div>
                <p className="text-xl font-black text-foreground tabular-nums">{metab.carboG}g</p>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Carbo
                </p>
              </div>
              <div>
                <p className="text-xl font-black text-foreground tabular-nums">
                  {metab.gorduraG}g
                </p>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Gordura
                </p>
              </div>
            </div>
          </div>
        </Section>

        {/* Section 3 - Score Geral */}
        <Section title="Score geral">
          <div className="flex items-center gap-6">
            <div className="relative h-32 w-32 shrink-0">
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={donutData}
                    innerRadius={42}
                    outerRadius={60}
                    startAngle={90}
                    endAngle={-270}
                    dataKey="value"
                    stroke="none"
                  >
                    <Cell fill="oklch(0.78 0.14 85)" />
                    <Cell fill="oklch(0.24 0.006 60)" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-3xl font-black tabular-nums text-foreground">{score}</p>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">/ 100</p>
              </div>
            </div>
            <div className="flex-1 space-y-3">
              <ScoreBar label="Recuperação" value={sRec} />
              <ScoreBar label="Nutrição" value={sNut} />
              <ScoreBar label="Composição" value={sComp} />
            </div>
          </div>
        </Section>

        {/* Section 4 - Objetivo & Protocolo */}
        <Section title="Seu objetivo">
          <div className="space-y-3">
            <Row label="Objetivo" value={LABEL.objetivo[objetivo]} />
            <Row label="Nível" value={(a.execucao as string) ?? "—"} />
            <Row
              label="Dor / lesão"
              value={dor?.resposta === "sim" ? (dor.detalhe ?? "sim") : "Nenhuma"}
            />
            {dificuldade && (
              <div className="rounded-xl bg-background p-3">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Maior dificuldade
                </p>
                <p className="mt-1 text-sm text-foreground">{dificuldade}</p>
              </div>
            )}
          </div>
          <Link to="/protocol" className="mt-5 block">
            <Button className="h-13 w-full rounded-2xl gold-gradient py-4 text-base font-bold text-primary-foreground shadow-gold-sm">
              Ver protocolo personalizado <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </Section>

        {/* Section 5 - Perfil de Performance (5 eixos) */}
        <Section title="Perfil de performance">
          <div className="h-72">
            <ResponsiveContainer>
              <RadarChart data={radarData} outerRadius="75%">
                <PolarGrid stroke="oklch(0.26 0.006 60)" />
                <PolarAngleAxis
                  dataKey="axis"
                  tick={{ fill: "oklch(0.98 0.005 80)", fontSize: 11, fontWeight: 600 }}
                />
                <PolarRadiusAxis
                  angle={90}
                  domain={[0, 100]}
                  tick={{ fill: "oklch(0.55 0.01 70)", fontSize: 10 }}
                  axisLine={false}
                />
                <Radar
                  dataKey="value"
                  stroke="oklch(0.78 0.14 85)"
                  fill="oklch(0.78 0.14 85)"
                  fillOpacity={0.35}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </Section>

        {/* Section 6 - Áreas de foco */}
        {areas.length > 0 && (
          <Section title="Áreas de foco">
            <div className="flex flex-wrap gap-2">
              {areas.map((k) => (
                <span
                  key={k}
                  className="inline-flex items-center rounded-full gold-border bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary"
                >
                  {LABEL.areas[k] ?? k}
                </span>
              ))}
            </div>
          </Section>
        )}

        {/* Section 7 - Indicadores de estilo de vida */}
        <Section title="Indicadores de estilo de vida">
          <div className="h-56">
            <ResponsiveContainer>
              <BarChart data={lifestyleData} margin={{ top: 16, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid stroke="oklch(0.26 0.006 60)" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fill: "oklch(0.85 0.01 70)", fontSize: 10, fontWeight: 600 }}
                  stroke="oklch(0.26 0.006 60)"
                />
                <YAxis hide domain={[0, 100]} />
                <Tooltip
                  cursor={{ fill: "oklch(0.22 0.006 60)" }}
                  contentStyle={{
                    background: "oklch(0.18 0.006 60)",
                    border: "1px solid oklch(0.26 0.006 60)",
                    borderRadius: 12,
                    color: "oklch(0.98 0.005 80)",
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]} maxBarSize={42} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Section>

        {/* Section 8 - Mentalidade */}
        {(motivacao || sonho) && (
          <Section title="Mentalidade">
            <div className="space-y-5">
              {motivacao && (
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    O que te motiva a mudar
                  </p>
                  <p className="mt-1.5 text-sm italic text-foreground">"{motivacao}"</p>
                </div>
              )}
              {sonho && (
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Seu sonho
                  </p>
                  <p className="mt-1.5 text-sm italic text-foreground">"{sonho}"</p>
                </div>
              )}
            </div>
          </Section>
        )}

        {/* Section 9 - Seu Progresso Físico (28 dias) */}
        <Section
          title="Seu progresso — Físico"
          subtitle="Projeção estimada nos próximos 28 dias seguindo o protocolo"
        >
          <div className="h-64">
            <ResponsiveContainer>
              <LineChart data={physical28} margin={{ top: 10, right: 8, left: -10, bottom: 0 }}>
                <CartesianGrid stroke="oklch(0.26 0.006 60)" vertical={false} />
                <XAxis
                  dataKey="dia"
                  tick={{ fill: "oklch(0.72 0.01 70)", fontSize: 11 }}
                  stroke="oklch(0.26 0.006 60)"
                />
                <YAxis
                  domain={[0, 100]}
                  tickFormatter={(v) => `${v}%`}
                  tick={{ fill: "oklch(0.72 0.01 70)", fontSize: 11 }}
                  stroke="oklch(0.26 0.006 60)"
                />
                <Tooltip
                  formatter={(v: number) => `${v}%`}
                  contentStyle={{
                    background: "oklch(0.18 0.006 60)",
                    border: "1px solid oklch(0.26 0.006 60)",
                    borderRadius: 12,
                    color: "oklch(0.98 0.005 80)",
                    fontSize: 12,
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 11, color: "oklch(0.72 0.01 70)" }} />
                <Line
                  type="monotone"
                  dataKey="ganhoMuscular"
                  name="Ganho muscular"
                  stroke="oklch(0.7 0.18 220)"
                  strokeWidth={3}
                  dot={{ r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="queimaGordura"
                  name="Queima de gordura"
                  stroke="oklch(0.65 0.2 295)"
                  strokeWidth={3}
                  dot={{ r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="disposicao"
                  name="Disposição"
                  stroke="oklch(0.78 0.14 85)"
                  strokeWidth={3}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Section>

        {/* Section 10 - Seu Progresso Bem-Estar */}
        <Section
          title="Seu progresso — Bem-estar"
          subtitle="Impacto estimado no bem-estar geral nos próximos 28 dias"
        >
          <div className="h-64">
            <ResponsiveContainer>
              <LineChart data={wellbeing28} margin={{ top: 10, right: 8, left: -10, bottom: 0 }}>
                <CartesianGrid stroke="oklch(0.26 0.006 60)" vertical={false} />
                <XAxis
                  dataKey="dia"
                  tick={{ fill: "oklch(0.72 0.01 70)", fontSize: 11 }}
                  stroke="oklch(0.26 0.006 60)"
                />
                <YAxis
                  domain={[0, 100]}
                  tickFormatter={(v) => `${v}%`}
                  tick={{ fill: "oklch(0.72 0.01 70)", fontSize: 11 }}
                  stroke="oklch(0.26 0.006 60)"
                />
                <Tooltip
                  formatter={(v: number) => `${v}%`}
                  contentStyle={{
                    background: "oklch(0.18 0.006 60)",
                    border: "1px solid oklch(0.26 0.006 60)",
                    borderRadius: 12,
                    color: "oklch(0.98 0.005 80)",
                    fontSize: 12,
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 11, color: "oklch(0.72 0.01 70)" }} />
                <Line
                  type="monotone"
                  dataKey="testosterona"
                  name="Testosterona"
                  stroke="oklch(0.65 0.2 295)"
                  strokeWidth={3}
                  dot={{ r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="autoestima"
                  name="Autoestima"
                  stroke="oklch(0.7 0.18 220)"
                  strokeWidth={3}
                  dot={{ r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="saude"
                  name="Saúde geral"
                  stroke="oklch(0.7 0.18 145)"
                  strokeWidth={3}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Section>
      </div>

      {/* Floating CTA above bottom nav */}
      <div className="fixed inset-x-0 bottom-[68px] z-40 px-4 pb-2">
        <div className="mx-auto max-w-md">
          <Link to="/protocol">
            <motion.div
              animate={{
                boxShadow: [
                  "0 0 0 0 oklch(0.78 0.14 85 / 0.5)",
                  "0 0 0 12px oklch(0.78 0.14 85 / 0)",
                ],
              }}
              transition={{ duration: 1.6, repeat: Infinity }}
              className="flex items-center justify-between gap-3 rounded-2xl gold-gradient px-5 py-4 text-primary-foreground shadow-gold"
            >
              <div className="text-left">
                <p className="text-[10px] font-bold uppercase tracking-wider opacity-80">
                  Seu protocolo está pronto
                </p>
                <p className="text-sm font-black">Toque para acessar</p>
              </div>
              <ArrowRight className="h-5 w-5" />
            </motion.div>
          </Link>
        </div>
      </div>

      <BottomNav />
    </main>
  );
}

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-border bg-card p-6 shadow-card-premium">
      <div className="mb-5">
        <h2 className="text-base font-black uppercase tracking-wider text-foreground">{title}</h2>
        {subtitle && <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}

function DataCell({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={`rounded-xl bg-background p-3 ${className ?? ""}`}>
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-background p-3">
      <span className="text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
      <span className="text-sm font-semibold text-foreground">{value}</span>
    </div>
  );
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex items-center justify-between text-[11px] font-semibold">
        <span className="text-muted-foreground">{label}</span>
        <span className="tabular-nums text-foreground">{value}</span>
      </div>
      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-background">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="h-full gold-gradient"
        />
      </div>
    </div>
  );
}
