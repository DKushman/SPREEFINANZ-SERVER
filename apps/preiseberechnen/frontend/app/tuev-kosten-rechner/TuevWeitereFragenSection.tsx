const cards = [
  {
    id: "tuev-weitere-pruefung",
    index: "1",
    title: "Was genau wird beim TÜV geprüft?",
    description:
      "Bremsen, Beleuchtung, Karosserie – alle Prüfpunkte im Detail.",
    image: "/weitere-1.webp",
    href: "#",
  },
  {
    id: "tuev-weitere-vorbereitung",
    index: "2",
    title: "Wie bereite ich mich optimal vor?",
    description:
      "Checkliste: So bestehst du den TÜV beim ersten Anlauf.",
    image: "/weitere-2.webp",
    href: "#",
  },
  {
    id: "tuev-weitere-nachpruefung",
    index: "3",
    title: "Nachprüfung & Mängel",
    description:
      "Was passiert bei Mängeln? Fristen, Kosten und Ablauf erklärt.",
    image: "/weitere-3.webp",
    href: "#",
  },
] as const;

export function TuevWeitereFragenSection() {
  return (
    <section
      id="tuev-weitere-fragen-section"
      className="mt-[clamp(2.5rem,6vh,4rem)] w-[calc(100%+4vh)] mx-[-2vh] overflow-hidden"
      aria-labelledby="tuev-weitere-fragen-heading"
    >
      <div
        id="tuev-weitere-fragen-container"
        className="px-[2vh] py-[clamp(3rem,6vw,5rem)]"
      >
        <h2
          id="tuev-weitere-fragen-heading"
          className="max-w-3xl text-[clamp(2.1rem,5vw,3.3rem)] leading-[1.04] font-semibold tracking-[-0.02em]"
        >
          Weitere Fragen zum TÜV
        </h2>
        <p
          id="tuev-weitere-fragen-subtitle"
          className="mt-[clamp(0.35rem,1vw,0.6rem)] max-w-3xl text-[clamp(0.95rem,1.6vw,1.08rem)] text-[rgba(255,255,227,0.55)]"
        >
          Vertiefende Informationen rund um die Hauptuntersuchung
        </p>

        <div
          id="tuev-weitere-fragen-grid"
          className="mt-[clamp(1.35rem,3.5vw,3.4rem)] grid grid-cols-1 gap-2.5 sm:mt-[clamp(2rem,4.5vw,3.4rem)] sm:grid-cols-3 sm:gap-[clamp(0.5rem,1vw,0.75rem)]"
        >
          {cards.map((card) => (
            <a
              key={card.id}
              id={card.id}
              href={card.href}
              className="group relative block h-[min(42svh,19.5rem)] overflow-hidden rounded-lg sm:h-[clamp(26rem,88vh,44rem)] sm:rounded-[clamp(0.75rem,1.4vw,1rem)] lg:h-[clamp(34rem,120vh,52rem)]"
            >
              {/* Background image with hover zoom + blur */}
              <img
                id={`${card.id}-img`}
                src={card.image}
                alt=""
                aria-hidden="true"
                loading="lazy"
                decoding="async"
                className="pointer-events-none absolute inset-0 h-full w-full scale-100 transform-gpu select-none object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,0.61,0.36,1)] will-change-transform group-hover:scale-[1.06] group-hover:blur-[2px]"
              />

              {/* Gradient overlay for text readability */}
              <span
                id={`${card.id}-overlay`}
                className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[rgba(3,15,3,0.78)] via-[rgba(3,15,3,0.4)] to-transparent transition-opacity duration-500 group-hover:opacity-90"
                aria-hidden="true"
              />

              {/* Sticky text block */}
              <div
                id={`${card.id}-content`}
                className="sticky top-[50%] z-10 -translate-y-1/2 p-3 sm:p-[clamp(1.25rem,2.5vw,1.75rem)]"
              >
                <span
                  id={`${card.id}-index`}
                  className="inline-flex size-7 items-center justify-center rounded-full border border-[rgba(255,255,227,0.3)] text-[0.62rem] font-medium text-[rgba(255,255,227,0.7)] sm:size-[clamp(1.5rem,2.4vw,1.85rem)] sm:text-[clamp(0.65rem,1vw,0.78rem)]"
                  aria-hidden="true"
                >
                  {card.index}
                </span>

                <h3
                  id={`${card.id}-title`}
                  className="mt-2.5 text-[0.92rem] font-semibold leading-[1.25] text-[#ffffe3] sm:mt-[clamp(0.75rem,1.5vw,1.1rem)] sm:text-[clamp(1.1rem,1.8vw,1.3rem)] sm:leading-[1.2]"
                >
                  {card.title}
                </h3>
                <p
                  id={`${card.id}-description`}
                  className="mt-1.5 text-[0.76rem] leading-[1.45] text-[rgba(255,255,227,0.6)] sm:mt-[clamp(0.3rem,0.7vw,0.5rem)] sm:text-[clamp(0.85rem,1.3vw,0.95rem)] sm:leading-[1.5]"
                >
                  {card.description}
                </p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
