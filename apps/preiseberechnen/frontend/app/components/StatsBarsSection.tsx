"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "./Button";

type StatsBar = {
  id: string;
  target: number; // 0-100
  percentLabel: string; // e.g. "30%"
  description: {
    before: string;
    strong: string;
    after: string;
  };
};

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

export function StatsBarsSection() {
  const stats: StatsBar[] = useMemo(
    () => [
      {
        id: "stats-30",
        target: 30,
        percentLabel: "30%",
        description: {
          before: "der Deutschen kann ",
          strong: "unerwartete Ausgaben",
          after: " nicht tragen",
        },
      },
      {
        id: "stats-64",
        target: 64,
        percentLabel: "64%",
        description: {
          before: "der Deutschen schätzen ",
          strong: "kommende Kosten",
          after: " falsch ein",
        },
      },
    ],
    [],
  );

  const fillRefs = useRef<(HTMLDivElement | null)[]>([]);
  const startedRef = useRef(false);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    const section = document.getElementById("preiseberechnen-stats-section");
    if (!section) return;

    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const io = new IntersectionObserver(
      (entries) => {
        const inView = entries.some((e) => e.isIntersecting);
        if (!inView) return;
        if (startedRef.current) return;
        startedRef.current = true;

        setHasStarted(true);

        // Reduce Motion: jump immediately to the final values
        if (reduceMotion) {
          stats.forEach((s, idx) => {
            const fill = fillRefs.current[idx];
            if (fill) fill.style.height = `${s.target}%`;
          });
          io.disconnect();
          return;
        }

        const durationMs = 950;
        const start = performance.now();

        const tick = (now: number) => {
          const p = clamp01((now - start) / durationMs);
          // easeOutCubic
          const eased = 1 - Math.pow(1 - p, 3);

          stats.forEach((s, idx) => {
            const fill = fillRefs.current[idx];
            if (!fill) return;
            fill.style.height = `${s.target * eased}%`;
          });

          if (p < 1) {
            requestAnimationFrame(tick);
          } else {
            io.disconnect();
          }
        };

        requestAnimationFrame(tick);
      },
      {
        threshold: 0.5,
        rootMargin: "0px 0px -15% 0px",
      },
    );

    io.observe(section);
    return () => io.disconnect();
  }, [stats]);

  return (
    <section
      id="preiseberechnen-stats-section"
      className="bg-[#060f06] text-[#ffffe3] rounded-[clamp(1.25rem,2.2vw,2.75rem)] w-[calc(100%+4vh)] mx-[-2vh] overflow-hidden py-[var(--preiseberechnen-section-padding-block)]"
      aria-labelledby="preiseberechnen-stats-title"
    >
      <div
        id="preiseberechnen-stats-container"
        className="px-[2vh]"
      >
        <header id="preiseberechnen-stats-header" className="max-w-3xl">
          <h2
            id="preiseberechnen-stats-title"
            className="text-[clamp(2.1rem,5vw,3.3rem)] leading-[1.04] font-semibold tracking-[-0.02em]"
          >
            Die Wenigsten können Preise richtig einschätzen
          </h2>
          <p
            id="preiseberechnen-stats-subtitle"
            className="mt-[clamp(0.35rem,1vw,0.6rem)] text-[rgba(255,255,227,0.55)] text-[clamp(0.98rem,2vw,1.18rem)]"
          >
            Die Nummern sind klar
          </p>
        </header>

        <ul
          id="preiseberechnen-stats-list"
          className="mt-[clamp(2rem,4.5vw,3.4rem)] grid grid-cols-1 md:grid-cols-2 gap-[clamp(1.5rem,4vw,3rem)] items-end justify-items-center"
        >
          {stats.map((stat, idx) => (
            <li
              key={stat.id}
              id={`preiseberechnen-stats-item-${stat.id}`}
              className="w-full max-w-[clamp(19rem,48vw,27rem)]"
            >
              {/* Semantik: Fortschritt als Progressbar */}
              <div
                id={`preiseberechnen-stats-bar-${stat.id}`}
                role="progressbar"
                aria-label={stat.percentLabel}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={hasStarted ? stat.target : 0}
                className="relative h-[clamp(13rem,30vw,17rem)] w-full overflow-hidden rounded-[0.25rem] bg-transparent"
              >
                <div
                  ref={(node) => {
                    fillRefs.current[idx] = node;
                  }}
                  className="absolute bottom-0 left-0 right-0 bg-[#ffffe3] rounded-[0.25rem] flex items-start justify-start p-[clamp(0.65rem,1.4vw,0.95rem)]"
                  style={{ willChange: "height", height: "0%" }}
                  aria-hidden="true"
                >
                  <span
                    id={`preiseberechnen-stats-percent-${stat.id}`}
                    className="text-[clamp(1.6rem,3.9vw,2.35rem)] font-semibold text-[#1c120e] leading-none"
                  >
                    {stat.percentLabel}
                  </span>
                </div>
              </div>

              <p
                id={`preiseberechnen-stats-description-${stat.id}`}
                className="mt-[clamp(0.7rem,1.4vw,1rem)] text-[clamp(0.92rem,1.6vw,1.08rem)] leading-[1.3] text-center text-[rgba(255,255,227,0.55)]"
              >
                {stat.description.before}
                <strong className="font-medium text-[#ffffe3]">
                  {stat.description.strong}
                </strong>
                {stat.description.after}
              </p>
            </li>
          ))}
        </ul>

        <div
          id="preiseberechnen-stats-cta-wrapper"
          className="mt-[clamp(2rem,4.5vw,3.4rem)] flex justify-center"
        >
          <Button
            id="preiseberechnen-stats-cta"
            variant="ghost"
            className="border-[rgba(255,255,227,0.35)]"
          >
            Wir helfen!
          </Button>
        </div>
      </div>
    </section>
  );
}

