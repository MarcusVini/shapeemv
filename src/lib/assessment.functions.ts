import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const SaveAssessmentInput = z.object({
  respostas: z.record(z.string(), z.unknown()),
  unlockDateIso: z.string(),
});

export const saveAssessment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => SaveAssessmentInput.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: assessment, error: aErr } = await supabase
      .from("assessments")
      .insert({
        user_id: userId,
        respostas_json: data.respostas,
        status: "concluido",
      })
      .select()
      .single();
    if (aErr) throw new Error(aErr.message);

    const { data: workout, error: wErr } = await supabase
      .from("workouts")
      .insert({
        user_id: userId,
        assessment_id: assessment.id,
        treinos_json: {},
        unlock_date: data.unlockDateIso,
      })
      .select()
      .single();
    if (wErr) throw new Error(wErr.message);

    return { assessmentId: assessment.id, workoutId: workout.id, unlockDate: workout.unlock_date };
  });

export const getLatestState = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const [profileRes, assessmentRes, workoutRes] = await Promise.all([
      supabase.from("profiles").select("nome_completo, email").eq("id", userId).maybeSingle(),
      supabase
        .from("assessments")
        .select("id, respostas_json, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("workouts")
        .select("id, unlock_date, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

    return {
      profile: profileRes.data
        ? { nome_completo: profileRes.data.nome_completo ?? "", email: profileRes.data.email ?? "" }
        : null,
      assessment: assessmentRes.data
        ? {
            id: assessmentRes.data.id,
            respostas: (assessmentRes.data.respostas_json ?? {}) as Record<string, unknown>,
            created_at: assessmentRes.data.created_at,
          }
        : null,
      workout: workoutRes.data
        ? {
            id: workoutRes.data.id,
            unlock_date: workoutRes.data.unlock_date,
          }
        : null,
    };
  });

// Dev helper: unlock immediately (no-op in production via NODE_ENV check)
export const unlockNow = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("workouts")
      .update({ unlock_date: new Date().toISOString() })
      .eq("user_id", userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
