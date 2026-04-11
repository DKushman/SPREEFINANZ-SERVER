"use client";

import { useEffect, useState } from "react";

type Step = {
  id: string;
  label: string;
  heading: string;
  description: string;
  cta: string;
  placeholderColor: string;
};

const steps: Step[] = [
  {
    id: "auswaehlen",
    label: "Auswählen",
    heading: "Auswählen",
    description:
      "Wähle den passenden Rechner aus unserer Übersicht – ob Anwalts-, Notar- oder Websitekosten. In Sekunden bist du beim richtigen Thema.",
    cta: "Rechner entdecken →",
    placeholderColor: "#1a3a1a",
  },
  {
    id: "eingeben",
    label: "Eingeben",
    heading: "Eingeben",
    description:
      "Gib wenige, anonyme Eckdaten ein – keine Anmeldung, keine persönlichen Daten. Unser Rechner braucht nur das Nötigste, um dir eine verlässliche Einschätzung zu liefern.",
    cta: "Jetzt loslegen →",
    placeholderColor: "#2a1a0a",
  },
  {
    id: "wissen",
    label: "Wissen",
    heading: "Wissen",
    description:
      "Innerhalb von Sekunden erhältst du eine transparente Kostenübersicht – als Verhandlungsbasis oder zur eigenen Orientierung. Kein Rätselraten mehr.",
    cta: "Mehr erfahren →",
    placeholderColor: "#0a1a2a",
  },
];

export function ProzessSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isInView, setIsInView] = useState(false);
  const active = steps[activeIndex];
  const globalProgress = (activeIndex + progress) / steps.length;

  useEffect(() => {
    if (typeof window === "undefined") return;
    const el = document.getElementById("preiseberechnen-prozess-section");
    if (!el) return;

    const io = new IntersectionObserver(
      (entries) => {
        const inView = entries.some((e) => e.isIntersecting);
        setIsInView(inView);
      },
      { threshold: 0.25 },
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!isInView) return;
    const reduceMotion = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    )?.matches;
    if (reduceMotion) return;

    const STEP_DURATION_MS = 4500;
    setProgress(0);
    const startAt = performance.now();
    let raf = 0;

    const tick = (now: number) => {
      const p = (now - startAt) / STEP_DURATION_MS;
      if (p >= 1) {
        setProgress(1);
        setActiveIndex((i) => (i + 1) % steps.length);
        return;
      }
      setProgress(p);
      raf = window.requestAnimationFrame(tick);
    };

    raf = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(raf);
  }, [activeIndex, isInView]);

  return (
    <section
      id="preiseberechnen-prozess-section"
      className="w-[calc(100%+4vh)] mx-[-2vh] overflow-hidden py-[var(--preiseberechnen-section-padding-block)]"
      aria-labelledby="preiseberechnen-prozess-heading"
    >
      <div
        id="preiseberechnen-prozess-container"
        className="px-[2vh]"
      >
        <h2
          id="preiseberechnen-prozess-heading"
          className="text-[clamp(2.1rem,5vw,3.3rem)] leading-[1.04] font-semibold tracking-[-0.02em]"
        >
          So funktionierts!
        </h2>

        <nav
          id="preiseberechnen-prozess-tabs"
          aria-label="Prozess-Schritte"
          className="relative mt-[clamp(1.1rem,2.8vw,2.0rem)] flex justify-between border-b border-[rgba(255,255,227,0.15)]"
        >
          <span
            aria-hidden="true"
            className="absolute bottom-0 left-0 h-[2px] bg-[#ffffe3] pointer-events-none"
            style={{ width: `${Math.min(1, globalProgress) * 100}%` }}
          />

          {steps.map((step, idx) => (
            <button
              key={step.id}
              id={`preiseberechnen-prozess-tab-${step.id}`}
              type="button"
              role="tab"
              aria-selected={idx === activeIndex}
              aria-controls={`preiseberechnen-prozess-panel-${step.id}`}
              onClick={() => setActiveIndex(idx)}
              className={`flex-1 text-center pb-[clamp(0.35rem,0.85vw,0.6rem)] text-[clamp(1.05rem,2.4vw,1.35rem)] font-semibold tracking-[-0.01em] transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-[#ffffe3] focus-visible:ring-offset-2 focus-visible:ring-offset-[#030F03] rounded-sm cursor-pointer ${
                idx === activeIndex
                  ? "text-[#ffffe3]"
                  : "text-[rgba(255,255,227,0.4)] hover:text-[rgba(255,255,227,0.65)]"
              }`}
            >
              {step.label}
            </button>
          ))}
        </nav>

        <div
          id={`preiseberechnen-prozess-panel-${active.id}`}
          role="tabpanel"
          aria-labelledby={`preiseberechnen-prozess-tab-${active.id}`}
          className="mt-[clamp(2rem,4vw,3rem)] grid grid-cols-1 lg:grid-cols-2 gap-[clamp(2rem,5vw,4rem)] items-center"
        >
          <div id="preiseberechnen-prozess-text" className="flex flex-col gap-[clamp(1rem,2.5vw,1.75rem)]">
            <h3
              id={`preiseberechnen-prozess-step-heading-${active.id}`}
              className="text-[clamp(1.6rem,3.8vw,2.4rem)] leading-[1.08] font-semibold tracking-[-0.02em]"
            >
              {active.heading}
            </h3>
            <p
              id={`preiseberechnen-prozess-step-description-${active.id}`}
              className="max-w-lg text-[clamp(0.95rem,1.6vw,1.08rem)] leading-[1.55] text-[rgba(255,255,227,0.7)]"
            >
              {active.description}
            </p>
            <p>
              <a
                id={`preiseberechnen-prozess-step-cta-${active.id}`}
                href="#preiseberechnen-feature-section"
                className="inline-block text-[clamp(0.92rem,1.5vw,1.02rem)] text-[#ffffe3] underline underline-offset-4 decoration-[rgba(255,255,227,0.45)] hover:decoration-[#ffffe3] transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-[#ffffe3] focus-visible:ring-offset-2 focus-visible:ring-offset-[#030F03] rounded-sm"
              >
                {active.cta}
              </a>
            </p>
          </div>

          <div
            id="preiseberechnen-prozess-visual"
            className="w-full aspect-[4/3] rounded-[clamp(0.75rem,1.8vw,1.5rem)] flex items-center justify-center transition-colors duration-300"
            style={{ backgroundColor: active.placeholderColor }}
            aria-hidden="true"
          >
            <span className="text-[rgba(255,255,227,0.25)] text-[clamp(0.85rem,1.4vw,1rem)] select-none">
              Video – Schritt {activeIndex + 1}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
