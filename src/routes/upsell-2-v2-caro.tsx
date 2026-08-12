import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { trackEvent, usePageView } from "@/lib/tracking";
import {
  CtaPulseStyle,
  OfferTimer,
  PromoUntilToday,
} from "@/components/OfferUrgency";
import { JourneySteps } from "@/components/JourneySteps";

const PLAYER_ID = "6a7ca9867d249b839f63c08a";
const VTURB_SRC = `https://scripts.converteai.net/2a30d855-9274-4879-8c74-a5f38084eefd/players/${PLAYER_ID}/v4/player.js`;
const CHECKOUT_URL = "https://pay.kiwify.com.br/zMbIC4Y";
const DELAY_SECONDS = 5 * 60 + 41;

export const Route = createFileRoute("/upsell-2-v2-caro")({
  component: Upsell2V2CaroPage,
  head: () => ({
    meta: [
      { title: "Condição Exclusiva Liberada — Shape em V" },
      {
        name: "description",
        content:
          "Condição exclusiva liberada para quem já garantiu o acesso ao Método Shape em V.",
      },
      {
        property: "og:title",
        content: "Condição Exclusiva Liberada — Shape em V",
      },
      {
        property: "og:description",
        content:
          "Condição exclusiva liberada para quem já garantiu o acesso ao Método Shape em V.",
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

function Upsell2V2CaroPage() {
  usePageView("upsell_2_v2_caro_viewed", "upsell_2_v2_caro");
  const [showCta, setShowCta] = useState(false);

  useEffect(() => {
    injectScript(VTURB_SRC);
  }, []);

  // Libera o botão quando o vídeo atinge 5min41s; fallback por tempo de página.
  useEffect(() => {
    let raf = 0;
    const start = Date.now();

    const check = () => {
      const el = document.getElementById(
        `vid-${PLAYER_ID}`,
      ) as (HTMLElement & { currentTime?: number }) | null;

      let t: number | undefined;
      if (el && typeof el.currentTime === "number") {
        t = el.currentTime;
      } else {
        const video = el?.querySelector("video") as HTMLVideoElement | null;
        if (video) t = video.currentTime;
      }

      if (
        (typeof t === "number" && t >= DELAY_SECONDS) ||
        Date.now() - start >= DELAY_SECONDS * 1000
      ) {
        setShowCta(true);
        return;
      }
      raf = window.setTimeout(check, 500);
    };

    check();
    return () => window.clearTimeout(raf);
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
            { text: "Acesso garantido", status: "done" },
            { text: "Condição exclusiva liberada", status: "current" },
          ]}
        />
        <p className="mt-5 text-sm leading-relaxed text-zinc-400 sm:text-base">
          Antes de seguir, assista ao vídeo abaixo até o final 👇
        </p>

        <div className="mt-8 flex justify-center">
          <vturb-smartplayer
            id={`vid-${PLAYER_ID}`}
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
                    event_name: "upsell_2_v2_caro_buy_clicked",
                    funnel_step: "upsell_2_v2_caro",
                    button_name: "cta_buy",
                    checkout_url: CHECKOUT_URL,
                    offer_name: "Upsell 2 V2 Caro",
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
                SIM, QUERO GARANTIR ESSA CONDIÇÃO
              </a>
              <PromoUntilToday />
              <a
                href="/downsell-2"
                onClick={() =>
                  trackEvent({
                    event_name: "upsell_2_v2_caro_decline_clicked",
                    funnel_step: "upsell_2_v2_caro",
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
                Não, obrigado. Quero continuar sem essa condição.
              </a>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
