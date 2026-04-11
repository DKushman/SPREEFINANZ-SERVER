"use client";

import { useState } from "react";

const priceRows = [
  { type: "Pkw", weight: "bis 3,5 t", huOnly: "~90–97 €", huAu: "143–170 €", interval: "alle 2 Jahre", highlight: true },
  { type: "Pkw (Elektro)", weight: "bis 3,5 t", huOnly: "56–74 €", huAu: "56–74 €", interval: "alle 2 Jahre", highlight: false, badge: "keine AU" },
  { type: "Motorrad", weight: "Kraftrad", huOnly: "~70 €", huAu: "70–100 €", interval: "alle 2 Jahre", highlight: false },
  { type: "Wohnmobil", weight: "3,5–7,5 t", huOnly: "–", huAu: "~180 €", interval: "alle 2 J. (jährl. ab 6 J.)", highlight: false },
  { type: "Wohnmobil", weight: "über 7,5 t", huOnly: "–", huAu: "~200 €", interval: "jährlich", highlight: false },
  { type: "Anhänger (ohne Bremse)", weight: "–", huOnly: "–", huAu: "ab 60 €", interval: "alle 2 Jahre", highlight: false },
  { type: "Anhänger (gebremst)", weight: "bis 12 t", huOnly: "–", huAu: "bis 100 €", interval: "alle 2 Jahre", highlight: false },
] as const;

const costFactors = [
  { id: "fahrzeugtyp", label: "Fahrzeugtyp", detail: "Pkw, Motorrad, Lkw oder Anhänger – jeder Typ hat eigene Gebühren.", abbr: "Fzg", cx: 12, cy: 12 },
  { id: "hu-au", label: "HU vs. AU", detail: "HU = Hauptuntersuchung, AU = Abgasuntersuchung. Zusammen kosten sie mehr – E-Autos brauchen nur die HU.", abbr: "HU", cx: 49, cy: 8 },
  { id: "gewicht", label: "Gewicht (zGG)", detail: "Je schwerer das Fahrzeug, desto höher die Prüfgebühr.", abbr: "kg", cx: 88, cy: 12 },
  { id: "bundesland", label: "Bundesland", detail: "Regionale Gebührenunterschiede von bis zu 20 € sind üblich.", abbr: "BL", cx: 8, cy: 50 },
  { id: "prueforg", label: "Prüforganisation", detail: "TÜV, DEKRA, GTÜ oder KÜS – alle prüfen gleich, aber nicht gleich teuer.", abbr: "Org", cx: 92, cy: 48 },
  { id: "antrieb", label: "Antrieb", detail: "E-Autos brauchen keine Abgasuntersuchung – das spart 30–50 €.", abbr: "E", cx: 14, cy: 92 },
  { id: "frist", label: "Fristüberziehung", detail: "Ab 2 Monaten Verspätung: +20 % Aufschlag auf die HU-Gebühr.", abbr: "Ü", cx: 89, cy: 93 },
] as const;

function FactorNode({
  factor,
  isActive,
  hasAnyActive,
  onActivate,
}: {
  factor: (typeof costFactors)[number];
  isActive: boolean;
  hasAnyActive: boolean;
  onActivate: () => void;
}) {
  const dimmed = hasAnyActive && !isActive;

  return (
    <div
      id={`tuev-kosten-factor-${factor.id}`}
      className="absolute flex flex-col items-center gap-[clamp(0.4rem,0.8vw,0.6rem)] cursor-pointer group"
      style={{ left: `${factor.cx}%`, top: `${factor.cy}%`, transform: "translate(-50%, -50%)" }}
      onMouseEnter={onActivate}
      onClick={onActivate}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onActivate(); } }}
      aria-expanded={isActive}
    >
      <span
        id={`tuev-kosten-factor-${factor.id}-circle`}
        className={`flex items-center justify-center size-[clamp(4.2rem,8.5vw,6rem)] shrink-0 rounded-full text-[clamp(1rem,1.8vw,1.3rem)] font-semibold transition-all duration-400 ease-out ${
          isActive
            ? "border-2 border-[rgba(255,255,227,0.4)] bg-[rgba(255,255,227,0.1)] text-[#ffffe3] scale-110 shadow-[0_0_30px_rgba(255,255,227,0.06)]"
            : dimmed
              ? "border border-[rgba(255,255,227,0.06)] bg-[rgba(255,255,227,0.02)] text-[rgba(255,255,227,0.2)] scale-95"
              : "border border-[rgba(255,255,227,0.1)] bg-[rgba(255,255,227,0.04)] text-[rgba(255,255,227,0.4)] group-hover:border-[rgba(255,255,227,0.25)] group-hover:bg-[rgba(255,255,227,0.08)] group-hover:text-[rgba(255,255,227,0.7)] group-hover:scale-105"
        }`}
        aria-hidden="true"
      >
        {factor.abbr}
      </span>
      <div className={`flex flex-col items-center text-center max-w-[clamp(9rem,18vw,14rem)] transition-opacity duration-300 ${dimmed ? "opacity-40" : "opacity-100"}`}>
        <dt className={`text-[clamp(0.88rem,1.4vw,1.05rem)] font-semibold leading-[1.2] transition-colors duration-300 ${
          isActive ? "text-[#ffffe3]" : "text-[rgba(255,255,227,0.6)] group-hover:text-[rgba(255,255,227,0.85)]"
        }`}>
          {factor.label}
        </dt>
        <dd className={`text-[clamp(0.75rem,1.05vw,0.85rem)] leading-[1.45] transition-all duration-400 overflow-hidden ${
          isActive
            ? "text-[rgba(255,255,227,0.55)] max-h-[5rem] opacity-100 mt-[clamp(0.15rem,0.3vw,0.25rem)]"
            : "max-h-0 opacity-0"
        }`}>
          {factor.detail}
        </dd>
      </div>
    </div>
  );
}

function ConnectingLines({
  activeId,
}: {
  activeId: string | null;
}) {
  return (
    <svg
      id="tuev-kosten-factors-lines"
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      {costFactors.map((factor) => {
        const active = activeId === factor.id;
        return (
          <line
            key={factor.id}
            x1={`${factor.cx}`}
            y1={`${factor.cy}`}
            x2="50"
            y2="50"
            stroke="rgba(255,255,227,0.08)"
            strokeWidth="0.15"
            className={`transition-all duration-400 ${
              active ? "!stroke-[rgba(255,255,227,0.2)] !stroke-[0.25]" : ""
            }`}
            style={active ? { stroke: "rgba(255,255,227,0.2)", strokeWidth: 0.25 } : undefined}
          />
        );
      })}
    </svg>
  );
}

export function TuevKostenSection() {
  const [activeFactorId, setActiveFactorId] = useState<string | null>(null);

  return (
    <section
      id="tuev-kosten-richtwerte"
      className="mt-[clamp(2.5rem,6vh,4rem)] w-[calc(100%+4vh)] mx-[-2vh] overflow-hidden"
      aria-labelledby="tuev-kosten-heading"
    >
      <div
        id="tuev-kosten-container"
        className="px-[2vh] py-[clamp(3rem,6vw,5rem)]"
      >
        <header id="tuev-kosten-header" className="max-w-3xl">
          <h2
            id="tuev-kosten-heading"
            className="text-[clamp(2.1rem,5vw,3.3rem)] leading-[1.04] font-semibold tracking-[-0.02em]"
          >
            Welche Kosten fallen an?
          </h2>
          <p
            id="tuev-kosten-subtitle"
            className="mt-[clamp(0.5rem,1.2vw,0.85rem)] text-[clamp(0.95rem,1.6vw,1.08rem)] leading-[1.55] text-[rgba(255,255,227,0.55)]"
          >
            Die TÜV-Kosten hängen von mehreren Faktoren ab. Hier siehst du die
            aktuellen Richtwerte für 2026 – inklusive 19 % MwSt.
          </p>
        </header>

        {/* Kostenfaktoren -- organisches interaktives Layout (Desktop) */}
        <div
          id="tuev-kosten-factors-wrapper"
          className="mt-[clamp(2.5rem,5vw,3.5rem)] relative w-full min-h-[clamp(32rem,60vw,44rem)] hidden sm:block"
          onMouseLeave={() => setActiveFactorId(null)}
        >
          <ConnectingLines activeId={activeFactorId} />

          <div
            id="tuev-kosten-factors-center"
            className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-[clamp(2rem,10vw,8rem)]"
          >
            <h3
              id="tuev-kosten-factors-heading"
              className="text-[clamp(1.8rem,4.2vw,2.8rem)] font-semibold leading-[1.08] tracking-[-0.02em] text-[#ffffe3]"
            >
              Wovon hängt der<br />Preis ab?
            </h3>
            <p
              id="tuev-kosten-factors-sub"
              className="mt-[clamp(0.5rem,1vw,0.75rem)] text-[clamp(0.85rem,1.3vw,1rem)] leading-[1.5] max-w-[30rem] text-[rgba(255,255,227,0.4)]"
            >
              7 Faktoren bestimmen, was du am Ende bezahlst. Hover über einen Faktor für Details.
            </p>
          </div>

          <dl
            id="tuev-kosten-factors-organic"
            className="absolute inset-0"
            aria-label="Kostenfaktoren"
          >
            {costFactors.map((factor) => (
              <FactorNode
                key={factor.id}
                factor={factor}
                isActive={activeFactorId === factor.id}
                hasAnyActive={activeFactorId !== null}
                onActivate={() => setActiveFactorId(factor.id)}
              />
            ))}
          </dl>
        </div>

        {/* Mobile: interaktive gestackte Liste */}
        <div
          id="tuev-kosten-factors-mobile"
          className="mt-[clamp(2rem,4vw,3rem)] sm:hidden"
        >
          <h3
            id="tuev-kosten-factors-heading-mobile"
            className="text-[clamp(1.2rem,3vw,1.6rem)] font-semibold leading-[1.1] text-[#ffffe3]"
          >
            Wovon hängt der Preis ab?
          </h3>
          <dl className="mt-[clamp(0.6rem,1.4vw,0.85rem)] flex flex-col">
            {costFactors.map((factor) => (
              <div
                key={factor.id}
                className="flex items-start gap-[clamp(0.5rem,1vw,0.75rem)] py-[clamp(0.6rem,1.2vw,0.8rem)] border-b border-[rgba(255,255,227,0.06)] last:border-b-0"
              >
                <span
                  className="flex items-center justify-center size-[clamp(2.2rem,5vw,2.6rem)] shrink-0 rounded-full border border-[rgba(255,255,227,0.1)] bg-[rgba(255,255,227,0.05)] text-[clamp(0.72rem,1vw,0.82rem)] font-semibold text-[rgba(255,255,227,0.45)] mt-[0.1rem]"
                  aria-hidden="true"
                >
                  {factor.abbr}
                </span>
                <div className="flex flex-col">
                  <dt className="text-[clamp(0.88rem,1.3vw,0.98rem)] font-semibold text-[#ffffe3] leading-[1.2]">
                    {factor.label}
                  </dt>
                  <dd className="mt-[0.1rem] text-[clamp(0.76rem,1.05vw,0.84rem)] text-[rgba(255,255,227,0.45)] leading-[1.4]">
                    {factor.detail}
                  </dd>
                </div>
              </div>
            ))}
          </dl>
        </div>

        {/* Preistabelle */}
        <article
          id="tuev-kosten-table-article"
          className="mt-[clamp(2.5rem,5vw,3.5rem)]"
          aria-labelledby="tuev-kosten-table-heading"
        >
          <h3
            id="tuev-kosten-table-heading"
            className="text-[clamp(0.75rem,1.1vw,0.85rem)] font-medium uppercase tracking-[0.08em] text-[rgba(255,255,227,0.35)]"
          >
            Preisübersicht 2026
          </h3>
          <div
            id="tuev-kosten-table-wrapper"
            className="mt-[clamp(0.6rem,1.2vw,0.85rem)] overflow-x-auto rounded-[clamp(0.6rem,1.1vw,0.85rem)] border border-[rgba(255,255,227,0.08)] bg-[rgba(255,255,227,0.02)]"
          >
            <table
              id="tuev-kosten-table"
              className="w-full border-collapse text-left text-[clamp(0.82rem,1.3vw,0.95rem)]"
            >
              <thead>
                <tr className="border-b border-[rgba(255,255,227,0.1)]">
                  <th className="py-[clamp(0.6rem,1.1vw,0.8rem)] px-[clamp(0.75rem,1.4vw,1rem)] text-[clamp(0.68rem,0.95vw,0.76rem)] font-medium uppercase tracking-[0.06em] text-[rgba(255,255,227,0.35)]">Fahrzeugtyp</th>
                  <th className="py-[clamp(0.6rem,1.1vw,0.8rem)] px-[clamp(0.75rem,1.4vw,1rem)] text-[clamp(0.68rem,0.95vw,0.76rem)] font-medium uppercase tracking-[0.06em] text-[rgba(255,255,227,0.35)]">Gewicht</th>
                  <th className="py-[clamp(0.6rem,1.1vw,0.8rem)] px-[clamp(0.75rem,1.4vw,1rem)] text-[clamp(0.68rem,0.95vw,0.76rem)] font-medium uppercase tracking-[0.06em] text-[rgba(255,255,227,0.35)] hidden sm:table-cell">HU (ohne AU)</th>
                  <th className="py-[clamp(0.6rem,1.1vw,0.8rem)] px-[clamp(0.75rem,1.4vw,1rem)] text-[clamp(0.68rem,0.95vw,0.76rem)] font-medium uppercase tracking-[0.06em] text-[rgba(255,255,227,0.35)]">HU + AU</th>
                  <th className="py-[clamp(0.6rem,1.1vw,0.8rem)] px-[clamp(0.75rem,1.4vw,1rem)] text-[clamp(0.68rem,0.95vw,0.76rem)] font-medium uppercase tracking-[0.06em] text-[rgba(255,255,227,0.35)] hidden md:table-cell">Intervall</th>
                </tr>
              </thead>
              <tbody>
                {priceRows.map((row, i) => (
                  <tr
                    key={i}
                    className={`border-b border-[rgba(255,255,227,0.06)] last:border-b-0 transition-colors hover:bg-[rgba(255,255,227,0.04)] ${
                      row.highlight ? "bg-[rgba(255,255,227,0.03)]" : ""
                    }`}
                  >
                    <td className="py-[clamp(0.55rem,1vw,0.7rem)] px-[clamp(0.75rem,1.4vw,1rem)] font-medium text-[#ffffe3]">
                      {row.type}
                    </td>
                    <td className="py-[clamp(0.55rem,1vw,0.7rem)] px-[clamp(0.75rem,1.4vw,1rem)] text-[rgba(255,255,227,0.5)]">
                      {row.weight}
                    </td>
                    <td className="py-[clamp(0.55rem,1vw,0.7rem)] px-[clamp(0.75rem,1.4vw,1rem)] text-[rgba(255,255,227,0.5)] hidden sm:table-cell">
                      {row.huOnly}
                    </td>
                    <td className="py-[clamp(0.55rem,1vw,0.7rem)] px-[clamp(0.75rem,1.4vw,1rem)] font-semibold text-[#ffffe3]">
                      <span className="flex items-center gap-[clamp(0.3rem,0.6vw,0.45rem)] flex-wrap">
                        {row.huAu}
                        {"badge" in row && row.badge && (
                          <span className="inline-block rounded-[0.25rem] bg-[#1D9E75]/15 px-[clamp(0.3rem,0.5vw,0.4rem)] py-[0.05rem] text-[clamp(0.6rem,0.85vw,0.7rem)] font-medium text-[#1D9E75]">
                            {row.badge}
                          </span>
                        )}
                      </span>
                    </td>
                    <td className="py-[clamp(0.55rem,1vw,0.7rem)] px-[clamp(0.75rem,1.4vw,1rem)] text-[rgba(255,255,227,0.4)] hidden md:table-cell">
                      {row.interval}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p
            id="tuev-kosten-footnote"
            className="mt-[clamp(0.6rem,1.1vw,0.85rem)] text-[clamp(0.7rem,0.95vw,0.78rem)] text-[rgba(255,255,227,0.3)]"
          >
            TÜV Nord &amp; Süd (HU+AU, Pkw bis 3,5 t): 155–169,90 € · GTÜ/KÜS
            oft günstiger · Großstädte tendenziell teurer · Preise Stand Januar 2026
          </p>
        </article>
      </div>
    </section>
  );
}
