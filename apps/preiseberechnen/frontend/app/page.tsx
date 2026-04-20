"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ProzessSection } from "./components/ProzessSection";
import { StatsBarsSection } from "./components/StatsBarsSection";
import { PrincipleQuoteSection } from "./components/PrincipleQuoteSection";
import { DualCTASection } from "./components/DualCTASection";
import { FaqSection } from "./components/FaqSection";
import { Button } from "./components/Button";
import { CursorReactiveNetwork } from "./components/CursorReactiveNetwork";
import { PreiseberechnenFeatureDeliverables } from "./components/PreiseberechnenFeatureDeliverables";
import { FillCircle } from "./components/FillCircle";

gsap.registerPlugin(ScrollTrigger);

const HERO_TERMS = ["Notare", "Anwälte", "Elektriker", "TÜV", "Zahnärzte"] as const;

const HERO_WORD_TRANSITION_MS = 560;
const HERO_WORD_START_DELAY_MS = 1500;
const HERO_NETWORK_DELAY_MS = 1200;

const HERO_SHRINK_MD = "(min-width: 768px)";

export default function Home() {
  const [termIndex, setTermIndex] = useState(0);
  const [incomingTermIndex, setIncomingTermIndex] = useState<number | null>(
    null,
  );
  const [showNetwork, setShowNetwork] = useState(false);
  const [networkVisible, setNetworkVisible] = useState(false);
  const termIndexRef = useRef(0);
  const transitionTimeoutRef = useRef<number | null>(null);
  const wordIntervalRef = useRef<number | null>(null);
  /** Scale nur auf Shell — Hero-Bereich selbst bleibt per fixed am gleichen Ort. */
  const heroTransformShellRef = useRef<HTMLDivElement>(null);
  const featureSectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    termIndexRef.current = termIndex;
  }, [termIndex]);

  useEffect(() => {
    const rotateWord = () => {
      const current = termIndexRef.current;
      const next = (current + 1) % HERO_TERMS.length;

      if (
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ) {
        termIndexRef.current = next;
        setTermIndex(next);
        return;
      }

      setIncomingTermIndex(next);
      if (transitionTimeoutRef.current != null) {
        window.clearTimeout(transitionTimeoutRef.current);
      }
      transitionTimeoutRef.current = window.setTimeout(() => {
        termIndexRef.current = next;
        setTermIndex(next);
        setIncomingTermIndex(null);
        transitionTimeoutRef.current = null;
      }, HERO_WORD_TRANSITION_MS);
    };

    const startTimeoutId = window.setTimeout(() => {
      rotateWord();
      wordIntervalRef.current = window.setInterval(rotateWord, 2000);
    }, HERO_WORD_START_DELAY_MS);

    return () => {
      window.clearTimeout(startTimeoutId);
      if (wordIntervalRef.current != null) {
        window.clearInterval(wordIntervalRef.current);
        wordIntervalRef.current = null;
      }
      if (transitionTimeoutRef.current != null) {
        window.clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const w = window as Window & {
      requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    let timeoutId: number | null = null;
    let idleId: number | null = null;
    timeoutId = window.setTimeout(() => {
      if (typeof w.requestIdleCallback === "function") {
        idleId = w.requestIdleCallback(() => setShowNetwork(true), { timeout: 1000 });
      } else {
        setShowNetwork(true);
      }
    }, HERO_NETWORK_DELAY_MS);

    return () => {
      if (timeoutId != null) window.clearTimeout(timeoutId);
      if (idleId != null && typeof w.cancelIdleCallback === "function") {
        w.cancelIdleCallback(idleId);
      }
    };
  }, []);

  useEffect(() => {
    if (!showNetwork) {
      setNetworkVisible(false);
      return;
    }

    // Ein Tick warten, damit der Canvas zuerst mit opacity:0 gemountet wird.
    const revealTimeoutId = window.setTimeout(() => {
      setNetworkVisible(true);
    }, 40);

    return () => {
      window.clearTimeout(revealTimeoutId);
    };
  }, [showNetwork]);

  useLayoutEffect(() => {
    const shell = heroTransformShellRef.current;
    const feature = featureSectionRef.current;
    if (!shell || !feature) return;

    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const ctx = gsap.context(() => {
      ScrollTrigger.matchMedia({
        [HERO_SHRINK_MD]: () => {
          gsap.fromTo(
            shell,
            { scale: 1, borderRadius: 0 },
            {
              scale: 0.88,
              borderRadius: "1.125rem",
              ease: "none",
              force3D: true,
              transformOrigin: "50% 0%",
              scrollTrigger: {
                trigger: feature,
                start: "top bottom",
                end: "top top",
                scrub: true,
                invalidateOnRefresh: true,
              },
            },
          );
          return () => undefined;
        },
      });
    }, feature);

    const refresh = () => {
      ScrollTrigger.refresh();
    };
    window.addEventListener("load", refresh);
    requestAnimationFrame(refresh);

    return () => {
      window.removeEventListener("load", refresh);
      ctx.revert();
    };
  }, []);

  return (
    <main id="preiseberechnen-main">
      {/*
        Desktop: Spacer 220vh erzeugt Scroll. Hero ist fixed (immer gleiche Viewport-Position).
        Feature (-mt 100svh, z-20) scrollt hoch — Scale läuft genau in dieser Phase (ScrollTrigger an Feature).
      */}
      <div id="preiseberechnen-hero-scroll-root" className="relative z-0">
        <div
          id="preiseberechnen-hero-scroll-spacer"
          className="hidden w-full md:block md:min-h-[220vh]"
          aria-hidden="true"
        />
        <section
          id="preiseberechnen-hero"
          className="preiseberechnen-page-hero relative z-0 flex min-h-[88vh] flex-col overflow-hidden text-center max-md:items-center max-md:justify-center md:fixed md:inset-x-0 md:top-0 md:z-0 md:h-[100svh] md:min-h-0 md:w-full md:items-stretch"
        >
        <div
          ref={heroTransformShellRef}
          id="preiseberechnen-hero-transform-shell"
          className="relative box-border flex h-full min-h-[88vh] w-full max-w-full flex-col items-center justify-center gap-[clamp(1.5rem,3vw,2.4rem)] overflow-hidden max-md:min-h-[88vh] md:min-h-0 md:gap-[clamp(0.55rem,min(2.75vw,3svh),1.75rem)] md:px-[clamp(0.5rem,min(2vw,1.5svh),1.25rem)] md:pt-[calc(var(--preiseberechnen-header-desktop-offset)+clamp(0.2rem,0.8svh,0.65rem))] md:pb-[max(0.5rem,calc(0.35rem+env(safe-area-inset-bottom,0px)))] md:will-change-transform"
        >
        <div
          className={`pointer-events-none absolute inset-0 z-0 transition-opacity duration-700 ease-out ${
            networkVisible ? "opacity-100" : "opacity-0"
          }`}
        >
          {showNetwork ? (
            <CursorReactiveNetwork id="preiseberechnen-hero-network" />
          ) : null}
        </div>

        <div id="preiseberechnen-hero-heading-wrapper">
          <h1
            id="preiseberechnen-hero-heading"
            className="relative z-10 flex flex-col items-center text-center text-[clamp(2.9rem,10vw,6.8rem)] leading-[0.98] tracking-[-0.03em] font-light text-[#ffffe3] md:text-[clamp(1.9rem,min(10vw,11svh),6.8rem)] md:leading-[0.96]"
          >
            <span
              id="preiseberechnen-hero-heading-line-1-wrap"
              className="max-w-[12ch] w-full overflow-hidden"
            >
              <span
                id="preiseberechnen-hero-heading-line-1"
                className="preiseberechnen-hero-line-motion preiseberechnen-hero-line-motion--stagger-1 block"
              >
                Bezahl nie
              </span>
            </span>
            <span
              id="preiseberechnen-hero-heading-line-2-wrap"
              className="max-w-[12ch] w-full overflow-hidden"
            >
              <span
                id="preiseberechnen-hero-heading-line-2"
                className="preiseberechnen-hero-line-motion preiseberechnen-hero-line-motion--stagger-2 block"
              >
                wieder zu viel
              </span>
            </span>
            <span
              id="preiseberechnen-hero-heading-line-3-wrap"
              className="-mt-[clamp(0.06em,0.9vw,0.14em)] flex w-full max-w-[min(100%,92vw)] justify-center overflow-hidden px-[clamp(0.15rem,1vw,0.5rem)] md:-mt-[clamp(0.02em,min(0.9vw,0.35svh),0.12em)]"
            >
              <span
                id="preiseberechnen-hero-heading-line-3"
                className="preiseberechnen-hero-line-motion preiseberechnen-hero-line-motion--stagger-3 inline-flex max-w-[min(100%,92vw)] flex-wrap items-center justify-start gap-x-[0.2em]"
              >
                <span id="preiseberechnen-hero-heading-fuer" className="shrink-0">
                  für
                </span>
                <span
                  id="preiseberechnen-hero-rotating-term"
                  aria-live="polite"
                  className="relative inline-grid shrink-0 text-[#ffffe3]"
                >
                  {HERO_TERMS.map((t) => (
                    <span
                      key={`preiseberechnen-hero-term-sizer-${t}`}
                      aria-hidden="true"
                      className="invisible col-start-1 row-start-1 whitespace-nowrap font-semibold"
                    >
                      {t}
                    </span>
                  ))}
                  <span
                    id="preiseberechnen-hero-rotating-term-viewport"
                    className="relative col-start-1 row-start-1 h-[1.56em] w-full overflow-hidden font-semibold"
                  >
                    <span
                      id="preiseberechnen-hero-rotating-term-current"
                      className={`absolute inset-0 flex items-center justify-start whitespace-nowrap ${
                        incomingTermIndex != null
                          ? "preiseberechnen-hero-word-out"
                          : ""
                      }`}
                    >
                      {HERO_TERMS[termIndex]}
                    </span>
                    {incomingTermIndex != null && (
                      <span
                        id="preiseberechnen-hero-rotating-term-incoming-wrap"
                        className="pointer-events-none absolute inset-0 flex items-center justify-start"
                      >
                        <span
                          id="preiseberechnen-hero-rotating-term-incoming"
                          className="preiseberechnen-hero-word-in whitespace-nowrap"
                        >
                          {HERO_TERMS[incomingTermIndex]}
                        </span>
                      </span>
                    )}
                  </span>
                </span>
              </span>
            </span>
          </h1>
        </div>

        <div
          id="preiseberechnen-hero-subtitle-wrap"
          className="relative z-10 mx-auto flex w-full max-w-[clamp(20rem,68vw,52rem)] justify-center overflow-hidden px-[clamp(0.75rem,4vw,1.25rem)]"
        >
          <p
            id="preiseberechnen-hero-subtitle"
            className="preiseberechnen-hero-line-motion preiseberechnen-hero-line-motion--stagger-4 m-0 max-w-none text-center text-[clamp(0.95rem,1.9vw,1.75rem)] leading-[1.4] text-[rgba(255,255,227,0.72)] md:text-[clamp(0.78rem,min(1.85vw,2.4svh),1.55rem)] md:leading-[1.32]"
          >
            Anwaltsgebühren, Notarkosten, Websitepreise – wir bringen Transparenz
            in die Themen, bei denen die meisten einfach zu viel bezahlen.
            Kostenlos, anonym, in unter einer Minute.
          </p>
        </div>

        <div
          id="preiseberechnen-hero-cta-wrap"
          className="relative z-10 flex w-full justify-center overflow-hidden"
        >
          <Button
            id="preiseberechnen-hero-overview-link"
            href="#preiseberechnen-feature-section"
            size="lg"
            variant="primary"
            className="preiseberechnen-hero-line-motion preiseberechnen-hero-line-motion--stagger-5"
          >
            Zur Übersicht
          </Button>
        </div>
        </div>
        </section>
      </div>

      <div
        id="preiseberechnen-main-content-stack"
        className="relative z-[10] bg-[var(--background)]"
      >
      <section
        ref={featureSectionRef}
        id="preiseberechnen-feature-section"
        className="relative left-1/2 mt-[clamp(2.5rem,6vh,4rem)] w-screen max-w-[100vw] -translate-x-1/2 overflow-hidden rounded-[clamp(1.25rem,2.2vw,2.75rem)] bg-[var(--foreground)] pt-[var(--preiseberechnen-section-padding-block)] pb-0 text-[#030F03] md:-mt-[100svh] md:shadow-[0_-12px_40px_rgba(0,0,0,0.12)]"
      >
        <PreiseberechnenFeatureDeliverables sectionId="preiseberechnen-feature-section" />
      </section>

      <section
        id="preiseberechnen-kompakt-circle-section"
        aria-labelledby="preiseberechnen-kompakt-circle-heading"
        className="flex justify-center px-[clamp(1rem,4vw,2rem)] py-[var(--preiseberechnen-section-padding-block)]"
      >
        <FillCircle
          sectionId="preiseberechnen-kompakt-circle-section"
          variant="on-green"
          className="w-[min(94vw,54rem)]"
        >
          <h2
            id="preiseberechnen-kompakt-circle-heading"
            className="text-[clamp(1.15rem,3.4vw,1.85rem)] font-semibold leading-snug tracking-[-0.02em] text-[#ffffe3]"
          >
            Alle Preisrechner kompakt an einem Ort!
          </h2>
          <Button
            id="preiseberechnen-kompakt-circle-cta"
            href="/tuev-kosten-rechner"
            size="lg"
            variant="primary"
            className="mt-[clamp(0.75rem,2vw,1rem)]"
          >
            Preisrechner probieren
          </Button>
        </FillCircle>
      </section>

      <ProzessSection />

      <StatsBarsSection />

      <PrincipleQuoteSection />

      <DualCTASection />

      <FaqSection />
      </div>
    </main>
  );
}
