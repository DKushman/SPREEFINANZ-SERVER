import type { Metadata } from "next";
import { FaqSection } from "../components/FaqSection";
import { RechnerVorlageClient } from "./RechnerVorlageClient";

export const metadata: Metadata = {
  title: "Preisrechner – Vorlage",
  description:
    "Wiederverwendbare Preisrechner-Vorlage mit konfigurierbaren Schritten.",
};

export default function RechnerVorlagePage() {
  return (
    <main
      id="rechner-vorlage-main"
      className="flex min-h-[70vh] items-center justify-center py-[clamp(3rem,6vh,5rem)]"
    >
      <div className="w-full max-w-[min(78rem,96vw)] overflow-hidden rounded-[clamp(1.25rem,2.2vw,2.75rem)] border border-[rgba(255,255,227,0.18)] bg-[var(--background)] shadow-[0_36px_80px_rgba(0,0,0,0.56)]">
        <RechnerVorlageClient />
      </div>

      <FaqSection />
    </main>
  );
}
