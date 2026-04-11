"use client";

import { useEffect, useRef, useState } from "react";
import { getGsap } from "@/app/lib/gsap-client";

type Stat = {
  id: string;
  value: string;
  suffix: string;
  numericTarget: number;
  description: string;
};

const stats: Stat[] = [
  {
    id: "tuev-stat-pruefungen",
    value: "30,9",
    suffix: " Mio.",
    numericTarget: 30.9,
    description: "Fahrzeugprüfungen pro Jahr in Deutschland",
  },
  {
    id: "tuev-stat-preisanstieg",
    value: "+10",
    suffix: " €",
    numericTarget: 10,
    description: "Preisanstieg 2026 bei allen Prüforganisationen",
  },
  {
    id: "tuev-stat-bussgeld",
    value: "60",
    suffix: " €",
    numericTarget: 60,
    description: "Bußgeld + 1 Punkt bei über 8 Monaten Überziehung",
  },
  {
    id: "tuev-stat-aufschlag",
    value: "+20",
    suffix: " %",
    numericTarget: 20,
    description: "Aufschlag auf die HU-Gebühr nach 2 Monaten Überziehung",
  },
];

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

function CountUpValue({ stat, started }: { stat: Stat; started: boolean }) {
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    if (!started) return;

    const reduceMotion = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    )?.matches;

    if (reduceMotion) {
      setDisplay(stat.value);
      return;
    }

    const duration = 900;
    const start = performance.now();

    const tick = (now: number) => {
      const p = clamp01((now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      const current = stat.numericTarget * eased;

      if (stat.value.includes(",")) {
        setDisplay(current.toFixed(1).replace(".", ","));
      } else if (stat.value.startsWith("+")) {
        setDisplay(`+${Math.round(current)}`);
      } else {
        setDisplay(String(Math.round(current)));
      }

      if (p < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }, [started, stat]);

  return (
    <span className="tabular-nums">
      {display}
      {stat.suffix}
    </span>
  );
}

export function TuevZahlenSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setStarted(true);
          io.disconnect();
        }
      },
      { threshold: 0.3, rootMargin: "0px 0px -10% 0px" },
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    const img = imgRef.current;
    if (!section || !img) return;

    const reduceMotion = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    )?.matches;
    if (reduceMotion) return;

    const gsap = getGsap();
    const ctx = gsap.context(() => {
      gsap.fromTo(
        img,
        { yPercent: 0 },
        {
          yPercent: -12,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.4,
          },
        },
      );
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="tuev-zahlen-section"
      ref={sectionRef}
      className="relative mt-[clamp(2.5rem,6vh,4rem)] h-screen min-h-[40rem] w-[calc(100%+4vh)] mx-[-2vh] overflow-hidden rounded-[clamp(1.25rem,2.2vw,2.75rem)]"
      aria-labelledby="tuev-zahlen-heading"
    >
      {/* Parallax background image */}
      <img
        ref={imgRef}
        id="tuev-zahlen-bg"
        src="/tuev-stats-bg.webp"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -top-[8%] h-[120%] w-full select-none object-cover"
      />

      <div
        id="tuev-zahlen-overlay"
        className="absolute inset-0 bg-[rgba(10,8,4,0.72)]"
        aria-hidden="true"
      />

      <div
        id="tuev-zahlen-container"
        className="relative z-10 flex h-full flex-col justify-center px-[clamp(1.5rem,3vw,2.5rem)] py-[clamp(3rem,6vw,5rem)]"
      >
        <div
          id="tuev-zahlen-layout"
          className="grid grid-cols-1 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] gap-[clamp(2rem,4vw,3.5rem)] items-center"
        >
          <header id="tuev-zahlen-header" className="flex flex-col">
            <p
              id="tuev-zahlen-kicker"
              className="flex items-center gap-[clamp(0.35rem,0.7vw,0.5rem)] text-[clamp(0.78rem,1.1vw,0.88rem)] uppercase tracking-[0.1em] text-[rgba(255,255,227,0.6)]"
            >
              <span
                className="size-[clamp(0.35rem,0.55vw,0.45rem)] rounded-full bg-[rgba(255,255,227,0.6)]"
                aria-hidden="true"
              />
              Stats
            </p>
            <h2
              id="tuev-zahlen-heading"
              className="mt-[clamp(0.6rem,1.2vw,0.85rem)] text-[clamp(2.1rem,5.5vw,3.6rem)] leading-[1.05] font-semibold tracking-[-0.02em] text-[#ffffe3]"
            >
              Die Zahlen sprechen für sich
            </h2>
            <p
              id="tuev-zahlen-subtitle"
              className="mt-[clamp(0.75rem,1.5vw,1.1rem)] text-[clamp(0.9rem,1.4vw,1.02rem)] leading-[1.6] text-[rgba(255,255,227,0.6)] max-w-[32rem]"
            >
              Warum es sich lohnt, den Preis vorher zu kennen und unnötige
              Zusatzkosten zu vermeiden.
            </p>
          </header>

          <ul
            id="tuev-zahlen-grid"
            className="grid grid-cols-2 gap-[clamp(0.5rem,1vw,0.7rem)]"
          >
            {stats.map((stat) => (
              <li
                key={stat.id}
                id={stat.id}
                className="relative rounded-[clamp(0.55rem,1vw,0.75rem)] bg-[rgba(255,255,227,0.07)] backdrop-blur-sm border border-[rgba(255,255,227,0.12)] min-h-[clamp(9rem,17vw,12rem)] p-[clamp(1rem,2vw,1.5rem)] flex flex-col justify-between"
              >
                <span
                  className="absolute top-[clamp(0.6rem,1.1vw,0.8rem)] right-[clamp(0.6rem,1.1vw,0.8rem)] size-[clamp(0.25rem,0.4vw,0.3rem)] rounded-full bg-[rgba(255,255,227,0.3)]"
                  aria-hidden="true"
                />

                <p className="text-[clamp(2.2rem,5.5vw,4.2rem)] font-semibold leading-[1] text-[#ffffe3]">
                  <CountUpValue stat={stat} started={started} />
                </p>

                <p className="text-[clamp(0.78rem,1.1vw,0.88rem)] leading-[1.45] text-[rgba(255,255,227,0.7)]">
                  {stat.description}
                </p>

                <span
                  className="absolute bottom-[clamp(0.6rem,1.1vw,0.8rem)] right-[clamp(0.6rem,1.1vw,0.8rem)] size-[clamp(0.25rem,0.4vw,0.3rem)] rounded-full bg-[rgba(255,255,227,0.3)]"
                  aria-hidden="true"
                />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
