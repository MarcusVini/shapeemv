import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";

const VTURB_SRC =
  "https://scripts.converteai.net/2a30d855-9274-4879-8c74-a5f38084eefd/players/6a57c0d8269dbf6f97c9db1e/v4/player.js";

export const Route = createFileRoute("/downsell")({
  component: DownsellPage,
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

function DownsellPage() {
  const [showOffer, setShowOffer] = useState(false);

  useEffect(() => {
    injectScript(VTURB_SRC, document.head);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setShowOffer(true), 280000);
    return () => clearTimeout(t);
  }, []);

  return (
    <main
      className="flex min-h-screen flex-col items-center px-5 pt-10 pb-16"
      style={{ backgroundColor: "#0B0B0B" }}
    >
      <div className="mx-auto w-full max-w-md text-center">
        <h1 className="text-2xl font-black leading-tight text-white sm:text-3xl">
          Espera! Tenho uma última condição pra você
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-zinc-400 sm:text-base">
          Assista o vídeo abaixo até o final para entender essa condição especial 👇
        </p>

        <div className="mt-8 flex justify-center">
          <vturb-smartplayer
            id="vid-6a57c0d8269dbf6f97c9db1e"
            style={{
              display: "block",
              margin: "0 auto",
              width: "100%",
              maxWidth: "400px",
            }}
          />
        </div>

        {showOffer && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="mt-8"
            style={{ textAlign: "center" }}
          >
            <a
              href={withUtms("https://pay.kiwify.com.br/1r1xQNB")}
              onClick={(e) => {
                e.currentTarget.setAttribute(
                  "href",
                  withUtms("https://pay.kiwify.com.br/1r1xQNB"),
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
              SIM, QUERO GARANTIR ESSA CONDIÇÃO
            </a>
            <a
              href="/downsell-2"
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
              Não, obrigado. Quero continuar sem essa condição.
            </a>
          </motion.div>
        )}
      </div>
    </main>
  );
}
