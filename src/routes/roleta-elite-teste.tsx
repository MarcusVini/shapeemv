import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";

export const Route = createFileRoute("/roleta-elite-teste")({
  component: RoletaElitePage,
  head: () => ({
    meta: [
      { title: "Oferta Elite — Shape em V" },
      { name: "robots", content: "noindex,nofollow" },
    ],
    scripts: [
      {
        src: "https://cdn.utmify.com.br/scripts/utms/latest.js",
        async: true,
        defer: true,
        "data-utmify-prevent-xcod-sck": "",
        "data-utmify-prevent-subids": "",
      } as unknown as Record<string, string>,
    ],
  }),
});

const CHECKOUT_URL = "https://pay.kiwify.com.br/zMY6eTU";

function withUtms(url: string) {
  if (typeof window === "undefined") return url;
  const qs = window.location.search;
  if (!qs) return url;
  return url.includes("?") ? `${url}&${qs.slice(1)}` : `${url}${qs}`;
}

// Wheel slices (visual only). Winning index is fixed.
const SLICES = [
  { label: "10% OFF", color: "#1a1a1a" },
  { label: "20% OFF", color: "#2a0a0a" },
  { label: "R$ 197", color: "#1a1a1a" },
  { label: "Bônus", color: "#2a0a0a" },
  { label: "2x R$51", color: "#3a2a05", winner: true },
  { label: "30% OFF", color: "#2a0a0a" },
  { label: "R$ 147", color: "#1a1a1a" },
  { label: "Elite", color: "#2a0a0a" },
];

const WINNER_INDEX = SLICES.findIndex((s) => s.winner);

const LOADING_MESSAGES = [
  "Analisando sua avaliação...",
  "Verificando condição disponível...",
  "Liberando oferta Elite...",
];

type Phase = "loading" | "ready" | "spinning" | "revealed";

// --- Audio helpers using Web Audio API ---
let audioCtx: AudioContext | null = null;
function getCtx() {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const AC = (window.AudioContext || (window as any).webkitAudioContext) as typeof AudioContext | undefined;
    if (!AC) return null;
    audioCtx = new AC();
  }
  return audioCtx;
}

function tick() {
  const ctx = getCtx();
  if (!ctx) return;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = "square";
  o.frequency.value = 1200;
  g.gain.setValueAtTime(0.0001, ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.05, ctx.currentTime + 0.005);
  g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.05);
  o.connect(g).connect(ctx.destination);
  o.start();
  o.stop(ctx.currentTime + 0.06);
}

function victorySound() {
  const ctx = getCtx();
  if (!ctx) return;
  const notes = [523.25, 659.25, 783.99, 1046.5];
  notes.forEach((f, i) => {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "triangle";
    o.frequency.value = f;
    const t = ctx.currentTime + i * 0.12;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.15, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
    o.connect(g).connect(ctx.destination);
    o.start(t);
    o.stop(t + 0.32);
  });
}

function revealSound() {
  const ctx = getCtx();
  if (!ctx) return;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = "sine";
  o.frequency.setValueAtTime(400, ctx.currentTime);
  o.frequency.exponentialRampToValueAtTime(1600, ctx.currentTime + 0.35);
  g.gain.setValueAtTime(0.0001, ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.12, ctx.currentTime + 0.05);
  g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.4);
  o.connect(g).connect(ctx.destination);
  o.start();
  o.stop(ctx.currentTime + 0.42);
}

function Wheel({ rotation }: { rotation: number }) {
  const size = 300;
  const r = size / 2;
  const n = SLICES.length;
  const anglePer = 360 / n;

  const slicePath = (i: number) => {
    const a1 = (i * anglePer - 90) * (Math.PI / 180);
    const a2 = ((i + 1) * anglePer - 90) * (Math.PI / 180);
    const x1 = r + r * Math.cos(a1);
    const y1 = r + r * Math.sin(a1);
    const x2 = r + r * Math.cos(a2);
    const y2 = r + r * Math.sin(a2);
    return `M${r},${r} L${x1},${y1} A${r},${r} 0 0 1 ${x2},${y2} Z`;
  };

  return (
    <div className="relative mx-auto" style={{ width: size, height: size }}>
      {/* Outer glow ring */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          boxShadow:
            "0 0 40px rgba(212,175,55,0.4), inset 0 0 20px rgba(212,175,55,0.3)",
          background: "linear-gradient(135deg, #d4af37, #8b6914)",
          padding: 6,
        }}
      >
        <div
          className="rounded-full overflow-hidden relative"
          style={{ width: "100%", height: "100%", background: "#0a0a0a" }}
        >
          <motion.svg
            width={size - 12}
            height={size - 12}
            viewBox={`0 0 ${size} ${size}`}
            animate={{ rotate: rotation }}
            transition={{ duration: 5, ease: [0.17, 0.67, 0.16, 1] }}
          >
            {SLICES.map((s, i) => {
              const mid = i * anglePer + anglePer / 2 - 90;
              const tx = r + (r * 0.62) * Math.cos((mid * Math.PI) / 180);
              const ty = r + (r * 0.62) * Math.sin((mid * Math.PI) / 180);
              return (
                <g key={i}>
                  <path
                    d={slicePath(i)}
                    fill={s.color}
                    stroke="#d4af37"
                    strokeWidth={1.5}
                  />
                  <text
                    x={tx}
                    y={ty}
                    fill={s.winner ? "#ffd76a" : "#f5f5f5"}
                    fontSize={s.winner ? 15 : 13}
                    fontWeight={s.winner ? 800 : 600}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    transform={`rotate(${mid + 90}, ${tx}, ${ty})`}
                  >
                    {s.label}
                  </text>
                </g>
              );
            })}
            <circle cx={r} cy={r} r={22} fill="#0a0a0a" stroke="#d4af37" strokeWidth={2} />
          </motion.svg>
        </div>
      </div>
      {/* Pointer */}
      <div
        className="absolute left-1/2 -translate-x-1/2"
        style={{ top: -6, filter: "drop-shadow(0 2px 6px rgba(220,38,38,0.7))" }}
      >
        <svg width="30" height="34" viewBox="0 0 30 34">
          <path d="M15 34 L2 4 Q15 -2 28 4 Z" fill="#dc2626" stroke="#d4af37" strokeWidth="1.5" />
        </svg>
      </div>
    </div>
  );
}

function Coupon({ expiresIn }: { expiresIn: number }) {
  const mm = String(Math.floor(expiresIn / 60)).padStart(2, "0");
  const ss = String(expiresIn % 60).padStart(2, "0");
  const today = useMemo(() => {
    return new Date().toLocaleDateString("pt-BR");
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.7, rotate: -4 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      transition={{ type: "spring", stiffness: 120, damping: 12 }}
      className="relative mx-auto max-w-md"
    >
      <div
        className="relative rounded-3xl p-[2px]"
        style={{
          background:
            "linear-gradient(135deg, #d4af37 0%, #ffe58a 30%, #d4af37 55%, #8b6914 100%)",
          boxShadow: "0 0 40px rgba(212,175,55,0.5), 0 0 80px rgba(220,38,38,0.15)",
          animation: "coupon-pulse 2s ease-in-out infinite",
        }}
      >
        <div
          className="rounded-3xl px-6 py-6 text-center"
          style={{
            background:
              "radial-gradient(circle at top, #1a1208 0%, #0a0a0a 70%)",
          }}
        >
          <div
            className="inline-block px-3 py-1 rounded-full text-[10px] font-bold tracking-widest"
            style={{ background: "#dc2626", color: "#fff" }}
          >
            OFERTA ELITE LIBERADA
          </div>
          <h3
            className="mt-3 text-2xl font-black tracking-tight"
            style={{
              background: "linear-gradient(135deg, #ffe58a, #d4af37)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Shape em V Elite
          </h3>
          <div className="mt-4 border-y border-dashed border-yellow-600/40 py-4">
            <div className="text-xs text-white/50 line-through">De R$ 197</div>
            <div className="text-4xl font-black text-white mt-1">
              2x de <span style={{ color: "#ffd76a" }}>R$ 51</span>
            </div>
            <div className="text-sm text-white/70 mt-1">
              ou <span className="font-bold text-white">R$ 97</span> à vista
            </div>
          </div>
          <p className="text-xs text-white/60 mt-3">
            Acelere seus resultados com o Shape em V Elite por apenas 2x de R$ 51.
          </p>
          <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-white/50">
            <span>Condição liberada hoje:</span>
            <span className="font-bold text-yellow-400">{today}</span>
          </div>
          <div className="mt-3">
            <div className="text-[10px] uppercase tracking-widest text-white/50">
              Seu cupom expira em:
            </div>
            <div
              className="text-3xl font-black mt-1 tabular-nums"
              style={{
                color: expiresIn < 60 ? "#ff6b6b" : "#ffd76a",
                textShadow: "0 0 12px rgba(212,175,55,0.6)",
              }}
            >
              {mm}:{ss}
            </div>
          </div>
        </div>
        {/* Notches */}
        <div
          className="absolute left-[-8px] top-1/2 -translate-y-1/2 h-4 w-4 rounded-full"
          style={{ background: "#0a0a0a" }}
        />
        <div
          className="absolute right-[-8px] top-1/2 -translate-y-1/2 h-4 w-4 rounded-full"
          style={{ background: "#0a0a0a" }}
        />
      </div>
    </motion.div>
  );
}

function RoletaElitePage() {
  const [phase, setPhase] = useState<Phase>("loading");
  const [loadingIdx, setLoadingIdx] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [timeLeft, setTimeLeft] = useState(240);
  const tickInterval = useRef<number | null>(null);

  // Loading messages cycle
  useEffect(() => {
    if (phase !== "loading") return;
    const interval = setInterval(() => {
      setLoadingIdx((i) => (i + 1) % LOADING_MESSAGES.length);
    }, 900);
    const done = setTimeout(() => setPhase("ready"), 2700);
    return () => {
      clearInterval(interval);
      clearTimeout(done);
    };
  }, [phase]);

  // Countdown after reveal
  useEffect(() => {
    if (phase !== "revealed") return;
    const iv = setInterval(() => {
      setTimeLeft((t) => (t > 0 ? t - 1 : 0));
    }, 1000);
    return () => clearInterval(iv);
  }, [phase]);

  const handleSpin = () => {
    if (phase !== "ready") return;
    setPhase("spinning");
    getCtx()?.resume?.();

    // Compute rotation so pointer (top) lands on winner middle.
    const anglePer = 360 / SLICES.length;
    const target = 360 - (WINNER_INDEX * anglePer + anglePer / 2);
    const finalRotation = 360 * 6 + target;
    setRotation(finalRotation);

    // Tick sounds
    let count = 0;
    const total = 5000;
    const start = Date.now();
    tickInterval.current = window.setInterval(() => {
      const elapsed = Date.now() - start;
      const progress = elapsed / total;
      // Slow down ticks over time
      const gap = 60 + progress * 260;
      if (elapsed - count * gap > 0) {
        tick();
        count++;
      }
      if (elapsed >= total) {
        if (tickInterval.current) window.clearInterval(tickInterval.current);
      }
    }, 60);

    setTimeout(() => {
      if (tickInterval.current) window.clearInterval(tickInterval.current);
      victorySound();
      setTimeout(() => {
        revealSound();
        setPhase("revealed");
      }, 500);
    }, 5100);
  };

  const steps = [
    { label: "Avaliação preenchida", status: "done" as const },
    { label: "Oferta especial recusada", status: "done" as const },
    { label: "Condição Elite liberada", status: "current" as const },
  ];

  return (
    <div
      className="min-h-screen w-full text-white"
      style={{
        background:
          "radial-gradient(ellipse at top, #1a0a0a 0%, #0a0a0a 40%, #000 100%)",
      }}
    >
      <style>{`
        @keyframes coupon-pulse {
          0%,100% { box-shadow: 0 0 40px rgba(212,175,55,0.5), 0 0 80px rgba(220,38,38,0.15); }
          50% { box-shadow: 0 0 60px rgba(212,175,55,0.8), 0 0 100px rgba(220,38,38,0.25); }
        }
        @keyframes cta-pulse {
          0%,100% { transform: scale(1); box-shadow: 0 8px 30px rgba(220,38,38,0.5); }
          50% { transform: scale(1.02); box-shadow: 0 12px 40px rgba(220,38,38,0.8); }
        }
      `}</style>

      <div className="mx-auto max-w-xl px-4 py-8">
        {/* Progress */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 mb-6">
          <div className="flex items-center justify-between gap-2">
            {steps.map((s, i) => (
              <div key={i} className="flex flex-1 flex-col items-center text-center gap-1">
                <div
                  className="h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{
                    background:
                      s.status === "current"
                        ? "linear-gradient(135deg, #d4af37, #ffe58a)"
                        : s.status === "done"
                          ? "rgba(34,197,94,0.2)"
                          : "rgba(255,255,255,0.08)",
                    color: s.status === "current" ? "#0a0a0a" : "#fff",
                    border:
                      s.status === "current"
                        ? "1px solid #ffd76a"
                        : "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  {s.status === "done" ? "✓" : i + 1}
                </div>
                <div
                  className="text-[10px] leading-tight"
                  style={{
                    color: s.status === "current" ? "#ffd76a" : "rgba(255,255,255,0.6)",
                    fontWeight: s.status === "current" ? 700 : 500,
                  }}
                >
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1
            className="text-3xl sm:text-4xl font-black leading-tight"
            style={{
              background: "linear-gradient(135deg, #fff 0%, #ffe58a 50%, #d4af37 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Gire a roleta e desbloqueie sua condição Elite
          </h1>
          <p className="mt-3 text-sm text-white/70">
            Você chegou em uma etapa especial da avaliação. Gire a roleta abaixo para revelar a condição liberada para o Shape em V Elite.
          </p>
        </div>

        {/* Loading */}
        {phase === "loading" && (
          <div className="text-center py-16">
            <div className="inline-block h-12 w-12 rounded-full border-2 border-yellow-500/30 border-t-yellow-400 animate-spin" />
            <AnimatePresence mode="wait">
              <motion.p
                key={loadingIdx}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="mt-6 text-yellow-300 font-semibold"
              >
                {LOADING_MESSAGES[loadingIdx]}
              </motion.p>
            </AnimatePresence>
          </div>
        )}

        {/* Wheel */}
        {(phase === "ready" || phase === "spinning" || phase === "revealed") && (
          <div className="mb-8">
            <Wheel rotation={rotation} />
            {phase === "ready" && (
              <button
                onClick={handleSpin}
                className="mt-8 w-full rounded-2xl py-4 text-base font-black tracking-wider"
                style={{
                  background: "linear-gradient(135deg, #d4af37, #ffe58a)",
                  color: "#0a0a0a",
                  boxShadow: "0 8px 30px rgba(212,175,55,0.5)",
                  animation: "cta-pulse 2s ease-in-out infinite",
                }}
              >
                GIRAR ROLETA
              </button>
            )}
            {phase === "spinning" && (
              <p className="mt-6 text-center text-yellow-300 font-semibold animate-pulse">
                Girando...
              </p>
            )}
          </div>
        )}

        {/* Reveal */}
        {phase === "revealed" && (
          <div className="space-y-6">
            <Coupon expiresIn={timeLeft} />

            <div className="text-center">
              <h2
                className="text-2xl font-black"
                style={{
                  background: "linear-gradient(135deg, #ffe58a, #d4af37)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Oferta Elite liberada apenas agora
              </h2>
              <p className="mt-3 text-sm text-white/70">
                Você desbloqueou uma condição especial para entrar no Shape em V Elite e acelerar seus resultados com um protocolo mais completo. Essa oferta foi liberada nesta etapa final e não será exibida novamente depois que você sair desta página.
              </p>
              <p className="mt-2 text-xs text-yellow-300/80">
                Condição liberada hoje, somente nesta etapa da sua avaliação.
              </p>
            </div>

            <motion.a
              href={withUtms(CHECKOUT_URL)}
              onClick={() => {
                try {
                  (window as any).location.href = withUtms(CHECKOUT_URL);
                } catch {}
              }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="block w-full rounded-2xl py-5 px-4 text-center text-base font-black tracking-wide"
              style={{
                background: "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)",
                color: "#fff",
                border: "2px solid #d4af37",
                boxShadow: "0 8px 30px rgba(220,38,38,0.5)",
                animation: "cta-pulse 2s ease-in-out infinite",
              }}
            >
              PEGAR CUPOM E ENTRAR PARA O SHAPE EM V ELITE
            </motion.a>

            <div className="text-center pt-2">
              <a
                href="/dashboard"
                className="text-xs text-white/40 underline underline-offset-4 hover:text-white/60"
              >
                Não, obrigado. Quero seguir sem o Shape em V Elite.
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
