export const TERMS_VERSION = "2026-08-13";
export const OFFICIAL_URL = "https://shapeemv.lovable.app";
export const ACCEPT_KEY = "shapeemv:terms_accepted";

export type StoredAcceptance = {
  version: string;
  accepted_at: string;
};

export function getAcceptance(): StoredAcceptance | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(ACCEPT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredAcceptance;
    if (parsed?.version !== TERMS_VERSION) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveAcceptance(): StoredAcceptance {
  const value: StoredAcceptance = {
    version: TERMS_VERSION,
    accepted_at: new Date().toISOString(),
  };
  if (typeof window !== "undefined") {
    window.localStorage.setItem(ACCEPT_KEY, JSON.stringify(value));
  }
  return value;
}

export const LAST_UPDATED_LABEL = new Date(TERMS_VERSION + "T12:00:00Z").toLocaleDateString(
  "pt-BR",
  { day: "2-digit", month: "long", year: "numeric" },
);
