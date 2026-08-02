import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { trackEvent, usePageView } from "@/lib/tracking";
import {
  CtaPulseStyle,
  OfferTimer,
  PromoUntilToday,
} from "@/components/OfferUrgency";

const VTURB_SRC =
  "https://scripts.converteai.net/2a30d855-9274-4879-8c74-a5f38084eefd/players/6a6fca4cbf319dc88a590a98/v4/player.js";
const CHECKOUT_URL = "https://pay.kiwify.com.br/YQg1R83";
const DELAY_MS = 555_000;

export const Route = createFileRoute("/upsell-1-v1-220")({
  component: UpsellV1Page,
  head: () => ({
    meta: [
      { title: "Oferta Especial Liberada — Shape em V" },
      {
        name: "description",
        content:
          "Condição especial liberada por tempo limitado dentro do Método Shape em V.",
      },
      { property: "og:title", content: "Oferta Especial Liberada — Shape em V" },
      {
        property: "og:description",
        content:
          "Condição especial liberada por tempo limitado dentro do Método Shape em V.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "preload", href: VTURB_SRC, as: "script" },
      {
        rel: "preload",
        href: "https://scripts.converteai.net/lib/js/smartplayer-wc/v4/smartplayer.js",
        as: "script",
      },
      { rel: "dns-prefetch", href: "https://m3u8.vturb.net" },
      { rel: "dns-prefetch", href: "https://scripts.converteai.net" },
      { rel: "dns-prefetch", href: "https://images.converteai.net" },
      { rel: "dns-prefetch", href: "https://license.vturb.com" },
    ],
    scripts: [
      {
        type: "text/javascript",
        children:
          '!function(i,n){i._plt=i._plt||(n&&n.timeOrigin?n.timeOrigin+n.now():Date.now())}(window,performance);',
      },
    ],
  }),
});

function withUtms(url: string) {
  if (typeof window === "undefined") return url;
  const qs = window.location.search;
  if (!qs) return url;
  return url.includes("?") ? `${url}&${qs.slice(1)}` : `${url}${qs}`;
}

function injectScript(src: string) {
  if (document.querySelector(`script[src="${src}"]`)) return;
  const s = document.createElement("script");
  s.src = src;
  s.async = true;
  document.head.appendChild(s);
}

function UpsellV1Page() {
  usePageView("upsell_1_v1_220_viewed", "upsell_1_v1_220");
  const [showCta, setShowCta] = useState(false);

  useEffect(() => {
    injectScript(VTURB_SRC);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setShowCta(true), DELAY_MS);
    return () => clearTimeout(t);
  }, []);

  return (
    <main
      className="flex min-h-screen flex-col items-center px-5 pt-10 pb-16"
      style={{ backgroundColor: "#0B0B0B" }}
    >
      <CtaPulseStyle />

      <div className="mx-auto w-full max-w-md text-center">
        <JourneySteps
          steps={[
            { text: "Avaliação preenchida", status: "done" },
            { text: "Acesso liberado", status: "done" },
            { text: "Assista ao vídeo agora", status: "current" },
          ]}
        />
        <p className="mt-5 text-sm leading-relaxed text-zinc-400 sm:text-base">
          Assista ao recado que o Fernando gravou especialmente pra você antes
          de continuar 👇
        </p>

        <div className="mt-8 flex justify-center">
          <vturb-smartplayer
            id="vid-6a6fca4cbf319dc88a590a98"
            style={{
              display: "block",
              margin: "0 auto",
              width: "100%",
              maxWidth: "400px",
            }}
          />
        </div>

        <div className="mt-8" style={{ textAlign: "center" }}>
          {showCta && (
            <>
              <OfferTimer />
              <a
                href={withUtms(CHECKOUT_URL)}
                onClick={(e) => {
                  e.currentTarget.setAttribute("href", withUtms(CHECKOUT_URL));
                  trackEvent({
                    event_name: "upsell_1_v1_220_buy_clicked",
                    funnel_step: "upsell_1_v1_220",
                    button_name: "cta_buy",
                    checkout_url: CHECKOUT_URL,
                    offer_name: "Upsell 1 V1 220",
                  });
                }}
                className="cta-pulse"
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
                SIM, QUERO GARANTIR ESSA OFERTA
              </a>
              <PromoUntilToday />
              <a
                href="/downsell-1-v1-110"
                onClick={() =>
                  trackEvent({
                    event_name: "upsell_1_v1_220_decline_clicked",
                    funnel_step: "upsell_1_v1_220",
                    button_name: "cta_decline",
                  })
                }
                style={{
                  display: "block",
                  background: "transparent",
                  border: "none",
                  marginTop: "1rem",
                  cursor: "pointer",
                  fontSize: "16px",
                  textDecoration: "underline",
                  color: "#A1A1AA",
                  fontFamily: "sans-serif",
                  textAlign: "center",
                }}
              >
                Não, obrigado. Quero continuar sem essa oferta.
              </a>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
