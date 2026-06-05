import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Zap } from "lucide-react";
import { getLatestState } from "@/lib/assessment.functions";

export const Route = createFileRoute("/_authenticated/processing")({
  component: ProcessingPage,
});

function ProcessingPage() {
  const navigate = useNavigate();
  const [idx, setIdx] = useState(0);
  const fetchState = useServerFn(getLatestState);
  const { data } = useQuery({ queryKey: ["state"], queryFn: () => fetchState() });

  const primeiro = data?.profile?.nome_completo?.trim().split(/\s+/)[0] || "atleta";
  const objetivo = String(
    (data?.assessment?.respostas as Record<string, unknown> | undefined)?.objetivo ?? "",
  );
  const objetivoTxt =
    objetivo === "secar"
      ? "queima de gordura"
      : objetivo === "crescer"
        ? "ganho de massa"
        : "recomposição corporal";

  const MESSAGES = [
    `Analisando as respostas de ${primeiro}…`,
    "Realizando análises corporais…",
    "Calculando seu metabolismo e calorias…",
    `Calibrando para o seu foco: ${objetivoTxt}…`,
    "Cruzando com o método Fernando Cantarelli…",
    "Preparando sua avaliação…",
  ];

  useEffect(() => {
    const interval = setInterval(() => setIdx((i) => (i + 1) % MESSAGES.length), 1100);
    const t = setTimeout(() => navigate({ to: "/waiting", replace: true }), 6500);
    return () => {
      clearInterval(interval);
      clearTimeout(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="text-center">
        <motion.div
          animate={{ scale: [1, 1.12, 1], opacity: [0.85, 1, 0.85] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
          className="mx-auto flex h-28 w-28 items-center justify-center rounded-full gold-gradient shadow-gold"
        >
          <Zap className="h-12 w-12 text-primary-foreground" strokeWidth={2.5} />
        </motion.div>

        <h1 className="mt-10 text-2xl font-black text-foreground">
          Montando sua <span className="text-gold-gradient">avaliação</span>
        </h1>

        <motion.p
          key={idx}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 text-sm text-muted-foreground"
        >
          {MESSAGES[idx]}
        </motion.p>
      </div>
    </main>
  );
}

