import type { Metadata } from "next";
import { Button } from "../components/Button";

export const metadata: Metadata = {
  title: "Über uns – Kostenlose Preisrechner & Transparenz | Preiseberechnen",
  description:
    "Warum wir kostenlose Preisrechner anbieten: unabhängige Orientierung, echte Marktdaten und mehr Transparenz bei Kosten und Leistungen.",
  openGraph: {
    title: "Über uns – Kostenlose Preisrechner & Transparenz",
    description:
      "Unabhängige dritte Partei mit aktuellen Daten aus dem Markt – für bessere Preiseinschätzung und faire Entscheidungen.",
    type: "website",
    locale: "de_DE",
  },
};

export default function UeberUnsPage() {
  return (
    <main id="ueber-uns-main" className="pb-[clamp(2.5rem,6vh,4rem)] text-[#ffffe3]">
      <section
        id="ueber-uns-hero"
        aria-labelledby="ueber-uns-heading"
        className="relative left-1/2 flex w-screen max-w-[100vw] -translate-x-1/2 min-h-[93svh] items-center bg-[var(--background)] py-[clamp(1.25rem,4vh,2.5rem)] text-[var(--foreground)]"
      >
        <div
          id="ueber-uns-hero-inner"
          className="w-full max-w-[min(90rem,calc(100vw-4vh))] mx-auto px-[clamp(1rem,3.5vw,2.75rem)]"
        >
          <h1
            id="ueber-uns-heading"
            aria-label="Kostenlose Preisrechner – warum machen wir das?"
            className="m-0 max-w-[min(100%,96vw)] lowercase leading-[0.82] tracking-[-0.045em] text-[clamp(2.35rem,11.5vw,7.35rem)]"
          >
            <span
              id="ueber-uns-heading-line-1-wrap"
              className="block w-fit overflow-hidden"
            >
              <span
                id="ueber-uns-heading-line-1"
                className="preiseberechnen-hero-line-motion block w-fit font-semibold"
              >
                kostenlose preisrechner&nbsp;—
              </span>
            </span>
            <span
              id="ueber-uns-heading-line-2-wrap"
              className="mt-[clamp(-0.02em,0.5vw,0.06em)] block w-fit overflow-hidden pl-[clamp(1.75rem,20vw,19rem)]"
            >
              <span
                id="ueber-uns-heading-line-2"
                className="preiseberechnen-hero-line-motion preiseberechnen-hero-line-motion--delayed block w-fit font-light"
              >
                warum machen wir das?
              </span>
            </span>
          </h1>
        </div>
      </section>

      <article
        id="ueber-uns-article"
        className="mx-auto w-full max-w-[min(72rem,calc(100vw-4vh))] px-[clamp(1rem,2vh,1.75rem)] pt-[clamp(2rem,5vh,3rem)]"
      >
        <header id="ueber-uns-page-header" className="mb-[clamp(2.25rem,5.5vw,3.75rem)] max-w-[min(48rem,100%)]">
          <p
            id="ueber-uns-lead"
            className="m-0 text-[clamp(0.95rem,1.85vw,1.2rem)] leading-[1.55] text-[rgba(255,255,227,0.78)]"
          >
            Weil faire Preise nicht vom Zufall abhängen sollten – sondern von guter
            Information.
          </p>
        </header>

        <div
          id="ueber-uns-sections"
          className="flex max-w-[min(42rem,100%)] flex-col gap-[clamp(2rem,5vw,2.85rem)]"
        >
          <section
            id="ueber-uns-unabhaengigkeit"
            aria-labelledby="ueber-uns-unabhaengigkeit-heading"
            className="border-t border-[rgba(255,255,227,0.12)] pt-[clamp(1.75rem,4vw,2.25rem)]"
          >
            <h2
              id="ueber-uns-unabhaengigkeit-heading"
              className="text-[clamp(1.05rem,2.4vw,1.28rem)] font-semibold tracking-[-0.02em] text-[#ffffe3]"
            >
              Unabhängig – und auf deiner Seite
            </h2>
            <p
              id="ueber-uns-unabhaengigkeit-text"
              className="mt-[clamp(0.65rem,1.8vw,0.95rem)] text-[clamp(0.92rem,1.65vw,1.08rem)] leading-[1.65] text-[rgba(255,255,227,0.76)]"
            >
              Wir sind eine <strong>dritte Partei</strong> ohne Verkaufsinteresse
              an einem konkreten Anbieter. Unser Anliegen:{" "}
              <strong>dir als Endnutzerin oder Endnutzer</strong> Orientierung zu
              geben, damit du Kosten für die nächste Besorgung oder den nächsten
              Termin <strong>realistischer einschätzen</strong> kannst und den
              letztlichen Preis <strong>aktiv mitgestalten</strong> kannst – etwa
              indem
              du dir <strong>mehrere Angebote einholst</strong> oder mit einem
              Dienstleister ins Gespräch gehst und{" "}
              <strong>verhandelst</strong>.
            </p>
          </section>

          <section
            id="ueber-uns-datenbasis"
            aria-labelledby="ueber-uns-datenbasis-heading"
            className="border-t border-[rgba(255,255,227,0.12)] pt-[clamp(1.75rem,4vw,2.25rem)]"
          >
            <h2
              id="ueber-uns-datenbasis-heading"
              className="text-[clamp(1.05rem,2.4vw,1.28rem)] font-semibold tracking-[-0.02em] text-[#ffffe3]"
            >
              Daten aus dem echten Markt
            </h2>
            <p
              id="ueber-uns-datenbasis-text"
              className="mt-[clamp(0.65rem,1.8vw,0.95rem)] text-[clamp(0.92rem,1.65vw,1.08rem)] leading-[1.65] text-[rgba(255,255,227,0.76)]"
            >
              Die Grundlagen für unsere Preisrechner entstehen aus{" "}
              <strong>aktuellen Marktdaten</strong> und aus{" "}
              <strong>Gesprächen mit echten Unternehmen</strong> in den
              jeweiligen Bereichen. So bleiben Schätzungen nah an der Praxis –
              nicht an Marketingversprechen.
            </p>
          </section>

          <section
            id="ueber-uns-transparenz"
            aria-labelledby="ueber-uns-transparenz-heading"
            className="border-t border-[rgba(255,255,227,0.12)] pt-[clamp(1.75rem,4vw,2.25rem)]"
          >
            <h2
              id="ueber-uns-transparenz-heading"
              className="text-[clamp(1.05rem,2.4vw,1.28rem)] font-semibold tracking-[-0.02em] text-[#ffffe3]"
            >
              Mehr als nur Preise
            </h2>
            <p
              id="ueber-uns-transparenz-text"
              className="mt-[clamp(0.65rem,1.8vw,0.95rem)] text-[clamp(0.92rem,1.65vw,1.08rem)] leading-[1.65] text-[rgba(255,255,227,0.76)]"
            >
              Wir wollen nicht nur Zahlen zeigen – wir wollen{" "}
              <strong>Transparenz</strong> in ein Thema bringen, bei dem lange
              genug geschwiegen wurde. Damit du weißt, was üblich ist, was
              variieren kann – und wo du handeln darfst.
            </p>
          </section>
        </div>

        <footer
          id="ueber-uns-page-footer-cta"
          className="mt-[clamp(2.5rem,6vw,3.5rem)] max-w-[min(42rem,100%)] border-t border-[rgba(255,255,227,0.12)] pt-[clamp(1.75rem,4vw,2.25rem)]"
        >
          <p
            id="ueber-uns-cta-copy"
            className="text-[clamp(0.88rem,1.5vw,1rem)] leading-[1.55] text-[rgba(255,255,227,0.62)]"
          >
            Zu den Rechnern und Themen auf einen Blick:
          </p>
          <div
            id="ueber-uns-cta-actions"
            className="mt-[clamp(0.85rem,2vw,1.1rem)] flex flex-wrap gap-[clamp(0.5rem,2vw,0.75rem)]"
          >
            <Button
              id="ueber-uns-cta-rechner"
              href="/#preiseberechnen-feature-section"
              size="md"
              variant="primary"
            >
              Zur Übersicht
            </Button>
            <Button
              id="ueber-uns-cta-home"
              href="/"
              size="md"
              variant="ghost"
            >
              Startseite
            </Button>
          </div>
        </footer>
      </article>
    </main>
  );
}
