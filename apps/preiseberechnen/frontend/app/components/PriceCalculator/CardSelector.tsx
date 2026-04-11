"use client";

import { useState, useEffect } from "react";
import type { CardOption } from "./types";

type CardSelectorProps = {
  stepId: string;
  options: CardOption[];
  selectedId: string | null;
  onSelect: (id: string) => void;
};

export function CardSelector({
  stepId,
  options,
  selectedId,
  onSelect,
}: CardSelectorProps) {
  const [popId, setPopId] = useState<string | null>(null);

  useEffect(() => {
    if (!popId) return;
    const timer = setTimeout(() => setPopId(null), 360);
    return () => clearTimeout(timer);
  }, [popId]);

  const handleSelect = (id: string) => {
    setPopId(id);
    onSelect(id);
  };

  return (
    <fieldset
      id={`price-calculator-cards-${stepId}`}
      className="flex flex-col gap-[clamp(0.75rem,1.5vw,1rem)]"
    >
      <legend className="sr-only">Optionen auswählen</legend>
      <div className="grid grid-cols-1 gap-[clamp(0.75rem,1.5vw,1rem)] pt-[clamp(0.65rem,1.35vw,0.95rem)] sm:grid-cols-2 lg:grid-cols-3">
        {options.map((option) => {
          const isActive = selectedId === option.id;
          const isPop = popId === option.id;
          return (
            <label
              key={option.id}
              id={`price-calculator-card-${stepId}-${option.id}`}
              className={`relative flex cursor-pointer touch-manipulation flex-col items-center gap-[clamp(0.3rem,0.6vw,0.5rem)] rounded-[clamp(1rem,2vw,1.3rem)] border px-[clamp(1rem,2vw,1.5rem)] py-[clamp(1.1rem,2.2vw,1.6rem)] transition-[border,box-shadow,background-color] duration-200 ${isPop ? "price-calc-card-pop" : ""} ${
                isActive
                  ? "border-[var(--foreground)] bg-[rgba(255,255,227,0.05)] shadow-[0_0_20px_rgba(255,255,227,0.06)]"
                  : "border-[rgba(255,255,227,0.22)] bg-[var(--background)] hover:border-[rgba(255,255,227,0.4)] hover:bg-[rgba(255,255,227,0.02)]"
              }`}
            >
              <input
                type="radio"
                name={`step-${stepId}`}
                value={option.id}
                checked={isActive}
                onChange={() => handleSelect(option.id)}
                className="sr-only"
              />

              {isActive && (
                <span
                  className="absolute right-[clamp(0.6rem,1.2vw,0.85rem)] top-[clamp(0.6rem,1.2vw,0.85rem)] flex size-[clamp(1.1rem,1.8vw,1.3rem)] items-center justify-center rounded-full bg-[var(--foreground)]"
                  aria-hidden="true"
                >
                  <svg
                    viewBox="0 0 16 16"
                    className="size-[0.55em] text-[var(--background)]"
                  >
                    <path
                      d="M3.5 8.5L6.5 11.5L12.5 4.5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              )}

              {option.badge && (
                <span className="absolute left-[clamp(0.75rem,1.5vw,1rem)] top-[clamp(0.35rem,0.7vw,0.5rem)] rounded-full bg-[var(--foreground)] px-[clamp(0.5rem,1vw,0.75rem)] py-[clamp(0.1rem,0.2vw,0.15rem)] text-[clamp(0.55rem,0.9vw,0.65rem)] font-normal leading-tight text-[var(--background)]">
                  {option.badge}
                </span>
              )}

              {option.icon && (
                <span
                  className="flex size-[clamp(1.5rem,3vw,2rem)] items-center justify-center text-[var(--foreground)]"
                  aria-hidden="true"
                >
                  {option.icon}
                </span>
              )}

              <span className="text-center text-[clamp(0.85rem,1.4vw,1rem)] font-semibold text-[var(--foreground)]">
                {option.title}
              </span>

              {option.subtitle && (
                <span
                  className={`text-center text-[clamp(0.7rem,1.1vw,0.8rem)] transition-colors duration-200 ${
                    isActive
                      ? "text-[rgba(255,255,227,0.8)]"
                      : "text-[rgba(255,255,227,0.4)]"
                  }`}
                >
                  {option.subtitle}
                </span>
              )}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
