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

    const { data: existing, error: selErr } = await supabaseAdmin
      .from("app_users")
      .select("id, email, nome_completo")
      .eq("email", data.email)
      .maybeSingle();
    if (selErr) {
      console.error("[loginOrCreateUser] select failed:", selErr);
      throw new Error("Erro ao acessar. Tente novamente.");
    }

    if (existing) {
      return {
        id: existing.id,
        email: existing.email,
        nome_completo: existing.nome_completo || data.nome_completo,
      };
    }

    const { data: created, error: insErr } = await supabaseAdmin
      .from("app_users")
      .insert({ email: data.email, nome_completo: data.nome_completo })
      .select("id, email, nome_completo")
      .single();
    if (insErr) {
      console.error("[loginOrCreateUser] insert failed:", insErr);
      throw new Error("Erro ao criar conta. Tente novamente.");
    }

    return {
      id: created.id,
      email: created.email,
      nome_completo: created.nome_completo,
    };
  });
