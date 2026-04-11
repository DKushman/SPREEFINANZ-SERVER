"use client";

import { useEffect, useCallback, useState } from "react";
import { Button } from "./Button";
import { RechnerVorlageClient } from "../rechner-vorlage/RechnerVorlageClient";
import { PriceCalculatorOverlayToolbarProvider } from "./PriceCalculator/PriceCalculatorOverlayToolbarContext";
import { PriceCalculatorOverlayTopBar } from "./PriceCalculatorOverlayTopBar";

export function PriceCalculatorLauncherOverlay() {
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
    <>
      <Button onClick={() => setIsOpen(true)}>Preisrechner öffnen</Button>

      {isOpen && (
        <div
          id="price-calculator-launcher-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Preisrechner"
          className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(1,8,1,0.78)] p-4"
          onClick={close}
        >
          <div
            className="relative flex h-[min(92vh,58rem)] min-h-0 w-full max-w-[min(78rem,96vw)] flex-col overflow-hidden rounded-[1.25rem] border border-[rgba(255,255,227,0.18)] bg-[var(--background)] pb-[clamp(1rem,2vw,1.5rem)] shadow-[0_36px_80px_rgba(0,0,0,0.56)]"
            onClick={(e) => e.stopPropagation()}
          >
            <PriceCalculatorOverlayToolbarProvider>
              <PriceCalculatorOverlayTopBar onClose={close} />
              <div className="min-h-0 flex-1 overflow-y-auto px-[clamp(1rem,2vw,1.5rem)] pt-[clamp(1rem,2vw,1.5rem)]">
                <div className="flex min-h-full flex-col">
                  <RechnerVorlageClient />
                </div>
              </div>
            </PriceCalculatorOverlayToolbarProvider>
          </div>
        </div>
      )}
    </>
  );
}
