import { useEffect, useMemo, useState, type ReactNode } from "react";

type StepKind = "loading" | "fail" | "success";

type Step = {
  text: string;
  kind: StepKind;
  ms: number;
};

const STEPS: Step[] = [
  { text: "Verificando vagas disponíveis no Shape em V Elite...", kind: "loading", ms: 2600 },
  { text: "Nenhuma vaga disponível no momento.", kind: "fail", ms: 2200 },
  { text: "Buscando novamente na fila de espera...", kind: "loading", ms: 3000 },
  { text: "Vaga encontrada: um aluno desistiu e liberou o lugar.", kind: "success", ms: 2600 },
  { text: "Checando se essa vaga pode ser liberada para você...", kind: "loading", ms: 3000 },
  { text: "Vaga autorizada para você.", kind: "success", ms: 1600 },
];

function Spinner() {
  return (
    <span
      className="inline-block h-3.5 w-3.5 shrink-0 rounded-full border-2 border-white/25 border-t-white"
      style={{ animation: "spotSpin 0.8s linear infinite" }}
    />
  );
}

function StepIcon({ kind }: { kind: StepKind }) {
  if (kind === "loading") return <Spinner />;
  if (kind === "fail")
    return (
      <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-red-500/20 text-[9px] font-bold text-red-400">
        ✕
      </span>
    );
  return (
    <span
      className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full text-[9px] font-bold text-white"
      style={{ backgroundColor: "#27AF60" }}
    >
      ✓
    </span>
  );
}

function VirtualQueue() {
  const [updatedAt, setUpdatedAt] = useState<string>("");
  const [people, setPeople] = useState(14);

  useEffect(() => {
    const stamp = () =>
      setUpdatedAt(
        new Date().toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      );
    stamp();
    const t = setInterval(() => {
      setPeople((p) => {
        const next = p + (Math.random() > 0.5 ? 1 : -1);
        return Math.min(17, Math.max(11, next));
      });
      stamp();
    }, 7000);
    return () => clearInterval(t);
  }, []);

  if (!updatedAt) return null;

  return (
    <div
      className="mx-auto flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-left"
      style={{ maxWidth: "400px" }}
    >
      <div className="flex items-center gap-2">
        <span
          className="h-2 w-2 rounded-full"
          style={{ backgroundColor: "#27AF60", animation: "spotBlink 1.4s ease-in-out infinite" }}
        />
        <span className="text-[11px] font-semibold text-white">
          {people} pessoas na fila de espera
        </span>
      </div>
      <span className="font-mono text-[10px] tabular-nums text-zinc-500">
        atualizado {updatedAt}
      </span>
    </div>
  );
}

function SpotTimer({ seconds = 240 }: { seconds?: number }) {
  const [left, setLeft] = useState(seconds);
  useEffect(() => {
    const t = setInterval(() => setLeft((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, []);
  const label = useMemo(() => {
    const m = Math.floor(left / 60);
    const s = left % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }, [left]);

  return (
    <div
      className="mx-auto mb-4 rounded-xl border px-4 py-3"
      style={{ maxWidth: "400px", borderColor: "rgba(39,175,96,0.35)", backgroundColor: "rgba(39,175,96,0.08)" }}
    >
      <div className="flex items-center justify-center gap-2">
        <span className="text-[11px] uppercase tracking-widest text-zinc-300">
          Sua vaga expira em
        </span>
        <span className="font-mono text-lg font-bold text-white tabular-nums">{label}</span>
      </div>
      <p className="mt-1 text-[11px] leading-relaxed text-zinc-400">
        Você tem apenas 4 minutos para garantir. Depois disso a vaga volta para o
        próximo da fila.
      </p>
    </div>
  );
}

export function SpotReleaseStyle() {
  return (
    <style>{`
      @keyframes spotSpin { to { transform: rotate(360deg); } }
      @keyframes spotBlink { 0%,100% { opacity: 1; } 50% { opacity: .25; } }
      @keyframes spotFade { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
      .spot-fade { animation: spotFade .35s ease-out both; }
    `}</style>
  );
}

/**
 * Waits `delayMs`, then plays a "checking for an available spot" sequence and
 * finally reveals `children` (the CTA block) with a 4-minute spot timer.
 */
export function SpotRelease({
  delayMs,
  children,
}: {
  delayMs: number;
  children: ReactNode;
}) {
  const [started, setStarted] = useState(delayMs === 0);
  const [visible, setVisible] = useState(0);
  const [released, setReleased] = useState(false);

  useEffect(() => {
    if (delayMs === 0) return;
    const t = setTimeout(() => setStarted(true), delayMs);
    return () => clearTimeout(t);
  }, [delayMs]);

  useEffect(() => {
    if (!started || released) return;
    if (visible >= STEPS.length) {
      const t = setTimeout(() => setReleased(true), 600);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setVisible((v) => v + 1), STEPS[visible].ms);
    return () => clearTimeout(t);
  }, [started, visible, released]);

  if (!started) return null;

  if (released) {
    return (
      <div className="spot-fade">
        <SpotTimer />
        {children}
        <div className="mt-5">
          <VirtualQueue />
        </div>
      </div>
    );
  }

  return (
    <div className="spot-fade">
      <div
        className="mx-auto rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-5 text-left"
        style={{ maxWidth: "400px" }}
      >
        <p className="text-[11px] uppercase tracking-widest text-zinc-400">
          Verificação de vaga
        </p>
        <ul className="mt-4 space-y-3">
          {STEPS.slice(0, visible + 1).map((step, idx) => (
            <li key={idx} className="spot-fade flex items-start gap-2.5">
              <span className="mt-0.5">
                <StepIcon kind={idx < visible ? step.kind : step.kind === "loading" ? "loading" : step.kind} />
              </span>
              <span
                className="text-xs leading-relaxed"
                style={{ color: idx === visible ? "#FFFFFF" : "#A1A1AA" }}
              >
                {step.text}
              </span>
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-4">
        <VirtualQueue />
      </div>
    </div>
  );
}
