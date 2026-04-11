const trustSignals = [
  {
    id: "tuev-vertrauen-unabhaengig",
    number: "01",
    titlePrefix: "Wir sind",
    titleSubject: "100 % unabhängig",
    description:
      "Wir sind kein TÜV, keine DEKRA, keine Werkstatt. Wir haben kein Interesse, dir etwas zu verkaufen.",
  },
  {
    id: "tuev-vertrauen-kostenlos",
    number: "02",
    titlePrefix: "Wir bleiben",
    titleSubject: "komplett kostenlos",
    description:
      "Kein versteckter Haken. Kein Premium-Upgrade. Der Rechner ist und bleibt gratis.",
  },
  {
    id: "tuev-vertrauen-sofort",
    number: "03",
    titlePrefix: "Wir liefern",
    titleSubject: "ein sofortiges Ergebnis",
    description:
      "In unter 60 Sekunden weißt du, was dein TÜV kosten wird – ohne Wartezeit.",
  },
  {
    id: "tuev-vertrauen-aktuell",
    number: "04",
    titlePrefix: "Wir arbeiten mit",
    titleSubject: "aktuellen Preisen 2026",
    description:
      "Wir aktualisieren unsere Daten regelmäßig. Alle Preise entsprechen dem Stand Januar 2026.",
  },
] as const;

const CARD_STAGGER_REM = 1.6;

export function TuevVertrauenSection() {
  return (
    <section
      id="tuev-vertrauen-section"
      className="relative mt-[clamp(2.5rem,6vh,4rem)]"
      aria-labelledby="tuev-vertrauen-heading"
    >
      {/* ── Sticky heading block ── */}
      <div
        id="tuev-vertrauen-heading-block"
        className="sticky top-0 z-0 flex min-h-screen flex-col items-center justify-center px-[2vh] text-center"
      >
        <p
          id="tuev-vertrauen-kicker"
          className="text-[clamp(0.72rem,1.1vw,0.85rem)] font-medium uppercase tracking-[0.14em] text-[rgba(255,255,227,0.35)]"
        >
          4 Gründe
        </p>
        <h2
          id="tuev-vertrauen-heading"
          className="mt-[clamp(0.6rem,1.2vw,0.9rem)] max-w-[20ch] text-[clamp(2.6rem,7vw,4.2rem)] leading-[1.04] font-semibold tracking-[-0.02em] text-[var(--foreground)]"
        >
          Warum uns vertrauen?
        </h2>
        <p
          id="tuev-vertrauen-subtitle"
          className="mt-[clamp(0.5rem,1.2vw,0.85rem)] max-w-[clamp(24rem,50vw,36rem)] text-[clamp(1rem,1.8vw,1.2rem)] leading-[1.5] text-[rgba(255,255,227,0.45)]"
        >
          Transparenz ist unser Produkt – nicht deine Daten
        </p>
      </div>

      {/* ── Stacking cards: centered over heading ── */}
      <ul
        id="tuev-vertrauen-cards"
        className="relative z-10 mx-auto flex max-w-[min(60rem,92vw)] flex-col gap-[clamp(3rem,6vw,5rem)] px-[2vh] pb-[clamp(4rem,10vh,8rem)]"
      >
        {trustSignals.map((signal, i) => (
          <li
            key={signal.id}
            id={signal.id}
            className="sticky will-change-[transform] rounded-[clamp(1.25rem,2.4vw,2rem)] bg-[#ffffe3] text-[#1c120e] shadow-[0_16px_56px_rgba(0,0,0,0.12),0_2px_10px_rgba(0,0,0,0.06)]"
            style={{
              top: `calc(30vh + ${i * CARD_STAGGER_REM}rem)`,
            }}
          >
            <article
              id={`${signal.id}-card`}
              className="flex flex-col items-center gap-[clamp(0.6rem,1.2vw,0.9rem)] p-[clamp(2.2rem,4.5vw,3.8rem)] text-center"
            >
              <span
                id={`${signal.id}-number`}
                className="text-[clamp(0.75rem,1.05vw,0.88rem)] font-semibold tabular-nums text-[#1c120e]/25"
                aria-hidden="true"
              >
                {signal.number}
              </span>
              <h3
                id={`${signal.id}-title`}
                className="text-[clamp(1.6rem,3.2vw,2.4rem)] font-semibold leading-[1.08] text-[#1c120e]"
              >
                <span className="font-normal">{signal.titlePrefix}</span>{" "}
                <span className="font-semibold">{signal.titleSubject}</span>
              </h3>
              <p
                id={`${signal.id}-description`}
                className="max-w-[52ch] text-[clamp(1.05rem,1.85vw,1.28rem)] leading-[1.55] text-[#1c120e]/55"
              >
                {signal.description}
              </p>
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}
