import { createServerFn } from "@tanstack/react-start";
import { useSession } from "@tanstack/react-start/server";
import { z } from "zod";
import { createHash, timingSafeEqual } from "node:crypto";

type AdminSession = { isAdmin?: boolean; loggedAt?: number };

function sessionConfig() {
  const password = process.env.ADMIN_SESSION_SECRET;
  if (!password || password.length < 32) {
    throw new Error("ADMIN_SESSION_SECRET missing or too short");
  }
  return {
    password,
    name: "shapeemv-admin",
    maxAge: 60 * 60 * 12, // 12h
    cookie: {
      httpOnly: true,
      secure: true,
      sameSite: "lax" as const,
      path: "/",
    },
  };
}

function safeEq(a: string, b: string): boolean {
  const ha = createHash("sha256").update(a, "utf8").digest();
  const hb = createHash("sha256").update(b, "utf8").digest();
  return timingSafeEqual(ha, hb);
}

export const adminLogin = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z.object({ username: z.string().min(1), password: z.string().min(1) }).parse(data),
  )
  .handler(async ({ data }) => {
    const expectedUser = process.env.ADMIN_USERNAME || "";
    const expectedPass = process.env.ADMIN_PASSWORD || "";
    if (!expectedUser || !expectedPass) {
      return { ok: false as const, reason: "not_configured" };
    }
    if (!safeEq(data.username, expectedUser) || !safeEq(data.password, expectedPass)) {
      return { ok: false as const, reason: "invalid" };
    }
    const session = await useSession<AdminSession>(sessionConfig());
    await session.update({ isAdmin: true, loggedAt: Date.now() });
    return { ok: true as const };
  });

export const adminLogout = createServerFn({ method: "POST" }).handler(async () => {
  const session = await useSession<AdminSession>(sessionConfig());
  await session.clear();
  return { ok: true as const };
});

export const adminCheck = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const session = await useSession<AdminSession>(sessionConfig());
    return { isAdmin: !!session.data.isAdmin };
  } catch {
    return { isAdmin: false };
  }
});

async function requireAdmin() {
  const session = await useSession<AdminSession>(sessionConfig());
  if (!session.data.isAdmin) throw new Error("UNAUTHORIZED");
}

const StatsInput = z.object({
  from: z.string(), // ISO date
  to: z.string(),
});

export const getFunnelStats = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => StatsInput.parse(d))
  .handler(async ({ data }) => {
    await requireAdmin();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Fetch events in range (paginate to bypass 1000-row default)
    const pageSize = 1000;
    let from = 0;
    const rows: Array<{
      created_at: string;
      session_id: string;
      event_name: string;
      page_path: string | null;
      funnel_step: string | null;
      button_name: string | null;
      button_text: string | null;
      quiz_step: number | null;
      quiz_question: string | null;
      quiz_answer: string | null;
      utm_source: string | null;
      utm_medium: string | null;
      utm_campaign: string | null;
      utm_content: string | null;
      utm_term: string | null;
      device_type: string | null;
      browser: string | null;
      os: string | null;
    }> = [];

    while (true) {
      const { data: batch, error } = await supabaseAdmin
        .from("funnel_events")
        .select(
          "created_at,session_id,event_name,page_path,funnel_step,button_name,button_text,quiz_step,quiz_question,quiz_answer,utm_source,utm_medium,utm_campaign,utm_content,utm_term,device_type,browser,os",
        )
        .gte("created_at", data.from)
        .lte("created_at", data.to)
        .order("created_at", { ascending: false })
        .range(from, from + pageSize - 1);
      if (error) throw error;
      if (!batch || batch.length === 0) break;
      rows.push(...(batch as typeof rows));
      if (batch.length < pageSize) break;
      from += pageSize;
      if (from > 50000) break; // safety
    }

    return { events: rows };
  });

export const getRecentEvents = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({
        from: z.string(),
        to: z.string(),
        limit: z.number().min(1).max(500).default(200),
        search: z.string().optional(),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    await requireAdmin();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    let q = supabaseAdmin
      .from("funnel_events")
      .select("*")
      .gte("created_at", data.from)
      .lte("created_at", data.to)
      .order("created_at", { ascending: false })
      .limit(data.limit);
    if (data.search && data.search.trim()) {
      const s = data.search.trim();
      q = q.or(
        `event_name.ilike.%${s}%,page_path.ilike.%${s}%,session_id.ilike.%${s}%,utm_source.ilike.%${s}%,utm_campaign.ilike.%${s}%`,
      );
    }
    const { data: rows, error } = await q;
    if (error) throw error;
    return { rows: rows ?? [] };
  });
