export type QuizStepType =
  | "cards"
  | "slider"
  | "textarea"
  | "checkbox-multi"
  | "yes-no-conditional"
  | "intersticial";

export interface QuizStep {
  id: string;
  type: QuizStepType;
  question: string;
  subtitle?: string;
  options?: { value: string; label: string; emoji?: string; description?: string }[];
  min?: number;
  max?: number;
  unit?: string;
  defaultValue?: number;
  placeholder?: string;
  conditionalPlaceholder?: string;
}

export const QUIZ_STEPS: QuizStep[] = [
  {
    id: "genero",
    type: "cards",
    question: "Qual é o seu gênero?",
    options: [
      { value: "masculino", label: "Masculino", emoji: "♂" },
      { value: "feminino", label: "Feminino", emoji: "♀" },
    ],
  },
  {
    id: "idade",
    type: "slider",
    question: "Qual é a sua idade?",
    min: 16,
    max: 75,
    unit: "anos",
    defaultValue: 30,
  },
  {
    id: "altura",
    type: "slider",
    question: "Qual é a sua altura?",
    min: 140,
    max: 220,
    unit: "cm",
    defaultValue: 175,
  },
  {
    id: "peso",
    type: "slider",
    question: "Qual é o seu peso?",
    min: 40,
    max: 180,
    unit: "kg",
    defaultValue: 80,
  },
  {
    id: "composicao",
    type: "cards",
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
  {
    id: "motivacao_intersticial",
    type: "intersticial",
    question: "Você não está sozinho!",
    subtitle:
      "Mais de 12.000 alunos já transformaram seus corpos com o método Shape em V. A jornada começa agora.",
  },
  {
    id: "experiencia",
    type: "cards",
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
    type: "cards",
    question: "Está treinando atualmente?",
    options: [
      { value: "sim", label: "Sim" },
      { value: "nao", label: "Não" },
    ],
  },
  {
    id: "outro_esporte",
    type: "yes-no-conditional",
    question: "Pratica outro esporte?",
    conditionalPlaceholder: "Qual?",
  },
  {
    id: "profissao",
    type: "textarea",
    question: "Qual é a sua profissão?",
    placeholder: "Ex: engenheiro, autônomo, estudante…",
  },
  {
    id: "objetivo",
    type: "cards",
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
    question: "Quais partes do corpo mais te incomodam?",
    subtitle: "Selecione todas que se aplicam",
    options: [
      { value: "barriga", label: "Barriga" },
      { value: "bracos", label: "Braços" },
      { value: "peito", label: "Peito" },
      { value: "costas", label: "Costas" },
      { value: "pernas", label: "Pernas" },
      { value: "gluteos", label: "Glúteos" },
      { value: "ombros", label: "Ombros" },
    ],
  },
  {
    id: "dificuldade",
    type: "textarea",
    question: "Qual é a sua maior dificuldade ou frustração?",
    placeholder: "Conte com suas palavras…",
  },
  {
    id: "sentimento_corpo",
    type: "textarea",
    question: "Como você se sente em relação ao seu corpo hoje?",
    placeholder: "Seja sincero…",
  },
  {
    id: "gasto_mensal",
    type: "cards",
    question: "Quanto você gasta por mês com alimentação e suplementos?",
    options: [
      { value: "ate_300", label: "Até R$ 300" },
      { value: "300_700", label: "R$ 300 – R$ 700" },
      { value: "700_1500", label: "R$ 700 – R$ 1.500" },
      { value: "mais_1500", label: "Mais de R$ 1.500" },
    ],
  },
  {
    id: "urgencia",
    type: "cards",
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
    question: "Qual é a sua maior motivação hoje?",
    placeholder: "Família, autoestima, saúde…",
  },
  {
    id: "ja_tentou",
    type: "yes-no-conditional",
    question: "Você já tentou outras coisas para mudar seu corpo?",
    conditionalPlaceholder: "Por que não funcionou?",
  },
  {
    id: "motivo_shape_v",
    type: "textarea",
    question: "Por que você está buscando o Shape em V agora?",
    placeholder: "O que te trouxe até aqui…",
  },
  {
    id: "quase_nao_comecou",
    type: "textarea",
    question: "O que quase te fez NÃO começar hoje?",
    placeholder: "Medos, dúvidas, desculpas…",
  },
  {
    id: "execucao",
    type: "cards",
    question: "Como é seu nível de execução nos exercícios?",
    options: [
      { value: "iniciante", label: "Iniciante" },
      { value: "intermediario", label: "Intermediário" },
      { value: "avancado", label: "Avançado" },
    ],
  },
  {
    id: "dor_lesao",
    type: "yes-no-conditional",
    question: "Você tem alguma dor ou problema físico?",
    conditionalPlaceholder: "Especifique a dor/lesão",
  },
  {
    id: "vida_dos_sonhos",
    type: "textarea",
    question: "Como você imagina sua vida com o corpo dos sonhos?",
    placeholder: "Sem limites, sonhe alto…",
  },
];

export const TOTAL_STEPS = QUIZ_STEPS.length;
