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
import { ArrowRight, Sparkles } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { getLatestState } from "@/lib/assessment.functions";
import {
  calcComposicaoScore,
  calcExecucaoScore,
  calcExperienciaScore,
  calcForcaScore,
  calcIMC,
  calcResistenciaScore,
  calcScoreGeral,
  getInitials,
  imcLabel,
  project28DaysPhysical,
  project28DaysWellbeing,
  projectProgress,
  type ConditionalAnswer,
} from "@/lib/assessment-calc";

export const Route = createFileRoute("/_authenticated/results")({
  component: ResultsPage,
});

const LABEL = {
  genero: { masculino: "Masculino", feminino: "Feminino" },
  composicao: {
    magro: "Magro",
    magro_definido: "Magro/Definido",
    medio: "Mediano",
    acima_peso: "Acima do peso",
    obeso: "Obeso",
  },
  objetivo: {
    crescer: "Crescer (hipertrofia)",
    crescer_secar: "Crescer e secar",
    secar: "Secar (emagrecer)",
  },
  areas: {
    barriga: "Barriga",
    bracos: "Braços",
    peito: "Peito",
    costas: "Costas",
    pernas: "Pernas",
    gluteos: "Glúteos",
    ombros: "Ombros",
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

  const imc = calcIMC(peso, altura);
  const imcInfo = imcLabel(imc);
  const score = calcScoreGeral(a);
  const sExp = calcExperienciaScore(a);
  const sExec = calcExecucaoScore(a);
  const sComp = calcComposicaoScore(a);
  const sForca = calcForcaScore(a);
  const sResist = calcResistenciaScore(a);

  const radarData = [
    { axis: "Força", value: sForca, full: 100 },
    { axis: "Resistência", value: sResist, full: 100 },
    { axis: "Execução", value: sExec, full: 100 },
  ];

  const projection = projectProgress(peso, altura, objetivo);

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
            <Sparkles className="h-3 w-3" /> Protocolo Personalizado
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-md space-y-6 px-6 pt-8">
        {/* Section 1 - Dados Pessoais */}
        <Section title="Dados pessoais">
          <div className="grid grid-cols-2 gap-3">
            <DataCell label="Gênero" value={LABEL.genero[genero]} />
            <DataCell label="Idade" value={`${idade} anos`} />
            <DataCell label="Altura" value={`${altura} cm`} />
            <DataCell label="Peso" value={`${peso} kg`} />
            <DataCell label="Composição" value={LABEL.composicao[composicao]} className="col-span-2" />
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
            <div className="relative h-3 overflow-hidden rounded-full" style={{ background: "var(--gradient-imc)" }}>
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
              <ScoreBar label="Experiência" value={sExp} />
              <ScoreBar label="Execução" value={sExec} />
              <ScoreBar label="Composição" value={sComp} />
            </div>
          </div>
        </Section>

        {/* Section 4 - Objetivo & Protocolo */}
        <Section title="Seu objetivo">
          <div className="space-y-3">
            <Row label="Objetivo" value={LABEL.objetivo[objetivo]} />
            <Row label="Nível" value={(a.execucao as string) ?? "—"} />
            <Row label="Dor / lesão" value={dor?.resposta === "sim" ? (dor.detalhe ?? "sim") : "Nenhuma"} />
            {dificuldade && (
              <div className="rounded-xl bg-background p-3">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Maior dificuldade</p>
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

        {/* Section 5 - Perfil de Performance */}
        <Section title="Perfil de performance">
          <div className="h-64">
            <ResponsiveContainer>
              <RadarChart data={radarData} outerRadius="75%">
                <PolarGrid stroke="oklch(0.26 0.006 60)" />
                <PolarAngleAxis
                  dataKey="axis"
                  tick={{ fill: "oklch(0.98 0.005 80)", fontSize: 12, fontWeight: 600 }}
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

        {/* Section 7 - Progresso projetado */}
        <Section title="Progresso físico projetado" subtitle="Estimativa em 4 meses com o protocolo">
          <div className="h-64">
            <ResponsiveContainer>
              <LineChart data={projection} margin={{ top: 10, right: 8, left: -10, bottom: 0 }}>
                <CartesianGrid stroke="oklch(0.26 0.006 60)" vertical={false} />
                <XAxis dataKey="mes" tick={{ fill: "oklch(0.72 0.01 70)", fontSize: 11 }} stroke="oklch(0.26 0.006 60)" />
                <YAxis tick={{ fill: "oklch(0.72 0.01 70)", fontSize: 11 }} stroke="oklch(0.26 0.006 60)" />
                <Tooltip
                  contentStyle={{
                    background: "oklch(0.18 0.006 60)",
                    border: "1px solid oklch(0.26 0.006 60)",
                    borderRadius: 12,
                    color: "oklch(0.98 0.005 80)",
                    fontSize: 12,
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 12, color: "oklch(0.72 0.01 70)" }} />
                <Line
                  type="monotone"
                  dataKey="peso"
                  name="Peso (kg)"
                  stroke="oklch(0.62 0.22 25)"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "oklch(0.62 0.22 25)" }}
                />
                <Line
                  type="monotone"
                  dataKey="massaMagra"
                  name="Massa magra (kg)"
                  stroke="oklch(0.78 0.14 85)"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "oklch(0.78 0.14 85)" }}
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
              animate={{ boxShadow: ["0 0 0 0 oklch(0.78 0.14 85 / 0.5)", "0 0 0 12px oklch(0.78 0.14 85 / 0)"] }}
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
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      className="rounded-3xl border border-border bg-card p-6 shadow-card-premium"
    >
      <header className="mb-5">
        <h2 className="text-lg font-black text-foreground">{title}</h2>
        {subtitle && <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>}
      </header>
      {children}
    </motion.section>
  );
}

function DataCell({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className={`rounded-2xl bg-background p-4 ${className ?? ""}`}>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 text-base font-bold text-foreground">{value}</p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border pb-2 last:border-0 last:pb-0">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold capitalize text-foreground">{value}</p>
    </div>
  );
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-[11px]">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-bold tabular-nums text-foreground">{value}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-background">
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
