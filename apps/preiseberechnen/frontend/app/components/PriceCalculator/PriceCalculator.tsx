"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import type {
  PriceCalculatorProps,
  CardOption,
  PillOption,
} from "./types";
import { AnimatedPriceDisplay } from "./AnimatedPriceDisplay";
import { StepIndicator } from "./StepIndicator";
import { CardSelector } from "./CardSelector";
import { PillSelector } from "./PillSelector";
import { SliderSelector } from "./SliderSelector";
import { StepNavigation } from "./StepNavigation";
import { ResultsOverlay } from "./ResultsOverlay";
import { usePriceCalculatorOverlayToolbarRegister } from "./PriceCalculatorOverlayToolbarContext";

type BreakdownItem = {
  label: string;
  range: [number, number];
};

function getInitialSelections(
  steps: PriceCalculatorProps["steps"],
): Record<string, string | number | string[]> {
  const initial: Record<string, string | number | string[]> = {};
  for (const s of steps) {
    if (s.type === "slider" && s.sliderConfig) {
      initial[s.id] = s.sliderConfig.min;
    }
    if (s.type === "pills") {
      initial[s.id] = [];
    }
  }
  return initial;
}

function computeRangeUntilStep(
  steps: PriceCalculatorProps["steps"],
  selections: Record<string, string | number | string[]>,
  initialRange: [number, number],
  stepCount: number,
): [number, number] {
  let range: [number, number] = [initialRange[0], initialRange[1]];
  for (let i = 0; i < stepCount; i += 1) {
    const step = steps[i];
    if (!step) break;
    const val = selections[step.id];
    if (Array.isArray(val)) {
      for (const entry of val) {
        range = step.priceEffect(entry, range);
      }
    } else if (val != null) {
      range = step.priceEffect(val, range);
    }
  }
  return range;
}

function estimateDeltaValue(
  step: PriceCalculatorProps["steps"][number],
  value: string | number,
): [number, number] {
  const result = step.priceEffect(value, [0, 0]);
  return [result[0], result[1]];
}

function getOptionLabel(
  step: PriceCalculatorProps["steps"][number],
  value: string,
): string {
  if (!step.options) return value;
  const match = step.options.find((opt) => opt.id === value);
  if (!match) return value;
  return "title" in match ? match.title : match.label;
}

function buildBreakdownItems(
  steps: PriceCalculatorProps["steps"],
  selections: Record<string, string | number | string[]>,
  stepCount: number,
): BreakdownItem[] {
  const rows: BreakdownItem[] = [];
  for (let i = 0; i < stepCount; i += 1) {
    const step = steps[i];
    if (!step) break;
    const selected = selections[step.id];
    if (Array.isArray(selected)) {
      for (const entry of selected) {
        rows.push({
          label: getOptionLabel(step, entry),
          range: estimateDeltaValue(step, entry),
        });
      }
      continue;
    }
    if (selected == null) continue;
    if (step.type === "slider") {
      rows.push({
        label: step.question,
        range: estimateDeltaValue(step, selected),
      });
    } else {
      rows.push({
        label: getOptionLabel(step, String(selected)),
        range: estimateDeltaValue(step, selected),
      });
    }
  }
  return rows;
}

function stepHasSelection(
  step: PriceCalculatorProps["steps"][number],
  selections: Record<string, string | number | string[]>,
): boolean {
  const val = selections[step.id];
  if (step.type === "slider") return true;
  if (step.type === "pills") return Array.isArray(val) && val.length > 0;
  return val != null && val !== "";
}

const RESULT_OVERLAY_DELAY_MS = 680;

const overlayCloseButtonClass =
  "inline-flex size-8 shrink-0 items-center justify-center rounded-full border border-[rgba(255,255,227,0.24)] text-[1rem] text-[rgba(255,255,227,0.9)] transition-colors hover:bg-[rgba(255,255,227,0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--foreground)]";

export function PriceCalculator({
  steps,
  initialRange,
  currency = "€",
  finalButtonLabel,
  onComplete,
  onOverlayClose,
}: PriceCalculatorProps) {
  const overlayToolbar = usePriceCalculatorOverlayToolbarRegister();
  const [currentStep, setCurrentStep] = useState(0);
  const [selections, setSelections] = useState<
    Record<string, string | number | string[]>
  >(() => getInitialSelections(steps));
  const [boostKey, setBoostKey] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [pendingResults, setPendingResults] = useState(false);
  const resultsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [visitedSteps, setVisitedSteps] = useState<Set<number>>(new Set());

  const scrollCalculatorWrapIntoView = useCallback(() => {
    if (typeof window === "undefined") return;
    const optionsScroll = document.getElementById(
      "price-calculator-options-scroll",
    );
    if (optionsScroll) {
      window.requestAnimationFrame(() => {
        optionsScroll.scrollTop = 0;
      });
      return;
    }
    // Nur mobil: nach "Weiter" den Rechnerbereich wieder in den Fokus holen.
    if (!window.matchMedia("(max-width: 767px)").matches) return;
    const wrap = document.getElementById("tuev-preisrechner-calculator-wrap");
    if (!wrap) return;
    window.requestAnimationFrame(() => {
      const topSafe = 16;
      const bottomSafe = 16;

      let scrollParent: HTMLElement | null = wrap.parentElement;
      while (scrollParent && scrollParent !== document.documentElement) {
        const st = window.getComputedStyle(scrollParent);
        if (st.overflowY === "auto" || st.overflowY === "scroll") break;
        scrollParent = scrollParent.parentElement;
      }

      if (scrollParent && scrollParent !== document.documentElement) {
        const wrapRect = wrap.getBoundingClientRect();
        const parentRect = scrollParent.getBoundingClientRect();
        const isVisibleEnough =
          wrapRect.top >= parentRect.top + topSafe &&
          wrapRect.bottom <= parentRect.bottom - bottomSafe;
        if (isVisibleEnough) return;
        const delta = wrapRect.top - parentRect.top - 12;
        scrollParent.scrollTop += delta;
        return;
      }

      const rect = wrap.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const isVisibleEnough =
        rect.top >= topSafe && rect.bottom <= viewportHeight - bottomSafe;
      if (isVisibleEnough) return;

      const targetTop = Math.max(0, window.scrollY + rect.top - 12);
      window.scrollTo({ top: targetTop });
    });
  }, []);

  const step = steps[currentStep];

  const priceRange = computeRangeUntilStep(
    steps,
    selections,
    initialRange,
    currentStep + 1,
  );
  const breakdownItems = buildBreakdownItems(steps, selections, currentStep + 1);

  const finalRange = computeRangeUntilStep(steps, selections, initialRange, steps.length);
  const finalBreakdown = buildBreakdownItems(steps, selections, steps.length);

  const progress = ((currentStep + 1) / steps.length) * 100;

  const canAdvance = stepHasSelection(step, selections);

  const handleSelect = useCallback(
    (value: string | number) => {
      setSelections((prev) => ({ ...prev, [step.id]: value }));
      setBoostKey((k) => k + 1);
      setVisitedSteps((prev) => new Set(prev).add(currentStep));
    },
    [step.id, currentStep],
  );

  const handlePillToggle = useCallback(
    (id: string) => {
      setSelections((prev) => {
        const current: string[] = Array.isArray(prev[step.id])
          ? (prev[step.id] as string[])
          : [];
        const next = current.includes(id)
          ? current.filter((x) => x !== id)
          : [...current, id];
        return { ...prev, [step.id]: next };
      });
      setBoostKey((k) => k + 1);
      setVisitedSteps((prev) => new Set(prev).add(currentStep));
    },
    [step.id, currentStep],
  );

  const handleBack = useCallback(() => {
    if (resultsTimerRef.current) {
      clearTimeout(resultsTimerRef.current);
      resultsTimerRef.current = null;
    }
    setPendingResults(false);
    setVisitedSteps((prev) => new Set(prev).add(currentStep));
    setCurrentStep((prev) => Math.max(0, prev - 1));
  }, [currentStep]);

  const handleNext = useCallback(() => {
    if (pendingResults) return;
    setVisitedSteps((prev) => new Set(prev).add(currentStep));
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
      scrollCalculatorWrapIntoView();
      return;
    }

    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    const delayMs = reduceMotion ? 0 : RESULT_OVERLAY_DELAY_MS;

    const openResults = () => {
      setShowResults(true);
      onComplete?.(selections);
      setPendingResults(false);
      resultsTimerRef.current = null;
    };

    if (delayMs === 0) {
      openResults();
      return;
    }

    setPendingResults(true);
    resultsTimerRef.current = setTimeout(openResults, delayMs);
  }, [
    currentStep,
    steps.length,
    onComplete,
    selections,
    pendingResults,
    scrollCalculatorWrapIntoView,
  ]);

  const handleSkip = useCallback(() => {
    handleNext();
  }, [handleNext]);

  const handleReset = useCallback(() => {
    if (resultsTimerRef.current) {
      clearTimeout(resultsTimerRef.current);
      resultsTimerRef.current = null;
    }
    setPendingResults(false);
    setShowResults(false);
    setCurrentStep(0);
    setSelections(getInitialSelections(steps));
    setVisitedSteps(new Set());
  }, [steps]);

  useEffect(() => {
    if (!overlayToolbar) return undefined;
    if (showResults) {
      overlayToolbar.registerOnReset(null);
      return undefined;
    }
    overlayToolbar.registerOnReset(handleReset);
    return () => overlayToolbar.registerOnReset(null);
  }, [overlayToolbar, handleReset, showResults]);

  const handleStepSelect = useCallback(
    (stepIndex: number) => {
      if (resultsTimerRef.current) {
        clearTimeout(resultsTimerRef.current);
        resultsTimerRef.current = null;
      }
      setPendingResults(false);
      setVisitedSteps((prev) => new Set(prev).add(currentStep));
      setCurrentStep(Math.max(0, Math.min(stepIndex, steps.length - 1)));
    },
    [steps.length, currentStep],
  );

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Enter" || e.repeat) return;
      if ((e as KeyboardEvent & { isComposing?: boolean }).isComposing)
        return;
      if (!canAdvance) return;

      const el = document.activeElement as HTMLElement | null;
      if (!el || !el.closest("#price-calculator")) return;

      if (el.closest("#price-calculator [role='dialog'][aria-modal='true']"))
        return;

      if (el.closest("#price-calculator-navigation")) return;
      if (el.closest("#price-calculator-reset-button")) return;
      if (el.closest("#price-calculator-header button")) return;

      if (el.closest("[data-price-calculator-manual-value]")) return;

      if (el.closest("#price-calculator-step-content button")) return;

      if (el.tagName === "TEXTAREA") return;
      if (el.isContentEditable) return;
      if (el.tagName === "SELECT") return;

      if (el.tagName === "INPUT") {
        const input = el as HTMLInputElement;
        const t = input.type;
        if (
          t === "text" ||
          t === "search" ||
          t === "email" ||
          t === "tel" ||
          t === "url" ||
          t === "number" ||
          t === "password"
        ) {
          return;
        }
      }

      e.preventDefault();
      handleNext();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [canAdvance, handleNext]);

  useEffect(() => {
    return () => {
      if (resultsTimerRef.current) {
        clearTimeout(resultsTimerRef.current);
        resultsTimerRef.current = null;
      }
    };
  }, []);

  if (showResults) {
    return (
      <div className="flex min-h-0 w-full flex-1 flex-col">
        <ResultsOverlay
          priceRange={finalRange}
          breakdownItems={finalBreakdown}
          currency={currency}
          onClose={() => setShowResults(false)}
        />
      </div>
    );
  }

  const stepSelectors = (
    <>
      {step.type === "cards" && step.options && (
        <CardSelector
          stepId={step.id}
          options={step.options as CardOption[]}
          selectedId={
            selections[step.id] != null ? String(selections[step.id]) : null
          }
          onSelect={handleSelect}
        />
      )}

      {step.type === "pills" && step.options && (
        <PillSelector
          stepId={step.id}
          options={step.options as PillOption[]}
          selectedIds={
            Array.isArray(selections[step.id])
              ? (selections[step.id] as string[])
              : []
          }
          onToggle={handlePillToggle}
        />
      )}

      {step.type === "slider" && step.sliderConfig && (
        <SliderSelector
          stepId={step.id}
          config={step.sliderConfig}
          value={
            typeof selections[step.id] === "number"
              ? (selections[step.id] as number)
              : step.sliderConfig.min
          }
          onChange={handleSelect}
          onEnterAdvance={() => {
            if (canAdvance) handleNext();
          }}
        />
      )}
    </>
  );

  return (
    <section
      id="price-calculator"
      aria-label="Preisrechner"
      className={`box-border flex w-full flex-col pt-[clamp(0.65rem,1.5vw,1rem)] ${onOverlayClose ? "h-full min-h-0 overflow-hidden" : "overflow-visible md:min-h-[90vh]"}`}
    >
      {/* Header: im Overlay eine Zeile — Reset | Indikator (mittig) | Schließen */}
      <div
        id="price-calculator-header"
        className="flex w-full shrink-0 flex-col gap-[clamp(0.45rem,0.9vw,0.65rem)]"
      >
        <div
          className={`flex w-full px-[clamp(0.8rem,2vw,1.4rem)] ${onOverlayClose ? "" : "items-center justify-between"}`}
        >
          {onOverlayClose ? (
            <div className="flex w-full items-center justify-between gap-2">
              <button
                id="price-calculator-reset-button"
                type="button"
                onClick={handleReset}
                aria-label="Preisrechner zurücksetzen"
                className="inline-flex size-8 shrink-0 items-center justify-center text-[var(--foreground)] transition-opacity duration-200 hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--foreground)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="size-[clamp(1rem,1.8vw,1.2rem)]"
                  aria-hidden="true"
                >
                  <path
                    d="M20 11a8 8 0 1 1-2.34-5.66"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                  <path
                    d="M20 4v5h-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              <div className="flex min-w-0 flex-1 justify-center">
                <StepIndicator
                  totalSteps={steps.length}
                  currentStep={currentStep}
                  visitedSteps={visitedSteps}
                  onStepSelect={handleStepSelect}
                />
              </div>
              <button
                type="button"
                onClick={onOverlayClose}
                aria-label="Preisrechner schließen"
                className={overlayCloseButtonClass}
              >
                ×
              </button>
            </div>
          ) : (
            <>
              <StepIndicator
                totalSteps={steps.length}
                currentStep={currentStep}
                visitedSteps={visitedSteps}
                onStepSelect={handleStepSelect}
              />
              <button
                id="price-calculator-reset-button"
                type="button"
                onClick={handleReset}
                aria-label="Preisrechner zurücksetzen"
                className="inline-flex size-8 shrink-0 items-center justify-center text-[var(--foreground)] transition-opacity duration-200 hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--foreground)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="size-[clamp(1rem,1.8vw,1.2rem)]"
                  aria-hidden="true"
                >
                  <path
                    d="M20 11a8 8 0 1 1-2.34-5.66"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                  <path
                    d="M20 4v5h-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </>
          )}
        </div>

        {/* Progress bar */}
        <div className="relative h-[2px] w-full overflow-hidden rounded-full bg-[rgba(255,255,227,0.1)]">
          <div
            className="price-calc-progress-fill absolute left-0 top-0 h-full rounded-full bg-[var(--foreground)]"
            style={{ width: `${progress}%` }}
            role="progressbar"
            aria-valuenow={Math.round(progress)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Fortschritt: ${Math.round(progress)}%`}
          />
        </div>

        {/* Step label */}
        <p className="px-[clamp(0.8rem,2vw,1.4rem)] text-[clamp(0.58rem,0.85vw,0.7rem)] font-medium tracking-[0.06em] text-[rgba(255,255,227,0.38)]">
          Schritt {currentStep + 1} von {steps.length}
        </p>
      </div>

      <div
        id="price-calculator-scroll"
        className={
          onOverlayClose
            ? "flex min-h-0 w-full flex-1 flex-col overflow-hidden"
            : "flex min-h-0 flex-1 flex-col overflow-visible"
        }
      >
        <div
          className={`flex w-full flex-col justify-start gap-[clamp(0.85rem,2.2vw,1.35rem)] px-[clamp(0.8rem,2vw,1.4rem)] pt-[clamp(0.25rem,0.8vw,0.45rem)] pb-[clamp(0.35rem,1vw,0.65rem)] ${onOverlayClose ? "min-h-0 flex-1 overflow-hidden" : "h-full min-h-full flex-1"}`}
        >
          {/* Price display */}
          <div
            className={`flex w-full shrink-0 flex-col items-center gap-[clamp(0.65rem,1.5vw,1.1rem)] ${onOverlayClose ? "mx-auto max-w-[clamp(36rem,65vw,52rem)]" : "max-w-[clamp(36rem,65vw,52rem)]"}`}
          >
            <AnimatedPriceDisplay
              range={priceRange}
              currency={currency}
              boostKey={boostKey}
              breakdownItems={breakdownItems}
            />
            <hr className="w-[clamp(6rem,12vw,10rem)] border-t border-[rgba(255,255,227,0.15)]" />
          </div>

          {/* Schritt: äußerer Slot mit fester Flex-Höhe; innen Gruppe mit margin-block auto */}
          <div
            key={`step-${currentStep}`}
            id="price-calculator-step-content"
            className="price-calc-step-enter flex min-h-0 w-full flex-1 flex-col items-center overflow-hidden"
          >
            <div
              id="price-calculator-step-group"
              className="my-auto mx-auto flex w-full max-w-[clamp(36rem,65vw,52rem)] min-h-0 max-h-full flex-col items-center gap-[clamp(1rem,2.2vw,1.5rem)] overflow-hidden self-center"
            >
              <h2
                id={`price-calculator-question-${step.id}`}
                className="w-full shrink-0 text-center text-[clamp(1.1rem,2vw,1.4rem)] font-semibold text-[var(--foreground)]"
              >
                {step.question}
              </h2>

              {step.description && (
                <p
                  id={`price-calculator-description-${step.id}`}
                  className="max-w-[clamp(24rem,50vw,38rem)] shrink-0 self-center text-center text-[clamp(0.8rem,1.2vw,0.95rem)] leading-relaxed text-[rgba(255,255,227,0.41)]"
                >
                  {step.description}
                </p>
              )}

              {onOverlayClose ? (
                <div
                  id="price-calculator-options-scroll"
                  className="flex min-h-0 w-full min-w-0 flex-1 flex-col self-stretch overflow-y-auto overflow-x-hidden overscroll-y-contain [-webkit-overflow-scrolling:touch] max-sm:px-[clamp(0.5rem,3.5vw,0.85rem)]"
                >
                  <div className="flex w-full min-h-min flex-col">
                    {stepSelectors}
                  </div>
                </div>
              ) : (
                <div className="w-full min-w-0 self-stretch max-sm:px-[clamp(0.5rem,3.5vw,0.85rem)]">
                  {stepSelectors}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation — gleiches horizontales Padding wie Header / Scroll-Bereich */}
      <div
        id="price-calculator-navigation-wrap"
        className="w-full shrink-0 border-t border-[rgba(255,255,227,0.06)] px-[clamp(0.8rem,2vw,1.4rem)] pb-[clamp(0.65rem,1.8vw,1rem)] pt-[clamp(0.75rem,2vw,1.15rem)]"
      >
        <StepNavigation
          currentStep={currentStep}
          totalSteps={steps.length}
          finalLabel={finalButtonLabel}
          disableNext={!canAdvance || pendingResults}
          finalButtonPending={pendingResults}
          onBack={handleBack}
          onNext={handleNext}
          onSkip={handleSkip}
        />
      </div>
    </section>
  );
}
