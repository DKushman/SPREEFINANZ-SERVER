import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Datenschutzerklärung | Preiseberechnen",
  description:
    "Informationen zur Verarbeitung personenbezogener Daten auf preiseberechnen.de – Hosting, Google Analytics, Cookies und deine Rechte.",
  openGraph: {
    title: "Datenschutzerklärung | Preiseberechnen",
    description:
      "Datenschutz auf preiseberechnen.de: Verantwortlicher, Zwecke, Rechtsgrundlagen und Betroffenenrechte.",
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

const h3Class =
  "mt-[clamp(0.75rem,2vw,1rem)] text-[clamp(0.98rem,1.85vw,1.08rem)] font-semibold text-[rgba(255,255,227,0.92)]";

const bodyClass =
  "text-[clamp(0.9rem,1.55vw,1.05rem)] leading-[1.65] text-[rgba(255,255,227,0.78)]";

const sectionClass =
  "border-t border-[rgba(255,255,227,0.12)] pt-[clamp(1.5rem,3.5vw,2rem)]";

const listClass = `${bodyClass} mt-[clamp(0.5rem,1.2vw,0.75rem)] list-disc pl-[1.15em] space-y-[0.35em]`;

export default function DatenschutzPage() {
  return (
    <main id="datenschutz-main" className="pb-[clamp(2.5rem,6vh,4rem)] text-[#ffffe3]">
      <article id="datenschutz-article" className={articleClass}>
        <header id="datenschutz-header" className="preiseberechnen-page-hero mb-[clamp(1.25rem,3vw,1.75rem)]">
          <h1 id="datenschutz-heading" className={h1Class}>
            Datenschutzerklärung
          </h1>
          <p id="datenschutz-intro" className={`preiseberechnen-hero-line-motion preiseberechnen-hero-line-motion--stagger-2 ${bodyClass} mt-[clamp(0.65rem,1.5vw,0.9rem)] max-w-[min(42rem,100%)]`}>
            Nachfolgend informieren wir über die Verarbeitung personenbezogener
            Daten beim Besuch dieser Website. Abschnitte zu Google Analytics,
            Cookies und ggf. Drittlandübermittlungen sollten vor dem Livegang{" "}
            <strong>rechtlich geprüft</strong> werden.
          </p>
        </header>

        <div
          id="datenschutz-sections"
          className="flex max-w-[min(42rem,100%)] flex-col gap-[clamp(1.25rem,3vw,1.75rem)]"
        >
          <section
            id="datenschutz-verantwortlicher"
            aria-labelledby="datenschutz-verantwortlicher-heading"
            className={sectionClass}
          >
            <h2 id="datenschutz-verantwortlicher-heading" className={h2Class}>
              Verantwortlicher
            </h2>
            <p id="datenschutz-verantwortlicher-text" className={`${bodyClass} mt-[clamp(0.5rem,1.2vw,0.75rem)]`}>
              Verantwortlich im Sinne der Datenschutz-Grundverordnung (DSGVO)
              ist:
            </p>
            <p id="datenschutz-verantwortlicher-block" className={`${bodyClass} mt-[clamp(0.35rem,1vw,0.5rem)]`}>
              <strong>DEVDESIGN · David Joel Chiosea</strong> (Einzelunternehmen)
              <br />
              Charlottenburger Straße 110A, 13086 Berlin, Deutschland
              <br />
              Telefon:{" "}
              <a
                id="datenschutz-tel"
                href="tel:+491743992254"
                className="text-[#ffffe3] underline underline-offset-4 decoration-[rgba(255,255,227,0.35)] outline-none hover:decoration-[#ffffe3] focus-visible:ring-2 focus-visible:ring-[#ffffe3] focus-visible:ring-offset-2 focus-visible:ring-offset-[#030F03] rounded-sm"
              >
                0174 3992254
              </a>
              <br />
              E-Mail:{" "}
              <a
                id="datenschutz-mailto"
                href="mailto:info@preiseberechnen.de"
                className="text-[#ffffe3] underline underline-offset-4 decoration-[rgba(255,255,227,0.35)] outline-none hover:decoration-[#ffffe3] focus-visible:ring-2 focus-visible:ring-[#ffffe3] focus-visible:ring-offset-2 focus-visible:ring-offset-[#030F03] rounded-sm"
              >
                info@preiseberechnen.de
              </a>
            </p>
            <p id="datenschutz-impressum-link" className={`${bodyClass} mt-[clamp(0.5rem,1.2vw,0.75rem)]`}>
              Weitere Pflichtangaben findest du im{" "}
              <Link
                id="datenschutz-link-impressum"
                href="/impressum"
                className="text-[#ffffe3] underline underline-offset-4 decoration-[rgba(255,255,227,0.35)] outline-none hover:decoration-[#ffffe3] focus-visible:ring-2 focus-visible:ring-[#ffffe3] focus-visible:ring-offset-2 focus-visible:ring-offset-[#030F03] rounded-sm"
              >
                Impressum
              </Link>
              .
            </p>
          </section>

          <section
            id="datenschutz-hosting"
            aria-labelledby="datenschutz-hosting-heading"
            className={sectionClass}
          >
            <h2 id="datenschutz-hosting-heading" className={h2Class}>
              Hosting
            </h2>
            <p id="datenschutz-hosting-text" className={`${bodyClass} mt-[clamp(0.5rem,1.2vw,0.75rem)]`}>
              Diese Website wird auf einem <strong>eigenen Server</strong> mit{" "}
              <strong>Apache HTTP Server</strong> bereitgestellt. Beim Aufruf
              werden dabei technisch notwendige Daten verarbeitet (z. B.
              IP-Adresse, Zeitstempel, User-Agent, angeforderte Ressource), um
              die Auslieferung, Stabilität und Sicherheit zu gewährleisten.
              Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO (berechtigtes
              Interesse an einem sicheren Betrieb). Logdaten werden nur so lange
              gespeichert, wie dies zur Erkennung von Störungen oder Missbrauch
              erforderlich ist; Details zur Speicherdauer bitte an deine
              Server-Konfiguration anpassen und hier ggf. ergänzen.
            </p>
          </section>

          <section
            id="datenschutz-cdn-dienste"
            aria-labelledby="datenschutz-cdn-dienste-heading"
            className={sectionClass}
          >
            <h2 id="datenschutz-cdn-dienste-heading" className={h2Class}>
              Content-Delivery, Medien und Schnittstellen
            </h2>
            <p id="datenschutz-cdn-dienste-text" className={`${bodyClass} mt-[clamp(0.5rem,1.2vw,0.75rem)]`}>
              Zur Darstellung von Inhalten und Performance können folgende
              Dienste eingebunden sein:
            </p>
            <ul id="datenschutz-cdn-dienste-liste" className={listClass}>
              <li id="datenschutz-cloudinary">
                <strong>Cloudinary</strong> (CDN / Bildauslieferung) –{" "}
                <a
                  id="datenschutz-cloudinary-privacy"
                  href="https://cloudinary.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#ffffe3] underline underline-offset-4 decoration-[rgba(255,255,227,0.35)] outline-none hover:decoration-[#ffffe3] focus-visible:ring-2 focus-visible:ring-[#ffffe3] focus-visible:ring-offset-2 focus-visible:ring-offset-[#030F03] rounded-sm"
                >
                  cloudinary.com/privacy
                </a>
              </li>
              <li id="datenschutz-pexels">
                <strong>Pexels</strong> (Bildmaterial / API) –{" "}
                <a
                  id="datenschutz-pexels-privacy"
                  href="https://www.pexels.com/privacy-policy/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#ffffe3] underline underline-offset-4 decoration-[rgba(255,255,227,0.35)] outline-none hover:decoration-[#ffffe3] focus-visible:ring-2 focus-visible:ring-[#ffffe3] focus-visible:ring-offset-2 focus-visible:ring-offset-[#030F03] rounded-sm"
                >
                  pexels.com/privacy-policy
                </a>
              </li>
              <li id="datenschutz-backend-api">
                <strong>Eigenes Backend / API</strong> – Anfragen von dieser
                Website können an von uns betriebene Schnittstellen gesendet
                werden (z. B. Kontaktformular, Rechner). Es gelten die jeweils in
                diesem Abschnitt und unter „Kontakt“ beschriebenen Zwecke und
                Rechtsgrundlagen.
              </li>
            </ul>
            <p id="datenschutz-cdn-rechtsgrundlage" className={`${bodyClass} mt-[clamp(0.5rem,1.2vw,0.75rem)]`}>
              Soweit dabei personenbezogene Daten an Drittanbieter übermittelt
              werden, geschieht dies zur Bereitstellung der Website und ihrer
              Funktionen (Art. 6 Abs. 1 lit. f DSGVO) bzw. auf Grundlage deiner
              Einwilligung, sofern wir eine solche einholen (Art. 6 Abs. 1 lit. a
              DSGVO).
            </p>
          </section>

          <section
            id="datenschutz-cookies-einwilligung"
            aria-labelledby="datenschutz-cookies-einwilligung-heading"
            className={sectionClass}
          >
            <h2 id="datenschutz-cookies-einwilligung-heading" className={h2Class}>
              Cookies, Einwilligung und Google Analytics (GA4)
            </h2>
            <p id="datenschutz-cookies-einwilligung-text" className={`${bodyClass} mt-[clamp(0.5rem,1.2vw,0.75rem)]`}>
              Wir setzen <strong>Google Analytics 4</strong> ein, um die Nutzung
              der Website auszuwerten (z. B. Seitenaufrufe, Verweildauer,
              technische Informationen). Dabei können <strong>Cookies</strong> und
              ähnliche Technologien verwendet werden. Die Rechtsgrundlage ist in
              der Regel deine <strong>Einwilligung</strong> (Art. 6 Abs. 1 lit. a
              DSGVO), sofern GA nicht in einer rechtlich als ausreichend
              eingestuften, datenschonenden Konfiguration ohne Einwilligung
              betrieben wird – bitte mit Fachkraft abstimmen.
            </p>
            <p id="datenschutz-ga-id" className={`${bodyClass} mt-[clamp(0.5rem,1.2vw,0.75rem)]`}>
              <strong>Measurement-ID (nach Einrichtung in GA4 eintragen):</strong>{" "}
              <code id="datenschutz-ga-id-code" className="rounded-sm bg-[rgba(255,255,227,0.08)] px-1.5 py-0.5 text-[0.92em]">
                G-… (in Google Analytics 4 kopieren)
              </code>
            </p>
            <p id="datenschutz-google-empfaenger" className={`${bodyClass} mt-[clamp(0.5rem,1.2vw,0.75rem)]`}>
              Empfänger kann die{" "}
              <strong>Google Ireland Limited</strong> (EU) bzw. im Rahmen von
              Verarbeitungen auch die <strong>Google LLC</strong> (USA) sein.
              Informationen von Google:{" "}
              <a
                id="datenschutz-google-privacy"
                href="https://policies.google.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#ffffe3] underline underline-offset-4 decoration-[rgba(255,255,227,0.35)] outline-none hover:decoration-[#ffffe3] focus-visible:ring-2 focus-visible:ring-[#ffffe3] focus-visible:ring-offset-2 focus-visible:ring-offset-[#030F03] rounded-sm"
              >
                policies.google.com/privacy
              </a>
              . Opt-out:{" "}
              <a
                id="datenschutz-google-optout"
                href="https://tools.google.com/dlpage/gaoptout?hl=de"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#ffffe3] underline underline-offset-4 decoration-[rgba(255,255,227,0.35)] outline-none hover:decoration-[#ffffe3] focus-visible:ring-2 focus-visible:ring-[#ffffe3] focus-visible:ring-offset-2 focus-visible:ring-offset-[#030F03] rounded-sm"
              >
                Browser-Add-on zur Deaktivierung von Google Analytics
              </a>
              .
            </p>
            <p id="datenschutz-drittland" className={`${bodyClass} mt-[clamp(0.5rem,1.2vw,0.75rem)]`}>
              Datenübermittlungen in Drittländer (insbesondere in die USA im
              Zusammenhang mit Google) können nicht ausgeschlossen werden.
              Welche Garantien (z. B. Angemessenheitsbeschluss, EU-US Data Privacy
              Framework, Standardvertragsklauseln) vorliegen, bitte{" "}
              <strong>aktuell mit einem Fachanwalt</strong> prüfen und hier
              präzisieren.
            </p>

            <aside
              id="datenschutz-consent-hinweis"
              aria-labelledby="datenschutz-consent-hinweis-heading"
              className="mt-[clamp(0.85rem,2vw,1.1rem)] rounded-[clamp(0.5rem,1.2vw,0.75rem)] border border-[rgba(255,255,227,0.2)] bg-[rgba(255,255,227,0.06)] px-[clamp(0.85rem,2vw,1.1rem)] py-[clamp(0.75rem,1.8vw,0.95rem)]"
            >
              <h3 id="datenschutz-consent-hinweis-heading" className={`${h3Class} !mt-0`}>
                Hinweis für den Betrieb (Consent / CMP)
              </h3>
              <p id="datenschutz-consent-hinweis-text" className={`${bodyClass} mt-[clamp(0.45rem,1.2vw,0.65rem)]`}>
                Bevor Google Analytics technisch geladen wird, sollte in der
                Regel eine <strong>wirksame Einwilligung</strong> eingeholt werden
                (Cookie-Banner oder Consent-Management-Plattform), dokumentiert
                und widerrufbar sein. Diese Website enthält derzeit{" "}
                <strong>kein fertiges Consent-Tool</strong> – bitte CMP wählen,
                einbinden und diese Erklärung danach anpassen.
              </p>
            </aside>
          </section>

          <section
            id="datenschutz-kontakt"
            aria-labelledby="datenschutz-kontakt-heading"
            className={sectionClass}
          >
            <h2 id="datenschutz-kontakt-heading" className={h2Class}>
              Kontakt (E-Mail und Formular)
            </h2>
            <p id="datenschutz-kontakt-email-text" className={`${bodyClass} mt-[clamp(0.5rem,1.2vw,0.75rem)]`}>
              Wenn du uns per <strong>E-Mail</strong> kontaktierst, verarbeiten
              wir die von dir mitgeteilten Daten (z. B. Absenderadresse, Inhalt
              der Nachricht), um dein Anliegen zu bearbeiten. Rechtsgrundlage ist
              Art. 6 Abs. 1 lit. b DSGVO (Vertragsanbahnung/-durchführung) bzw.
              Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an der Bearbeitung
              von Anfragen). Die Daten werden gelöscht, sobald die Speicherung
              nicht mehr erforderlich ist, sofern keine gesetzlichen
              Aufbewahrungspflichten entgegenstehen.
            </p>
            <p id="datenschutz-kontakt-form-text" className={`${bodyClass} mt-[clamp(0.5rem,1.2vw,0.75rem)]`}>
              Über das <strong>Kontaktformular</strong> auf dieser Website
              übermittelst du uns freiwillig Angaben (z. B. Name, E-Mail-Adresse,
              Nachricht). Wir verwenden sie ausschließlich, um dein Anliegen zu
              bearbeiten. Die Übermittlung kann technisch über unsere Website und
              ein angebundenes Backend erfolgen (siehe Umgebungskonfiguration).
              Rechtsgrundlage ist Art. 6 Abs. 1 lit. b bzw. lit. f DSGVO. Nach
              Erledigung der Anfrage löschen wir die Daten, sofern keine
              gesetzlichen Pflichten zur Aufbewahrung bestehen.
            </p>
            <p id="datenschutz-kontakt-link" className={`${bodyClass} mt-[clamp(0.5rem,1.2vw,0.75rem)]`}>
              Zum Formular:{" "}
              <Link
                id="datenschutz-link-kontakt"
                href="/kontakt"
                className="text-[#ffffe3] underline underline-offset-4 decoration-[rgba(255,255,227,0.35)] outline-none hover:decoration-[#ffffe3] focus-visible:ring-2 focus-visible:ring-[#ffffe3] focus-visible:ring-offset-2 focus-visible:ring-offset-[#030F03] rounded-sm"
              >
                Kontakt
              </Link>
            </p>
          </section>

          <section
            id="datenschutz-newsletter"
            aria-labelledby="datenschutz-newsletter-heading"
            className={sectionClass}
          >
            <h2 id="datenschutz-newsletter-heading" className={h2Class}>
              Newsletter und Marketing
            </h2>
            <p id="datenschutz-newsletter-text" className={`${bodyClass} mt-[clamp(0.5rem,1.2vw,0.75rem)]`}>
              Es wird kein Newsletter angeboten und keine Daten zu
              E-Mail-Marketing erhoben.
            </p>
          </section>

          <section
            id="datenschutz-dsb"
            aria-labelledby="datenschutz-dsb-heading"
            className={sectionClass}
          >
            <h2 id="datenschutz-dsb-heading" className={h2Class}>
              Datenschutzbeauftragte/r
            </h2>
            <p id="datenschutz-dsb-text" className={`${bodyClass} mt-[clamp(0.5rem,1.2vw,0.75rem)]`}>
              Es ist kein Datenschutzbeauftragter bestellt, soweit keine
              gesetzliche Pflicht zur Bestellung besteht.
            </p>
          </section>

          <section
            id="datenschutz-rechte"
            aria-labelledby="datenschutz-rechte-heading"
            className={sectionClass}
          >
            <h2 id="datenschutz-rechte-heading" className={h2Class}>
              Deine Rechte
            </h2>
            <p id="datenschutz-rechte-einleitung" className={`${bodyClass} mt-[clamp(0.5rem,1.2vw,0.75rem)]`}>
              Du hast – soweit die gesetzlichen Voraussetzungen erfüllt sind –
              insbesondere folgende Rechte:
            </p>
            <ul id="datenschutz-rechte-liste" className={listClass}>
              <li id="datenschutz-recht-auskunft">
                <strong>Auskunft</strong> (Art. 15 DSGVO)
              </li>
              <li id="datenschutz-recht-berichtigung">
                <strong>Berichtigung</strong> (Art. 16 DSGVO)
              </li>
              <li id="datenschutz-recht-loeschung">
                <strong>Löschung</strong> (Art. 17 DSGVO)
              </li>
              <li id="datenschutz-recht-einschraenkung">
                <strong>Einschränkung der Verarbeitung</strong> (Art. 18 DSGVO)
              </li>
              <li id="datenschutz-recht-datentragbarkeit">
                <strong>Datenübertragbarkeit</strong> (Art. 20 DSGVO)
              </li>
              <li id="datenschutz-recht-widerspruch">
                <strong>Widerspruch</strong> gegen die Verarbeitung (Art. 21 DSGVO)
              </li>
              <li id="datenschutz-recht-widerruf">
                <strong>Widerruf</strong> einer erteilten Einwilligung mit
                Wirkung für die Zukunft (Art. 7 Abs. 3 DSGVO)
              </li>
            </ul>
            <p id="datenschutz-rechte-kontakt" className={`${bodyClass} mt-[clamp(0.5rem,1.2vw,0.75rem)]`}>
              Zur Geltendmachung kontaktiere uns unter den oben genannten
              Kontaktdaten des Verantwortlichen.
            </p>
          </section>

          <section
            id="datenschutz-beschwerde"
            aria-labelledby="datenschutz-beschwerde-heading"
            className={sectionClass}
          >
            <h2 id="datenschutz-beschwerde-heading" className={h2Class}>
              Beschwerde bei einer Aufsichtsbehörde
            </h2>
            <p id="datenschutz-beschwerde-text" className={`${bodyClass} mt-[clamp(0.5rem,1.2vw,0.75rem)]`}>
              Du hast das Recht, dich bei einer Datenschutz-Aufsichtsbehörde über
              die Verarbeitung personenbezogener Daten durch uns zu beschweren.
              Zuständig ist typischerweise die Behörde deines gewöhnlichen
              Aufenthaltsorts, Arbeitsplatzes oder des Orts des mutmaßlichen
              Verstoßes. Der Verantwortliche hat seinen Sitz in{" "}
              <strong>Berlin</strong>; zuständig ist daher insbesondere die{" "}
              <strong>Berliner Beauftragte für Datenschutz und Informationsfreiheit</strong>
              . Aktuelle Kontaktdaten:{" "}
              <a
                id="datenschutz-bldb-link"
                href="https://www.datenschutz-berlin.de/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#ffffe3] underline underline-offset-4 decoration-[rgba(255,255,227,0.35)] outline-none hover:decoration-[#ffffe3] focus-visible:ring-2 focus-visible:ring-[#ffffe3] focus-visible:ring-offset-2 focus-visible:ring-offset-[#030F03] rounded-sm"
              >
                datenschutz-berlin.de
              </a>
              .
            </p>
          </section>

          <section
            id="datenschutz-aenderungen"
            aria-labelledby="datenschutz-aenderungen-heading"
            className={sectionClass}
          >
            <h2 id="datenschutz-aenderungen-heading" className={h2Class}>
              Änderung dieser Erklärung
            </h2>
            <p id="datenschutz-aenderungen-text" className={`${bodyClass} mt-[clamp(0.5rem,1.2vw,0.75rem)]`}>
              Wir passen diese Datenschutzerklärung an, wenn sich Rechtslage oder
              unsere Verarbeitungen ändern. Bitte informiere dich regelmäßig auf
              dieser Seite über den aktuellen Stand.
            </p>
          </section>

          <p id="datenschutz-stand" className={`${bodyClass} text-[rgba(255,255,227,0.55)]`}>
            <small id="datenschutz-stand-small">Stand: April 2026</small>
          </p>

          <p id="datenschutz-back" className={bodyClass}>
            <Link
              id="datenschutz-link-home"
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
