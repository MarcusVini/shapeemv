import { createFileRoute } from "@tanstack/react-router";
import { Dumbbell, Lock } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";

export const Route = createFileRoute("/_authenticated/protocol")({
  component: ProtocolPage,
});

const TREINOS = [
  { letra: "A", foco: "Peito e tríceps", duracao: "55 min", exercicios: 7 },
  { letra: "B", foco: "Costas e bíceps", duracao: "60 min", exercicios: 7 },
  { letra: "C", foco: "Pernas e glúteos", duracao: "65 min", exercicios: 8 },
  { letra: "D", foco: "Ombros e abdômen", duracao: "50 min", exercicios: 6 },
];

function ProtocolPage() {
  return (
    <main className="min-h-screen bg-background pb-24">
      <div className="mx-auto max-w-md px-6 pt-12">
        <p className="text-xs uppercase tracking-[0.3em] text-primary/80">Seu protocolo</p>
        <h1 className="mt-1 text-3xl font-black text-foreground">
          Shape em V <span className="text-gold-gradient">Personalizado</span>
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          4 treinos calibrados para o seu nível, objetivo e disponibilidade.
        </p>

        <div className="mt-8 space-y-3">
          {TREINOS.map((t) => (
            <article
              key={t.letra}
              className="flex items-center gap-4 rounded-3xl border border-border bg-card p-5 shadow-card-premium"
            >
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl gold-gradient text-xl font-black text-primary-foreground shadow-gold-sm">
                {t.letra}
              </div>
              <div className="flex-1">
                <p className="text-base font-bold text-foreground">Treino {t.letra}</p>
                <p className="text-xs text-muted-foreground">{t.foco}</p>
                <p className="mt-1 text-[11px] uppercase tracking-wider text-primary/80">
                  {t.duracao} • {t.exercicios} exercícios
                </p>
              </div>
              <Dumbbell className="h-5 w-5 text-muted-foreground" />
            </article>
          ))}
        </div>

        <div className="mt-8 flex items-start gap-3 rounded-2xl border border-border bg-card p-4">
          <Lock className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <p className="text-xs text-muted-foreground">
            Detalhes dos exercícios, séries e repetições serão liberados em breve junto
            com o vídeo de execução do Fernando.
          </p>
        </div>
      </div>
      <BottomNav />
    </main>
  );
}
