"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { PriceCalculator } from "@/app/components/PriceCalculator/PriceCalculator";
import {
  tuevPreisrechnerInitialRange,
  tuevPreisrechnerSteps,
} from "@/app/preisrechner/tuev/tuevPreisrechnerSteps";

type TuevPreisrechnerOverlayContextValue = {
  openPreisrechner: () => void;
};

const TuevPreisrechnerOverlayContext =
  createContext<TuevPreisrechnerOverlayContextValue | null>(null);

export function useOpenTuevPreisrechner() {
  const ctx = useContext(TuevPreisrechnerOverlayContext);
  if (!ctx) {
    throw new Error(
      "useOpenTuevPreisrechner must be used within TuevPreisrechnerOverlayProvider",
    );
  }
  return ctx.openPreisrechner;
}

export function TuevPreisrechnerOverlayProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const close = useCallback(() => setIsOpen(false), []);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, close]);

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  return (
    <TuevPreisrechnerOverlayContext.Provider
      value={{ openPreisrechner: () => setIsOpen(true) }}
    >
      {children}
      {isOpen && (
        <div
          id="tuev-preisrechner-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="TÜV-Preisrechner"
          className="fixed inset-0 z-[10200] flex items-center justify-center bg-[#010801] px-[clamp(0.75rem,2vw,1.25rem)]"
          onClick={close}
        >
          <div
            id="tuev-preisrechner-calculator-wrap"
            className="flex h-[90vh] max-h-[90vh] min-h-0 w-full max-w-[min(78rem,96vw)] flex-col overflow-hidden rounded-[clamp(1rem,2vw,1.5rem)] border border-[rgba(255,255,227,0.14)] bg-[rgba(255,255,227,0.04)] px-[clamp(0.25rem,1vw,0.5rem)] pb-[clamp(0.5rem,1.5vw,1rem)] pt-[clamp(0.25rem,0.75vw,0.5rem)] shadow-[0_24px_60px_rgba(0,0,0,0.35)]"
            onClick={(e) => e.stopPropagation()}
          >
            <PriceCalculator
              steps={tuevPreisrechnerSteps}
              initialRange={tuevPreisrechnerInitialRange}
              currency="€"
              finalButtonLabel="Ergebnis"
              onOverlayClose={close}
            />
          </div>
        </div>
      )}
    </TuevPreisrechnerOverlayContext.Provider>
  );
}
