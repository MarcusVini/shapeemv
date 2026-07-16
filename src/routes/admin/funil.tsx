import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { adminLogout, getFunnelStats, getRecentEvents } from "@/lib/admin.functions";

export const Route = createFileRoute("/admin/funil")({
  component: FunnelDashboard,
});

type Preset = "today" | "yesterday" | "7d" | "14d" | "30d" | "custom";

function rangeFor(preset: Preset, customFrom?: string, customTo?: string) {
  const now = new Date();
  const startOfDay = (d: Date) => {
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    return x;
  };
  const endOfDay = (d: Date) => {
    const x = new Date(d);
    x.setHours(23, 59, 59, 999);
    return x;
  };
  if (preset === "today") return { from: startOfDay(now), to: endOfDay(now) };
  if (preset === "yesterday") {
    const y = new Date(now);
    y.setDate(y.getDate() - 1);
    return { from: startOfDay(y), to: endOfDay(y) };
  }
  const daysMap: Record<Exclude<Preset, "today" | "yesterday" | "custom">, number> = {
    "7d": 7,
    "14d": 14,
    "30d": 30,
  };
  if (preset !== "custom") {
    const from = new Date(now);
    from.setDate(from.getDate() - (daysMap[preset] - 1));
    return { from: startOfDay(from), to: endOfDay(now) };
  }
  const f = customFrom ? new Date(customFrom) : startOfDay(now);
  const t = customTo ? new Date(customTo) : endOfDay(now);
  return { from: startOfDay(f), to: endOfDay(t) };
}

const FUNNEL_STEPS: { key: string; label: string }[] = [
  { key: "page_view:/", label: "Visitou página inicial" },
  { key: "quiz_started", label: "Iniciou o quiz" },
  { key: "quiz_completed", label: "Concluiu o quiz" },
  { key: "result_viewed", label: "Viu resultado" },
  { key: "protocol_viewed", label: "Viu protocolo" },
  { key: "upsell_1_viewed", label: "Viu Upsell 1" },
  { key: "upsell_1_buy_clicked", label: "Clicou comprar Upsell 1" },
  { key: "upsell_1_decline_clicked", label: "Recusou Upsell 1" },
  { key: "downsell_2_viewed", label: "Viu Downsell 2" },
  { key: "downsell_2_buy_clicked", label: "Clicou comprar Downsell 2" },
  { key: "downsell_2_decline_clicked", label: "Recusou Downsell 2" },
  { key: "downsell_1_viewed", label: "Viu Downsell 1" },
  { key: "downsell_1_buy_clicked", label: "Clicou comprar Downsell 1" },
  { key: "downsell_1_decline_clicked", label: "Recusou Downsell 1" },
  { key: "upsell_2_viewed", label: "Viu Upsell 2" },
  { key: "upsell_2_buy_clicked", label: "Clicou comprar Upsell 2" },
  { key: "upsell_2_decline_clicked", label: "Recusou Upsell 2" },
  { key: "checkout_clicked", label: "Clicou em checkout" },
  { key: "app_dashboard_viewed", label: "Chegou ao dashboard do app" },
];

type StatsEvent = {
  created_at: string;
  session_id: string;
  event_name: string;
  page_path: string | null;
  funnel_step: string | null;
  quiz_step: number | null;
  quiz_question: string | null;
  quiz_answer: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  device_type: string | null;
};

function FunnelDashboard() {
  const navigate = useNavigate();
  const statsFn = useServerFn(getFunnelStats);
  const recentFn = useServerFn(getRecentEvents);
  const logoutFn = useServerFn(adminLogout);

  const [preset, setPreset] = useState<Preset>("7d");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [search, setSearch] = useState("");

  const range = useMemo(() => rangeFor(preset, customFrom, customTo), [preset, customFrom, customTo]);
  const rangeKey = `${range.from.toISOString()}|${range.to.toISOString()}`;

  const statsQ = useQuery({
    queryKey: ["admin-stats", rangeKey],
    queryFn: () =>
      statsFn({ data: { from: range.from.toISOString(), to: range.to.toISOString() } }),
  });

  const recentQ = useQuery({
    queryKey: ["admin-recent", rangeKey, search],
    queryFn: () =>
      recentFn({
        data: {
          from: range.from.toISOString(),
          to: range.to.toISOString(),
          limit: 200,
          search: search || undefined,
        },
      }),
  });

  const events = (statsQ.data?.events ?? []) as StatsEvent[];

  const metrics = useMemo(() => computeMetrics(events), [events]);

  async function handleLogout() {
    await logoutFn();
    navigate({ to: "/admin/login" });
  }

  return (
    <main className="min-h-screen bg-[#0B0B0B] text-white">
      <header className="border-b border-white/10 px-4 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div>
            <h1 className="text-lg font-bold">Painel do Funil — Shape em V</h1>
            <p className="text-xs text-zinc-400">Rastreamento de eventos e conversão</p>
          </div>
          <button
            onClick={handleLogout}
            className="rounded-md border border-white/15 px-3 py-1.5 text-xs text-zinc-200 hover:bg-white/10"
          >
            Sair
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {(["today", "yesterday", "7d", "14d", "30d", "custom"] as Preset[]).map((p) => (
            <button
              key={p}
              onClick={() => setPreset(p)}
              className={`rounded-md border px-3 py-1.5 text-xs ${
                preset === p
                  ? "border-white bg-white text-black"
                  : "border-white/15 text-zinc-200 hover:bg-white/10"
              }`}
            >
              {p === "today"
                ? "Hoje"
                : p === "yesterday"
                  ? "Ontem"
                  : p === "custom"
                    ? "Personalizado"
                    : `Últimos ${p.replace("d", "")} dias`}
            </button>
          ))}
          {preset === "custom" && (
            <>
              <input
                type="date"
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
                className="rounded-md border border-white/15 bg-black/40 px-2 py-1 text-xs"
              />
              <input
                type="date"
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
                className="rounded-md border border-white/15 bg-black/40 px-2 py-1 text-xs"
              />
            </>
          )}
        </div>

        {statsQ.isLoading && <p className="mt-6 text-sm text-zinc-400">Carregando...</p>}
        {statsQ.isError && (
          <p className="mt-6 text-sm text-red-400">Erro ao carregar dados.</p>
        )}

        {/* Metric cards */}
        <section className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <Card label="Sessões únicas" value={metrics.uniqueSessions} />
          <Card label="Total de eventos" value={metrics.totalEvents} />
          <Card label="Quizzes iniciados" value={metrics.quizStarted} />
          <Card label="Quizzes concluídos" value={metrics.quizCompleted} />
          <Card
            label="Conversão quiz"
            value={pct(metrics.quizCompleted, metrics.quizStarted)}
          />
          <Card label="Cliques em checkout" value={metrics.checkoutClicked} />
        </section>

        {/* Daily chart */}
        <section className="mt-6 rounded-xl border border-white/10 bg-white/[0.02] p-4">
          <h2 className="text-sm font-semibold">Evolução diária (sessões e quizzes)</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={metrics.daily}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="day" stroke="#888" fontSize={11} />
                <YAxis stroke="#888" fontSize={11} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#111", border: "1px solid #333" }}
                  labelStyle={{ color: "#fff" }}
                />
                <Line type="monotone" dataKey="sessions" stroke="#27AF60" strokeWidth={2} />
                <Line type="monotone" dataKey="quiz_started" stroke="#F5A623" strokeWidth={2} />
                <Line type="monotone" dataKey="quiz_completed" stroke="#4A90E2" strokeWidth={2} />
                <Line type="monotone" dataKey="checkout" stroke="#E94560" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Funnel view */}
        <section className="mt-6 rounded-xl border border-white/10 bg-white/[0.02] p-4">
          <h2 className="text-sm font-semibold">Funil por etapas</h2>
          <div className="mt-3 space-y-1">
            {metrics.funnel.map((f, idx) => {
              const prev = idx > 0 ? metrics.funnel[idx - 1].unique : null;
              const conv = prev && prev > 0 ? (f.unique / prev) * 100 : null;
              const widthPct = metrics.funnel[0].unique
                ? Math.max(4, (f.unique / metrics.funnel[0].unique) * 100)
                : 4;
              return (
                <div key={f.key} className="relative">
                  <div
                    className="rounded-md bg-emerald-500/20 px-3 py-2"
                    style={{ width: `${widthPct}%`, minWidth: "220px" }}
                  >
                    <div className="flex items-center justify-between gap-3 text-xs">
                      <span className="truncate">{f.label}</span>
                      <span className="whitespace-nowrap font-mono text-emerald-300">
                        {f.unique} únicos · {f.total} eventos
                        {conv !== null && (
                          <span className="ml-2 text-zinc-400">
                            {conv.toFixed(1)}% da etapa anterior
                          </span>
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Offers breakdown */}
        <section className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          <OfferCard title="Upsell 1" metrics={metrics.offers.upsell_1} />
          <OfferCard title="Upsell 2" metrics={metrics.offers.upsell_2} />
          <OfferCard title="Downsell 1" metrics={metrics.offers.downsell_1} />
          <OfferCard title="Downsell 2" metrics={metrics.offers.downsell_2} />
        </section>

        {/* Quiz breakdown */}
        <section className="mt-6 rounded-xl border border-white/10 bg-white/[0.02] p-4">
          <h2 className="text-sm font-semibold">Quiz — abandono por etapa</h2>
          <table className="mt-3 w-full text-left text-xs">
            <thead className="text-zinc-400">
              <tr>
                <th className="py-1">Etapa</th>
                <th>Visualizações</th>
                <th>Respostas</th>
                <th>Sessões únicas</th>
              </tr>
            </thead>
            <tbody>
              {metrics.quizByStep.map((r) => (
                <tr key={r.step} className="border-t border-white/5">
                  <td className="py-1.5">Pergunta {r.step}</td>
                  <td>{r.viewed}</td>
                  <td>{r.answered}</td>
                  <td>{r.uniqueSessions}</td>
                </tr>
              ))}
              {metrics.quizByStep.length === 0 && (
                <tr>
                  <td className="py-3 text-zinc-500" colSpan={4}>
                    Sem dados no período.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>

        {/* UTM breakdown */}
        <section className="mt-6 rounded-xl border border-white/10 bg-white/[0.02] p-4">
          <h2 className="text-sm font-semibold">Origem de tráfego (UTM)</h2>
          <table className="mt-3 w-full text-left text-xs">
            <thead className="text-zinc-400">
              <tr>
                <th className="py-1">Source</th>
                <th>Medium</th>
                <th>Campaign</th>
                <th>Sessões</th>
                <th>Iniciou quiz</th>
                <th>Concluiu quiz</th>
                <th>Checkout</th>
              </tr>
            </thead>
            <tbody>
              {metrics.utms.map((r) => (
                <tr key={r.key} className="border-t border-white/5">
                  <td className="py-1.5">{r.source || "—"}</td>
                  <td>{r.medium || "—"}</td>
                  <td>{r.campaign || "—"}</td>
                  <td>{r.sessions}</td>
                  <td>{r.quizStarted}</td>
                  <td>{r.quizCompleted}</td>
                  <td>{r.checkout}</td>
                </tr>
              ))}
              {metrics.utms.length === 0 && (
                <tr>
                  <td className="py-3 text-zinc-500" colSpan={7}>
                    Sem UTMs registradas no período.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>

        {/* Recent events */}
        <section className="mt-6 rounded-xl border border-white/10 bg-white/[0.02] p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-semibold">Eventos recentes</h2>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Buscar evento, página, session, UTM..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="rounded-md border border-white/15 bg-black/40 px-2 py-1 text-xs"
              />
              <button
                onClick={() => exportCsv(recentQ.data?.rows ?? [])}
                className="rounded-md border border-white/15 px-3 py-1 text-xs hover:bg-white/10"
              >
                Exportar CSV
              </button>
            </div>
          </div>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-zinc-400">
                <tr>
                  <th className="py-1">Data</th>
                  <th>Evento</th>
                  <th>Página</th>
                  <th>Session</th>
                  <th>Botão</th>
                  <th>UTM src</th>
                  <th>Dispositivo</th>
                </tr>
              </thead>
              <tbody>
                {(recentQ.data?.rows ?? []).map((r) => (
                  <tr key={r.id} className="border-t border-white/5">
                    <td className="py-1.5 font-mono">{new Date(r.created_at).toLocaleString("pt-BR")}</td>
                    <td className="font-mono text-emerald-300">{r.event_name}</td>
                    <td>{r.page_path || "—"}</td>
                    <td className="font-mono text-zinc-400">{String(r.session_id).slice(0, 8)}</td>
                    <td>{r.button_name || r.button_text || "—"}</td>
                    <td>{r.utm_source || "—"}</td>
                    <td>{r.device_type || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}

function Card({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
      <p className="text-[10px] uppercase tracking-wider text-zinc-400">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </div>
  );
}

type OfferMetrics = { viewed: number; buy: number; decline: number };
function OfferCard({ title, metrics }: { title: string; metrics: OfferMetrics }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
      <h3 className="text-sm font-semibold">{title}</h3>
      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        <MiniStat label="Views" value={metrics.viewed} />
        <MiniStat label="Comprou" value={metrics.buy} />
        <MiniStat label="Recusou" value={metrics.decline} />
      </div>
      <p className="mt-3 text-xs text-zinc-400">
        Taxa de clique: {pct(metrics.buy, metrics.viewed)} · Taxa de recusa:{" "}
        {pct(metrics.decline, metrics.viewed)}
      </p>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md bg-white/[0.03] py-2">
      <p className="text-[10px] uppercase tracking-wider text-zinc-500">{label}</p>
      <p className="text-lg font-bold">{value}</p>
    </div>
  );
}

function pct(a: number, b: number): string {
  if (!b) return "—";
  return `${((a / b) * 100).toFixed(1)}%`;
}

function computeMetrics(events: StatsEvent[]) {
  const uniqueSessionsSet = new Set<string>();
  const eventsByName = new Map<string, StatsEvent[]>();
  for (const e of events) {
    uniqueSessionsSet.add(e.session_id);
    const arr = eventsByName.get(e.event_name) ?? [];
    arr.push(e);
    eventsByName.set(e.event_name, arr);
  }

  const countUnique = (name: string) => {
    const arr = eventsByName.get(name) ?? [];
    return new Set(arr.map((x) => x.session_id)).size;
  };
  const countTotal = (name: string) => (eventsByName.get(name) ?? []).length;

  // Daily
  const dailyMap = new Map<
    string,
    { day: string; sessions: Set<string>; quiz_started: number; quiz_completed: number; checkout: number }
  >();
  for (const e of events) {
    const day = e.created_at.slice(0, 10);
    let d = dailyMap.get(day);
    if (!d) {
      d = { day, sessions: new Set(), quiz_started: 0, quiz_completed: 0, checkout: 0 };
      dailyMap.set(day, d);
    }
    d.sessions.add(e.session_id);
    if (e.event_name === "quiz_started") d.quiz_started++;
    if (e.event_name === "quiz_completed") d.quiz_completed++;
    if (e.event_name === "checkout_clicked") d.checkout++;
  }
  const daily = Array.from(dailyMap.values())
    .sort((a, b) => a.day.localeCompare(b.day))
    .map((d) => ({
      day: d.day.slice(5),
      sessions: d.sessions.size,
      quiz_started: d.quiz_started,
      quiz_completed: d.quiz_completed,
      checkout: d.checkout,
    }));

  // Funnel
  const funnel = FUNNEL_STEPS.map((s) => {
    let arr: StatsEvent[];
    if (s.key.startsWith("page_view:")) {
      const path = s.key.split(":")[1];
      arr = (eventsByName.get("page_view") ?? []).filter((e) => e.page_path === path);
    } else {
      arr = eventsByName.get(s.key) ?? [];
    }
    return {
      key: s.key,
      label: s.label,
      total: arr.length,
      unique: new Set(arr.map((x) => x.session_id)).size,
    };
  });

  // Offers
  const offers = {
    upsell_1: {
      viewed: countUnique("upsell_1_viewed"),
      buy: countUnique("upsell_1_buy_clicked"),
      decline: countUnique("upsell_1_decline_clicked"),
    },
    upsell_2: {
      viewed: countUnique("upsell_2_viewed"),
      buy: countUnique("upsell_2_buy_clicked"),
      decline: countUnique("upsell_2_decline_clicked"),
    },
    downsell_1: {
      viewed: countUnique("downsell_1_viewed"),
      buy: countUnique("downsell_1_buy_clicked"),
      decline: countUnique("downsell_1_decline_clicked"),
    },
    downsell_2: {
      viewed: countUnique("downsell_2_viewed"),
      buy: countUnique("downsell_2_buy_clicked"),
      decline: countUnique("downsell_2_decline_clicked"),
    },
  };

  // Quiz per step
  const quizStepMap = new Map<
    number,
    { step: number; viewed: number; answered: number; sessions: Set<string> }
  >();
  for (const e of events) {
    if (e.quiz_step == null) continue;
    let r = quizStepMap.get(e.quiz_step);
    if (!r) {
      r = { step: e.quiz_step, viewed: 0, answered: 0, sessions: new Set() };
      quizStepMap.set(e.quiz_step, r);
    }
    r.sessions.add(e.session_id);
    if (e.event_name === "quiz_step_viewed") r.viewed++;
    if (e.event_name === "quiz_question_answered") r.answered++;
  }
  const quizByStep = Array.from(quizStepMap.values())
    .sort((a, b) => a.step - b.step)
    .map((r) => ({ ...r, uniqueSessions: r.sessions.size }));

  // UTM
  const utmMap = new Map<
    string,
    {
      key: string;
      source: string;
      medium: string;
      campaign: string;
      sessions: Set<string>;
      quizStartedSessions: Set<string>;
      quizCompletedSessions: Set<string>;
      checkoutSessions: Set<string>;
    }
  >();
  for (const e of events) {
    const key = `${e.utm_source || ""}|${e.utm_medium || ""}|${e.utm_campaign || ""}`;
    if (key === "||") continue;
    let r = utmMap.get(key);
    if (!r) {
      r = {
        key,
        source: e.utm_source || "",
        medium: e.utm_medium || "",
        campaign: e.utm_campaign || "",
        sessions: new Set(),
        quizStartedSessions: new Set(),
        quizCompletedSessions: new Set(),
        checkoutSessions: new Set(),
      };
      utmMap.set(key, r);
    }
    r.sessions.add(e.session_id);
    if (e.event_name === "quiz_started") r.quizStartedSessions.add(e.session_id);
    if (e.event_name === "quiz_completed") r.quizCompletedSessions.add(e.session_id);
    if (e.event_name === "checkout_clicked") r.checkoutSessions.add(e.session_id);
  }
  const utms = Array.from(utmMap.values())
    .map((r) => ({
      key: r.key,
      source: r.source,
      medium: r.medium,
      campaign: r.campaign,
      sessions: r.sessions.size,
      quizStarted: r.quizStartedSessions.size,
      quizCompleted: r.quizCompletedSessions.size,
      checkout: r.checkoutSessions.size,
    }))
    .sort((a, b) => b.sessions - a.sessions);

  return {
    uniqueSessions: uniqueSessionsSet.size,
    totalEvents: events.length,
    quizStarted: countUnique("quiz_started"),
    quizCompleted: countUnique("quiz_completed"),
    checkoutClicked: countTotal("checkout_clicked"),
    daily,
    funnel,
    offers,
    quizByStep,
    utms,
  };
}

function exportCsv(rows: Array<Record<string, unknown>>) {
  if (rows.length === 0) return;
  const cols = Object.keys(rows[0]);
  const escape = (v: unknown) => {
    if (v == null) return "";
    const s = typeof v === "object" ? JSON.stringify(v) : String(v);
    return `"${s.replace(/"/g, '""')}"`;
  };
  const csv = [
    cols.join(","),
    ...rows.map((r) => cols.map((c) => escape(r[c])).join(",")),
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `funnel-events-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
