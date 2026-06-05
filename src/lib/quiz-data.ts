export type QuizStepType =
  | "cards"
  | "slider"
  | "textarea"
  | "checkbox-multi"
  | "yes-no-conditional"
  | "intersticial";

export type QuizCategory = "corpo" | "rotina" | "nutricao" | "mente";

export interface QuizStep {
  id: string;
  type: QuizStepType;
  question: string;
  subtitle?: string;
  category?: QuizCategory;
  options?: { value: string; label: string; emoji?: string; description?: string }[];
  min?: number;
  max?: number;
  unit?: string;
  defaultValue?: number;
  placeholder?: string;
  conditionalPlaceholder?: string;
  optional?: boolean;
}

export const CATEGORY_LABEL: Record<QuizCategory, string> = {
  corpo: "Corpo",
  rotina: "Rotina & Recuperação",
  nutricao: "Nutrição",
  mente: "Mentalidade",
};

export const QUIZ_STEPS: QuizStep[] = [
  // ============ CORPO ============
  {
    id: "genero",
    type: "cards",
    category: "corpo",
    question: "Qual é o seu gênero?",
    options: [
      { value: "masculino", label: "Masculino", emoji: "♂" },
      { value: "feminino", label: "Feminino", emoji: "♀" },
    ],
  },
  {
    id: "idade",
    type: "slider",
    category: "corpo",
    question: "Qual é a sua idade?",
    min: 16,
    max: 75,
    unit: "anos",
    defaultValue: 30,
  },
  {
    id: "altura",
    type: "slider",
    category: "corpo",
    question: "Qual é a sua altura?",
    min: 140,
    max: 220,
    unit: "cm",
    defaultValue: 175,
  },
  {
    id: "peso",
    type: "slider",
    category: "corpo",
    question: "Qual é o seu peso atual?",
    min: 40,
    max: 180,
    unit: "kg",
    defaultValue: 80,
  },
  {
    id: "peso_meta",
    type: "slider",
    category: "corpo",
    question: "Qual peso você quer atingir?",
    subtitle: "Sua meta realista nos próximos meses",
    min: 40,
    max: 180,
    unit: "kg",
    defaultValue: 75,
  },
  {
    id: "circunferencia_cintura",
    type: "slider",
    category: "corpo",
    question: "Qual sua circunferência da cintura?",
    subtitle: "Meça na altura do umbigo (opcional, mas refina sua avaliação)",
    min: 50,
    max: 160,
    unit: "cm",
    defaultValue: 90,
    optional: true,
  },
  {
    id: "composicao",
    type: "cards",
    category: "corpo",
    question: "Como está sua composição corporal hoje?",
    options: [
      { value: "muito_magro", label: "Muito magro", emoji: "🦴", description: "Pouca massa e gordura" },
      { value: "magro", label: "Magro", emoji: "💪", description: "Boa definição, pouca massa" },
      { value: "magro_barriga", label: "Magro com barriga", emoji: "🫃", description: "Corpo fino mas com barriga" },
      { value: "medio", label: "Médio", emoji: "🙂", description: "Nem gordo nem magro" },
      { value: "acima_peso", label: "Acima do peso", emoji: "🍔", description: "Bastante gordura corporal" },
      { value: "muito_acima_peso", label: "Muito acima do peso", emoji: "⚠️", description: "Sobrepeso significativo" },
      { value: "musculoso", label: "Musculoso", emoji: "🏋️", description: "Tenho massa, quero mais" },
    ],
  },

  // ============ Intersticial 1 ============
  {
    id: "intersticial_corpo",
    type: "intersticial",
    question: "Ótimo! Conhecemos seu corpo.",
    subtitle: "Agora vamos entender sua rotina para montar o protocolo certo para você.",
  },

  // ============ ROTINA & RECUPERAÇÃO ============
  {
    id: "experiencia",
    type: "cards",
    category: "rotina",
    question: "Qual sua experiência com academia?",
    options: [
      { value: "nunca", label: "Nunca treinei" },
      { value: "menos_6m", label: "Menos de 6 meses" },
      { value: "6m_2a", label: "6 meses a 2 anos" },
      { value: "mais_2a", label: "Mais de 2 anos" },
    ],
  },
  {
    id: "treinando_agora",
    type: "yes-no-conditional",
    category: "rotina",
    question: "Está treinando atualmente?",
    conditionalPlaceholder: "Conte rapidamente como é seu treino hoje",
  },
  {
    id: "dias_treino_semana",
    type: "cards",
    category: "rotina",
    question: "Quantos dias por semana você pode treinar?",
    options: [
      { value: "2", label: "2 dias" },
      { value: "3", label: "3 dias" },
      { value: "4", label: "4 dias" },
      { value: "5", label: "5 dias" },
      { value: "6", label: "6 dias" },
    ],
  },
  {
    id: "tempo_treino",
    type: "cards",
    category: "rotina",
    question: "Quanto tempo por treino?",
    options: [
      { value: "30", label: "Até 30 minutos" },
      { value: "45", label: "Até 45 minutos" },
      { value: "60", label: "Até 1 hora" },
      { value: "75", label: "Mais de 1 hora" },
    ],
  },
  {
    id: "local_treino",
    type: "cards",
    category: "rotina",
    question: "Onde você vai treinar?",
    options: [
      { value: "academia_completa", label: "Academia completa", description: "Todos os equipamentos" },
      { value: "academia_basica", label: "Academia básica", description: "Equipamentos limitados" },
      { value: "casa_equipada", label: "Casa com equipamentos", description: "Halteres, barras, etc." },
      { value: "casa_basica", label: "Casa sem equipamentos", description: "Só peso do corpo" },
    ],
  },
  {
    id: "execucao",
    type: "cards",
    category: "rotina",
    question: "Como é seu nível de execução nos exercícios?",
    options: [
      { value: "iniciante", label: "Iniciante", description: "Preciso aprender as técnicas" },
      { value: "intermediario", label: "Intermediário", description: "Sei executar os principais" },
      { value: "avancado", label: "Avançado", description: "Tenho boa técnica" },
    ],
  },
  {
    id: "horas_sono",
    type: "slider",
    category: "rotina",
    question: "Quantas horas você dorme por noite?",
    subtitle: "Sono é a base da recuperação muscular",
    min: 4,
    max: 10,
    unit: "horas",
    defaultValue: 7,
  },
  {
    id: "nivel_estresse",
    type: "slider",
    category: "rotina",
    question: "Qual seu nível de estresse no dia a dia?",
    subtitle: "1 = muito calmo · 10 = sob alta pressão",
    min: 1,
    max: 10,
    unit: "/10",
    defaultValue: 5,
  },
  {
    id: "outro_esporte",
    type: "yes-no-conditional",
    category: "rotina",
    question: "Pratica outro esporte?",
    conditionalPlaceholder: "Qual? Com que frequência?",
  },
  {
    id: "dor_lesao",
    type: "yes-no-conditional",
    category: "rotina",
    question: "Você tem alguma dor ou problema físico?",
    conditionalPlaceholder: "Especifique a dor/lesão",
  },

  // ============ Intersticial 2 ============
  {
    id: "motivacao_intersticial",
    type: "intersticial",
    question: "Você não está sozinho!",
    subtitle:
      "Mais de 12.000 alunos já transformaram seus corpos com o método Shape em V. A jornada começa agora.",
  },

  // ============ NUTRIÇÃO ============
  {
    id: "refeicoes_dia",
    type: "cards",
    category: "nutricao",
    question: "Quantas refeições você faz por dia?",
    options: [
      { value: "2", label: "2 refeições" },
      { value: "3", label: "3 refeições" },
      { value: "4", label: "4 refeições" },
      { value: "5", label: "5 ou mais" },
    ],
  },
  {
    id: "qualidade_alimentacao",
    type: "cards",
    category: "nutricao",
    question: "Como você avalia sua alimentação hoje?",
    options: [
      { value: "ruim", label: "Ruim", description: "Fast food, processados, irregular" },
      { value: "regular", label: "Regular", description: "Tento, mas escorrego bastante" },
      { value: "boa", label: "Boa", description: "Como bem na maior parte do tempo" },
      { value: "excelente", label: "Excelente", description: "Disciplinado, pesado e calculado" },
    ],
  },
  {
    id: "agua_dia",
    type: "cards",
    category: "nutricao",
    question: "Quanta água você bebe por dia?",
    options: [
      { value: "menos_1l", label: "Menos de 1 litro" },
      { value: "1_2l", label: "Entre 1 e 2 litros" },
      { value: "2_3l", label: "Entre 2 e 3 litros" },
      { value: "mais_3l", label: "Mais de 3 litros" },
    ],
  },
  {
    id: "alcool_semana",
    type: "cards",
    category: "nutricao",
    question: "Com que frequência você bebe álcool?",
    options: [
      { value: "nao_bebo", label: "Não bebo" },
      { value: "1_2", label: "1 a 2 vezes por semana" },
      { value: "3_5", label: "3 a 5 vezes por semana" },
      { value: "quase_todo_dia", label: "Quase todo dia" },
    ],
  },
  {
    id: "suplementacao",
    type: "checkbox-multi",
    category: "nutricao",
    question: "Você usa algum suplemento?",
    subtitle: "Selecione todos que você usa",
    options: [
      { value: "whey", label: "Whey protein" },
      { value: "creatina", label: "Creatina" },
      { value: "multivit", label: "Multivitamínico" },
      { value: "pre_treino", label: "Pré-treino" },
      { value: "omega3", label: "Ômega 3" },
      { value: "nenhum", label: "Nenhum" },
    ],
  },
  {
    id: "gasto_mensal",
    type: "cards",
    category: "nutricao",
    question: "Quanto você gasta por mês com alimentação e suplementos?",
    options: [
      { value: "ate_300", label: "Até R$ 300" },
      { value: "300_700", label: "R$ 300 – R$ 700" },
      { value: "700_1500", label: "R$ 700 – R$ 1.500" },
      { value: "mais_1500", label: "Mais de R$ 1.500" },
    ],
  },

  // ============ MENTALIDADE ============
  {
    id: "profissao",
    type: "textarea",
    category: "mente",
    question: "Qual é a sua profissão?",
    placeholder: "Ex: engenheiro, autônomo, estudante…",
  },
  {
    id: "objetivo",
    type: "cards",
    category: "mente",
    question: "Qual é o seu principal objetivo?",
    options: [
      { value: "crescer", label: "Crescer", description: "Ganhar massa muscular" },
      { value: "crescer_secar", label: "Crescer e Secar", description: "Ganhar músculo e perder gordura" },
      { value: "secar", label: "Secar Muito", description: "Perder muita gordura" },
    ],
  },
  {
    id: "areas_incomodam",
    type: "checkbox-multi",
    category: "mente",
    question: "Quais partes do corpo mais te incomodam?",
    subtitle: "Selecione todas que se aplicam",
    options: [
      { value: "barriga", label: "Barriga" },
      { value: "abdomen_definido", label: "Falta de abdômen definido" },
      { value: "bracos", label: "Braços" },
      { value: "peito", label: "Peito" },
      { value: "costas", label: "Costas" },
      { value: "pernas", label: "Pernas" },
      { value: "gluteos", label: "Glúteos" },
      { value: "ombros", label: "Ombros" },
      { value: "postura", label: "Postura" },
    ],
  },
  {
    id: "dificuldade",
    type: "textarea",
    category: "mente",
    question: "Qual é a sua maior dificuldade ou frustração?",
    placeholder: "Conte com suas palavras…",
  },
  {
    id: "sentimento_corpo",
    type: "textarea",
    category: "mente",
    question: "Como você se sente em relação ao seu corpo hoje?",
    placeholder: "Seja sincero…",
  },
  {
    id: "urgencia",
    type: "cards",
    category: "mente",
    question: "Qual sua urgência para melhorar?",
    options: [
      { value: "imediata", label: "Imediata — para ontem" },
      { value: "alta", label: "Alta — próximos meses" },
      { value: "media", label: "Média — este ano" },
      { value: "baixa", label: "Sem pressa" },
    ],
  },
  {
    id: "motivacao_atual",
    type: "textarea",
    category: "mente",
    question: "Qual é a sua maior motivação hoje?",
    placeholder: "Família, autoestima, saúde…",
  },
  {
    id: "ja_tentou",
    type: "yes-no-conditional",
    category: "mente",
    question: "Você já tentou outras coisas para mudar seu corpo?",
    conditionalPlaceholder: "Por que não funcionou?",
  },
  {
    id: "motivo_shape_v",
    type: "textarea",
    category: "mente",
    question: "Por que você está buscando o Shape em V agora?",
    placeholder: "O que te trouxe até aqui…",
  },
  {
    id: "quase_nao_comecou",
    type: "textarea",
    category: "mente",
    question: "O que quase te fez NÃO começar hoje?",
    placeholder: "Medos, dúvidas, desculpas…",
  },
  {
    id: "vida_dos_sonhos",
    type: "textarea",
    category: "mente",
    question: "Como você imagina sua vida com o corpo dos sonhos?",
    placeholder: "Sem limites, sonhe alto…",
  },
];

export const TOTAL_STEPS = QUIZ_STEPS.length;

/** Returns 1-based index of the step within its own category, plus the size of that category. */
export function stepCategoryProgress(stepIdx: number): { current: number; total: number } | null {
  const step = QUIZ_STEPS[stepIdx];
  if (!step?.category) return null;
  const sameCat = QUIZ_STEPS.filter((s) => s.category === step.category);
  const pos = sameCat.findIndex((s) => s.id === step.id) + 1;
  return { current: pos, total: sameCat.length };
}
