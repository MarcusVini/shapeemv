import { createFileRoute } from "@tanstack/react-router";
import { trackEvent, usePageView } from "@/lib/tracking";

export const Route = createFileRoute("/downsell-2")({
  component: Downsell2Page,
  head: () => ({
    meta: [
      { title: "Última oportunidade — Shape em V" },
      {
        name: "description",
        content:
          "Última condição para manter seu acesso ao aplicativo Shape em V por apenas R$9,90/mês.",
      },
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

function withUtms(url: string) {
  if (typeof window === "undefined") return url;
  const qs = window.location.search;
  if (!qs) return url;
  return url.includes("?") ? `${url}&${qs.slice(1)}` : `${url}${qs}`;
}

function JourneySteps() {
  const steps = [
    { text: "Avaliação preenchida", status: "done" as const },
    { text: "Oferta especial recusada", status: "done" as const },
    { text: "Condição final liberada", status: "current" as const },
  ];
  return (
    <div
      className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4"
      style={{ maxWidth: "400px", margin: "0 auto" }}
    >
      <div className="flex items-start justify-between gap-2">
        {steps.map((step, idx) => (
          <div key={idx} className="flex flex-1 flex-col items-center text-center">
            <div
              className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold"
              style={{
                backgroundColor: step.status === "done" ? "#27AF60" : "#FFFFFF",
                color: step.status === "done" ? "#FFFFFF" : "#0B0B0B",
              }}
            >
              {step.status === "done" ? "✓" : idx + 1}
            </div>
            <p
              className="mt-1.5 text-[10px] font-medium leading-tight"
              style={{ color: step.status === "current" ? "#FFFFFF" : "#A1A1AA" }}
            >
              {step.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function Downsell2Page() {
  return (
    <main
      className="flex min-h-screen flex-col items-center px-5 pt-10 pb-16"
      style={{ backgroundColor: "#0B0B0B" }}
    >
      <style>{`
        @keyframes softPulse {
          0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(39,175,96,0.55); }
          50% { transform: scale(1.02); box-shadow: 0 0 0 12px rgba(39,175,96,0); }
        }
        .cta-pulse { animation: softPulse 1.8s ease-in-out infinite; }
      `}</style>

      <div className="mx-auto w-full max-w-md text-center">
        <JourneySteps />

        <p className="mt-4 text-xs leading-relaxed text-zinc-400">
          Este é o último passo antes de acessar o aplicativo. Essa condição não será exibida novamente.
        </p>

        <h1 className="mt-8 text-2xl font-black leading-tight text-white sm:text-3xl">
          ÚLTIMA OPORTUNIDADE
        </h1>

        <div className="mt-6 space-y-4 text-left text-sm leading-relaxed text-zinc-300 sm:text-base">
          <p>Você recusou as ofertas anteriores, tudo bem.</p>
          <p>
            Mas antes de liberar seu acesso final, existe uma última condição disponível para você continuar com acesso ao aplicativo.
          </p>
          <p>
            Por apenas <span className="font-bold text-white">R$9,90 por mês</span>, você pode manter seu acesso ativo ao app e seguir com seus treinos organizados, sem depender de planilha perdida, treino solto ou ficar tentando montar tudo sozinho.
          </p>
          <p>
            Essa é a opção mais simples para quem quer começar agora, gastar pouco e ainda assim ter um caminho claro para seguir.
          </p>
          <p>
            Com esse acesso, você continua dentro do aplicativo e pode usar o protocolo para treinar com mais direção, acompanhar os exercícios e manter sua rotina de treino sem complicação.
          </p>
          <p className="text-zinc-400">
            Essa condição é liberada somente agora, nesta etapa final. Depois que você sair dessa página, essa opção não será exibida novamente.
          </p>
        </div>

        <div
          className="mt-8 rounded-2xl border border-white/10 bg-white/[0.04] p-6"
          style={{ textAlign: "center" }}
        >
          <p className="text-xs uppercase tracking-widest text-zinc-400">
            Plano mensal de acesso ao aplicativo
          </p>
          <p className="mt-2 text-4xl font-black text-white">
            R$9,90<span className="text-base font-medium text-zinc-400">/mês</span>
          </p>

          <ul className="mt-5 space-y-2 text-left text-sm text-zinc-200">
            <li>✅ Acesso ao aplicativo</li>
            <li>✅ Treinos organizados em um só lugar</li>
            <li>✅ Protocolo para seguir com mais clareza</li>
            <li>✅ Exercícios estruturados para sua rotina</li>
            <li>✅ Valor simbólico para continuar com acesso ativo</li>
          </ul>
        </div>

        <p className="mt-6 text-sm text-zinc-300">
          Se você realmente quer começar, essa é a forma mais fácil de entrar.
        </p>

        <div className="mt-6" style={{ textAlign: "center" }}>
          <a
            href={withUtms("https://pay.kiwify.com.br/kyyCqoh")}
            onClick={(e) => {
              e.currentTarget.setAttribute(
                "href",
                withUtms("https://pay.kiwify.com.br/kyyCqoh"),
              );
            }}
            className="cta-pulse"
            style={{
              display: "block",
              backgroundColor: "#27AF60",
              padding: "16px 20px",
              color: "#FFFFFF",
              fontWeight: 800,
              borderRadius: "12px",
              border: "1px solid #27AF60",
              fontSize: "18px",
              width: "100%",
              maxWidth: "400px",
              margin: "0 auto",
              textDecoration: "none",
              cursor: "pointer",
              letterSpacing: "0.02em",
            }}
          >
            SIM, QUERO ACESSAR POR R$9,90/MÊS
          </a>
          <a
            href="/dashboard"
            style={{
              display: "block",
              background: "transparent",
              border: "none",
              marginTop: "1rem",
              cursor: "pointer",
              fontSize: "13px",
              textDecoration: "underline",
              color: "rgba(255,255,255,0.55)",
              fontFamily: "sans-serif",
              textAlign: "center",
            }}
          >
            Não, obrigado. Quero seguir sem o acesso ao aplicativo.
          </a>
        </div>
      </div>
    </main>
  );
}
