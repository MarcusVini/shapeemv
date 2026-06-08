import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { nextUnlockDate } from "@/lib/assessment-calc";
import type { Json } from "@/integrations/supabase/types";

const SaveAssessmentInput = z.object({
  userId: z.string().uuid(),
  respostas: z.record(z.string(), z.unknown()),
});

export const saveAssessment = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => SaveAssessmentInput.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: assessment, error: aErr } = await supabaseAdmin
      .from("assessments")
      .insert({
        user_id: data.userId,
        respostas_json: data.respostas as Json,
        status: "concluido",
      })
      .select()
      .single();
    if (aErr) {
      console.error("[saveAssessment] assessment insert failed:", aErr);
      throw new Error("Failed to save assessment. Please try again.");
    }

    const unlockDateIso = nextUnlockDate().toISOString();

    const { data: workout, error: wErr } = await supabaseAdmin
      .from("workouts")
      .insert({
        user_id: data.userId,
        assessment_id: assessment.id,
        treinos_json: {},
        unlock_date: unlockDateIso,
      })
      .select()
      .single();
    if (wErr) {
      console.error("[saveAssessment] workout insert failed:", wErr);
      throw new Error("Failed to save assessment. Please try again.");
    }

    return { assessmentId: assessment.id, workoutId: workout.id, unlockDate: workout.unlock_date };
  });

const GetLatestStateInput = z.object({
  userId: z.string().uuid(),
});

export const getLatestState = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => GetLatestStateInput.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const userId = data.userId;

    const [userRes, assessmentRes, workoutRes] = await Promise.all([
      supabaseAdmin.from("app_users").select("nome_completo, email").eq("id", userId).maybeSingle(),
      supabaseAdmin
        .from("assessments")
        .select("id, respostas_json, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabaseAdmin
        .from("workouts")
        .select("id, unlock_date, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

    return {
      profile: userRes.data
        ? { nome_completo: userRes.data.nome_completo ?? "", email: userRes.data.email ?? "" }
        : null,
      assessment: assessmentRes.data
        ? {
            id: assessmentRes.data.id,
            respostas: (assessmentRes.data.respostas_json ?? {}) as Json,
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
