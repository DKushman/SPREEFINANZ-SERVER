"use client";

import { usePriceCalculatorOverlayToolbar } from "./PriceCalculator/PriceCalculatorOverlayToolbarContext";

const closeButtonClass =
  "inline-flex size-8 shrink-0 items-center justify-center rounded-full border border-[rgba(255,255,227,0.24)] text-[1rem] text-[rgba(255,255,227,0.9)] transition-colors hover:bg-[rgba(255,255,227,0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--foreground)]";

type PriceCalculatorOverlayTopBarProps = {
  onClose: () => void;
};

export function PriceCalculatorOverlayTopBar({
  onClose,
}: PriceCalculatorOverlayTopBarProps) {
  const { onReset } = usePriceCalculatorOverlayToolbar();

  if (!onReset) return null;

  return (
    <div
      role="toolbar"
      aria-label="Preisrechner-Werkzeugleiste"
      className="flex w-full shrink-0 items-center justify-between pl-[clamp(1rem,2vw,1.5rem)] pr-[clamp(1.35rem,3.2vw,2.25rem)] pt-[clamp(1rem,2vw,1.5rem)] pb-[clamp(0.5rem,1.2vw,0.85rem)]"
    >
      <button
        id="price-calculator-reset-button"
        type="button"
        onClick={() => onReset()}
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
      <button
        type="button"
        onClick={onClose}
        aria-label="Preisrechner schließen"
        className={closeButtonClass}
      >
        ×
      </button>
    </div>
  );
}
