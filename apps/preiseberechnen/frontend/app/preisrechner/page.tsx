import type { Metadata } from "next";
import { PreisrechnerSammlung } from "./preisrechner";

export const metadata: Metadata = {
  title: "Alle Preisrechner | Preiseberechnen",
  description:
    "Übersicht aller kostenlosen Preisrechner auf preiseberechnen.de – TÜV und mehr.",
  openGraph: {
    title: "Alle Preisrechner | Preiseberechnen",
    description:
      "Wähle einen Rechner und erhalte schnell eine transparente Kostenschätzung.",
    type: "website",
    locale: "de_DE",
  },
};

export default function PreisrechnerPage() {
  return (
    <main
      id="preiseberechnen-preisrechner-main"
      className="w-full pb-[clamp(3rem,7vh,5rem)] text-[#ffffe3]"
    >
      <article
        id="preiseberechnen-preisrechner-article"
        className="w-full px-[2vh] pb-[clamp(2.75rem,6vh,4.25rem)] pt-[clamp(3.5rem,11svh,6.75rem)]"
      >
        <header
          id="preiseberechnen-preisrechner-header"
          className="preiseberechnen-page-hero mb-[clamp(1.5rem,3.5vw,2.5rem)] w-full max-w-none"
        >
          <h1
            id="preiseberechnen-preisrechner-heading"
            className="preiseberechnen-hero-line-motion preiseberechnen-hero-line-motion--stagger-1 m-0 text-[clamp(1.65rem,4.2vw,2.35rem)] font-semibold tracking-[-0.02em] text-[#ffffe3]"
          >
            Preisrechner
          </h1>
          <p
            id="preiseberechnen-preisrechner-intro"
            className="preiseberechnen-hero-line-motion preiseberechnen-hero-line-motion--stagger-2 mt-[clamp(0.65rem,1.8vw,1rem)] max-w-none text-[clamp(0.95rem,1.9vw,1.1rem)] leading-relaxed text-[rgba(255,255,227,0.72)]"
          >
            Alle Rechner auf einen Blick – tippe auf eine Kachel, um loszulegen.
          </p>
        </header>

        <PreisrechnerSammlung />
      </article>
    </main>
  );
}
