import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";

export const Route = createFileRoute("/_authenticated/upsell")({
  component: UpsellPage,
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
  "https://scripts.converteai.net/2a30d855-9274-4879-8c74-a5f38084eefd/players/6a2581818e99006cc2b82f9a/v4/player.js";

function injectScript(src: string, target: HTMLElement) {
  if (document.querySelector(`script[src="${src}"]`)) return;
  const s = document.createElement("script");
  s.src = src;
  s.async = true;
  target.appendChild(s);
}

function UpsellPage() {
  const [showOffer, setShowOffer] = useState(false);
  const navigate = useNavigate();

  // Inject Vturb script on mount
  useEffect(() => {
    injectScript(VTURB_SRC, document.head);
  }, []);

  // 128s delay before showing offer block
  useEffect(() => {
    const t = setTimeout(() => setShowOffer(true), 128000);
    return () => clearTimeout(t);
  }, []);

  return (
    <main
      className="flex min-h-screen flex-col items-center px-5 pt-10 pb-16"
      style={{ backgroundColor: "#0B0B0B" }}
    >
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
            id="vid-6a2581818e99006cc2b82f9a"
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
              href="https://pay.kiwify.com.br/Vj9idar"
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
              Sim, eu aceito essa oferta especial!
            </a>
            <button
              type="button"
              onClick={() => navigate({ to: "/dashboard" })}
              style={{
                background: "transparent",
                border: "none",
                marginTop: "1rem",
                cursor: "pointer",
                fontSize: "16px",
                textDecoration: "underline",
                color: "#A1A1AA",
                fontFamily: "sans-serif",
              }}
            >
              Não, eu gostaria de recusar essa oferta
            </button>
          </motion.div>
        )}
      </div>
    </main>
  );
}
