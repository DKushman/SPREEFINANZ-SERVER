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
      className="w-full pb-[clamp(2.5rem,6vh,4rem)] text-[#ffffe3]"
    >
      <article
        id="preiseberechnen-preisrechner-article"
        className="w-full px-[2vh] py-[clamp(2rem,5vh,3.5rem)]"
      >
        <header
          id="preiseberechnen-preisrechner-header"
          className="mb-[clamp(1.5rem,3.5vw,2.5rem)] w-full max-w-none"
        >
          <h1
            id="preiseberechnen-preisrechner-heading"
            className="m-0 text-[clamp(1.65rem,4.2vw,2.35rem)] font-semibold tracking-[-0.02em] text-[#ffffe3]"
          >
            Preisrechner
          </h1>
          <p
            id="preiseberechnen-preisrechner-intro"
            className="mt-[clamp(0.65rem,1.8vw,1rem)] max-w-none text-[clamp(0.95rem,1.9vw,1.1rem)] leading-relaxed text-[rgba(255,255,227,0.72)]"
          >
            Alle Rechner auf einen Blick – tippe auf eine Kachel, um loszulegen.
          </p>
        </header>

        <PreisrechnerSammlung />
      </article>
    </main>
  );
}
