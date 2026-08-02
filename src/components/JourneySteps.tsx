export type JourneyStep = {
  text: string;
  status: "done" | "current";
};

export function JourneySteps({ steps }: { steps: JourneyStep[] }) {
  return (
    <div
      className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4"
      style={{ maxWidth: "400px", margin: "0 auto" }}
    >
      <div className="flex items-start justify-between gap-2">
        {steps.map((step, idx) => (
          <div
            key={idx}
            className="flex flex-1 flex-col items-center text-center"
          >
            <div
              className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold"
              style={{
                backgroundColor:
                  step.status === "done" ? "#27AF60" : "#FFFFFF",
                color: step.status === "done" ? "#FFFFFF" : "#0B0B0B",
              }}
            >
              {step.status === "done" ? "✓" : idx + 1}
            </div>
            <p
              className="mt-2 text-[11px] font-medium leading-tight"
              style={{
                color: step.status === "current" ? "#FFFFFF" : "#A1A1AA",
              }}
            >
              {step.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
