import type { Metadata } from "next";
import Link from "next/link";
import { ContactForm } from "./ContactForm";

export const metadata: Metadata = {
  title: "Kontakt | Preiseberechnen",
  description:
    "Kontaktiere preiseberechnen.de – Fragen, Feedback oder Anregungen per Formular oder E-Mail.",
  openGraph: {
    title: "Kontakt | Preiseberechnen",
    description:
      "Schreib uns über das Kontaktformular oder per E-Mail an info@preiseberechnen.de.",
    type: "website",
    locale: "de_DE",
  },
};

export default function KontaktPage() {
  return (
    <main
      id="preiseberechnen-kontakt-main"
      className="pb-[clamp(2.5rem,6vh,4rem)] text-[#ffffe3]"
    >
      <article
        id="preiseberechnen-kontakt-article"
        className="mx-auto w-full max-w-[min(72rem,calc(100vw-4vh))] px-[clamp(1rem,2vh,1.75rem)] py-[clamp(2rem,5vh,3.5rem)]"
      >
        <header
          id="preiseberechnen-kontakt-header"
          className="mb-[clamp(1.5rem,3.5vw,2.25rem)] max-w-[min(42rem,100%)]"
        >
          <h1
            id="preiseberechnen-kontakt-heading"
            className="m-0 text-[clamp(1.65rem,4.2vw,2.35rem)] font-semibold tracking-[-0.02em] text-[#ffffe3]"
          >
            Kontakt
          </h1>
          <p
            id="preiseberechnen-kontakt-lead"
            className="mt-[clamp(0.65rem,1.5vw,0.9rem)] text-[clamp(0.92rem,1.65vw,1.05rem)] leading-[1.65] text-[rgba(255,255,227,0.78)]"
          >
            Schreib uns über das Formular oder direkt per E-Mail an{" "}
            <a
              id="preiseberechnen-kontakt-email-inline"
              href="mailto:info@preiseberechnen.de"
              className="text-[#ffffe3] underline underline-offset-4 decoration-[rgba(255,255,227,0.35)] outline-none hover:decoration-[#ffffe3] focus-visible:ring-2 focus-visible:ring-[#ffffe3] focus-visible:ring-offset-2 focus-visible:ring-offset-[#030F03] rounded-sm"
            >
              info@preiseberechnen.de
            </a>
            .
          </p>
        </header>

        <section
          id="preiseberechnen-kontakt-form-section"
          aria-labelledby="preiseberechnen-kontakt-form-heading"
          className="max-w-[min(42rem,100%)] border-t border-[rgba(255,255,227,0.12)] pt-[clamp(1.5rem,3.5vw,2rem)]"
        >
          <h2
            id="preiseberechnen-kontakt-form-heading"
            className="m-0 text-[clamp(1.05rem,2.2vw,1.22rem)] font-semibold tracking-[-0.02em] text-[#ffffe3]"
          >
            Nachricht senden
          </h2>
          <p
            id="preiseberechnen-kontakt-form-hint"
            className="mt-[clamp(0.45rem,1.2vw,0.65rem)] text-[clamp(0.88rem,1.5vw,0.98rem)] leading-[1.55] text-[rgba(255,255,227,0.62)]"
          >
            Pflichtfelder sind gekennannt. Mit dem Absenden erklärst du dich mit
            der Verarbeitung gemäß unserer{" "}
            <Link
              id="preiseberechnen-kontakt-link-datenschutz"
              href="/datenschutz"
              className="text-[#ffffe3] underline underline-offset-4 decoration-[rgba(255,255,227,0.35)] outline-none hover:decoration-[#ffffe3] focus-visible:ring-2 focus-visible:ring-[#ffffe3] focus-visible:ring-offset-2 focus-visible:ring-offset-[#030F03] rounded-sm"
            >
              Datenschutzerklärung
            </Link>{" "}
            einverstanden.
          </p>
          <div className="mt-[clamp(1rem,2.5vw,1.35rem)]">
            <ContactForm />
          </div>
        </section>

        <p
          id="preiseberechnen-kontakt-back"
          className="mt-[clamp(2rem,4vw,2.75rem)] text-[clamp(0.9rem,1.55vw,1.05rem)] text-[rgba(255,255,227,0.78)]"
        >
          <Link
            id="preiseberechnen-kontakt-link-home"
            href="/"
            className="text-[#ffffe3] underline underline-offset-4 decoration-[rgba(255,255,227,0.35)] outline-none hover:decoration-[#ffffe3] focus-visible:ring-2 focus-visible:ring-[#ffffe3] focus-visible:ring-offset-2 focus-visible:ring-offset-[#030F03] rounded-sm"
          >
            Zur Startseite
          </Link>
        </p>
      </article>
    </main>
  );
}
