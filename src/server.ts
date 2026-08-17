// =============================================================================
// ARQUIVO PARA COLAR NO LOVABLE  →  src/server.ts
//
// Substitui o src/server.ts do projeto da Lovable INTEIRO por este conteúdo.
// A única mudança em relação ao original é o bloco de redirect: o resto do
// arquivo está idêntico, não foi tocado.
//
// Para desligar o redirect depois: troque REDIRECT_ENABLED para false.
// =============================================================================

import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

// ---------------------------------------------------------------------------
// Cutover para o self-hosted (app.fernandocantarelli.com.br).
//
// Toda requisição que cair aqui é redirecionada preservando path e query. A
// query importa: utm_source/utm_medium/utm_campaign/fbclid/gclid são o que
// sustenta a atribuição do tráfego pago — perder a query aqui cega o funil.
//
// 302 e não 301: o 301 fica cacheado no browser de cada visitante e não dá
// para desfazer sem esperar o cache expirar em todos eles. Depois que o
// cutover estiver estável por alguns dias, pode virar 301.
// ---------------------------------------------------------------------------
const REDIRECT_ENABLED = true;
const SELFHOSTED_ORIGIN = "https://app.fernandocantarelli.com.br";

function redirectToSelfHosted(request: Request): Response {
  const url = new URL(request.url);
  return new Response(null, {
    status: 302,
    headers: {
      location: `${SELFHOSTED_ORIGIN}${url.pathname}${url.search}`,
      "cache-control": "no-store",
    },
  });
}

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then((m) => (m.default ?? m) as ServerEntry);
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!body.includes('"unhandled":true') || !body.includes('"message":"HTTPError"')) {
    return response;
  }

  const captured = consumeLastCapturedError();
  if (isAbortError(captured)) return new Response(null, { status: 499 });
  console.error(captured ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isAbortError(error: unknown): boolean {
  const e = error as { name?: string; code?: string; message?: string; cause?: unknown } | null;
  if (!e || typeof e !== "object") return false;
  if (e.name === "AbortError" || e.code === "ECONNRESET" || e.code === "ABORT_ERR") return true;
  if (typeof e.message === "string" && /aborted|ECONNRESET/i.test(e.message)) return true;
  return e.cause ? isAbortError(e.cause) : false;
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    if (REDIRECT_ENABLED) return redirectToSelfHosted(request);

    try {
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      // The client went away mid-render: not an app error, nothing to report.
      if (isAbortError(error) || request.signal?.aborted) {
        return new Response(null, { status: 499 });
      }
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};
