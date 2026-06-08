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

    // 1) Always insert a fresh assessment row (keeps full history)
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

    // 2) Preserve existing workout (and unlock_date) if user already has one.
    //    Otherwise create a new workout with a fresh unlock_date.
    const { data: existingWorkout, error: wSelErr } = await supabaseAdmin
      .from("workouts")
      .select("id, unlock_date")
      .eq("user_id", data.userId)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();
    if (wSelErr) {
      console.error("[saveAssessment] workout lookup failed:", wSelErr);
      throw new Error("Failed to save assessment. Please try again.");
    }

    let workoutId: string;
    let unlockDateIso: string;

    if (existingWorkout) {
      const { data: updated, error: wUpdErr } = await supabaseAdmin
        .from("workouts")
        .update({ assessment_id: assessment.id })
        .eq("id", existingWorkout.id)
        .select("id, unlock_date")
        .single();
      if (wUpdErr) {
        console.error("[saveAssessment] workout update failed:", wUpdErr);
        throw new Error("Failed to save assessment. Please try again.");
      }
      workoutId = updated.id;
      unlockDateIso = updated.unlock_date as unknown as string;
    } else {
      const newUnlock = nextUnlockDate().toISOString();
      const { data: created, error: wInsErr } = await supabaseAdmin
        .from("workouts")
        .insert({
          user_id: data.userId,
          assessment_id: assessment.id,
          treinos_json: {},
          unlock_date: newUnlock,
        })
        .select("id, unlock_date")
        .single();
      if (wInsErr) {
        console.error("[saveAssessment] workout insert failed:", wInsErr);
        throw new Error("Failed to save assessment. Please try again.");
      }
      workoutId = created.id;
      unlockDateIso = created.unlock_date as unknown as string;
    }

    // 3) Clear any saved draft after a successful submission (best-effort)
    await supabaseAdmin.from("quiz_drafts").delete().eq("user_id", data.userId);

    return { assessmentId: assessment.id, workoutId, unlockDate: unlockDateIso };
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
        .order("created_at", { ascending: true })
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

// ─── Quiz Drafts (server-side autosave) ──────────────────────────────────────

const SaveQuizDraftInput = z.object({
  userId: z.string().uuid(),
  respostas: z.record(z.string(), z.unknown()),
  stepIdx: z.number().int().min(0).max(200),
});

export const saveQuizDraft = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => SaveQuizDraftInput.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("quiz_drafts")
      .upsert(
        {
          user_id: data.userId,
          respostas_json: data.respostas as Json,
          step_idx: data.stepIdx,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" },
      );
    if (error) {
      console.error("[saveQuizDraft] failed:", error);
      throw new Error("Não foi possível salvar o rascunho.");
    }
    return { ok: true };
  });

const GetQuizDraftInput = z.object({
  userId: z.string().uuid(),
});

export const getQuizDraft = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => GetQuizDraftInput.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("quiz_drafts")
      .select("respostas_json, step_idx, updated_at")
      .eq("user_id", data.userId)
      .maybeSingle();
    if (error) {
      console.error("[getQuizDraft] failed:", error);
      return { draft: null };
    }
    return {
      draft: row
        ? {
            respostas: (row.respostas_json ?? {}) as Json,
            stepIdx: row.step_idx ?? 0,
            updatedAt: row.updated_at as unknown as string,
          }
        : null,
    };
  });
