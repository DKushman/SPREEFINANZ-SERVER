"use client";

import { useState, useEffect } from "react";
import type { PillOption } from "./types";

type PillSelectorProps = {
  stepId: string;
  options: PillOption[];
  selectedIds: string[];
  onToggle: (id: string) => void;
};

export function PillSelector({
  stepId,
  options,
  selectedIds,
  onToggle,
}: PillSelectorProps) {
  const [popId, setPopId] = useState<string | null>(null);

  useEffect(() => {
    if (!popId) return;
    const timer = setTimeout(() => setPopId(null), 360);
    return () => clearTimeout(timer);
  }, [popId]);

  const handleToggle = (id: string) => {
    setPopId(id);
    onToggle(id);
  };

  return (
    <fieldset
      id={`price-calculator-pills-${stepId}`}
      className="flex flex-col gap-[clamp(0.5rem,1vw,0.75rem)]"
    >
      <legend className="sr-only">Optionen auswählen</legend>
      <div className="flex flex-wrap items-center justify-center gap-[clamp(0.5rem,1vw,0.75rem)]">
        {options.map((option) => {
          const isActive = selectedIds.includes(option.id);
          const isPop = popId === option.id;
          return (
            <label
              key={option.id}
              id={`price-calculator-pill-${stepId}-${option.id}`}
              className={`flex cursor-pointer touch-manipulation items-center gap-[clamp(0.5rem,0.9vw,0.7rem)] rounded-full border px-[clamp(0.9rem,1.6vw,1.2rem)] py-[clamp(0.45rem,0.8vw,0.6rem)] transition-[border,box-shadow,background-color] duration-200 ${isPop ? "price-calc-card-pop" : ""} ${
                isActive
                  ? "border-[var(--foreground)] bg-[rgba(255,255,227,0.06)] shadow-[0_0_12px_rgba(255,255,227,0.05)]"
                  : "border-[rgba(255,255,227,0.22)] bg-transparent hover:border-[rgba(255,255,227,0.4)]"
              }`}
            >
              <input
                type="checkbox"
                name={`step-${stepId}-${option.id}`}
                value={option.id}
                checked={isActive}
                onChange={() => handleToggle(option.id)}
                className="sr-only"
              />
              <span
                className={`flex size-[clamp(0.6rem,1.1vw,0.8rem)] items-center justify-center rounded-full border transition-all duration-200 ${
                  isActive
                    ? "border-[var(--foreground)] bg-[var(--foreground)]"
                    : "border-[rgba(255,255,227,0.4)] bg-transparent"
                }`}
                aria-hidden="true"
              >
                {isActive && (
                  <svg
                    viewBox="0 0 16 16"
                    className="size-[0.55em] text-[var(--background)]"
                  >
                    <path
                      d="M4 8.5L7 11L12 5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </span>
              <span className="text-[clamp(0.8rem,1.3vw,0.95rem)] font-normal text-[var(--foreground)]">
                {option.label}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
