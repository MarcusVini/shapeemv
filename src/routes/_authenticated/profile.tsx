import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Check, LogOut, Mail, RefreshCw } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { getLatestState } from "@/lib/assessment.functions";
import { getInitials } from "@/lib/assessment-calc";
import { clearSession, useSession } from "@/lib/session";

export const Route = createFileRoute("/_authenticated/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const fetchState = useServerFn(getLatestState);
  const navigate = useNavigate();
  const session = useSession();
  const { data } = useQuery({
    queryKey: ["state", session?.id],
    queryFn: () => fetchState({ data: { userId: session!.id } }),
    enabled: !!session?.id,
  });
  const nome = session?.nome_completo ?? data?.profile?.nome_completo ?? "";
  const email = session?.email ?? data?.profile?.email ?? "";
  const hasAssessment = !!data?.assessment;
  const hasWorkout = !!data?.workout;
  const assessmentDate = data?.assessment?.created_at
    ? new Date(data.assessment.created_at as string)
    : null;

  function redoAssessment() {
    const ok = window.confirm(
      "Refazer sua avaliação vai gerar uma nova versão personalizada. Suas respostas atuais ficam salvas no histórico. Continuar?",
    );
    if (!ok) return;
    try {
      window.localStorage.removeItem("shapeemv:quiz-progress:v2");
    } catch {
      // ignore
    }
    navigate({ to: "/quiz" });
  }

  const journey = [
    { title: "Cadastro", desc: "Conta criada", done: true },
    { title: "Avaliação enviada", desc: hasAssessment ? "Respostas registradas" : "Ainda não enviada", done: hasAssessment },
    { title: "Protocolo liberado", desc: hasWorkout ? "Disponível na área de treinos" : "Aguardando liberação", done: hasWorkout },
  ];

  return (
    <main className="min-h-screen bg-background pb-28">
      <div className="mx-auto max-w-md px-6 pt-12">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary/80">Conta</p>
          <span className="rounded-full border border-border bg-card/60 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Perfil
          </span>
        </div>
        <h1 className="mt-3 text-3xl font-black text-foreground">
          Sua <span className="text-gold-gradient">área</span>
        </h1>

        <div className="mt-6 flex items-center gap-4 rounded-3xl border border-border bg-card p-5 shadow-card-premium">
          <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl gold-gradient text-lg font-black text-primary-foreground shadow-gold-sm">
            {getInitials(nome, email)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-base font-bold text-foreground">{nome || "Atleta"}</p>
            <p className="flex items-center gap-1.5 truncate text-xs text-muted-foreground">
              <Mail className="h-3 w-3" /> {email}
            </p>
          </div>
        </div>

        {/* Jornada / Histórico */}
        <section className="mt-6 rounded-3xl border border-border bg-card/60 p-5">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Sua jornada
            </p>
            {assessmentDate && (
              <span className="text-[10px] font-semibold text-muted-foreground">
                Avaliada em {assessmentDate.toLocaleDateString("pt-BR")}
              </span>
            )}
          </div>
          <ol className="mt-3 space-y-2">
            {journey.map((j, i) => (
              <li
                key={j.title}
                className="flex items-start gap-3 rounded-2xl border border-border/60 bg-background p-3"
              >
                <span
                  className={
                    j.done
                      ? "grid h-8 w-8 shrink-0 place-items-center rounded-full gold-gradient text-primary-foreground"
                      : "grid h-8 w-8 shrink-0 place-items-center rounded-full border border-border bg-background text-[11px] font-bold tabular-nums text-muted-foreground"
                  }
                >
                  {j.done ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : i + 1}
                </span>
                <div className="min-w-0">
                  <p className={j.done ? "text-sm font-semibold text-foreground" : "text-sm text-foreground/80"}>
                    {j.title}
                  </p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">{j.desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {hasAssessment ? (
          <Button
            onClick={redoAssessment}
            className="mt-6 h-13 w-full rounded-2xl gold-gradient py-3 text-sm font-bold text-primary-foreground shadow-gold-sm"
          >
            <RefreshCw className="mr-2 h-4 w-4" /> Refazer avaliação
          </Button>
        ) : (
          <Link to="/quiz" className="mt-6 block">
            <Button className="h-13 w-full rounded-2xl gold-gradient py-3 text-sm font-bold text-primary-foreground shadow-gold-sm">
              Fazer minha avaliação
            </Button>
          </Link>
        )}

        <Button
          variant="outline"
          onClick={() => {
            clearSession();
            navigate({ to: "/", replace: true });
          }}
          className="mt-3 h-13 w-full rounded-2xl border-border bg-card py-3 text-sm font-semibold text-foreground hover:bg-secondary"
        >
          <LogOut className="mr-2 h-4 w-4" /> Sair da conta
        </Button>

        <p className="mt-10 text-center text-[11px] text-muted-foreground">
          Shape em V • Método Fernando Cantarelli
        </p>
      </div>
      <BottomNav />
    </main>
  );
}
