import { useEffect, useState } from "react";

export const OFFER_SECONDS = 4 * 60 + 45;

export function CtaPulseStyle() {
  return (
    <style>{`
      @keyframes softPulse {
        0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(39,175,96,0.35); }
        50% { transform: scale(1.012); box-shadow: 0 0 0 8px rgba(39,175,96,0); }
      }
      .cta-pulse { animation: softPulse 2.4s ease-in-out infinite; }
    `}</style>
  );
}

export function useCountdown(seconds = OFFER_SECONDS) {
  const [left, setLeft] = useState(seconds);
  useEffect(() => {
    const t = setInterval(() => setLeft((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, []);
  const m = Math.floor(left / 60);
  const s = left % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function OfferTimer() {
  const timer = useCountdown();
  return (
    <div
      className="mx-auto mb-4 flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3"
      style={{ maxWidth: "400px" }}
    >
      <span className="text-[11px] uppercase tracking-widest text-zinc-400">
        Oferta expira em
      </span>
      <span className="font-mono text-lg font-bold text-white tabular-nums">
        {timer}
      </span>
    </div>
  );
}

export function PromoUntilToday() {
  const [dateLabel, setDateLabel] = useState("");
  useEffect(() => {
    setDateLabel(
      new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long" }),
    );
  }, []);
  if (!dateLabel) return null;
  return (
    <p
      className="mx-auto mt-3 text-[11px] leading-relaxed text-zinc-500"
      style={{ maxWidth: "400px" }}
    >
      Essa promoção só vai até hoje, {dateLabel}.
    </p>
  );
}
