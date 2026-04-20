import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Impressum | Preiseberechnen",
  description:
    "Impressum und Anbieterkennzeichnung von preiseberechnen.de – Kontakt, Verantwortliche und rechtliche Hinweise.",
  openGraph: {
    title: "Impressum | Preiseberechnen",
    description:
      "Anbieterkennzeichnung und Kontaktdaten von preiseberechnen.de.",
    type: "website",
    locale: "de_DE",
  },
};

const articleClass =
  "mx-auto w-full max-w-[min(72rem,calc(100vw-4vh))] px-[clamp(1rem,2vh,1.75rem)] py-[clamp(2rem,5vh,3.5rem)]";

const h1Class =
  "preiseberechnen-hero-line-motion preiseberechnen-hero-line-motion--stagger-1 m-0 text-[clamp(1.65rem,4.2vw,2.35rem)] font-semibold tracking-[-0.02em] text-[#ffffe3]";

const h2Class =
  "mt-0 text-[clamp(1.05rem,2.2vw,1.22rem)] font-semibold tracking-[-0.02em] text-[#ffffe3]";

const bodyClass =
  "text-[clamp(0.9rem,1.55vw,1.05rem)] leading-[1.65] text-[rgba(255,255,227,0.78)]";

const sectionClass =
  "border-t border-[rgba(255,255,227,0.12)] pt-[clamp(1.5rem,3.5vw,2rem)]";

export default function ImpressumPage() {
  return (
    <main id="impressum-main" className="pb-[clamp(2.5rem,6vh,4rem)] text-[#ffffe3]">
      <article id="impressum-article" className={articleClass}>
        <header id="impressum-header" className="preiseberechnen-page-hero mb-[clamp(1.25rem,3vw,1.75rem)]">
          <h1 id="impressum-heading" className={h1Class}>
            Impressum
          </h1>
          <p id="impressum-intro" className={`preiseberechnen-hero-line-motion preiseberechnen-hero-line-motion--stagger-2 ${bodyClass} mt-[clamp(0.65rem,1.5vw,0.9rem)] max-w-[min(42rem,100%)]`}>
            Angaben gemäß den gesetzlichen Vorgaben zur Anbieterkennzeichnung.
            Rechtlich verbindliche Prüfung durch Fachanwalt oder Steuerberater
            wird empfohlen.
          </p>
        </header>

        <div
          id="impressum-sections"
          className="flex max-w-[min(42rem,100%)] flex-col gap-[clamp(1.25rem,3vw,1.75rem)]"
        >
          <section
            id="impressum-anbieter"
            aria-labelledby="impressum-anbieter-heading"
            className={sectionClass}
          >
            <h2 id="impressum-anbieter-heading" className={h2Class}>
              Diensteanbieter
            </h2>
            <p id="impressum-anbieter-text" className={`${bodyClass} mt-[clamp(0.5rem,1.2vw,0.75rem)]`}>
              <strong id="impressum-name">DEVDESIGN · David Joel Chiosea</strong>
              <br />
              <span id="impressum-rechtsform">Einzelunternehmen</span>
            </p>
            <address
              id="impressum-address"
              className={`${bodyClass} mt-[clamp(0.5rem,1.2vw,0.75rem)] not-italic`}
            >
              Charlottenburger Straße 110A
              <br />
              13086 Berlin
              <br />
              Deutschland
            </address>
            <p id="impressum-kontakt-email" className={`${bodyClass} mt-[clamp(0.5rem,1.2vw,0.75rem)]`}>
              E-Mail:{" "}
              <a
                id="impressum-mailto"
                href="mailto:info@preiseberechnen.de"
                className="text-[#ffffe3] underline underline-offset-4 decoration-[rgba(255,255,227,0.35)] outline-none hover:decoration-[#ffffe3] focus-visible:ring-2 focus-visible:ring-[#ffffe3] focus-visible:ring-offset-2 focus-visible:ring-offset-[#030F03] rounded-sm"
              >
                info@preiseberechnen.de
              </a>
            </p>
            <p id="impressum-telefon" className={`${bodyClass} mt-[clamp(0.35rem,1vw,0.5rem)]`}>
              Telefon:{" "}
              <a
                id="impressum-tel"
                href="tel:+491743992254"
                className="text-[#ffffe3] underline underline-offset-4 decoration-[rgba(255,255,227,0.35)] outline-none hover:decoration-[#ffffe3] focus-visible:ring-2 focus-visible:ring-[#ffffe3] focus-visible:ring-offset-2 focus-visible:ring-offset-[#030F03] rounded-sm"
              >
                0174 3992254
              </a>
            </p>
          </section>

          <section
            id="impressum-vertretung"
            aria-labelledby="impressum-vertretung-heading"
            className={sectionClass}
          >
            <h2 id="impressum-vertretung-heading" className={h2Class}>
              Vertretungsberechtigte
            </h2>
            <p id="impressum-vertretung-text" className={`${bodyClass} mt-[clamp(0.5rem,1.2vw,0.75rem)]`}>
              Das Einzelunternehmen wird durch den Inhaber{" "}
              <strong>David Joel Chiosea</strong> vertreten.
            </p>
          </section>

          <section
            id="impressum-register"
            aria-labelledby="impressum-register-heading"
            className={sectionClass}
          >
            <h2 id="impressum-register-heading" className={h2Class}>
              Registereintrag
            </h2>
            <p id="impressum-register-text" className={`${bodyClass} mt-[clamp(0.5rem,1.2vw,0.75rem)]`}>
              Ein Eintrag im Handelsregister besteht nicht.
            </p>
          </section>

          <section
            id="impressum-umsatzsteuer"
            aria-labelledby="impressum-umsatzsteuer-heading"
            className={sectionClass}
          >
            <h2 id="impressum-umsatzsteuer-heading" className={h2Class}>
              Umsatzsteuer
            </h2>
            <p id="impressum-umsatzsteuer-text" className={`${bodyClass} mt-[clamp(0.5rem,1.2vw,0.75rem)]`}>
              Es wird keine Umsatzsteuer-Identifikationsnummer im Sinne von § 27
              a Umsatzsteuergesetz ausgewiesen.
            </p>
          </section>

          <section
            id="impressum-redaktion"
            aria-labelledby="impressum-redaktion-heading"
            className={sectionClass}
          >
            <h2 id="impressum-redaktion-heading" className={h2Class}>
              Verantwortlich für den Inhalt (§ 18 Abs. 2 MStV)
            </h2>
            <address
              id="impressum-redaktion-address"
              className={`${bodyClass} mt-[clamp(0.5rem,1.2vw,0.75rem)] not-italic`}
            >
              David Joel Chiosea
              <br />
              Charlottenburger Straße 110A
              <br />
              13086 Berlin, Deutschland
            </address>
          </section>

          <section
            id="impressum-streitbeilegung"
            aria-labelledby="impressum-streitbeilegung-heading"
            className={sectionClass}
          >
            <h2 id="impressum-streitbeilegung-heading" className={h2Class}>
              EU-Streitbeilegung / Verbraucherschlichtung
            </h2>
            <p id="impressum-streitbeilegung-text" className={`${bodyClass} mt-[clamp(0.5rem,1.2vw,0.75rem)]`}>
              Die Europäische Kommission stellt eine Plattform zur
              Online-Streitbeilegung (OS) bereit:{" "}
              <a
                id="impressum-os-link"
                href="https://ec.europa.eu/consumers/odr/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#ffffe3] underline underline-offset-4 decoration-[rgba(255,255,227,0.35)] outline-none hover:decoration-[#ffffe3] focus-visible:ring-2 focus-visible:ring-[#ffffe3] focus-visible:ring-offset-2 focus-visible:ring-offset-[#030F03] rounded-sm"
              >
                https://ec.europa.eu/consumers/odr/
              </a>
            </p>
            <p id="impressum-streitbeilegung-hinweis" className={`${bodyClass} mt-[clamp(0.5rem,1.2vw,0.75rem)]`}>
              Wir sind nicht verpflichtet und nicht bereit, an
              Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle
              teilzunehmen.
            </p>
          </section>

          <section
            id="impressum-haftung-inhalte"
            aria-labelledby="impressum-haftung-inhalte-heading"
            className={sectionClass}
          >
            <h2 id="impressum-haftung-inhalte-heading" className={h2Class}>
              Haftung für Inhalte
            </h2>
            <p id="impressum-haftung-inhalte-text" className={`${bodyClass} mt-[clamp(0.5rem,1.2vw,0.75rem)]`}>
              Als Diensteanbieter sind wir gemäß § 7 Abs. 1 DDG für eigene
              Inhalte auf diesen Seiten nach den allgemeinen Gesetzen
              verantwortlich. Nach §§ 8 bis 10 DDG sind wir als Diensteanbieter
              jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde
              Informationen zu überwachen oder nach Umständen zu forschen, die
              auf eine rechtswidrige Tätigkeit hinweisen. Verpflichtungen zur
              Entfernung oder Sperrung der Nutzung von Informationen nach den
              allgemeinen Gesetzen bleiben hiervon unberührt. Eine Haftung ist
              erst ab dem Zeitpunkt der Kenntnis einer konkreten Rechtsverletzung
              möglich. Bei Bekanntwerden entsprechender Rechtsverletzungen werden
              wir diese Inhalte umgehend entfernen.
            </p>
          </section>

          <section
            id="impressum-haftung-links"
            aria-labelledby="impressum-haftung-links-heading"
            className={sectionClass}
          >
            <h2 id="impressum-haftung-links-heading" className={h2Class}>
              Haftung für Links
            </h2>
            <p id="impressum-haftung-links-text" className={`${bodyClass} mt-[clamp(0.5rem,1.2vw,0.75rem)]`}>
              Unser Angebot enthält ggf. Links zu externen Websites Dritter, auf
              deren Inhalte wir keinen Einfluss haben. Deshalb können wir für
              diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte
              der verlinkten Seiten ist stets der jeweilige Anbieter oder
              Betreiber der Seiten verantwortlich. Die verlinkten Seiten wurden
              zum Zeitpunkt der Verlinkung auf mögliche Rechtsverstöße überprüft.
              Rechtswidrige Inhalte waren zum Zeitpunkt der Verlinkung nicht
              erkennbar. Eine permanente inhaltliche Kontrolle der verlinkten
              Seiten ist jedoch ohne konkrete Anhaltspunkte einer
              Rechtsverletzung nicht zumutbar. Bei Bekanntwerden von
              Rechtsverletzungen werden wir derartige Links umgehend entfernen.
            </p>
          </section>

          <section
            id="impressum-urheber"
            aria-labelledby="impressum-urheber-heading"
            className={sectionClass}
          >
            <h2 id="impressum-urheber-heading" className={h2Class}>
              Urheberrecht
            </h2>
            <p id="impressum-urheber-text" className={`${bodyClass} mt-[clamp(0.5rem,1.2vw,0.75rem)]`}>
              Die durch den Seitenbetreiber erstellten Inhalte und Werke auf
              diesen Seiten unterliegen dem deutschen Urheberrecht. Die
              Vervielfältigung, Bearbeitung, Verbreitung und jede Art der
              Verwertung außerhalb der Grenzen des Urheberrechts bedürfen der
              schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.
              Downloads und Kopien dieser Seite sind nur für den privaten, nicht
              kommerziellen Gebrauch gestattet. Soweit die Inhalte auf dieser
              Seite nicht vom Betreiber erstellt wurden, werden die Urheberrechte
              Dritter beachtet. Insbesondere werden Inhalte Dritter als solche
              gekennzeichnet. Solltest du trotzdem auf eine Urheberrechtsverletzung
              aufmerksam werden, bitten wir um einen entsprechenden Hinweis. Bei
              Bekanntwerden von Rechtsverletzungen werden wir derartige Inhalte
              umgehend entfernen.
            </p>
          </section>

          <p id="impressum-stand" className={`${bodyClass} text-[rgba(255,255,227,0.55)]`}>
            <small id="impressum-stand-small">Stand: April 2026</small>
          </p>

          <p id="impressum-back" className={bodyClass}>
            <Link
              id="impressum-link-home"
              href="/"
              className="text-[#ffffe3] underline underline-offset-4 decoration-[rgba(255,255,227,0.35)] outline-none hover:decoration-[#ffffe3] focus-visible:ring-2 focus-visible:ring-[#ffffe3] focus-visible:ring-offset-2 focus-visible:ring-offset-[#030F03] rounded-sm"
            >
              Zur Startseite
            </Link>
          </p>
        </div>
      </article>
    </main>
  );
}
