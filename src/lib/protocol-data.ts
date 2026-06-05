export interface Exercicio {
  nome: string;
  subtitulo: string;
  series: string;
  reps: string;
  descanso: string;
}

export interface Treino {
  id: number;
  nome: string;
  foco: string;
  exercicios: Exercicio[];
}

export const TREINOS: Treino[] = [
  {
    id: 1,
    nome: "Treino 1",
    foco: "Peito e Tríceps",
    exercicios: [
      { nome: "Aquecimento — Esteira", subtitulo: "Preparação cardiovascular", series: "1", reps: "5 min", descanso: "—" },
      { nome: "Supino Reto com Barra", subtitulo: "Foco no peitoral médio", series: "4", reps: "10 a 12", descanso: "60s" },
      { nome: "Supino Inclinado com Halteres", subtitulo: "Peitoral superior", series: "4", reps: "10 a 12", descanso: "60s" },
      { nome: "Crucifixo", subtitulo: "Isolamento do peitoral", series: "3", reps: "12 a 15", descanso: "45s" },
      { nome: "Tríceps Pulley", subtitulo: "Cabeça lateral do tríceps", series: "4", reps: "12", descanso: "45s" },
      { nome: "Tríceps Francês", subtitulo: "Alongamento do tríceps", series: "3", reps: "10 a 12", descanso: "60s" },
    ],
  },
  {
    id: 2,
    nome: "Treino 2",
    foco: "Costas e Bíceps (A base do V)",
    exercicios: [
      { nome: "Aquecimento — Remo", subtitulo: "Ativação dorsal", series: "1", reps: "5 min", descanso: "—" },
      { nome: "Puxada Frontal", subtitulo: "Largura do dorsal", series: "4", reps: "10 a 12", descanso: "60s" },
      { nome: "Remada Curvada com Barra", subtitulo: "Espessura das costas", series: "4", reps: "8 a 10", descanso: "75s" },
      { nome: "Pulldown na Polia", subtitulo: "Ênfase no V superior", series: "3", reps: "12", descanso: "60s" },
      { nome: "Remada Baixa", subtitulo: "Meio das costas", series: "3", reps: "10 a 12", descanso: "60s" },
      { nome: "Rosca Direta", subtitulo: "Bíceps braquial", series: "4", reps: "10 a 12", descanso: "45s" },
      { nome: "Rosca Martelo", subtitulo: "Braquial e antebraço", series: "3", reps: "12", descanso: "45s" },
    ],
  },
  {
    id: 3,
    nome: "Treino 3",
    foco: "Pernas e Ombros (Alargamento de deltoides)",
    exercicios: [
      { nome: "Aquecimento — Bike", subtitulo: "Preparação articular", series: "1", reps: "5 min", descanso: "—" },
      { nome: "Agachamento Livre", subtitulo: "Base de força em pernas", series: "4", reps: "8 a 10", descanso: "90s" },
      { nome: "Leg Press 45°", subtitulo: "Quadríceps e glúteos", series: "4", reps: "10 a 12", descanso: "75s" },
      { nome: "Cadeira Extensora", subtitulo: "Isolamento de quadríceps", series: "3", reps: "12 a 15", descanso: "45s" },
      { nome: "Elevação Lateral", subtitulo: "Deltoide medial — o V", series: "4", reps: "12 a 15", descanso: "45s" },
      { nome: "Desenvolvimento com Halteres", subtitulo: "Ombro completo", series: "4", reps: "10 a 12", descanso: "60s" },
      { nome: "Elevação Frontal", subtitulo: "Deltoide anterior", series: "3", reps: "12", descanso: "45s" },
    ],
  },
];
