import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Check, Loader2 } from "lucide-react";
import { getLatestState } from "@/lib/assessment.functions";
import { useSession } from "@/lib/session";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/processing")({
  component: ProcessingPage,
});

function ProcessingPage() {
  const navigate = useNavigate();
  const [idx, setIdx] = useState(0);
  const fetchState = useServerFn(getLatestState);
  const session = useSession();
  const { data } = useQuery({
    queryKey: ["state", session?.id],
    queryFn: () => fetchState({ data: { userId: session!.id } }),
    enabled: !!session?.id,
  });

  const primeiro = (session?.nome_completo || data?.profile?.nome_completo || "atleta").trim().split(/\s+/)[0];
  const objetivo = String(
    (data?.assessment?.respostas as Record<string, unknown> | undefined)?.objetivo ?? "",
  );
  const objetivoTxt =
    objetivo === "secar"
      ? "queima de gordura"
      : objetivo === "crescer"
        ? "ganho de massa"
        : "recomposição corporal";

  const STEPS = [
    `Lendo respostas de ${primeiro}`,
    "Cruzando composição corporal",
    "Calculando metabolismo e macros",
    `Calibrando foco em ${objetivoTxt}`,
    "Aplicando método Cantarelli",
    "Preparando sua avaliação",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setIdx((i) => (i < STEPS.length - 1 ? i + 1 : i));
    }, 950);
    const t = setTimeout(() => navigate({ to: "/upsell", replace: true }), 6500);
    return () => {
      clearInterval(interval);
      clearTimeout(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  const progress = ((idx + 1) / STEPS.length) * 100;

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-10">
      <div className="w-full max-w-md">
        <div className="text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-primary/80">
            Processando avaliação
          </p>
          <h1 className="mt-3 text-3xl font-black leading-tight text-foreground">
            Montando o seu <span className="text-gold-gradient">diagnóstico</span>
          </h1>
        </div>

        <div className="mt-8 rounded-3xl border border-border bg-card p-6 shadow-card-premium">
          <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            <span>Progresso</span>
            <span className="tabular-nums text-primary">{Math.round(progress)}%</span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-background">
            <motion.div
              className="h-full gold-gradient"
              animate={{ width: `${progress}%` }}
              transition={{ ease: "easeOut", duration: 0.4 }}
            />
          </div>

          <ol className="mt-6 space-y-2">
            {STEPS.map((label, i) => {
              const done = i < idx;
              const active = i === idx;
              return (
                <li
                  key={label}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl border px-4 py-3 transition-all",
                    done && "border-primary/20 bg-primary/5",
                    active && "border-primary/40 bg-primary/10",
                    !done && !active && "border-border/40 opacity-50",
                  )}
                >
                  <span
                    className={cn(
                      "grid h-7 w-7 shrink-0 place-items-center rounded-full",
                      done && "gold-gradient text-primary-foreground",
                      active && "border border-primary/60 bg-background text-primary",
                      !done && !active && "border border-border bg-background text-muted-foreground",
                    )}
                  >
                    {done ? (
                      <Check className="h-3.5 w-3.5" strokeWidth={3} />
                    ) : active ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <span className="text-[10px] font-bold tabular-nums">{i + 1}</span>
                    )}
                  </span>
                  <span
                    className={cn(
                      "text-sm",
                      done && "text-foreground/80",
                      active && "font-semibold text-foreground",
                      !done && !active && "text-muted-foreground",
                    )}
                  >
                    {label}
                  </span>
                </li>
              );
            })}
          </ol>
        </div>

        <p className="mt-5 text-center text-[11px] text-muted-foreground">
          Não feche esta tela. Estamos organizando os próximos passos da sua jornada.
        </p>
      </div>
    </main>
  );
}
