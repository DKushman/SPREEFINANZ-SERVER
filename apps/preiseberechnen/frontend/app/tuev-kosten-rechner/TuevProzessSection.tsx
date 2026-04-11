"use client";

import { useEffect, useRef } from "react";
import { getGsap } from "@/app/lib/gsap-client";

const steps = [
  {
    id: "tuev-prozess-step-1",
    index: "01",
    title: "Beantworte Fragen",
    description:
      "Kurze Fragen zu Fahrzeugtyp, HU-Frist, Region, Aufwand und Prüforganisation.",
  },
  {
    id: "tuev-prozess-step-2",
    index: "02",
    title: "Gib deine Daten ein",
    description: "Ohne Anmeldung, ohne E-Mail – komplett anonym.",
  },
  {
    id: "tuev-prozess-step-3",
    index: "03",
    title: "Sieh dein Ergebnis",
    description:
      "Transparente Kostenübersicht in Echtzeit – als Verhandlungsbasis.",
  },
  {
    id: "tuev-prozess-step-4",
    index: "04",
    title: "Lade dein PDF herunter",
    description: "Und lass dich nicht übers Ohr hauen.",
  },
] as const;

/* ── Desktop: horizontal wave ── */
const H_PATH =
  "M0,160 C140,40 280,40 420,160 C560,280 700,280 840,160 C980,40 1120,40 1260,160 C1400,280 1540,280 1680,160";
/* ── Mobile: vertical wave ── */
const V_PATH =
  "M160,0 C40,120 40,240 160,360 C280,480 280,600 160,720 C40,840 40,960 160,1080 C280,1200 280,1320 160,1440";

export function TuevProzessSection() {
  const hPathRef = useRef<SVGPathElement>(null);
  const vPathRef = useRef<SVGPathElement>(null);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const reduceMotion = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    )?.matches;

    const paths = [hPathRef.current, vPathRef.current].filter(Boolean) as SVGPathElement[];

    for (const path of paths) {
      const len = path.getTotalLength();
      path.style.strokeDasharray = `${len}`;
      path.style.strokeDashoffset = reduceMotion ? "0" : `${len}`;
    }

    if (reduceMotion) return;

    const gsap = getGsap();
    const ctx = gsap.context(() => {
      for (const path of paths) {
        gsap.to(path, {
          strokeDashoffset: 0,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top 70%",
            end: "bottom 50%",
            scrub: 0.5,
          },
        });
      }
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="tuev-prozess-section"
      className="mt-[clamp(4rem,10vh,7rem)] w-[calc(100%+4vh)] mx-[-2vh] overflow-hidden"
      aria-labelledby="tuev-prozess-heading"
    >
      <div
        id="tuev-prozess-container"
        className="px-[2vh] py-[clamp(3.5rem,7vw,6rem)]"
      >
        {/* Header */}
        <div id="tuev-prozess-header" className="text-center">
          <p
            id="tuev-prozess-kicker"
            className="text-[clamp(0.72rem,1.1vw,0.85rem)] font-medium uppercase tracking-[0.14em] text-[rgba(255,255,227,0.35)]"
          >
            So funktioniert's
          </p>
          <h2
            id="tuev-prozess-heading"
            className="mt-[clamp(0.5rem,1vw,0.75rem)] text-[clamp(2.1rem,5vw,3.3rem)] leading-[1.04] font-semibold tracking-[-0.02em] text-[var(--foreground)]"
          >
            4 Schritte zum Ergebnis
          </h2>
          <p
            id="tuev-prozess-subtitle"
            className="mx-auto mt-[clamp(0.35rem,1vw,0.6rem)] max-w-[clamp(22rem,44vw,32rem)] text-[clamp(0.95rem,1.6vw,1.08rem)] leading-[1.5] text-[rgba(255,255,227,0.45)]"
          >
            Unter 60 Sekunden – komplett anonym – fertig
          </p>
        </div>

        {/* ────────────────────────────────────────────────── */}
        {/*  DESKTOP: horizontal wave  (hidden < md)          */}
        {/* ────────────────────────────────────────────────── */}
        <div
          id="tuev-prozess-desktop"
          className="relative mx-auto mt-[clamp(3rem,6vw,5rem)] hidden md:block"
        >
          <svg
            id="tuev-prozess-wave-h"
            viewBox="0 0 1680 320"
            fill="none"
            className="w-full"
            aria-hidden="true"
          >
            <path
              d={H_PATH}
              stroke="rgba(255,255,227,0.08)"
              strokeWidth="2"
              fill="none"
            />
            <path
              ref={hPathRef}
              d={H_PATH}
              stroke="rgba(255,255,227,0.4)"
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
            />
          </svg>

          <ol
            id="tuev-prozess-steps-h"
            className="pointer-events-none absolute inset-0 grid grid-cols-4"
          >
            {steps.map((step, i) => (
              <li
                key={step.id}
                id={`${step.id}-label-h`}
                className={`pointer-events-auto flex flex-col items-center px-[clamp(0.75rem,2vw,1.5rem)] ${
                  i % 2 === 0
                    ? "self-start -translate-y-[clamp(2.2rem,4.5vw,3.2rem)]"
                    : "self-end translate-y-[clamp(2.2rem,4.5vw,3.2rem)]"
                }`}
              >
                <span
                  id={`${step.id}-index-h`}
                  className="text-[clamp(2.4rem,5vw,3.6rem)] font-semibold leading-none text-[rgba(255,255,227,0.06)] select-none"
                  aria-hidden="true"
                >
                  {step.index}
                </span>
                <div className="rounded-[clamp(0.55rem,1.2vw,0.85rem)] bg-[rgba(3,15,3,0.72)] px-[clamp(0.45rem,0.9vw,0.7rem)] py-[clamp(0.3rem,0.7vw,0.5rem)]">
                  <h3
                    id={`${step.id}-title-h`}
                    className="text-center text-[clamp(1rem,1.8vw,1.3rem)] font-semibold leading-[1.2] text-[var(--foreground)]"
                  >
                    {step.title}
                  </h3>
                  <p
                    id={`${step.id}-desc-h`}
                    className="mt-[clamp(0.2rem,0.5vw,0.35rem)] max-w-[24ch] text-center text-[clamp(0.82rem,1.3vw,0.95rem)] leading-[1.5] text-[rgba(255,255,227,0.45)]"
                  >
                    {step.description}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        {/* ────────────────────────────────────────────────── */}
        {/*  MOBILE: vertical timeline  (visible < md)        */}
        {/* ────────────────────────────────────────────────── */}
        <div
          id="tuev-prozess-mobile"
          className="relative mx-auto mt-[clamp(2.5rem,5vw,3.5rem)] max-w-[28rem] md:hidden"
        >
          <svg
            id="tuev-prozess-wave-v"
            viewBox="0 0 320 1440"
            fill="none"
            className="absolute left-[2.25rem] top-0 h-full w-[10rem]"
            aria-hidden="true"
            preserveAspectRatio="none"
          >
            <path
              d={V_PATH}
              stroke="rgba(255,255,227,0.08)"
              strokeWidth="2"
              fill="none"
            />
            <path
              ref={vPathRef}
              d={V_PATH}
              stroke="rgba(255,255,227,0.4)"
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
            />
          </svg>

          <ol
            id="tuev-prozess-steps-v"
            className="relative flex flex-col gap-[clamp(3rem,8vw,5rem)]"
          >
            {steps.map((step) => (
              <li
                key={step.id}
                id={`${step.id}-label-v`}
                className="ml-[5.6rem] flex flex-col"
              >
                <span
                  id={`${step.id}-index-v`}
                  className="text-[clamp(2.2rem,7vw,3rem)] font-semibold leading-none text-[rgba(255,255,227,0.06)] select-none"
                  aria-hidden="true"
                >
                  {step.index}
                </span>
                <div className="w-fit rounded-[0.7rem] bg-[rgba(3,15,3,0.72)] px-[0.55rem] py-[0.4rem]">
                  <h3
                    id={`${step.id}-title-v`}
                    className="text-[clamp(1.1rem,4.5vw,1.35rem)] font-semibold leading-[1.2] text-[var(--foreground)]"
                  >
                    {step.title}
                  </h3>
                  <p
                    id={`${step.id}-desc-v`}
                    className="mt-[0.25rem] max-w-[28ch] text-[clamp(0.88rem,3.5vw,1rem)] leading-[1.5] text-[rgba(255,255,227,0.45)]"
                  >
                    {step.description}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
