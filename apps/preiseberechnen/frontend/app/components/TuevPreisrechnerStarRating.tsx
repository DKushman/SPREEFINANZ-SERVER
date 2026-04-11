"use client";

import { useState } from "react";

export type TuevPreisrechnerStarRatingProps = {
  /** Eindeutiges Präfix für `id`s (z. B. `price-calculator-results`, `tuev-hero-trust`). */
  idPrefix: string;
  legend: string;
  hintIdle: string;
  hintDone: string;
  className?: string;
  /** Nach Stern-Klick (z. B. für externen „Senden“-Button). */
  onRatingChange?: (rating: number) => void;
};

export function TuevPreisrechnerStarRating({
  idPrefix,
  legend,
  hintIdle,
  hintDone,
  className = "",
  onRatingChange,
}: TuevPreisrechnerStarRatingProps) {
  const [rating, setRating] = useState<number | null>(null);
  const [hover, setHover] = useState<number | null>(null);
  const display = hover ?? rating ?? 0;
  const groupId = `${idPrefix}-star-rating`;

  return (
    <fieldset
      className={`mx-auto w-full max-w-[min(22rem,100%)] border-none p-0 text-center ${className}`}
    >
      <legend className="mb-[clamp(0.45rem,1vw,0.65rem)] block w-full px-1 text-[clamp(0.72rem,1.15vw,0.84rem)] font-medium leading-snug text-[rgba(255,255,227,0.62)]">
        {legend}
      </legend>
      <div
        id={groupId}
        role="group"
        aria-label="Bewertung in Sternen von 1 bis 5"
        className="flex justify-center gap-[clamp(0.15rem,0.9vw,0.4rem)]"
        onPointerLeave={() => setHover(null)}
      >
        {[1, 2, 3, 4, 5].map((n) => {
          const active = display >= n;
          return (
            <button
              key={n}
              type="button"
              id={`${idPrefix}-star-${n}`}
              aria-label={`${n} von 5 Sternen`}
              aria-pressed={rating === n}
              className={`flex min-h-[2.75rem] min-w-[2.75rem] items-center justify-center rounded-lg p-[clamp(0.2rem,0.6vw,0.35rem)] text-[clamp(1.65rem,4.2vw,2.15rem)] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffffe3] focus-visible:ring-offset-2 focus-visible:ring-offset-[#030F03] ${
                active
                  ? "text-[#e8a84a]"
                  : "text-[rgba(255,255,227,0.2)] hover:text-[rgba(255,255,227,0.42)]"
              }`}
              onPointerEnter={() => setHover(n)}
              onClick={() => {
                setRating(n);
                onRatingChange?.(n);
              }}
            >
              <svg viewBox="0 0 20 20" className="size-[1em]" aria-hidden="true">
                <path
                  fill={active ? "currentColor" : "none"}
                  stroke="currentColor"
                  strokeWidth="1.35"
                  strokeLinejoin="round"
                  d="M10 1.5l2.47 5.01 5.53.8-4 3.9.94 5.49L10 14.27 5.06 16.7 6 11.21l-4-3.9 5.53-.8L10 1.5z"
                />
              </svg>
            </button>
          );
        })}
      </div>
      <p
        id={`${idPrefix}-rating-live`}
        className="mt-[clamp(0.35rem,0.8vw,0.5rem)] min-h-[1.1em] text-[clamp(0.62rem,0.95vw,0.72rem)] text-[rgba(255,255,227,0.38)]"
        aria-live="polite"
      >
        {rating != null ? hintDone : hintIdle}
      </p>
    </fieldset>
  );
}
