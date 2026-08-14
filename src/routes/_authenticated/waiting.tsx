import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { motion } from "framer-motion";
import { ArrowLeft, Check, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getLatestState } from "@/lib/assessment.functions";
import { useSession } from "@/lib/session";

export const Route = createFileRoute("/_authenticated/waiting")({
  component: WaitingPage,
});


function WaitingPage() {
  const fetchState = useServerFn(getLatestState);
  const navigate = useNavigate();
  const session = useSession();

  const { data } = useQuery({
    queryKey: ["state", session?.id],
    queryFn: () => fetchState({ data: { userId: session!.id, token: session!.token } }),
    enabled: !!session?.id,
  });

  const computeNext10am = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(10, 0, 0, 0);
    return d.getTime();
  };
  const unlockTs = data?.workout
    ? new Date(data.workout.unlock_date).getTime()
    : computeNext10am();
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const i = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(i);
  }, []);

  useEffect(() => {
    if (unlockTs && now >= unlockTs) {
      navigate({ to: "/results", replace: true });
    }
  }, [now, unlockTs, navigate]);

  const diff = unlockTs ? Math.max(0, unlockTs - now) : 0;
  const h = Math.floor(diff / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  const s = Math.floor((diff % 60_000) / 1000);
  const pad = (n: number) => String(n).padStart(2, "0");

  const journey = [
    { title: "Avaliação enviada", done: true, current: false },
    { title: "Diagnóstico em análise", done: true, current: false },
    { title: "Protocolo em liberação", done: false, current: true },
  ];

  return (
    <main className="min-h-screen bg-background px-6 py-10">
      <div className="mx-auto w-full max-w-md">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary/80">
            Etapa 03 · Liberação
          </p>
          <span className="rounded-full border border-border bg-card/60 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Aguardando
          </span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 overflow-hidden rounded-[28px] border border-border bg-card p-6 shadow-card-premium"
        >
          <div className="flex items-center gap-4">
            <motion.div
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl gold-border bg-primary/10"
            >
              <Lock className="h-6 w-6 text-primary" />
            </motion.div>
            <div className="min-w-0">
              <h1 className="text-xl font-black leading-tight text-foreground">
                Seu protocolo <span className="text-gold-gradient">está sendo liberado</span>
              </h1>
              <p className="mt-1 text-[12px] text-muted-foreground">
                Método Fernando Cantarelli · versão personalizada
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-2xl bg-background p-5">
            <p className="text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Liberação em
            </p>
            <div className="mt-3 flex items-center justify-center gap-2 font-black tabular-nums">
              <TimeBlock value={pad(h)} label="horas" />
              <span className="text-2xl text-primary/40">:</span>
              <TimeBlock value={pad(m)} label="min" />
              <span className="text-2xl text-primary/40">:</span>
              <TimeBlock value={pad(s)} label="seg" />
            </div>
          </div>
        </motion.div>

        <div className="mt-6 rounded-3xl border border-border bg-card/60 p-5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Sua jornada
          </p>
          <ol className="mt-3 space-y-2">
            {journey.map((j, i) => (
              <li
                key={j.title}
                className="flex items-center gap-3 rounded-2xl border border-border/60 bg-background p-3"
              >
                <span
                  className={
                    j.done
                      ? "grid h-7 w-7 place-items-center rounded-full gold-gradient text-primary-foreground"
                      : j.current
                        ? "grid h-7 w-7 place-items-center rounded-full border border-primary/60 bg-primary/10 text-[11px] font-black tabular-nums text-primary"
                        : "grid h-7 w-7 place-items-center rounded-full border border-border bg-background text-[11px] font-bold tabular-nums text-muted-foreground"
                  }
                >
                  {j.done ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : i + 1}
                </span>
                <span
                  className={
                    j.done
                      ? "text-sm text-foreground/80"
                      : j.current
                        ? "text-sm font-semibold text-foreground"
                        : "text-sm text-muted-foreground"
                  }
                >
                  {j.title}
                </span>
              </li>
            ))}
          </ol>
        </div>

        <p className="mt-5 text-center text-[11px] text-muted-foreground">
          Salve este link. Ao encerrar o cronômetro, seu protocolo abre automaticamente.
        </p>

        <Link to="/dashboard" className="mt-6 block">
          <Button
            variant="outline"
            className="h-12 w-full rounded-2xl border-border bg-card/60 text-sm font-bold text-foreground hover:bg-card"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para a jornada
          </Button>
        </Link>
      </div>
    </main>
  );
}

function TimeBlock({ value, label }: { value: string; label: string }) {
  return (
    <span className="flex min-w-[64px] flex-col items-center">
      <span className="inline-flex min-w-[64px] justify-center rounded-2xl bg-card px-2 py-3 text-3xl text-gold-gradient">
        {value}
      </span>
      <span className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
    </span>
  );
}
