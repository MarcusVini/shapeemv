import { useEffect, useState } from "react";

export type AppSession = {
  id: string;
  email: string;
  nome_completo: string;
};

const KEY = "shapeemv:session";

export function getSession(): AppSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AppSession;
    if (!parsed?.id || !parsed?.email) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function setSession(session: AppSession) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(session));
  window.dispatchEvent(new Event("shapeemv:session"));
}

export function clearSession() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
  window.dispatchEvent(new Event("shapeemv:session"));
}

export function useSession(): AppSession | null {
  const [session, setLocal] = useState<AppSession | null>(() => getSession());
  useEffect(() => {
    const handler = () => setLocal(getSession());
    window.addEventListener("shapeemv:session", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("shapeemv:session", handler);
      window.removeEventListener("storage", handler);
    };
  }, []);
  return session;
}
