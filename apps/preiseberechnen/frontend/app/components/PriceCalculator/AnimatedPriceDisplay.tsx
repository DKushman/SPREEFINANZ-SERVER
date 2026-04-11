"use client";

import { useEffect, useCallback, useMemo, useState } from "react";
import { ParticleNetwork } from "./ParticleNetwork";

type AnimatedPriceDisplayProps = {
  range: [number, number];
  currency?: string;
  boostKey: number;
  breakdownItems: Array<{ label: string; range: [number, number] }>;
};

function formatPrice(value: number, currency: string): string {
  return `${currency}${value.toLocaleString("de-DE")}`;
}
function formatPriceTrailing(value: number, currency: string): string {
  return `${value.toLocaleString("de-DE")}${currency}`;
}
function formatRangeTrailing(
  valueRange: [number, number],
  currency: string,
): string {
  return `${formatPriceTrailing(valueRange[0], currency)}–${formatPriceTrailing(valueRange[1], currency)}`;
}

export function AnimatedPriceDisplay({
  range,
  currency = "€",
  boostKey,
  breakdownItems,
}: AnimatedPriceDisplayProps) {
  const formatted =
    range[0] === 0 && range[1] === 0
      ? `0${currency}`
      : `${formatPrice(range[0], currency)}–${formatPrice(range[1], currency)}`;

  const [currentText, setCurrentText] = useState(formatted);
  const [animKey, setAnimKey] = useState(0);
  const [infoOpen, setInfoOpen] = useState(false);

  const closeInfo = useCallback(() => setInfoOpen(false), []);

  useEffect(() => {
    if (!infoOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeInfo();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [infoOpen, closeInfo]);

  useEffect(() => {
    if (formatted === currentText) return;
    setCurrentText(formatted);
    setAnimKey((k) => k + 1);
  }, [formatted, currentText]);

  const breakdownRows = useMemo(() => breakdownItems, [breakdownItems]);
  const totalMin = breakdownRows.reduce((s, r) => s + r.range[0], 0);
  const totalMax = breakdownRows.reduce((s, r) => s + r.range[1], 0);

  return (
    <output
      id="price-calculator-price-display"
      className="relative flex w-[clamp(15rem,38vw,24rem)] items-baseline justify-center overflow-visible text-center font-semibold text-[clamp(2.4rem,6vw,3.6rem)] leading-none text-[var(--foreground)]"
    >
      <span
        id="price-calculator-price-network"
        className="pointer-events-none absolute left-1/2 top-1/2 block h-[clamp(2.8rem,6vw,3.9rem)] w-[clamp(2.8rem,6vw,3.9rem)] -translate-x-1/2 -translate-y-1/2"
        aria-hidden="true"
      >
        <ParticleNetwork boostKey={boostKey} />
      </span>
      <span
        id="price-calculator-price-value"
        className="relative z-10 inline-flex items-center gap-[clamp(0.35rem,0.8vw,0.55rem)]"
        aria-live="polite"
        aria-atomic="true"
      >
        <span
          key={`bounce-${animKey}`}
          className="block whitespace-nowrap price-calc-bounce"
          style={{ height: "1.15em" }}
        >
          {currentText}
        </span>
        <button
          id="price-calculator-price-info"
          type="button"
          onClick={() => setInfoOpen(true)}
          className="relative inline-flex size-[clamp(1rem,2vw,1.2rem)] shrink-0 cursor-pointer items-center justify-center rounded-full border border-[rgba(255,255,227,0.45)] bg-[rgba(255,255,227,0.08)] text-[clamp(0.62rem,1vw,0.72rem)] font-semibold text-[var(--foreground)]"
          aria-label="Informationen zur Preisberechnung anzeigen"
          aria-haspopup="dialog"
          aria-expanded={infoOpen}
        >
          i
        </button>
      </span>
      {infoOpen && (
        <div
          id="price-calculator-price-info-dialog"
          role="dialog"
          aria-modal="true"
          aria-label="Preisaufschlüsselung"
          className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(1,8,1,0.72)] p-4 backdrop-blur-[4px]"
          onClick={closeInfo}
        >
          <div
            className="price-calc-info-panel relative flex w-full max-w-[min(30rem,94vw)] flex-col gap-[clamp(0.7rem,1.3vw,1rem)] rounded-[1.1rem] border border-[rgba(255,255,227,0.16)] bg-[rgba(3,15,3,0.97)] px-[clamp(1.2rem,2.2vw,1.6rem)] pb-[clamp(1.2rem,2vw,1.5rem)] pt-[clamp(1.4rem,2.4vw,1.8rem)] text-left shadow-[0_24px_60px_rgba(0,0,0,0.5)]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={closeInfo}
              className="absolute right-[clamp(0.7rem,1.3vw,0.9rem)] top-[clamp(0.7rem,1.3vw,0.9rem)] inline-flex size-7 items-center justify-center rounded-full text-[0.92rem] leading-none text-[rgba(255,255,227,0.6)] transition-colors hover:bg-[rgba(255,255,227,0.08)] hover:text-[rgba(255,255,227,0.9)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--foreground)]"
              aria-label="Dialog schließen"
            >
              ×
            </button>

            <div className="flex flex-col gap-[clamp(0.15rem,0.3vw,0.2rem)]">
              <h3 className="text-[clamp(0.92rem,1.5vw,1.15rem)] font-semibold text-[var(--foreground)]">
                Preisaufschlüsselung
              </h3>
              <p className="text-[clamp(0.6rem,0.88vw,0.72rem)] text-[rgba(255,255,227,0.46)]">
                Basierend auf deiner aktuellen Auswahl
              </p>
            </div>

            {breakdownRows.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-[clamp(1rem,2vw,1.5rem)] text-center">
                <span className="text-[1.5rem]" aria-hidden="true">🧮</span>
                <p className="text-[clamp(0.72rem,1.05vw,0.86rem)] text-[rgba(255,255,227,0.52)]">
                  Noch keine Auswahl getroffen.
                </p>
                <p className="text-[clamp(0.6rem,0.82vw,0.68rem)] text-[rgba(255,255,227,0.34)]">
                  Wähle eine Option aus, um die Aufschlüsselung zu sehen.
                </p>
              </div>
            ) : (
              <table className="w-full text-[clamp(0.72rem,1.1vw,0.88rem)]">
                <thead>
                  <tr className="border-b border-[rgba(255,255,227,0.12)] text-[clamp(0.56rem,0.78vw,0.64rem)] font-medium uppercase tracking-[0.06em] text-[rgba(255,255,227,0.38)]">
                    <th className="pb-[clamp(0.25rem,0.45vw,0.35rem)] text-left font-medium">
                      Leistung
                    </th>
                    <th className="pb-[clamp(0.25rem,0.45vw,0.35rem)] text-right font-medium">
                      Min
                    </th>
                    <th className="pb-[clamp(0.25rem,0.45vw,0.35rem)] text-right font-medium">
                      Max
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {breakdownRows.map((row, idx) => (
                    <tr
                      key={`${row.label}-${row.range[0]}-${row.range[1]}`}
                      className={`border-b border-[rgba(255,255,227,0.07)] ${idx % 2 === 1 ? "bg-[rgba(255,255,227,0.015)]" : ""}`}
                    >
                      <td className="py-[clamp(0.35rem,0.6vw,0.48rem)] text-[rgba(255,255,227,0.68)]">
                        {row.label}
                      </td>
                      <td className="py-[clamp(0.35rem,0.6vw,0.48rem)] text-right tabular-nums text-[rgba(255,255,227,0.78)]">
                        {formatPriceTrailing(row.range[0], currency)}
                      </td>
                      <td className="py-[clamp(0.35rem,0.6vw,0.48rem)] text-right tabular-nums text-[rgba(255,255,227,0.78)]">
                        {formatPriceTrailing(row.range[1], currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="text-[clamp(0.82rem,1.25vw,1rem)] font-semibold text-[var(--foreground)]">
                    <td className="pt-[clamp(0.4rem,0.7vw,0.55rem)]">Gesamt</td>
                    <td className="pt-[clamp(0.4rem,0.7vw,0.55rem)] text-right tabular-nums">
                      {formatPriceTrailing(totalMin, currency)}
                    </td>
                    <td className="pt-[clamp(0.4rem,0.7vw,0.55rem)] text-right tabular-nums">
                      {formatPriceTrailing(totalMax, currency)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            )}

            <p className="text-[clamp(0.5rem,0.68vw,0.58rem)] text-[rgba(255,255,227,0.28)]">
              Die endgültigen Kosten können je nach Anforderung variieren.
            </p>
          </div>
        </div>
      )}
    </output>
  );
}
