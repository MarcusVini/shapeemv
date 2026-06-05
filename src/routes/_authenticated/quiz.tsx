import { useEffect, useRef, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Check } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import { QUIZ_STEPS, TOTAL_STEPS, type QuizStep } from "@/lib/quiz-data";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { saveAssessment } from "@/lib/assessment.functions";
import { nextUnlockDate } from "@/lib/assessment-calc";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import t1 from "@/assets/transformacao-1.jpg.asset.json";
import t2 from "@/assets/transformacao-2.jpg.asset.json";
import t3 from "@/assets/transformacao-3.jpg.asset.json";
import t4 from "@/assets/transformacao-4.jpg.asset.json";
import t5 from "@/assets/transformacao-5.jpg.asset.json";
import t6 from "@/assets/transformacao-6.jpg.asset.json";

export const Route = createFileRoute("/_authenticated/quiz")({
  component: QuizPage,
});

type Answers = Record<string, unknown>;

function QuizPage() {
  const navigate = useNavigate();
  const submitFn = useServerFn(saveAssessment);
  const [stepIdx, setStepIdx] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [submitting, setSubmitting] = useState(false);

  const step = QUIZ_STEPS[stepIdx];
  const progress = ((stepIdx + 1) / TOTAL_STEPS) * 100;

  function setAnswer(value: unknown) {
    setAnswers((a) => ({ ...a, [step.id]: value }));
    // Auto-advance for single-choice card questions
    if (step.type === "cards" && stepIdx < TOTAL_STEPS - 1) {
      setTimeout(() => setStepIdx((i) => (i === stepIdx ? i + 1 : i)), 280);
    }
  }

  function canAdvance(): boolean {
    if (step.type === "intersticial") return true;
    const v = answers[step.id];
    if (step.type === "slider") return typeof v === "number";
    if (step.type === "cards") return typeof v === "string";
    if (step.type === "textarea") return typeof v === "string" && v.trim().length > 0;
    if (step.type === "checkbox-multi") return Array.isArray(v) && v.length > 0;
    if (step.type === "yes-no-conditional") {
      const ans = v as { resposta?: string; detalhe?: string } | undefined;
      if (!ans?.resposta) return false;
      if (ans.resposta === "sim" && !ans.detalhe?.trim()) return false;
      return true;
    }
    return false;
  }

  async function handleNext() {
    if (stepIdx < TOTAL_STEPS - 1) {
      setStepIdx((i) => i + 1);
      return;
    }
    // Submit
    setSubmitting(true);
    try {
      const unlock = nextUnlockDate();
      await submitFn({
        data: { respostas: answers, unlockDateIso: unlock.toISOString() },
      });
      navigate({ to: "/processing", replace: true });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao salvar");
      setSubmitting(false);
    }
  }

  function handleBack() {
    if (stepIdx === 0) {
      navigate({ to: "/dashboard" });
      return;
    }
    setStepIdx((i) => i - 1);
  }

  return (
    <main className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-background/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-md items-center gap-3 px-5 pt-6 pb-3">
          <button
            onClick={handleBack}
            className="-ml-2 rounded-full p-2 text-foreground hover:bg-card"
            aria-label="Voltar"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <p className="text-xs font-medium text-muted-foreground tabular-nums">
            {stepIdx + 1} <span className="opacity-50">/ {TOTAL_STEPS}</span>
          </p>
        </div>
        <div className="mx-auto max-w-md px-5 pb-3">
          <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
            <motion.div
              className="h-full gold-gradient"
              animate={{ width: `${progress}%` }}
              transition={{ type: "spring", stiffness: 120, damping: 20 }}
            />
          </div>
        </div>
      </header>

      {/* Step */}
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-5 pt-6 pb-32">
        <AnimatePresence mode="wait">
          <motion.div
            key={step.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="flex-1"
          >
            <StepView step={step} value={answers[step.id]} onChange={setAnswer} />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer CTA */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-background/95 backdrop-blur-md">
        <div className="mx-auto max-w-md px-5 py-4 pb-[calc(env(safe-area-inset-bottom)+1rem)]">
          <Button
            disabled={!canAdvance() || submitting}
            onClick={handleNext}
            className={cn(
              "h-14 w-full rounded-2xl gold-gradient text-base font-bold text-primary-foreground shadow-gold-sm disabled:opacity-40 disabled:shadow-none",
              step.type === "intersticial" && "animate-gold-pulse",
            )}
          >
            {submitting
              ? "Enviando…"
              : stepIdx === TOTAL_STEPS - 1
                ? "Finalizar avaliação"
                : step.type === "intersticial"
                  ? "Continuar"
                  : step.type === "textarea" || step.type === "yes-no-conditional"
                    ? "Enviar resposta"
                    : "Próximo"}
          </Button>
        </div>
      </div>
    </main>
  );
}

function StepView({
  step,
  value,
  onChange,
}: {
  step: QuizStep;
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  if (step.type === "intersticial") {
    return <Intersticial step={step} />;
  }
  return (
    <div>
      <h2 className="text-2xl font-black leading-tight text-foreground">
        {step.question}
      </h2>
      {step.subtitle && (
        <p className="mt-2 text-sm text-muted-foreground">{step.subtitle}</p>
      )}

      <div className="mt-8">
        {step.type === "cards" && <CardsInput step={step} value={value as string} onChange={onChange} />}
        {step.type === "slider" && <SliderInput step={step} value={value as number} onChange={onChange} />}
        {step.type === "textarea" && (
          <Textarea
            value={(value as string) ?? ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={step.placeholder}
            rows={6}
            className="min-h-32 rounded-2xl border-border bg-card text-base"
          />
        )}
        {step.type === "checkbox-multi" && (
          <CheckboxMulti step={step} value={(value as string[]) ?? []} onChange={onChange} />
        )}
        {step.type === "yes-no-conditional" && (
          <YesNoConditional
            step={step}
            value={value as { resposta?: "sim" | "nao"; detalhe?: string } | undefined}
            onChange={onChange}
          />
        )}
      </div>
    </div>
  );
}

function CardsInput({
  step,
  value,
  onChange,
}: {
  step: QuizStep;
  value: string | undefined;
  onChange: (v: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-3">
      {step.options?.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              "flex items-center gap-4 rounded-2xl border bg-card p-4 text-left transition-all",
              active
                ? "border-primary bg-primary/10 shadow-gold-sm"
                : "border-border hover:border-primary/40",
            )}
          >
            {opt.emoji && (
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-background text-2xl">
                {opt.emoji}
              </span>
            )}
            <span className="flex-1">
              <span className="block text-base font-semibold text-foreground">{opt.label}</span>
              {opt.description && (
                <span className="mt-0.5 block text-xs text-muted-foreground">{opt.description}</span>
              )}
            </span>
            {active && (
              <span className="flex h-6 w-6 items-center justify-center rounded-full gold-gradient">
                <Check className="h-3.5 w-3.5 text-primary-foreground" strokeWidth={3} />
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

function SliderInput({
  step,
  value,
  onChange,
}: {
  step: QuizStep;
  value: number | undefined;
  onChange: (v: number) => void;
}) {
  const v = value ?? step.defaultValue ?? step.min ?? 0;
  return (
    <div className="space-y-8 rounded-3xl border border-border bg-card p-7">
      <div className="text-center">
        <p className="text-6xl font-black text-gold-gradient tabular-nums">{v}</p>
        <p className="mt-1 text-sm font-medium uppercase tracking-wider text-muted-foreground">
          {step.unit}
        </p>
      </div>
      <Slider
        value={[v]}
        min={step.min ?? 0}
        max={step.max ?? 100}
        step={1}
        onValueChange={(arr) => onChange(arr[0])}
      />
      <div className="flex justify-between text-xs text-muted-foreground tabular-nums">
        <span>{step.min}</span>
        <span>{step.max}</span>
      </div>
    </div>
  );
}

function CheckboxMulti({
  step,
  value,
  onChange,
}: {
  step: QuizStep;
  value: string[];
  onChange: (v: string[]) => void;
}) {
  function toggle(v: string) {
    onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v]);
  }
  return (
    <div className="space-y-3">
      {step.options?.map((opt) => {
        const active = value.includes(opt.value);
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => toggle(opt.value)}
            className={cn(
              "flex w-full items-center gap-3 rounded-2xl border bg-card p-4 text-left transition-all",
              active ? "border-primary bg-primary/10" : "border-border",
            )}
          >
            <Checkbox checked={active} className="pointer-events-none" />
            <span className="text-base font-semibold text-foreground">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function YesNoConditional({
  step,
  value,
  onChange,
}: {
  step: QuizStep;
  value: { resposta?: "sim" | "nao"; detalhe?: string } | undefined;
  onChange: (v: { resposta: "sim" | "nao"; detalhe?: string }) => void;
}) {
  const resp = value?.resposta;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {(["sim", "nao"] as const).map((v) => {
          const active = resp === v;
          return (
            <button
              key={v}
              type="button"
              onClick={() => onChange({ resposta: v, detalhe: v === "sim" ? value?.detalhe : undefined })}
              className={cn(
                "rounded-2xl border bg-card py-5 text-lg font-bold capitalize transition-all",
                active
                  ? "border-primary bg-primary/10 text-primary shadow-gold-sm"
                  : "border-border text-foreground hover:border-primary/40",
              )}
            >
              {v === "sim" ? "Sim" : "Não"}
            </button>
          );
        })}
      </div>
      <AnimatePresence initial={false}>
        {resp === "sim" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <Textarea
              value={value?.detalhe ?? ""}
              onChange={(e) => onChange({ resposta: "sim", detalhe: e.target.value })}
              placeholder={step.conditionalPlaceholder}
              rows={4}
              autoFocus
              className="mt-2 rounded-2xl border-primary/30 bg-card text-base"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

import t1 from "@/assets/transformacao-1.jpg.asset.json";
import t2 from "@/assets/transformacao-2.jpg.asset.json";
import t3 from "@/assets/transformacao-3.jpg.asset.json";
import t4 from "@/assets/transformacao-4.jpg.asset.json";
import t5 from "@/assets/transformacao-5.jpg.asset.json";
import t6 from "@/assets/transformacao-6.jpg.asset.json";
import { useEffect, useRef, useState as useReactState } from "react";
import useEmblaCarousel from "embla-carousel-react";

const TRANSFORMACOES = [t1, t2, t3, t4, t5, t6];

function Intersticial({ step }: { step: QuizStep }) {
  const isMotivacao = step.id === "motivacao_intersticial";

  if (!isMotivacao) {
    return (
      <div>
        <h2 className="text-2xl font-black leading-tight text-foreground">{step.question}</h2>
        {step.subtitle && <p className="mt-2 text-sm text-muted-foreground">{step.subtitle}</p>}
        <div className="mt-8 relative overflow-hidden rounded-3xl gold-border bg-card p-8 text-center shadow-gold">
          <div className="absolute inset-0 gold-gradient-soft" />
          <div className="relative">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full gold-gradient text-2xl shadow-gold-sm">
              💪
            </div>
            <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
              O método já transformou milhares de homens e mulheres comuns em versões
              mais fortes e mais leves de si mesmos.{" "}
              <strong className="text-foreground">A próxima transformação pode ser a sua.</strong>
            </p>
          </div>
        </div>
      </div>
    );
  }

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "center" });
  const [selected, setSelected] = useReactState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelected(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    onSelect();
    intervalRef.current = setInterval(() => emblaApi.scrollNext(), 3500);
    return () => {
      emblaApi.off("select", onSelect);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [emblaApi]);

  return (
    <div>
      {/* Carrossel */}
      <div className="relative">
        <div className="overflow-hidden rounded-3xl gold-border shadow-gold" ref={emblaRef}>
          <div className="flex">
            {TRANSFORMACOES.map((img, i) => (
              <div key={i} className="min-w-0 flex-[0_0_100%]">
                <img
                  src={img.url}
                  alt={`Transformação ${i + 1}`}
                  className="aspect-square w-full object-cover"
                  loading={i === 0 ? "eager" : "lazy"}
                />
              </div>
            ))}
          </div>
        </div>
        {/* Dots */}
        <div className="mt-4 flex justify-center gap-2">
          {TRANSFORMACOES.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => emblaApi?.scrollTo(i)}
              aria-label={`Ir para slide ${i + 1}`}
              className={cn(
                "h-1.5 rounded-full transition-all",
                selected === i ? "w-6 gold-gradient" : "w-1.5 bg-border",
              )}
            />
          ))}
        </div>
      </div>

      {/* Headline */}
      <h2 className="mt-8 text-3xl font-black leading-tight text-foreground">
        {step.question}
      </h2>

      {/* Texto */}
      <p className="mt-3 text-base leading-relaxed text-muted-foreground">
        Mais de <strong className="text-foreground">12.000 alunos</strong> já transformaram seus corpos com o
        método <strong className="text-foreground">Shape em V</strong>. A jornada começa agora.
      </p>
    </div>
  );
}
