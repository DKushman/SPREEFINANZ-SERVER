"use client";

type StepIndicatorProps = {
  totalSteps: number;
  currentStep: number;
  visitedSteps: Set<number>;
  onStepSelect: (stepIndex: number) => void;
};

export function StepIndicator({
  totalSteps,
  currentStep,
  visitedSteps,
  onStepSelect,
}: StepIndicatorProps) {
  return (
    <nav
      id="price-calculator-step-indicator"
      aria-label="Fortschritt"
      className="flex items-center gap-[clamp(0.25rem,0.55vw,0.4rem)]"
    >
      {Array.from({ length: totalSteps }, (_, i) => {
        const isActive = i === currentStep;
        const isVisited = visitedSteps.has(i) && !isActive;
        return (
          <button
            key={i}
            id={`price-calculator-step-dot-${i}`}
            type="button"
            onClick={() => onStepSelect(i)}
            aria-current={isActive ? "step" : undefined}
            aria-label={`Zu Schritt ${i + 1} von ${totalSteps} wechseln${isActive ? ", aktiv" : isVisited ? ", abgeschlossen" : ""}`}
            className={`inline-flex h-[clamp(0.92rem,1.6vw,1.15rem)] min-w-[clamp(0.92rem,1.6vw,1.15rem)] items-center justify-center rounded-full px-0 text-[clamp(0.5rem,0.75vw,0.6rem)] font-medium leading-none transition-all duration-220 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--foreground)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] ${
              isActive
                ? "min-w-[clamp(2.35rem,4.4vw,3rem)] bg-[var(--foreground)] text-[var(--background)]"
                : isVisited
                  ? "bg-[rgba(255,255,227,0.7)] text-[var(--background)]"
                  : "bg-[rgba(255,255,227,0.42)] text-[var(--background)] hover:bg-[rgba(255,255,227,0.55)]"
            }`}
          >
            {isVisited && (
              <svg
                viewBox="0 0 16 16"
                className="size-[clamp(0.48rem,0.72vw,0.55rem)]"
                aria-hidden="true"
              >
                <path
                  d="M3.5 8.5L6.5 11.5L12.5 4.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </button>
        );
      })}
    </nav>
  );
}
