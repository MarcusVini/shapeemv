import { useSession } from "@tanstack/react-start/server";

export type UserSessionData = { userId?: string; email?: string; loggedAt?: number };

function sessionSecret() {
  const password = process.env['ADMIN_SESSION_SECRET'];
  if (!password || password.length < 32) {
    throw new Error("Session secret missing or too short");
  }
  return password;
}

function userSessionConfig() {
  return {
    password: sessionSecret(),
    name: "shapeemv-user",
    maxAge: 60 * 60 * 24 * 30, // 30 days
    cookie: {
      httpOnly: true,
      secure: true,
      // "none" is required so the cookie survives inside an iframe (preview),
      // which is a cross-site context. Requires secure: true.
      sameSite: "none" as const,
      path: "/",
    },
  };
}

export async function getUserSession() {
  return useSession<UserSessionData>(userSessionConfig());
}

/** Sets the signed, httpOnly session cookie binding the browser to a user id. */
export async function setUserSession(userId: string, email: string) {
  const session = await getUserSession();
  await session.update({ userId, email, loggedAt: Date.now() });
}

export async function clearUserSession() {
  const session = await getUserSession();
  await session.clear();
}

// ─── Stateless signed token (cookie-independent fallback) ────────────────────
// Some browsers (and the editor preview iframe) drop third-party cookies, which
// made every data call fail with SESSION_EXPIRED and reset the user's progress.
// The token below is HMAC-signed on the server, so the client can hold it in
// localStorage without being able to forge another user's id.

const TOKEN_TTL_MS = 1000 * 60 * 60 * 24 * 90; // 90 days

function b64url(bytes: Uint8Array) {
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function hmac(payload: string) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(sessionSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(payload));
  return b64url(new Uint8Array(sig));
}

export async function createAuthToken(userId: string, issuedAt = Date.now()) {
  const payload = `${userId}.${issuedAt}`;
  return `${payload}.${await hmac(payload)}`;
}

export async function verifyAuthToken(token: string): Promise<string | null> {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [userId, issuedAtRaw, sig] = parts;
  const issuedAt = Number(issuedAtRaw);
  if (!userId || !Number.isFinite(issuedAt)) return null;
  if (Date.now() - issuedAt > TOKEN_TTL_MS) return null;
  const expected = await hmac(`${userId}.${issuedAt}`);
  if (expected.length !== sig.length) return null;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ sig.charCodeAt(i);
  if (diff !== 0) return null;
  return userId;
}

/**
 * Returns the verified user id: first from the signed token sent by the client
 * (works even when cookies are blocked), otherwise from the session cookie.
 * A raw user id from the request body is never trusted.
 */
export async function requireUserId(token?: string | null): Promise<string> {
  if (token) {
    const userId = await verifyAuthToken(token);
    if (userId) return userId;
  }
  try {
    const session = await getUserSession();
    const userId = session.data.userId;
    if (userId) return userId;
  } catch {
    /* fall through */
  }
  throw new Error("SESSION_EXPIRED");
}
