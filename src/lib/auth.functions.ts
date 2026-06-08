import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const LoginInput = z.object({
  email: z.string().trim().toLowerCase().email().max(255),
  nome_completo: z.string().trim().min(1).max(120),
});

export const loginOrCreateUser = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => LoginInput.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const email = data.email; // already lower+trim from zod
    const nome = data.nome_completo;

    async function findByEmail() {
      const { data: rows, error } = await supabaseAdmin
        .from("app_users")
        .select("id, email, nome_completo")
        .ilike("email", email) // case-insensitive exact match
        .limit(1);
      if (error) throw error;
      return rows && rows.length > 0 ? rows[0] : null;
    }

    try {
      const existing = await findByEmail();
      if (existing) {
        return {
          id: existing.id,
          email: existing.email,
          nome_completo: existing.nome_completo || nome,
        };
      }

      const { data: created, error: insErr } = await supabaseAdmin
        .from("app_users")
        .insert({ email, nome_completo: nome })
        .select("id, email, nome_completo")
        .single();

      if (insErr) {
        // Likely a race: another request just inserted the same email
        // (unique index on lower(email)). Re-fetch.
        const retry = await findByEmail();
        if (retry) {
          return {
            id: retry.id,
            email: retry.email,
            nome_completo: retry.nome_completo || nome,
          };
        }
        console.error("[loginOrCreateUser] insert failed:", insErr);
        throw new Error("Erro ao criar conta. Tente novamente.");
      }

      return {
        id: created.id,
        email: created.email,
        nome_completo: created.nome_completo,
      };
    } catch (err) {
      console.error("[loginOrCreateUser] failed:", err);
      throw err instanceof Error ? err : new Error("Erro ao acessar.");
    }
  });
