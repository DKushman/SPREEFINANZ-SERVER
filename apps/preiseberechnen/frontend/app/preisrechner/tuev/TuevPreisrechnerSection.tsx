"use client";

import { PriceCalculator } from "@/app/components/PriceCalculator/PriceCalculator";
import {
  tuevPreisrechnerInitialRange,
  tuevPreisrechnerSteps,
} from "./tuevPreisrechnerSteps";

export function TuevPreisrechnerSection() {
  return (
    <section
      id="tuev-kosten-section"
      className="mt-[clamp(1.75rem,4vh,2.75rem)] w-[calc(100%+4vh)] mx-[-2vh] overflow-hidden"
      aria-labelledby="tuev-preisrechner-heading"
    >
      <div
        id="tuev-preisrechner-container"
        className="px-[2vh] pb-[clamp(2rem,5vw,3rem)] pt-[clamp(0.25rem,1vh,0.75rem)]"
      >
        <h2
          id="tuev-preisrechner-heading"
          className="w-full text-[clamp(1.85rem,4.2vw,2.75rem)] font-semibold leading-[1.08] tracking-[-0.02em]"
        >
          TÜV-Preisrechner
        </h2>
        <p
          id="tuev-preisrechner-subtitle"
          className="mt-[clamp(0.45rem,1vw,0.65rem)] w-full text-[clamp(0.9rem,1.45vw,1.05rem)] leading-[1.5] text-[rgba(255,255,227,0.55)]"
        >
          Fahrzeug, Frist, Region, Prüfer und mehr – deine Preisspanne in
          unter einer Minute. Unverbindlich, ohne Anmeldung.
        </p>

        <div
          id="tuev-preisrechner-calculator-wrap"
          className="mt-[clamp(1.25rem,3vw,2rem)] overflow-x-auto rounded-[clamp(1rem,2vw,1.5rem)] border border-[rgba(255,255,227,0.14)] bg-[rgba(255,255,227,0.04)] shadow-[0_24px_60px_rgba(0,0,0,0.35)]"
        >
          <div className="flex min-h-0 min-w-[min(100%,20rem)] flex-1 flex-col">
            <PriceCalculator
              steps={tuevPreisrechnerSteps}
              initialRange={tuevPreisrechnerInitialRange}
              currency="€"
              finalButtonLabel="Ergebnis"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
