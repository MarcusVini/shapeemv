export interface QuizAnswers {
  [key: string]: unknown;
}

export interface ConditionalAnswer {
  resposta: "sim" | "nao";
  detalhe?: string;
}

export function getAnswer<T = unknown>(answers: QuizAnswers, key: string): T | undefined {
  return answers[key] as T | undefined;
}

export function calcIMC(pesoKg: number, alturaCm: number): number {
  if (!pesoKg || !alturaCm) return 0;
  const m = alturaCm / 100;
  return +(pesoKg / (m * m)).toFixed(1);
}

export function imcLabel(imc: number): { label: string; pct: number; color: string } {
  // pct used to position pointer on 0..100 scale
  if (imc < 18.5) return { label: "Abaixo do peso", pct: 10, color: "oklch(0.6 0.18 240)" };
  if (imc < 25) return { label: "Peso normal", pct: 35, color: "oklch(0.7 0.16 145)" };
  if (imc < 30) return { label: "Sobrepeso", pct: 65, color: "oklch(0.82 0.16 85)" };
  if (imc < 35) return { label: "Obesidade I", pct: 85, color: "oklch(0.62 0.22 25)" };
  return { label: "Obesidade II+", pct: 95, color: "oklch(0.55 0.22 25)" };
}

function scoreFromMap(value: unknown, map: Record<string, number>, fallback = 50): number {
  if (typeof value !== "string") return fallback;
  return map[value] ?? fallback;
}

export function calcExperienciaScore(answers: QuizAnswers): number {
  return scoreFromMap(answers.experiencia, {
    nunca: 20,
    menos_6m: 40,
    "6m_2a": 70,
    mais_2a: 90,
  });
}

export function calcExecucaoScore(answers: QuizAnswers): number {
  return scoreFromMap(answers.execucao, {
    iniciante: 35,
    intermediario: 65,
    avancado: 90,
  });
}

export function calcComposicaoScore(answers: QuizAnswers): number {
  return scoreFromMap(answers.composicao, {
    magro_definido: 90,
    magro: 70,
    medio: 60,
    acima_peso: 45,
    obeso: 30,
  });
}

export function calcResistenciaScore(answers: QuizAnswers): number {
  // derived from outro_esporte + treinando_agora
  let base = 40;
  const outro = answers.outro_esporte as ConditionalAnswer | undefined;
  const treina = answers.treinando_agora as ConditionalAnswer | undefined;
  if (outro?.resposta === "sim") base += 25;
  if (treina?.resposta === "sim") base += 20;
  return Math.min(95, base);
}

export function calcForcaScore(answers: QuizAnswers): number {
  const exp = calcExperienciaScore(answers);
  const exec = calcExecucaoScore(answers);
  return Math.round(exp * 0.5 + exec * 0.5);
}

export function calcScoreGeral(answers: QuizAnswers): number {
  const exp = calcExperienciaScore(answers);
  const exec = calcExecucaoScore(answers);
  const comp = calcComposicaoScore(answers);
  return Math.round(exp * 0.3 + exec * 0.35 + comp * 0.35);
}

export interface ProjectionPoint {
  mes: string;
  peso: number;
  massaMagra: number;
}

export function projectProgress(
  pesoAtual: number,
  alturaCm: number,
  objetivo: string,
): ProjectionPoint[] {
  const massaMagraBase = +(pesoAtual * 0.62).toFixed(1);
  const deltaPesoTotal = objetivo === "secar" ? -6 : objetivo === "crescer" ? 4 : -2;
  const deltaMagraTotal = objetivo === "secar" ? 2.5 : objetivo === "crescer" ? 5 : 4;
  const months = ["Mês 0", "Mês 1", "Mês 2", "Mês 3", "Mês 4"];
  return months.map((m, i) => ({
    mes: m,
    peso: +(pesoAtual + (deltaPesoTotal * i) / 4).toFixed(1),
    massaMagra: +(massaMagraBase + (deltaMagraTotal * i) / 4).toFixed(1),
  }));
}

export function getInitials(name: string, email: string): string {
  const n = (name || "").trim();
  if (n) {
    const parts = n.split(/\s+/);
    return ((parts[0]?.[0] ?? "") + (parts[parts.length - 1]?.[0] ?? "")).toUpperCase() || "U";
  }
  return (email?.[0] ?? "U").toUpperCase();
}

/**
 * Returns next 10:00 local time after `from`. If `from` is before today's 10:00,
 * returns today's 10:00. Otherwise tomorrow's 10:00.
 */
export function nextUnlockDate(from: Date = new Date()): Date {
  const d = new Date(from);
  const target = new Date(d);
  target.setHours(10, 0, 0, 0);
  if (target <= d) {
    target.setDate(target.getDate() + 1);
  }
  return target;
}
