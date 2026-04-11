import type { Metadata } from "next";
import { FaqSection } from "../components/FaqSection";
import type { FaqItem } from "../components/FaqSection";
import { TuevHeroSection } from "./TuevHeroSection";
import { TuevPreisrechnerOverlayProvider } from "./TuevPreisrechnerOverlayProvider";
import { TuevKostenSection } from "./TuevKostenSection";
import { TuevZahlenSection } from "./TuevZahlenSection";
import { TuevZielgruppeSection } from "./TuevZielgruppeSection";
import { TuevVertrauenSection } from "./TuevVertrauenSection";
import { TuevProzessSection } from "./TuevProzessSection";
import { TuevFallstrickeSection } from "./TuevFallstrickeSection";
import { TuevWeitereFragenSection } from "./TuevWeitereFragenSection";
import { TuevAnimations } from "./TuevAnimations";

export const metadata: Metadata = {
  title: "TÜV-Kosten berechnen 2026 – Kostenloser Preisrechner | preiseberechnen.de",
  description:
    "Was kostet dein TÜV wirklich? Berechne die HU- und AU-Kosten für Pkw, Motorrad, Wohnmobil oder Anhänger – kostenlos, anonym, in 60 Sekunden. Aktuelle Preise 2026.",
  openGraph: {
    title: "TÜV-Kosten berechnen 2026 – Kostenloser Preisrechner",
    description:
      "Berechne deine TÜV-Kosten für 2026: HU + AU für alle Fahrzeugtypen. Kostenlos, anonym, sofortiges Ergebnis.",
    type: "website",
    locale: "de_DE",
  },
};

const tuevFaqItems: FaqItem[] = [
  {
    id: "tuev-faq-item-01",
    indexLabel: "01",
    question: "Was kostet der TÜV 2026 für ein normales Auto?",
    answer:
      "Für einen Pkw bis 3,5 Tonnen mit Verbrenner-Motor liegt die Hauptuntersuchung (HU) inklusive Abgasuntersuchung (AU) bei 143–170 €. E-Autos sind günstiger, da keine AU anfällt: 56–74 €. Die Preise variieren je nach Prüforganisation und Bundesland.",
    defaultOpen: true,
  },
  {
    id: "tuev-faq-item-02",
    indexLabel: "02",
    question: "Was passiert, wenn ich den TÜV überziehe?",
    answer:
      "In den ersten 2 Monaten gibt es eine Karenzzeit ohne Bußgeld. Danach steigt die Strafe stufenweise: 15 € (2–4 Monate), 25 € (4–8 Monate), bis hin zu 60 € + 1 Punkt in Flensburg (über 8 Monate). Zusätzlich wird die HU um 20 % teurer (erweiterte Prüfung).",
  },
  {
    id: "tuev-faq-item-03",
    indexLabel: "03",
    question: "Wie oft muss ich zum TÜV?",
    answer:
      "Neuwagen müssen erstmals nach 36 Monaten zur HU, danach alle 24 Monate. Wohnmobile über 7,5 Tonnen müssen jährlich geprüft werden. Mofas und Roller unter 50 ccm sind von der HU befreit.",
  },
  {
    id: "tuev-faq-item-04",
    indexLabel: "04",
    question: "Kann ich mir die Prüforganisation aussuchen?",
    answer:
      "Ja. TÜV Nord, TÜV Süd, DEKRA, GTÜ und KÜS arbeiten alle nach denselben gesetzlichen Vorgaben. Unterschiede gibt es nur beim Preis und der Terminverfügbarkeit. GTÜ und KÜS sind häufig etwas günstiger.",
  },
  {
    id: "tuev-faq-item-05",
    indexLabel: "05",
    question: "Was wird beim TÜV geprüft?",
    answer:
      "Geprüft werden alle sicherheitsrelevanten Bauteile: Bremsen, Lenkung, Beleuchtung, Karosserie, Reifen, Abgasanlage und mehr. Seit 2010 ist die Abgasuntersuchung (AU) fester Bestandteil der HU – außer bei reinen Elektrofahrzeugen.",
  },
  {
    id: "tuev-faq-item-06",
    indexLabel: "06",
    question: "Wie kann ich beim TÜV sparen?",
    answer:
      "Prüforganisationen vergleichen (bis 20 € Unterschied möglich), Kombi-Tarif HU+AU buchen (10–15 % günstiger), vor dem Termin selbst einen Mängelcheck durchführen, und den Termin rechtzeitig buchen, um Bußgelder und den 20-%-Aufschlag zu vermeiden.",
  },
];

export default function TuevKostenRechnerPage() {
  return (
    <main
      id="tuev-kosten-rechner-main"
      className="pb-[clamp(2.5rem,6vh,4rem)]"
    >
      <TuevPreisrechnerOverlayProvider>
        <TuevAnimations />

        <TuevHeroSection />

        <TuevKostenSection />

        <TuevZahlenSection />

        <TuevZielgruppeSection />

        <TuevVertrauenSection />

        <TuevProzessSection />

        <TuevFallstrickeSection />

        <TuevWeitereFragenSection />

        <FaqSection
          items={tuevFaqItems}
          heading="Häufig gestellte Fragen zum TÜV"
          introText={
            <>
              Deine Frage ist nicht dabei? Schreib uns gerne über den{" "}
              <a
                id="tuev-faq-support-link"
                href="#preiseberechnen-footer-nav-kontakt"
                className="text-[#ffffe3] underline underline-offset-4 decoration-[rgba(255,255,227,0.4)] hover:decoration-[#ffffe3] outline-none focus-visible:ring-2 focus-visible:ring-[#ffffe3] focus-visible:ring-offset-2 focus-visible:ring-offset-[#030F03] rounded-sm transition-colors"
              >
                Kontakt!
              </a>
            </>
          }
        />
      </TuevPreisrechnerOverlayProvider>
    </main>
  );
}
