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

function num(v: unknown, fallback: number): number {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim() !== "" && Number.isFinite(Number(v))) return Number(v);
  return fallback;
}

// =================== IMC ===================

export function calcIMC(pesoKg: number, alturaCm: number): number {
  if (!pesoKg || !alturaCm) return 0;
  const m = alturaCm / 100;
  return +(pesoKg / (m * m)).toFixed(1);
}

export function imcLabel(imc: number): { label: string; pct: number; color: string } {
  if (imc < 18.5) return { label: "Abaixo do peso", pct: 10, color: "oklch(0.6 0.18 240)" };
  if (imc < 25) return { label: "Peso normal", pct: 35, color: "oklch(0.7 0.16 145)" };
  if (imc < 30) return { label: "Sobrepeso", pct: 65, color: "oklch(0.82 0.16 85)" };
  if (imc < 35) return { label: "Obesidade I", pct: 85, color: "oklch(0.62 0.22 25)" };
  return { label: "Obesidade II+", pct: 95, color: "oklch(0.55 0.22 25)" };
}

/** Returns a contextual note for the IMC reading (musculoso, idoso, magro_barriga). */
export function imcContextNote(answers: QuizAnswers, imc: number): string | null {
  const comp = answers.composicao as string | undefined;
  const idade = num(answers.idade, 0);
  if (comp === "musculoso" && imc >= 25) {
    return "Seu IMC está alto, mas como você tem boa massa muscular, este número superestima sua gordura corporal. Olhe a composição e a cintura, não só o IMC.";
  }
  if (comp === "magro_barriga" && imc < 25) {
    return "Seu IMC parece normal, mas o padrão 'magro com barriga' indica gordura visceral concentrada — o foco vai ser ganhar massa e reduzir abdômen.";
  }
  if (idade >= 60) {
    return "Acima de 60 anos as faixas saudáveis de IMC se deslocam levemente para cima (22–27). Considere isso na sua leitura.";
  }
  return null;
}

// =================== Scores (0–100) ===================

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
    muito_magro: 35,
    magro: 70,
    magro_barriga: 55,
    medio: 60,
    acima_peso: 45,
    muito_acima_peso: 25,
    musculoso: 90,
  });
}

export function calcResistenciaScore(answers: QuizAnswers): number {
  let base = 35;
  const outro = answers.outro_esporte as ConditionalAnswer | undefined;
  const treina = answers.treinando_agora as ConditionalAnswer | undefined;
  if (outro?.resposta === "sim") base += 22;
  if (treina?.resposta === "sim") base += 22;
  // dias treino contribuem
  const dias = num(answers.dias_treino_semana, 0);
  base += Math.min(20, dias * 4);
  return Math.min(95, base);
}

export function calcForcaScore(answers: QuizAnswers): number {
  const exp = calcExperienciaScore(answers);
  const exec = calcExecucaoScore(answers);
  return Math.round(exp * 0.5 + exec * 0.5);
}

/** Recuperação: sono + estresse + álcool. */
export function calcRecuperacaoScore(answers: QuizAnswers): number {
  const sono = num(answers.horas_sono, 7); // 4–10
  const stress = num(answers.nivel_estresse, 5); // 1–10
  // sono: 8h = 100, 7h = 85, 6h = 65, 5h = 40, 4h = 20
  const sonoScore = Math.max(10, Math.min(100, (sono - 4) * 20 + 10));
  // estresse: 1 = 100, 10 = 10
  const stressScore = Math.max(10, 110 - stress * 10);
  // alcool penaliza
  const alcool = String(answers.alcool_semana ?? "");
  const alcoolPenalty = { nao_bebo: 0, "1_2": 4, "3_5": 12, quase_todo_dia: 22 }[alcool] ?? 0;
  return Math.max(10, Math.round(sonoScore * 0.55 + stressScore * 0.45 - alcoolPenalty));
}

/** Nutrição: qualidade + refeições + água + álcool. */
export function calcNutricaoScore(answers: QuizAnswers): number {
  const qualidade = scoreFromMap(answers.qualidade_alimentacao, {
    ruim: 25,
    regular: 50,
    boa: 75,
    excelente: 95,
  });
  const refs = scoreFromMap(String(answers.refeicoes_dia ?? ""), {
    "2": 40,
    "3": 70,
    "4": 90,
    "5": 95,
  });
  const agua = scoreFromMap(answers.agua_dia, {
    menos_1l: 25,
    "1_2l": 55,
    "2_3l": 85,
    mais_3l: 95,
  });
  const alcool = scoreFromMap(answers.alcool_semana, {
    nao_bebo: 100,
    "1_2": 80,
    "3_5": 50,
    quase_todo_dia: 25,
  });
  return Math.round(qualidade * 0.45 + refs * 0.2 + agua * 0.2 + alcool * 0.15);
}

export function calcScoreGeral(answers: QuizAnswers): number {
  const exp = calcExperienciaScore(answers);
  const exec = calcExecucaoScore(answers);
  const comp = calcComposicaoScore(answers);
  const rec = calcRecuperacaoScore(answers);
  const nut = calcNutricaoScore(answers);
  return Math.round(exp * 0.2 + exec * 0.2 + comp * 0.2 + rec * 0.2 + nut * 0.2);
}

// =================== Metabolismo (Mifflin-St Jeor) ===================

export interface Metabolism {
  tmb: number; // kcal repouso
  gastoTotal: number; // kcal com atividade
  metaCalorica: number; // kcal alvo conforme objetivo
  proteinaG: number; // gramas/dia
  carboG: number;
  gorduraG: number;
}

export function calcMetabolism(answers: QuizAnswers): Metabolism {
  const peso = num(answers.peso, 75);
  const altura = num(answers.altura, 175);
  const idade = num(answers.idade, 30);
  const genero = String(answers.genero ?? "masculino");
  const dias = num(answers.dias_treino_semana, 3);
  const objetivo = String(answers.objetivo ?? "crescer_secar");

  // Mifflin-St Jeor
  const base = 10 * peso + 6.25 * altura - 5 * idade;
  const tmb = Math.round(genero === "feminino" ? base - 161 : base + 5);

  // fator de atividade pela frequência de treino
  const factor = dias <= 2 ? 1.375 : dias <= 4 ? 1.55 : dias <= 5 ? 1.65 : 1.75;
  const gastoTotal = Math.round(tmb * factor);

  // meta calórica
  let metaCalorica = gastoTotal;
  let proteinaPorKg = 2.0;
  if (objetivo === "secar") {
    metaCalorica = Math.round(gastoTotal * 0.8); // -20%
    proteinaPorKg = 2.2;
  } else if (objetivo === "crescer") {
    metaCalorica = Math.round(gastoTotal * 1.1); // +10%
    proteinaPorKg = 1.8;
  } else {
    // crescer_secar: leve déficit
    metaCalorica = Math.round(gastoTotal * 0.95);
    proteinaPorKg = 2.2;
  }

  const proteinaG = Math.round(peso * proteinaPorKg);
  const proteinaKcal = proteinaG * 4;
  const gorduraG = Math.round((metaCalorica * 0.25) / 9); // 25% de gordura
  const gorduraKcal = gorduraG * 9;
  const carboKcal = Math.max(0, metaCalorica - proteinaKcal - gorduraKcal);
  const carboG = Math.round(carboKcal / 4);

  return { tmb, gastoTotal, metaCalorica, proteinaG, carboG, gorduraG };
}

// =================== Projeções ===================

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
  void alturaCm;
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

export interface PhysicalProjectionPoint {
  dia: string;
  ganhoMuscular: number;
  queimaGordura: number;
  disposicao: number;
}

/**
 * Projeção 28d personalizada usando volume (dias/tempo de treino),
 * recuperação (sono/estresse) e experiência (newbie gains).
 */
export function project28DaysPhysical(answers: QuizAnswers): PhysicalProjectionPoint[] {
  const objetivo = String(answers.objetivo ?? "crescer_secar");
  const dias = num(answers.dias_treino_semana, 3);
  const tempo = num(answers.tempo_treino, 45);
  const exp = String(answers.experiencia ?? "menos_6m");
  const recScore = calcRecuperacaoScore(answers);

  // multiplicadores 0.7 – 1.2
  const volMult = Math.min(1.2, 0.7 + (dias * tempo) / 250);
  const recMult = 0.7 + (recScore / 100) * 0.5;
  const newbieMult = exp === "nunca" || exp === "menos_6m" ? 1.15 : 1.0;
  const mult = Math.min(1.25, volMult * recMult * newbieMult);

  const ganhoBase = objetivo === "secar" ? 50 : 85;
  const queimaBase = objetivo === "crescer" ? 45 : 80;
  const dispBase = 80;

  const ganhoMax = Math.min(95, Math.round(ganhoBase * mult));
  const queimaMax = Math.min(95, Math.round(queimaBase * mult));
  const dispMax = Math.min(95, Math.round(dispBase * mult));

  const labels = ["Hoje", "Dia 7", "Dia 14", "Dia 21", "Dia 28"];
  return labels.map((label, i) => {
    const t = i / 4;
    return {
      dia: label,
      ganhoMuscular: Math.round(t * ganhoMax),
      queimaGordura: Math.round(t * queimaMax),
      disposicao: Math.round(t * dispMax),
    };
  });
}

export interface WellbeingProjectionPoint {
  dia: string;
  testosterona: number;
  autoestima: number;
  saude: number;
}

export function project28DaysWellbeing(answers: QuizAnswers): WellbeingProjectionPoint[] {
  const rec = calcRecuperacaoScore(answers);
  const nut = calcNutricaoScore(answers);
  const mult = 0.7 + ((rec + nut) / 200) * 0.6; // 0.7 – 1.3

  const testoMax = Math.min(70, Math.round(40 * mult));
  const autoMax = Math.min(95, Math.round(80 * mult));
  const saudeMax = Math.min(90, Math.round(65 * mult));

  const labels = ["Hoje", "Dia 7", "Dia 14", "Dia 21", "Dia 28"];
  return labels.map((label, i) => {
    const t = i / 4;
    return {
      dia: label,
      testosterona: Math.round(t * testoMax),
      autoestima: Math.round(t * autoMax),
      saude: Math.round(t * saudeMax),
    };
  });
}

// =================== Diagnóstico textual ===================

const OBJETIVO_LABEL: Record<string, string> = {
  crescer: "ganho de massa muscular",
  crescer_secar: "ganho de massa + queima de gordura (recomposição)",
  secar: "queima de gordura e definição",
};

export function buildDiagnostico(answers: QuizAnswers, nome: string): string {
  const primeiro = (nome || "").trim().split(/\s+/)[0] || "Atleta";
  const idade = num(answers.idade, 0);
  const peso = num(answers.peso, 0);
  const meta = num(answers.peso_meta, 0);
  const altura = num(answers.altura, 0);
  const imc = calcIMC(peso, altura);
  const imcL = imcLabel(imc).label.toLowerCase();
  const objetivo = OBJETIVO_LABEL[String(answers.objetivo ?? "crescer_secar")];
  const dias = num(answers.dias_treino_semana, 0);
  const tempo = num(answers.tempo_treino, 0);
  const sono = num(answers.horas_sono, 7);
  const stress = num(answers.nivel_estresse, 5);

  const recScore = calcRecuperacaoScore(answers);
  const nutScore = calcNutricaoScore(answers);
  const execL = String(answers.execucao ?? "intermediario");

  const recTxt =
    recScore < 50
      ? "baixa recuperação"
      : recScore < 75
        ? "recuperação moderada"
        : "boa recuperação";
  const nutTxt =
    nutScore < 50
      ? "alimentação a ser ajustada"
      : nutScore < 75
        ? "alimentação razoável"
        : "alimentação consistente";

  // alavanca principal
  let alavanca = "manter consistência";
  if (recScore < 60 && sono < 7) alavanca = "ajustar sono e estresse";
  else if (nutScore < 60) alavanca = "limpar a alimentação e aumentar proteína";
  else if (objetivo.includes("queima")) alavanca = "criar déficit calórico controlado";
  else if (objetivo.includes("massa")) alavanca = "aumentar volume de treino e calorias";

  const metaTxt = meta && meta !== peso ? ` Meta de peso: ${meta}kg.` : "";
  const treinoTxt = dias && tempo ? `${dias}x/semana de ${tempo}min` : "rotina a ser estruturada";

  return `${primeiro}, ${idade ? idade + " anos. " : ""}Seu perfil indica ${imcL} (IMC ${imc || "—"}), com ${recTxt} (dormindo ${sono}h e estresse ${stress}/10) e ${nutTxt}. Sua execução é ${execL} e o foco do protocolo é ${objetivo}.${metaTxt} Sua maior alavanca nos próximos 28 dias é ${alavanca}, mantendo treino ${treinoTxt}.`;
}

export function buildTags(answers: QuizAnswers): string[] {
  const tags: string[] = [];
  const sono = num(answers.horas_sono, 7);
  const stress = num(answers.nivel_estresse, 5);
  const tempo = num(answers.tempo_treino, 60);
  const objetivo = String(answers.objetivo ?? "");
  const urgencia = String(answers.urgencia ?? "");
  const exp = String(answers.experiencia ?? "");
  const nutScore = calcNutricaoScore(answers);

  if (stress >= 7) tags.push("Estressado crônico");
  if (sono < 6) tags.push("Sono curto");
  if (tempo <= 30) tags.push("Tempo curto");
  if (objetivo === "secar") tags.push("Foco em definição");
  if (objetivo === "crescer") tags.push("Foco em massa");
  if (objetivo === "crescer_secar") tags.push("Recomposição");
  if (urgencia === "imediata" || urgencia === "alta") tags.push("Alta urgência");
  if (exp === "nunca" || exp === "menos_6m") tags.push("Iniciante");
  if (exp === "mais_2a") tags.push("Experiente");
  if (nutScore < 50) tags.push("Nutrição frágil");
  return tags.slice(0, 4);
}

export interface Lever {
  title: string;
  detail: string;
  impact: string;
}

export function buildLevers(answers: QuizAnswers): Lever[] {
  const peso = num(answers.peso, 75);
  const sono = num(answers.horas_sono, 7);
  const stress = num(answers.nivel_estresse, 5);
  const agua = String(answers.agua_dia ?? "");
  const nutScore = calcNutricaoScore(answers);
  const proteinaAlvo = Math.round(peso * 2);
  const objetivo = String(answers.objetivo ?? "");

  const candidates: Array<{ score: number; lever: Lever }> = [];

  if (sono < 7) {
    candidates.push({
      score: 100 - sono * 10,
      lever: {
        title: `Dormir 7h+ (hoje: ${sono}h)`,
        detail: "Sono é onde o músculo cresce e a fome do dia seguinte se regula.",
        impact: "+20% recuperação",
      },
    });
  }
  if (stress >= 7) {
    candidates.push({
      score: stress * 10,
      lever: {
        title: `Reduzir estresse (hoje: ${stress}/10)`,
        detail: "Cortisol alto trava queima de gordura e atrapalha sono.",
        impact: "+15% testosterona livre",
      },
    });
  }
  if (nutScore < 70) {
    candidates.push({
      score: 100 - nutScore,
      lever: {
        title: `Atingir ${proteinaAlvo}g de proteína/dia`,
        detail: "Base para construir músculo ou preservar massa no déficit.",
        impact: objetivo === "secar" ? "Preserva massa magra" : "+ganho muscular real",
      },
    });
  }
  if (agua === "menos_1l" || agua === "1_2l") {
    candidates.push({
      score: agua === "menos_1l" ? 80 : 50,
      lever: {
        title: "Subir hidratação para 3L/dia",
        detail: "Água adequada melhora performance, saciedade e digestão.",
        impact: "+10% disposição",
      },
    });
  }
  const treina = answers.treinando_agora as ConditionalAnswer | undefined;
  if (treina?.resposta !== "sim") {
    candidates.push({
      score: 70,
      lever: {
        title: "Começar a treinar nesta semana",
        detail: "Não espere segunda-feira ideal. Comece com 3 dias consistentes.",
        impact: "Destrava todo o resto",
      },
    });
  }
  const alcool = String(answers.alcool_semana ?? "");
  if (alcool === "3_5" || alcool === "quase_todo_dia") {
    candidates.push({
      score: alcool === "quase_todo_dia" ? 90 : 65,
      lever: {
        title: "Reduzir álcool para 1–2x/semana",
        detail: "Álcool sabota recuperação, sono e queima de gordura.",
        impact: "+12% testosterona, melhor sono",
      },
    });
  }

  candidates.sort((a, b) => b.score - a.score);
  const top = candidates.slice(0, 3).map((c) => c.lever);
  if (top.length === 0) {
    return [
      {
        title: "Manter consistência por 28 dias",
        detail: "Você já tem boas bases. Foco agora é não quebrar a sequência.",
        impact: "Resultado composto",
      },
    ];
  }
  return top;
}

// =================== Utils ===================

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
