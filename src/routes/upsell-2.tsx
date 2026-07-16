import { useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";

const VTURB_SRC =
  "https://scripts.converteai.net/2a30d855-9274-4879-8c74-a5f38084eefd/players/6a43902140698aa96bc8797c/v4/player.js";

export const Route = createFileRoute("/upsell-2")({
  component: Upsell2Page,
  head: () => ({
    links: [
      { rel: "preload", href: VTURB_SRC, as: "script" },
      {
        rel: "preload",
        href: "https://scripts.converteai.net/lib/js/smartplayer-wc/v4/smartplayer.js",
        as: "script",
      },
      { rel: "dns-prefetch", href: "https://scripts.converteai.net" },
      { rel: "dns-prefetch", href: "https://images.converteai.net" },
      { rel: "dns-prefetch", href: "https://m3u8.vturb.net" },
      { rel: "dns-prefetch", href: "https://license.vturb.com" },
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

function injectScript(src: string, target: HTMLElement) {
  if (document.querySelector(`script[src="${src}"]`)) return;
  const s = document.createElement("script");
  s.src = src;
  s.async = true;
  target.appendChild(s);
}

function withUtms(url: string) {
  if (typeof window === "undefined") return url;
  const qs = window.location.search;
  if (!qs) return url;
  return url.includes("?") ? `${url}&${qs.slice(1)}` : `${url}${qs}`;
}

function JourneySteps({ steps }: { steps: { text: string; status: "done" | "current" }[] }) {
  return (
    <div
      className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4"
      style={{ maxWidth: "400px", margin: "0 auto" }}
    >
      <div className="flex items-center justify-between gap-2">
        {steps.map((step, idx) => (
          <div key={idx} className="flex flex-1 flex-col items-center text-center">
            <div
              className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold"
              style={{
                backgroundColor: step.status === "done" ? "#27AF60" : "#FFFFFF",
                color: step.status === "done" ? "#FFFFFF" : "#0B0B0B",
                opacity: step.status === "current" ? 1 : 0.7,
              }}
            >
              {step.status === "done" ? "✓" : idx + 1}
            </div>
            <p
              className="mt-1.5 text-[10px] font-medium leading-tight"
              style={{
                color: step.status === "current" ? "#FFFFFF" : "#A1A1AA",
              }}
            >
              {step.text}
            </p>
            {idx < steps.length - 1 && (
              <div
                className="absolute h-0.5 w-full"
                style={{
                  backgroundColor: "#27AF60",
                  opacity: 0.4,
                  top: "1.1rem",
                  left: "50%",
                  transform: "translateX(50%)",
                }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function Upsell2Page() {
  useEffect(() => {
    injectScript(VTURB_SRC, document.head);
  }, []);

  return (
    <main
      className="flex min-h-screen flex-col items-center px-5 pt-10 pb-16"
      style={{ backgroundColor: "#0B0B0B" }}
    >
      <div className="mx-auto w-full max-w-md text-center">
        <h1 className="text-2xl font-black leading-tight text-white sm:text-3xl">
          Uma última condição especial para você
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-zinc-400 sm:text-base">
          Assista o vídeo abaixo até o final para entender essa oferta liberada 👇
        </p>

        <div className="mt-6">
          <JourneySteps
            steps={[
              { text: "Acesso iniciado", status: "done" },
              { text: "Avaliação preenchida", status: "done" },
              { text: "Assista ao vídeo importante agora", status: "current" },
            ]}
          />
        </div>

        <p className="mt-4 text-xs leading-relaxed text-zinc-400">
          Você está quase finalizando sua jornada. Assista ao vídeo abaixo com atenção para entender essa condição liberada antes de seguir para o aplicativo.
        </p>

        <div className="mt-6 flex justify-center">
          <vturb-smartplayer
            id="vid-6a43902140698aa96bc8797c"
            style={{
              display: "block",
              margin: "0 auto",
              width: "100%",
              maxWidth: "400px",
            }}
          />
        </div>

        <div className="mt-8" style={{ textAlign: "center" }}>
          <a
            href={withUtms("https://pay.kiwify.com.br/YQg1R83")}
            onClick={(e) => {
              e.currentTarget.setAttribute(
                "href",
                withUtms("https://pay.kiwify.com.br/YQg1R83"),
              );
            }}
            style={{
              display: "block",
              backgroundColor: "#27AF60",
              padding: "12px 16px",
              color: "#FFFFFF",
              fontWeight: 700,
              borderRadius: "4px",
              border: "1px solid #27AF60",
              fontSize: "20px",
              width: "100%",
              maxWidth: "400px",
              margin: "0 auto",
              textDecoration: "none",
              cursor: "pointer",
            }}
          >
            QUERO ACELERAR MEUS RESULTADOS
          </a>
          <a
            href="/downsell"
            style={{
              display: "block",
              background: "transparent",
              border: "none",
              marginTop: "1rem",
              cursor: "pointer",
              fontSize: "14px",
              textDecoration: "underline",
              color: "#A1A1AA",
              fontFamily: "sans-serif",
              textAlign: "center",
            }}
          >
            Não, obrigado. Quero continuar sem essa oferta.
          </a>
        </div>
      </div>
    </main>
  );
}
