"use client";

import { useId, useCallback, useEffect, useState } from "react";
import type { SliderConfig } from "./types";

type SliderSelectorProps = {
  stepId: string;
  config: SliderConfig;
  value: number;
  onChange: (value: number) => void;
  /** Nach Enter im Zahlenfeld: einen Schritt weiter (wenn erlaubt). */
  onEnterAdvance?: () => void;
};

function getFineStep(min: number, max: number, configStep: number): number {
  const span = max - min;
  if (span <= 0) return Math.max(configStep, 1e-6);
  return Math.max(Math.min(configStep, span / 200), span / 5000, 1e-6);
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

function snapToStep(n: number, min: number, max: number, step: number): number {
  if (step <= 0) return clamp(n, min, max);
  const k = Math.round((n - min) / step);
  return clamp(min + k * step, min, max);
}

function valueFromClientX(
  clientX: number,
  rect: DOMRect,
  min: number,
  max: number,
  fineStep: number,
): number {
  const ratio = clamp((clientX - rect.left) / rect.width, 0, 1);
  const raw = min + ratio * (max - min);
  const stepped = Math.round(raw / fineStep) * fineStep;
  return clamp(stepped, min, max);
}

/** Immer ganze Zahlen ohne Dezimalstellen (de-DE). */
function formatSliderNumber(n: number): string {
  return Math.round(n).toLocaleString("de-DE");
}

function toWhole(n: number, min: number, max: number): number {
  return Math.round(clamp(n, min, max));
}

export function SliderSelector({
  stepId,
  config,
  value,
  onChange,
  onEnterAdvance,
}: SliderSelectorProps) {
  const sliderId = useId();
  const manualId = useId();
  const manualHintId = `price-calculator-slider-manual-hint-${stepId}`;
  const {
    min,
    max,
    step: configStep,
    unit = "€",
    averageValue,
    averageLabel = "Durchschnitt",
  } = config;

  const whole = Math.round(clamp(value, min, max));

  const [manualDraft, setManualDraft] = useState(() =>
    String(Math.round(value)),
  );

  useEffect(() => {
    setManualDraft(String(Math.round(value)));
  }, [value]);

  useEffect(() => {
    if (whole !== value) onChange(whole);
  }, [value, whole, onChange]);

  const fineStep = getFineStep(min, max, configStep);
  const span = max - min || 1;
  const pct = ((whole - min) / span) * 100;
  const avgPct =
    averageValue != null ? ((averageValue - min) / span) * 100 : null;

  const applySliderValue = useCallback(
    (v: number) => {
      onChange(toWhole(v, min, max));
    },
    [min, max, onChange],
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLInputElement>) => {
      const el = e.currentTarget;
      const rect = el.getBoundingClientRect();
      if (rect.width <= 0) return;
      const next = toWhole(
        valueFromClientX(e.clientX, rect, min, max, fineStep),
        min,
        max,
      );
      if (next !== whole) applySliderValue(next);
    },
    [min, max, fineStep, whole, applySliderValue],
  );

  const syncSliderFromElement = useCallback(
    (el: HTMLInputElement) => {
      const next = Number(el.value);
      if (Number.isFinite(next)) applySliderValue(next);
    },
    [applySliderValue],
  );

  const commitManual = useCallback(() => {
    const normalized = manualDraft.replace(",", ".").trim();
    const n = Number(normalized);
    if (!Number.isFinite(n)) {
      setManualDraft(String(Math.round(value)));
      return;
    }
    const snapped = snapToStep(n, min, max, configStep);
    applySliderValue(snapped);
  }, [manualDraft, min, max, configStep, value, applySliderValue]);

  const handleManualKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key !== "Enter") return;
      e.preventDefault();
      commitManual();
      onEnterAdvance?.();
      (e.target as HTMLInputElement).blur();
    },
    [commitManual, onEnterAdvance],
  );

  const rangeAriaLabel = [
    "Wert einstellen",
    `Bereich ${formatSliderNumber(min)} bis ${formatSliderNumber(max)}${unit ? ` ${unit}` : ""}`,
    averageValue != null
      ? `${averageLabel}: ${formatSliderNumber(averageValue)}${unit}`
      : null,
  ]
    .filter(Boolean)
    .join(". ");

  return (
    <div
      id={`price-calculator-slider-${stepId}`}
      className="flex w-full flex-col items-center gap-[clamp(1rem,2vw,1.5rem)]"
    >
      <output
        htmlFor={sliderId}
        id={`price-calculator-slider-value-${stepId}`}
        className="text-center text-[clamp(2rem,5vw,3.2rem)] font-semibold leading-none text-[var(--foreground)]"
        aria-live="polite"
      >
        {formatSliderNumber(whole)}
        {unit}
      </output>

      <div className="flex w-full max-w-[min(40rem,100%)] flex-col gap-[clamp(0.35rem,0.7vw,0.5rem)]">
        <div className="flex w-full items-center gap-[clamp(0.75rem,1.5vw,1.25rem)]">
          <div className="relative min-w-0 flex-1 py-1 pb-6 [touch-action:pan-x]">
            <div
              id={`price-calculator-slider-track-${stepId}`}
              className="pointer-events-none absolute left-0 right-0 top-1/2 h-[10px] -translate-y-1/2 rounded-full bg-[rgba(255,255,227,0.1)]"
              aria-hidden="true"
            />
            <div
              className="pointer-events-none absolute left-0 top-1/2 h-[10px] -translate-y-1/2 rounded-full bg-[var(--foreground)]"
              style={{
                width: `${pct}%`,
                opacity: 0.28,
                boxShadow: "0 0 12px rgba(255,255,227,0.15)",
              }}
              aria-hidden="true"
            />

            {averageValue != null && avgPct != null && (
              <div
                id={`price-calculator-slider-avg-${stepId}`}
                className="pointer-events-none absolute left-0 top-1/2 z-[6] flex -translate-x-1/2 flex-col items-center"
                style={{ left: `${avgPct}%` }}
                aria-hidden="true"
              >
                <div className="h-[10px] w-[2px] shrink-0 -translate-y-1/2 rounded-full bg-[rgba(255,255,227,0.55)] shadow-[0_0_6px_rgba(255,255,227,0.25)]" />
                <span className="mt-1 whitespace-nowrap text-[clamp(0.54rem,0.76vw,0.64rem)] font-medium text-[rgba(255,255,227,0.4)]">
                  {averageLabel}
                </span>
              </div>
            )}

            <input
              id={sliderId}
              type="range"
              min={min}
              max={max}
              step={fineStep}
              value={whole}
              onPointerDown={handlePointerDown}
              onInput={(e) =>
                syncSliderFromElement(e.currentTarget as HTMLInputElement)
              }
              onChange={(e) => syncSliderFromElement(e.currentTarget)}
              aria-valuemin={min}
              aria-valuemax={max}
              aria-valuenow={whole}
              aria-label={rangeAriaLabel}
              className="price-calculator-range-input relative z-10 h-11 w-full cursor-pointer appearance-none bg-transparent"
              style={
                {
                  "--thumb-pct": `${pct}%`,
                } as React.CSSProperties
              }
            />
          </div>

          <div className="flex shrink-0 flex-col gap-[clamp(0.15rem,0.3vw,0.2rem)]">
            <label
              htmlFor={manualId}
              className="text-[clamp(0.48rem,0.68vw,0.56rem)] font-medium uppercase tracking-[0.08em] text-[rgba(255,255,227,0.38)]"
            >
              Direkt
            </label>
            <div className="flex items-center gap-[clamp(0.25rem,0.5vw,0.35rem)]">
              <input
                id={manualId}
                data-price-calculator-manual-value=""
                type="text"
                inputMode="decimal"
                autoComplete="off"
                value={manualDraft}
                onChange={(e) => setManualDraft(e.target.value)}
                onBlur={commitManual}
                onKeyDown={handleManualKeyDown}
                className="w-[clamp(4.5rem,12vw,6.5rem)] rounded-[0.55rem] border border-[rgba(255,255,227,0.2)] bg-[rgba(255,255,227,0.05)] px-[clamp(0.45rem,0.85vw,0.6rem)] py-[clamp(0.45rem,0.8vw,0.55rem)] text-right text-[clamp(0.8rem,1.15vw,0.95rem)] tabular-nums text-[var(--foreground)] outline-none transition-colors focus:border-[rgba(255,255,227,0.48)] focus:bg-[rgba(255,255,227,0.08)] focus:ring-2 focus:ring-[rgba(255,255,227,0.12)]"
                aria-describedby={manualHintId}
              />
              {unit !== "" && (
                <span className="text-[clamp(0.72rem,1vw,0.88rem)] text-[rgba(255,255,227,0.45)]">
                  {unit}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex w-full max-w-[min(40rem,100%)] items-center justify-between px-[clamp(0.15rem,0.3vw,0.2rem)] text-[clamp(0.52rem,0.75vw,0.64rem)] tabular-nums text-[rgba(255,255,227,0.35)]">
          <span>
            Min. {formatSliderNumber(min)}
            {unit}
          </span>
          <span>
            Max. {formatSliderNumber(max)}
            {unit}
          </span>
        </div>
      </div>

      <p className="sr-only" id={manualHintId}>
        Nach Eingabe: Enter übernimmt den Wert und geht weiter. Schrittweite
        beim Verlassen des Feldes: {configStep}. Bereich {min} bis {max}.
      </p>
    </div>
  );
}
