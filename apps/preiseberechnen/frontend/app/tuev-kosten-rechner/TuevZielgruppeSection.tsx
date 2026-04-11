const personas = [
  {
    id: "tuev-zielgruppe-erstbesitzer",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="size-[clamp(1.6rem,2.8vw,2.2rem)]" aria-hidden="true">
        <path d="M9 17a2 2 0 1 0 4 0H9Z" />
        <path d="M12 2v1m5.66 2.34-.71.71M22 12h-1M4 12H3m2.05-5.95-.71-.71" />
        <circle cx="12" cy="12" r="4" />
      </svg>
    ),
    title: "Erstbesitzer",
    description: "Erste HU nach 3 Jahren – wissen, was auf dich zukommt.",
  },
  {
    id: "tuev-zielgruppe-gebrauchtwagen",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="size-[clamp(1.6rem,2.8vw,2.2rem)]" aria-hidden="true">
        <path d="M7 17h10M5 13l1.5-5h11L19 13" />
        <rect x="3" y="13" width="18" height="4" rx="1" />
        <circle cx="7.5" cy="17" r="1.5" />
        <circle cx="16.5" cy="17" r="1.5" />
      </svg>
    ),
    title: "Gebrauchtwagen\u00ADkäufer",
    description: "TÜV-Kosten beim Kauf realistisch einkalkulieren.",
  },
  {
    id: "tuev-zielgruppe-familien",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="size-[clamp(1.6rem,2.8vw,2.2rem)]" aria-hidden="true">
        <circle cx="9" cy="7" r="3" />
        <circle cx="17" cy="9" r="2" />
        <path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
        <path d="M21 21v-1.5a3 3 0 0 0-3-3h-1" />
      </svg>
    ),
    title: "Familien",
    description: "Mehrere Fahrzeuge? Kosten summieren sich schnell.",
  },
  {
    id: "tuev-zielgruppe-wohnmobil",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="size-[clamp(1.6rem,2.8vw,2.2rem)]" aria-hidden="true">
        <rect x="2" y="6" width="16" height="10" rx="1" />
        <path d="M18 10h2.5a1 1 0 0 1 .8.4l1.5 2a1 1 0 0 1 .2.6V16h-5" />
        <circle cx="7" cy="17" r="1.5" />
        <circle cx="18" cy="17" r="1.5" />
        <path d="M6 10h5" />
      </svg>
    ),
    title: "Wohnmobil-Besitzer",
    description: "Ab 3,5 t andere Regeln und höhere Gebühren.",
  },
  {
    id: "tuev-zielgruppe-eauto",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="size-[clamp(1.6rem,2.8vw,2.2rem)]" aria-hidden="true">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8Z" />
      </svg>
    ),
    title: "E-Auto-Fahrer",
    description: "Keine AU nötig – du sparst bares Geld.",
  },
  {
    id: "tuev-zielgruppe-motorrad",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="size-[clamp(1.6rem,2.8vw,2.2rem)]" aria-hidden="true">
        <circle cx="5" cy="16" r="3" />
        <circle cx="19" cy="16" r="3" />
        <path d="M7.5 14l3-6h4l2 4h2.5" />
        <path d="M10.5 8L9 14" />
      </svg>
    ),
    title: "Motorrad\u00ADfahrer",
    description: "Günstigere HU, gleiche Fristen und Bußgelder.",
  },
] as const;

export function TuevZielgruppeSection() {
  return (
    <section
      id="tuev-zielgruppe-section"
      className="mt-[clamp(2.5rem,6vh,4rem)] w-[calc(100%+4vh)] mx-[-2vh] overflow-hidden"
      aria-labelledby="tuev-zielgruppe-heading"
    >
      <div
        id="tuev-zielgruppe-container"
        className="px-[2vh] py-[clamp(3rem,6vw,5rem)]"
      >
        <header id="tuev-zielgruppe-header" className="max-w-3xl">
          <h2
            id="tuev-zielgruppe-heading"
            className="text-[clamp(2.1rem,5vw,3.3rem)] leading-[1.04] font-semibold tracking-[-0.02em] text-[#ffffe3]"
          >
            Für wen ist der Rechner?
          </h2>
          <p
            id="tuev-zielgruppe-subtitle"
            className="mt-[clamp(0.35rem,1vw,0.6rem)] text-[clamp(0.92rem,1.5vw,1.05rem)] text-[rgba(255,255,227,0.55)] leading-[1.5]"
          >
            Egal welches Fahrzeug – der Rechner hilft dir, den Überblick zu
            behalten.
          </p>
        </header>

        <ul
          id="tuev-zielgruppe-grid"
          className="mt-[clamp(1.8rem,4vw,3rem)] grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-[clamp(0.4rem,0.8vw,0.6rem)]"
        >
          {personas.map((persona) => (
            <li
              key={persona.id}
              id={persona.id}
              className="group relative aspect-square rounded-[clamp(0.6rem,1.1vw,0.85rem)] border border-[rgba(255,255,227,0.1)] bg-[rgba(255,255,227,0.03)] overflow-hidden transition-all duration-400 ease-[cubic-bezier(0.32,0.72,0,1)] hover:border-[rgba(255,255,227,0.22)] hover:bg-[rgba(255,255,227,0.07)]"
            >
              <div className="absolute inset-0 flex flex-col items-center justify-center p-[clamp(0.6rem,1.2vw,1rem)] text-center transition-transform duration-400 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:-translate-y-[12%]">
                <span className="text-[rgba(255,255,227,0.5)] transition-colors duration-400 group-hover:text-[#ffffe3]">
                  {persona.icon}
                </span>
                <h3 className="mt-[clamp(0.4rem,0.9vw,0.65rem)] text-[clamp(0.82rem,1.3vw,0.95rem)] font-medium leading-[1.2] text-[#ffffe3] hyphens-auto">
                  {persona.title}
                </h3>
              </div>

              <p className="absolute inset-x-0 bottom-0 px-[clamp(0.5rem,1vw,0.8rem)] pb-[clamp(0.6rem,1.1vw,0.85rem)] text-center text-[clamp(0.68rem,0.95vw,0.78rem)] leading-[1.4] text-[rgba(255,255,227,0.6)] translate-y-full opacity-0 transition-all duration-400 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-y-0 group-hover:opacity-100">
                {persona.description}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
