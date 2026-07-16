// Client-side tracking helper. Safe on SSR (no-ops when window undefined).
import { useEffect } from "react";

const SESSION_KEY = "shapeemv:funnel:session_id";
const UTM_KEY = "shapeemv:funnel:utms";
const UTM_PARAMS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "fbclid",
  "gclid",
] as const;

type UtmData = Partial<Record<(typeof UTM_PARAMS)[number], string>>;

function uuid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    try {
      return crypto.randomUUID();
    } catch {
      /* fall through */
    }
  }
  return "sess-" + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function getSessionId(): string {
  if (typeof window === "undefined") return "";
  try {
    let id = window.localStorage.getItem(SESSION_KEY);
    if (!id) {
      id = uuid();
      window.localStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return "";
  }
}

export function captureUtms(): UtmData {
  if (typeof window === "undefined") return {};
  try {
    const url = new URL(window.location.href);
    const fresh: UtmData = {};
    for (const key of UTM_PARAMS) {
      const val = url.searchParams.get(key);
      if (val) fresh[key] = val;
    }
    if (Object.keys(fresh).length > 0) {
      window.localStorage.setItem(UTM_KEY, JSON.stringify(fresh));
      return fresh;
    }
    const stored = window.localStorage.getItem(UTM_KEY);
    return stored ? (JSON.parse(stored) as UtmData) : {};
  } catch {
    return {};
  }
}

function parseDevice(ua: string) {
  const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(ua);
  const isTablet = /iPad|Tablet/i.test(ua);
  const device_type = isTablet ? "tablet" : isMobile ? "mobile" : "desktop";
  let browser = "unknown";
  if (/Edg\//.test(ua)) browser = "edge";
  else if (/Chrome\//.test(ua)) browser = "chrome";
  else if (/Firefox\//.test(ua)) browser = "firefox";
  else if (/Safari\//.test(ua)) browser = "safari";
  let os = "unknown";
  if (/Windows/.test(ua)) os = "windows";
  else if (/Android/.test(ua)) os = "android";
  else if (/iPhone|iPad|iPod/.test(ua)) os = "ios";
  else if (/Mac OS X/.test(ua)) os = "macos";
  else if (/Linux/.test(ua)) os = "linux";
  return { device_type, browser, os };
}

export type TrackPayload = {
  event_name: string;
  funnel_step?: string;
  button_name?: string;
  button_text?: string;
  action_type?: string;
  quiz_step?: number;
  quiz_question?: string;
  quiz_answer?: string;
  checkout_url?: string;
  product_name?: string;
  offer_name?: string;
  amount?: number;
  user_id?: string;
  lead_id?: string;
  metadata?: Record<string, unknown>;
};

export async function trackEvent(payload: TrackPayload): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    const session_id = getSessionId();
    const utms = captureUtms();
    const ua = navigator.userAgent || "";
    const dev = parseDevice(ua);
    const body = {
      session_id,
      event_name: payload.event_name,
      page_path: window.location.pathname,
      page_title: document.title,
      referrer: document.referrer || null,
      user_agent: ua,
      ...dev,
      ...utms,
      funnel_step: payload.funnel_step ?? null,
      button_name: payload.button_name ?? null,
      button_text: payload.button_text ?? null,
      action_type: payload.action_type ?? null,
      quiz_step: payload.quiz_step ?? null,
      quiz_question: payload.quiz_question ?? null,
      quiz_answer: payload.quiz_answer ?? null,
      checkout_url: payload.checkout_url ?? null,
      product_name: payload.product_name ?? null,
      offer_name: payload.offer_name ?? null,
      amount: payload.amount ?? null,
      user_id: payload.user_id ?? null,
      lead_id: payload.lead_id ?? null,
      metadata: payload.metadata ?? {},
    };
    // Fire-and-forget. Never block user flow.
    const url = `${
      import.meta.env.VITE_SUPABASE_URL
    }/rest/v1/funnel_events`;
    const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
    // Use sendBeacon when possible for reliability on unload
    if ("sendBeacon" in navigator) {
      const blob = new Blob([JSON.stringify(body)], { type: "application/json" });
      const beaconUrl = `${url}?apikey=${encodeURIComponent(key)}`;
      const ok = navigator.sendBeacon(beaconUrl, blob);
      if (ok) return;
    }
    await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: key,
        Authorization: `Bearer ${key}`,
        Prefer: "return=minimal",
      },
      body: JSON.stringify(body),
      keepalive: true,
    }).catch(() => undefined);
  } catch {
    // Never break the user experience.
  }
}

export function usePageView(event_name: string, funnel_step?: string) {
  useEffect(() => {
    trackEvent({ event_name, funnel_step });
    captureUtms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
