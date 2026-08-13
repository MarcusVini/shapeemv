import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const AcceptInput = z.object({
  email: z.string().trim().toLowerCase().max(255).optional(),
  user_id: z.string().uuid().optional(),
  terms_version: z.string().min(1).max(40),
  source: z.string().min(1).max(40),
});

export const recordTermsAcceptance = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => AcceptInput.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    try {
      await supabaseAdmin.from("terms_acceptances").insert({
        email: data.email ?? null,
        user_id: data.user_id ?? null,
        terms_version: data.terms_version,
        source: data.source,
      });
    } catch (err) {
      console.error("[recordTermsAcceptance] failed:", err);
    }
    return { ok: true };
  });
