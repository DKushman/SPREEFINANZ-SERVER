"use client";

type StepNavigationProps = {
  currentStep: number;
  totalSteps: number;
  finalLabel?: string;
  disableNext?: boolean;
  /** Letzter Schritt: Ladezustand nach Klick bis das Ergebnis-Overlay erscheint */
  finalButtonPending?: boolean;
  onBack: () => void;
  onNext: () => void;
  onSkip?: () => void;
};

export function StepNavigation({
  currentStep,
  totalSteps,
  finalLabel = "Ergebnis",
  disableNext = false,
  finalButtonPending = false,
  onBack,
  onNext,
  onSkip,
}: StepNavigationProps) {
  const isFirst = currentStep === 0;
  const isLast = currentStep === totalSteps - 1;
  const nextDisabled = disableNext || (isLast && finalButtonPending);

  return (
    <div
      id="price-calculator-navigation"
      role="group"
      aria-label="Schrittnavigation"
      className="flex w-full flex-wrap items-center justify-center gap-x-[clamp(0.5rem,1vw,0.75rem)] gap-y-[clamp(0.35rem,0.8vw,0.5rem)]"
    >
      {!isFirst && (
        <button
          id="price-calculator-nav-back"
          type="button"
          onClick={onBack}
          aria-label="Zurück zum vorherigen Schritt"
          className="inline-flex h-[clamp(2.4rem,4.5vw,3rem)] items-center justify-center gap-[clamp(0.15rem,0.3vw,0.2rem)] rounded-full border border-[rgba(255,255,227,0.25)] bg-transparent px-[clamp(1.8rem,3.5vw,2.5rem)] text-[clamp(0.85rem,1.3vw,1rem)] text-[var(--foreground)] transition-colors duration-200 hover:bg-[rgba(255,255,227,0.06)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--foreground)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]"
        >
          <span aria-hidden="true">←</span>
          <span>Zurück</span>
        </button>
      )}

      <button
        id="price-calculator-nav-next"
        type="button"
        onClick={onNext}
        disabled={nextDisabled}
        aria-busy={isLast && finalButtonPending}
        aria-label={
          isLast && finalButtonPending
            ? "Ergebnis wird geladen"
            : isLast
              ? finalLabel
              : "Weiter zum nächsten Schritt"
        }
        className={`inline-flex h-[clamp(2.4rem,4.5vw,3rem)] min-w-[clamp(8.5rem,28vw,11rem)] items-center justify-center gap-[clamp(0.35rem,0.7vw,0.5rem)] rounded-full px-[clamp(1.8rem,3.5vw,2.5rem)] text-[clamp(0.85rem,1.3vw,1rem)] font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--foreground)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] ${
          nextDisabled && !finalButtonPending
            ? "cursor-not-allowed bg-[rgba(255,255,227,0.18)] text-[rgba(255,255,227,0.35)]"
            : finalButtonPending
              ? "cursor-wait bg-[var(--foreground)] text-[var(--background)] opacity-95"
              : "bg-[var(--foreground)] text-[var(--background)] hover:bg-[#f3f0c8] active:scale-[0.97] active:bg-[#e7e3b8]"
        }`}
      >
        {isLast && finalButtonPending && (
          <span
            className="inline-block size-[1.05em] shrink-0 animate-spin rounded-full border-2 border-[var(--background)] border-t-transparent"
            aria-hidden="true"
          />
        )}
        <span>{isLast ? finalLabel : "Weiter"}</span>
        {!isLast && <span aria-hidden="true">→</span>}
      </button>

      {onSkip && (
        <button
          id="price-calculator-nav-skip"
          type="button"
          onClick={onSkip}
          aria-label="Diesen Schritt überspringen"
          className="inline-flex h-[clamp(2rem,3.4vw,2.3rem)] items-center justify-center rounded-md px-[clamp(0.45rem,0.9vw,0.65rem)] text-[clamp(0.68rem,0.92vw,0.76rem)] text-[rgba(255,255,227,0.48)] underline decoration-[rgba(255,255,227,0.25)] underline-offset-4 transition-colors duration-200 hover:text-[rgba(255,255,227,0.72)] hover:decoration-[rgba(255,255,227,0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--foreground)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]"
        >
          Überspringen
        </button>
      )}
    </div>
  );
}
