const fineRows = [
  { id: "fine-0", period: "bis 2 Monate", fine: "0 €", points: "—", note: "Karenzzeit – normale HU", severity: "green" as const },
  { id: "fine-2", period: "2–4 Monate", fine: "15 €", points: "—", note: "+20 % Aufschlag (erweiterte HU)", severity: "amber" as const },
  { id: "fine-4", period: "4–8 Monate", fine: "25 €", points: "—", note: "+20 % Aufschlag", severity: "amber" as const },
  { id: "fine-8", period: "über 8 Monate", fine: "60 €", points: "1 Punkt", note: "+20 % Aufschlag", severity: "red" as const },
] as const;

const severityColors = {
  green: "bg-[#1D9E75]/15 text-[#34C48E]",
  amber: "bg-[#BA7517]/15 text-[#D99E3C]",
  red: "bg-[#E24B4A]/15 text-[#F06B6A]",
} as const;

const pitfalls = [
  {
    id: "tuev-pitfall-versicherung",
    highlight: "Versicherung kürzt",
    body: "Bei Unfall mit abgelaufenem TÜV riskierst du Leistungskürzungen.",
    severity: "red" as const,
  },
  {
    id: "tuev-pitfall-nachpruefung",
    highlight: "Nachprüfung bis ⅔ Gebühr",
    body: "Erhebliche Mängel? 4 Wochen Zeit – danach zahlst du fast nochmal.",
    severity: "red" as const,
  },
  {
    id: "tuev-pitfall-beleuchtung",
    highlight: "Top-Mangel: Beleuchtung",
    body: "Blinker, Bremslicht, Rückfahrscheinwerfer – vorher selbst prüfen.",
    severity: "amber" as const,
  },
  {
    id: "tuev-pitfall-reifen",
    highlight: "Reifenprofil unter 1,6 mm",
    body: "Gesetzliches Minimum. Empfohlen: 3 mm. Wird beim TÜV gemessen.",
    severity: "amber" as const,
  },
  {
    id: "tuev-pitfall-zubehoer",
    highlight: "Pflichtausstattung fehlt",
    body: "Warndreieck, Verbandskasten, Warnweste – ohne gibt's sofort Mängel.",
    severity: "amber" as const,
  },
  {
    id: "tuev-pitfall-tuning",
    highlight: "Tuning ohne ABE",
    body: "Spoiler, Tieferlegung, Chiptuning – ohne Eintragung erlischt die BE.",
    severity: "red" as const,
  },
] as const;

export function TuevFallstrickeSection() {
  return (
    <section
      id="tuev-fallstricke-section"
      className="mt-[clamp(2.5rem,6vh,4rem)] w-[calc(100%+4vh)] mx-[-2vh] overflow-hidden"
      aria-labelledby="tuev-fallstricke-heading"
    >
      <div
        id="tuev-fallstricke-container"
        className="px-[2vh] py-[clamp(3rem,6vw,5rem)]"
      >
        <header id="tuev-fallstricke-header" className="max-w-3xl">
          <h2
            id="tuev-fallstricke-heading"
            className="text-[clamp(2.1rem,5vw,3.3rem)] leading-[1.04] font-semibold tracking-[-0.02em]"
          >
            Häufige Fallstricke
          </h2>
          <p
            id="tuev-fallstricke-subtitle"
            className="mt-[clamp(0.35rem,1vw,0.6rem)] text-[clamp(0.95rem,1.6vw,1.08rem)] text-[rgba(255,255,227,0.55)]"
          >
            Diese Fehler kosten unnötig Geld – so vermeidest du sie
          </p>
        </header>

        {/* ── Bußgeld-Tabelle ── */}
        <div
          id="tuev-fallstricke-fines-wrapper"
          className="mt-[clamp(2rem,4vw,3rem)] overflow-x-auto rounded-[clamp(0.75rem,1.4vw,1rem)] border border-[rgba(255,255,227,0.12)]"
        >
          <table
            id="tuev-fallstricke-fines-table"
            className="w-full border-collapse text-left text-[clamp(0.85rem,1.35vw,0.98rem)]"
          >
            <thead>
              <tr className="border-b border-[rgba(255,255,227,0.12)]">
                <th className="py-[clamp(0.6rem,1.2vw,0.85rem)] px-[clamp(0.75rem,1.5vw,1rem)] text-[clamp(0.7rem,1vw,0.78rem)] font-medium uppercase tracking-[0.06em] text-[rgba(255,255,227,0.4)]">Überziehung</th>
                <th className="py-[clamp(0.6rem,1.2vw,0.85rem)] px-[clamp(0.75rem,1.5vw,1rem)] text-[clamp(0.7rem,1vw,0.78rem)] font-medium uppercase tracking-[0.06em] text-[rgba(255,255,227,0.4)]">Bußgeld</th>
                <th className="py-[clamp(0.6rem,1.2vw,0.85rem)] px-[clamp(0.75rem,1.5vw,1rem)] text-[clamp(0.7rem,1vw,0.78rem)] font-medium uppercase tracking-[0.06em] text-[rgba(255,255,227,0.4)] hidden sm:table-cell">Punkte</th>
                <th className="py-[clamp(0.6rem,1.2vw,0.85rem)] px-[clamp(0.75rem,1.5vw,1rem)] text-[clamp(0.7rem,1vw,0.78rem)] font-medium uppercase tracking-[0.06em] text-[rgba(255,255,227,0.4)] hidden md:table-cell">Folge</th>
              </tr>
            </thead>
            <tbody>
              {fineRows.map((row) => (
                <tr
                  key={row.id}
                  id={row.id}
                  className="border-b border-[rgba(255,255,227,0.06)] last:border-b-0"
                >
                  <td className="py-[clamp(0.6rem,1.2vw,0.85rem)] px-[clamp(0.75rem,1.5vw,1rem)]">
                    <span className={`inline-block rounded-[0.3rem] px-[clamp(0.4rem,0.8vw,0.55rem)] py-[0.15rem] text-[clamp(0.75rem,1.1vw,0.85rem)] font-semibold ${severityColors[row.severity]}`}>
                      {row.period}
                    </span>
                  </td>
                  <td className="py-[clamp(0.6rem,1.2vw,0.85rem)] px-[clamp(0.75rem,1.5vw,1rem)] text-[clamp(0.95rem,1.5vw,1.1rem)] font-semibold text-[#ffffe3]">{row.fine}</td>
                  <td className="py-[clamp(0.6rem,1.2vw,0.85rem)] px-[clamp(0.75rem,1.5vw,1rem)] text-[rgba(255,255,227,0.55)] hidden sm:table-cell">{row.points}</td>
                  <td className="py-[clamp(0.6rem,1.2vw,0.85rem)] px-[clamp(0.75rem,1.5vw,1rem)] text-[rgba(255,255,227,0.45)] hidden md:table-cell">{row.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── Pitfall-Karten ── */}
        <ul
          id="tuev-fallstricke-pitfalls-grid"
          className="mt-[clamp(2rem,4vw,3rem)] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[clamp(0.75rem,1.8vw,1.25rem)]"
        >
          {pitfalls.map((pitfall) => (
            <li
              key={pitfall.id}
              id={pitfall.id}
              className="grid grid-cols-[2px_minmax(0,1fr)] items-start gap-x-[clamp(0.5rem,1vw,0.7rem)] gap-y-[clamp(0.25rem,0.6vw,0.4rem)]"
            >
              <span
                className="row-span-2 h-full w-[2px] self-stretch bg-[rgba(255,255,227,0.45)]"
                aria-hidden="true"
              />
              <h3
                id={`${pitfall.id}-title`}
                className="text-[clamp(1rem,1.65vw,1.15rem)] font-semibold leading-[1.2] text-[#ffffe3]"
              >
                {pitfall.highlight}
              </h3>
              <p
                id={`${pitfall.id}-description`}
                className="col-start-2 text-[clamp(0.88rem,1.35vw,0.98rem)] leading-[1.55] text-[rgba(255,255,227,0.5)]"
              >
                {pitfall.body}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
