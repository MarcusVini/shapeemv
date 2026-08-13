import { useSession } from "@tanstack/react-start/server";

export type UserSessionData = { userId?: string; email?: string; loggedAt?: number };

function userSessionConfig() {
  const password = process.env['ADMIN_SESSION_SECRET'];
  if (!password || password.length < 32) {
    throw new Error("Session secret missing or too short");
  }
  return {
    password,
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

/**
 * Returns the verified user id from the signed session cookie.
 * Never trust a user id coming from the request body.
 */
export async function requireUserId(): Promise<string> {
  let session;
  try {
    session = await getUserSession();
  } catch {
    throw new Error("SESSION_EXPIRED");
  }
  const userId = session.data.userId;
  if (!userId) throw new Error("SESSION_EXPIRED");
  return userId;
}
