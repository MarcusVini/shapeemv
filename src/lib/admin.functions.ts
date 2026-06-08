import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const Input = z.object({
  token: z.string().min(1).max(200),
  table: z.enum(["app_users", "assessments", "workouts", "quiz_drafts"]),
});

function toCsv(rows: Array<Record<string, unknown>>): string {
  if (rows.length === 0) return "";
  const headers = Array.from(
    rows.reduce<Set<string>>((acc, r) => {
      Object.keys(r).forEach((k) => acc.add(k));
      return acc;
    }, new Set()),
  );
  const esc = (v: unknown) => {
    if (v === null || v === undefined) return "";
    const s = typeof v === "object" ? JSON.stringify(v) : String(v);
    if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };
  const lines = [headers.join(",")];
  for (const r of rows) lines.push(headers.map((h) => esc(r[h])).join(","));
  return lines.join("\n");
}

export const exportTableCsv = createServerFn({ method: "POST" })
  .inputValidator((i: unknown) => Input.parse(i))
  .handler(async ({ data }) => {
    const expected = process.env.ADMIN_TOKEN;
    if (!expected) throw new Error("ADMIN_TOKEN não configurado no servidor.");
    if (data.token !== expected) throw new Error("Token inválido.");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const pageSize = 1000;
    let from = 0;
    const all: Array<Record<string, unknown>> = [];
    // paginate to handle large tables
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const { data: rows, error } = await supabaseAdmin
        .from(data.table)
        .select("*")
        .range(from, from + pageSize - 1);
      if (error) throw error;
      if (!rows || rows.length === 0) break;
      all.push(...(rows as Array<Record<string, unknown>>));
      if (rows.length < pageSize) break;
      from += pageSize;
    }

    return { csv: toCsv(all), count: all.length };
  });
