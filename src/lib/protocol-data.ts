export interface Exercicio {
  id: number;
  nome: string;
  foco: string;
  series: string;
  reps: string;
  descanso: string;
  videoUrl: string;
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
    foco: "Ênfase em Costas (Dorsais / Bíceps / Deltoide Posterior)",
    exercicios: [
      { id: 1, nome: "Rotação Ext. Polia Unilateral", foco: "Manguito", series: "3", reps: "10 a 12", descanso: "40s", videoUrl: "https://www.youtube.com/embed/uUo-Ri4_vFQ" },
      { id: 2, nome: "Puxada Alta Frente", foco: "Dorsais", series: "4", reps: "10 a 12", descanso: "60s", videoUrl: "https://www.youtube.com/embed/mPmfwbc_svw" },
      { id: 3, nome: "Remada Baixa", foco: "Dorsais Espessura", series: "4", reps: "10 a 12", descanso: "60s", videoUrl: "https://www.youtube.com/embed/Lh_NpUyMegw" },
      { id: 4, nome: "Pulldown", foco: "Dorsais Expansão", series: "4", reps: "10 a 12", descanso: "60s", videoUrl: "https://www.youtube.com/embed/7KNy6aij2p0" },
      { id: 5, nome: "Crucifixo Inverso Máquina", foco: "Deltóide Posterior", series: "3", reps: "12 a 15", descanso: "45s", videoUrl: "https://www.youtube.com/embed/YWxL4qBQEJk" },
      { id: 6, nome: "Rosca Direta Barra W", foco: "Bíceps", series: "4", reps: "10 a 12", descanso: "60s", videoUrl: "https://www.youtube.com/embed/CxsSfJb3ucA" },
      { id: 7, nome: "Rosca com Halteres Banco Inclinado", foco: "Bíceps Alongado", series: "3", reps: "10 a 12", descanso: "60s", videoUrl: "https://www.youtube.com/embed/6C5y_02RrfM" },
    ],
  },
  {
    id: 2,
    nome: "Treino 2",
    foco: "Ênfase em Peitoral (Peitoral / Deltoide / Tríceps)",
    exercicios: [
      { id: 1, nome: "Rotação Ext. Polia Unilateral", foco: "Manguito", series: "3", reps: "10 a 12", descanso: "40s", videoUrl: "https://www.youtube.com/embed/uUo-Ri4_vFQ" },
      { id: 2, nome: "Desenvolvimento", foco: "Deltóide Frontal/Médio", series: "4", reps: "10 a 12", descanso: "60s", videoUrl: "https://www.youtube.com/embed/9Dk2URiYUgI" },
      { id: 3, nome: "Voador", foco: "Peitoral Isolado", series: "4", reps: "10 a 12", descanso: "60s", videoUrl: "https://www.youtube.com/embed/Ozot1-lhaBo" },
      { id: 4, nome: "Supino Inclinado Halteres", foco: "Peitoral Superior", series: "4", reps: "10 a 12", descanso: "60s", videoUrl: "https://www.youtube.com/embed/ZhWgcCY2lqs" },
      { id: 5, nome: "Cross Over", foco: "Peitoral Inferior", series: "4", reps: "10 a 12", descanso: "60s", videoUrl: "https://www.youtube.com/embed/mccQrInfjBs" },
      { id: 6, nome: "Elevação Lateral com Halteres", foco: "Deltóide Médio", series: "4", reps: "12 a 15", descanso: "45s", videoUrl: "https://www.youtube.com/embed/9y3Kz4vFE8k" },
      { id: 7, nome: "Tríceps Testa", foco: "Tríceps", series: "4", reps: "10 a 12", descanso: "60s", videoUrl: "https://www.youtube.com/embed/B0sXjBDyuiQ" },
      { id: 8, nome: "Tríceps Corda", foco: "Tríceps Isolado", series: "3", reps: "12 a 15", descanso: "45s", videoUrl: "https://www.youtube.com/embed/Qyd7_FaxoLs" },
    ],
  },
  {
    id: 3,
    nome: "Treino 3",
    foco: "Ênfase em Pernas (Inferiores Completo)",
    exercicios: [
      { id: 1, nome: "Agachamento Peso Corporal", foco: "Aquecimento", series: "2", reps: "15 a 20", descanso: "40s", videoUrl: "EM BREVE" },
      { id: 2, nome: "Agachamento Livre", foco: "Quadríceps e Glúteos", series: "4", reps: "10 a 12", descanso: "90s", videoUrl: "https://www.youtube.com/embed/9h_VvLDlR7k" },
      { id: 3, nome: "Mesa Flexora", foco: "Posterior de Coxa", series: "4", reps: "10 a 12", descanso: "60s", videoUrl: "https://www.youtube.com/embed/Z7Yj5ajNA0E" },
      { id: 4, nome: "Leg Press", foco: "Quadríceps", series: "4", reps: "10 a 12", descanso: "90s", videoUrl: "https://www.youtube.com/embed/qeNHff6-_I8" },
      { id: 5, nome: "Cadeira Abdutora", foco: "Glúteo Médio", series: "4", reps: "12 a 15", descanso: "45s", videoUrl: "https://www.youtube.com/embed/1BdeEx18sec" },
      { id: 6, nome: "Gêmeos em Pé", foco: "Panturrilhas", series: "4", reps: "15 a 20", descanso: "45s", videoUrl: "https://www.youtube.com/embed/5laQ9RG_6gY" },
    ],
  },
  {
    id: 4,
    nome: "Treino 4",
    foco: "Ênfase em Ombros (Deltóides e Complementar)",
    exercicios: [
      { id: 1, nome: "Supino Reto Halteres", foco: "Peitoral Médio", series: "4", reps: "10 a 12", descanso: "60s", videoUrl: "https://www.youtube.com/embed/30jKgYuAXIM" },
      { id: 2, nome: "Remada Curvada", foco: "Dorsais Espessura", series: "4", reps: "10 a 12", descanso: "60s", videoUrl: "https://www.youtube.com/embed/FUZ8sowWDcE" },
      { id: 3, nome: "Crucifixo Inclinado", foco: "Peitoral Superior", series: "3", reps: "10 a 12", descanso: "60s", videoUrl: "https://www.youtube.com/embed/Giy7FAPf8oA" },
      { id: 4, nome: "Elevação Frontal", foco: "Deltóide Frontal", series: "3", reps: "10 a 12", descanso: "45s", videoUrl: "https://www.youtube.com/embed/UTAhAhA1gSA" },
      { id: 5, nome: "Rosca Martelo", foco: "Braquial", series: "3", reps: "10 a 12", descanso: "45s", videoUrl: "https://www.youtube.com/embed/0-_yC5le2i4" },
      { id: 6, nome: "Tríceps Pulley Barra Reta", foco: "Tríceps", series: "4", reps: "10 a 12", descanso: "60s", videoUrl: "https://www.youtube.com/embed/4LQYl3QIM2k" },
    ],
  },
];

export const ABDOMEN: Exercicio[] = [
  { id: 1, nome: "Abdomen Corda", foco: "Abdômen Superior", series: "3", reps: "10 a 12", descanso: "40s", videoUrl: "https://www.youtube.com/embed/Dn_PIBI41nc" },
  { id: 2, nome: "Abdomen Infra ao Chão", foco: "Abdômen Inferior", series: "3", reps: "10 a 12", descanso: "40s", videoUrl: "https://www.instagram.com/p/CoqANw_jGNa/embed" },
  { id: 3, nome: "Isometria Prancha", foco: "Core / Estabilidade", series: "2", reps: "40s", descanso: "40s", videoUrl: "EM BREVE" },
];
