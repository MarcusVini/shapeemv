import { useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { trackEvent, usePageView } from "@/lib/tracking";
import { useState } from "react";
import {
  CtaPulseStyle,
  OfferTimer,
  PromoUntilToday,
} from "@/components/OfferUrgency";



export const Route = createFileRoute("/upsell")({
  component: UpsellPage,
  head: () => ({
    links: [
      {
        rel: "preload",
        href: "https://scripts.converteai.net/2a30d855-9274-4879-8c74-a5f38084eefd/players/6a280947135e043f2b702184/v4/player.js",
        as: "script",
      },
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

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "vturb-smartplayer": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & { id?: string },
        HTMLElement
      >;
    }
  }
}

const VTURB_SRC =
  "https://scripts.converteai.net/2a30d855-9274-4879-8c74-a5f38084eefd/players/6a280947135e043f2b702184/v4/player.js";

function injectScript(src: string, target: HTMLElement) {
  if (document.querySelector(`script[src="${src}"]`)) return;
  const s = document.createElement("script");
  s.src = src;
  s.async = true;
  target.appendChild(s);
}

function UpsellPage() {
  usePageView("upsell_1_viewed", "upsell_1");

  // Inject Vturb script on mount
  useEffect(() => {
    injectScript(VTURB_SRC, document.head);
  }, []);

  return (
    <main
      className="flex min-h-screen flex-col items-center px-5 pt-10 pb-16"
      style={{ backgroundColor: "#0B0B0B" }}
    >
      <CtaPulseStyle />
      <SpotReleaseStyle />

      <div className="mx-auto w-full max-w-md text-center">
        <h1 className="text-2xl font-black leading-tight text-white sm:text-3xl">
          Sua avaliação está sendo concluída...
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-zinc-400 sm:text-base">
          Enquanto isso, veja o recado importante que o Fernando gravou
          especialmente pra você 👇
        </p>

        <div className="mt-8 flex justify-center">
          <vturb-smartplayer
            id="vid-6a280947135e043f2b702184"
            style={{
              display: "block",
              margin: "0 auto",
              width: "100%",
              maxWidth: "400px",
            }}
          />
        </div>

        <div className="mt-8" style={{ textAlign: "center" }}>
          <SpotRelease delayMs={150000}>
            <a
              href="https://pay.kiwify.com.br/zByOXHf"
              onClick={() =>
                trackEvent({
                  event_name: "upsell_1_buy_clicked",
                  funnel_step: "upsell_1",
                  button_name: "cta_buy",
                  checkout_url: "https://pay.kiwify.com.br/zByOXHf",
                  offer_name: "Upsell 1",
                })
              }
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
              QUERO GARANTIR MINHA VAGA AGORA
            </a>
            <PromoUntilToday />
            <a
              href="/upsell-2"
              onClick={() =>
                trackEvent({
                  event_name: "upsell_1_decline_clicked",
                  funnel_step: "upsell_1",
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
              Não, eu gostaria de abrir mão dessa vaga
            </a>
          </SpotRelease>
        </div>
      </div>
    </main>
  );
}

