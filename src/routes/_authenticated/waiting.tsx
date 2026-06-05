import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { motion } from "framer-motion";
import { Lock, Sparkles } from "lucide-react";
import { getLatestState, unlockNow } from "@/lib/assessment.functions";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/waiting")({
  component: WaitingPage,
});

function WaitingPage() {
  const fetchState = useServerFn(getLatestState);
  const unlockFn = useServerFn(unlockNow);
  const navigate = useNavigate();

  const { data, refetch } = useQuery({
    queryKey: ["state"],
    queryFn: () => fetchState(),
  });

  const unlockTs = data?.workout ? new Date(data.workout.unlock_date).getTime() : null;
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

  useEffect(() => {
    if (data && !data.workout) {
      navigate({ to: "/dashboard", replace: true });
    }
  }, [data, navigate]);

  const diff = unlockTs ? Math.max(0, unlockTs - now) : 0;
  const h = Math.floor(diff / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  const s = Math.floor((diff % 60_000) / 1000);
  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-12">
      <div className="w-full max-w-md text-center">
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl gold-border bg-card shadow-gold"
        >
          <Lock className="h-10 w-10 text-primary" />
        </motion.div>

        <div className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary">
          <Sparkles className="h-3 w-3" /> Avaliação recebida
        </div>

        <h1 className="mt-5 text-3xl font-black leading-tight text-foreground">
          Seu protocolo será liberado <span className="text-gold-gradient">amanhã às 10h</span>
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          Nossa inteligência está cruzando os seus dados com o método Fernando
          Contarini. Aproveite para descansar — sua transformação começa em
          breve.
        </p>

        <div className="mt-10 rounded-3xl gold-border bg-card p-6 shadow-card-premium">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Liberação em
          </p>
          <div className="mt-4 flex items-center justify-center gap-2 font-black tabular-nums text-gold-gradient">
            <TimeBlock value={pad(h)} />
            <span className="text-3xl text-primary/40">:</span>
            <TimeBlock value={pad(m)} />
            <span className="text-3xl text-primary/40">:</span>
            <TimeBlock value={pad(s)} />
          </div>
          <div className="mt-4 flex justify-around text-[10px] uppercase tracking-wider text-muted-foreground">
            <span>horas</span>
            <span>min</span>
            <span>seg</span>
          </div>
        </div>

        {import.meta.env.DEV && (
          <Button
            variant="ghost"
            className="mt-6 text-xs text-muted-foreground"
            onClick={async () => {
              await unlockFn();
              await refetch();
            }}
          >
            (dev) Liberar agora
          </Button>
        )}
      </div>
    </main>
  );
}

function TimeBlock({ value }: { value: string }) {
  return (
    <span className="inline-flex min-w-[64px] justify-center rounded-2xl bg-background px-2 py-3 text-4xl">
      {value}
    </span>
  );
}
