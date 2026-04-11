"use client";

import Image from "next/image";
import { useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const DELIVERABLE_ROWS = [
  {
    id: "preiseberechnen-feature-deliverables-row-1",
    indexLabel: "1",
    title: "Keine Abzocke mehr",
    description:
      "Klare Richtwerte statt Bauchgefühl: Du siehst sofort, was marktüblich ist und wo Nachfragen sinnvoll ist.",
    imageSrc: "/preiseberechnen-feature-2.png",
    imageAlt:
      "Freundliche Person, symbolisiert Vertrauen und eine angenehme, faire Verhandlungsbasis",
  },
  {
    id: "preiseberechnen-feature-deliverables-row-2",
    indexLabel: "2",
    title: "Verhandlungsbasis",
    description:
      "Konkrete Zahlen aus dem Rechner helfen dir, Angebote sachlich zu vergleichen und fair zu verhandeln.",
    imageSrc: "/preiseberechnen-feature-1.png",
    imageAlt:
      "Beratungssituation: Person füllt ein Formular aus, symbolisiert klare und sachliche Preisorientierung",
  },
  {
    id: "preiseberechnen-feature-deliverables-row-3",
    indexLabel: "3",
    title: "Keine Überraschungen mehr",
    description:
      "Kosten logisch erklärt – weniger Kleingedrucktes, das dich im Nachhineen vor vollendete Tatsachen stellt.",
    imageSrc: "/preiseberechnen-feature-3.png",
    imageAlt:
      "Person mit Post und Papiertüte, symbolisiert Themen rund um unerwartete Kosten und volle Transparenz",
  },
  {
    id: "preiseberechnen-feature-deliverables-row-4",
    indexLabel: "4",
    title: "Sicher entscheiden",
    description:
      "Mit Transparenz entscheidest du informiert: Du weißt, wofür du zahlst und ob das Angebot zu dir passt.",
    imageSrc: "/preiseberechnen-feature-4.png",
    imageAlt:
      "Geschlossenes Schloss an einer Tür, symbolisiert Sicherheit und ein gutes Gefühl bei der Entscheidung",
  },
] as const;

type PreiseberechnenFeatureDeliverablesProps = {
  sectionId: string;
};

export function PreiseberechnenFeatureDeliverables({
  sectionId,
}: PreiseberechnenFeatureDeliverablesProps) {
  useLayoutEffect(() => {
    const section = document.getElementById(sectionId);
    if (!section) return;

    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const ctx = gsap.context(() => {
      section
        .querySelectorAll<HTMLElement>("[data-preiseberechnen-feature-row]")
        .forEach((row) => {
          const left = row.querySelector<HTMLElement>(
            "[data-preiseberechnen-feature-row-left]",
          );
          const right = row.querySelector<HTMLElement>(
            "[data-preiseberechnen-feature-row-right]",
          );
          if (!left || !right) return;

          gsap
            .timeline({
              scrollTrigger: {
                trigger: row,
                start: "top 90%",
                end: "top 44%",
                scrub: 0.5,
                invalidateOnRefresh: true,
              },
            })
            .fromTo(
              left,
              { x: "-3.5rem", opacity: 0.1, force3D: true },
              { x: 0, opacity: 1, ease: "none" },
            )
            .fromTo(
              right,
              { x: "3.5rem", opacity: 0.1, force3D: true },
              { x: 0, opacity: 1, ease: "none" },
              "<",
            );
        });
    }, section);

    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("load", refresh);
    requestAnimationFrame(refresh);

    return () => {
      window.removeEventListener("load", refresh);
      ctx.revert();
    };
  }, [sectionId]);

  return (
    <div
      id={`${sectionId}-deliverables-inner`}
      className="w-full max-w-none px-[2vh]"
    >
      <header
        id={`${sectionId}-deliverables-header`}
        className="border-b border-[#030F03]/22 pb-[clamp(1.25rem,3vw,2rem)]"
      >
        <p
          id={`${sectionId}-deliverables-eyebrow`}
          className="mb-[clamp(0.75rem,2vw,1.25rem)] text-[clamp(0.65rem,1.05vw,0.78rem)] font-medium uppercase tracking-[0.28em] text-[#030F03]/72"
        >
          [ Leistungen ]
        </p>
        <div
          id={`${sectionId}-deliverables-header-row`}
          className="flex flex-wrap items-end justify-between gap-x-[clamp(1rem,4vw,2.5rem)] gap-y-[clamp(0.5rem,1.5vw,0.75rem)]"
        >
          <span
            id={`${sectionId}-deliverables-count`}
            className="font-semibold tabular-nums text-[clamp(2.75rem,12vw,7.5rem)] leading-[0.92] tracking-[-0.04em] text-[#030F03]"
            aria-hidden="true"
          >
            [4]
          </span>
          <h2
            id={`${sectionId}-deliverables-heading`}
            className="max-w-[min(100%,20ch)] text-right text-[clamp(1.35rem,4.2vw,3.25rem)] font-bold uppercase leading-[1.02] tracking-[0.02em] text-[#030F03]"
          >
            Vorteile
          </h2>
        </div>
      </header>

      <div
        id={`${sectionId}-deliverables-rows-wrap`}
        className="flex w-full flex-col"
      >
        <ul
          id={`${sectionId}-deliverables-rows`}
          className="m-0 flex list-none flex-col p-0"
        >
          {DELIVERABLE_ROWS.map((row) => (
            <li key={row.id} className="contents">
              <article
                id={row.id}
                data-preiseberechnen-feature-row
                className="grid grid-cols-1 gap-y-[clamp(1rem,2.5vw,1.5rem)] border-b border-[#030F03]/22 py-[clamp(1.5rem,4vw,2.75rem)] md:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] md:items-start md:gap-x-[clamp(1.25rem,4vw,3rem)]"
              >
                <div
                  id={`${row.id}-left`}
                  data-preiseberechnen-feature-row-left
                  className="flex flex-col gap-[clamp(0.35rem,1vw,0.55rem)] will-change-transform"
                >
                  <span
                    id={`${row.id}-index`}
                    className="text-[clamp(0.65rem,1.05vw,0.78rem)] font-medium uppercase tracking-[0.22em] text-[#030F03]/58"
                  >
                    [ {row.indexLabel} ]
                  </span>
                  <h3
                    id={`${row.id}-title`}
                    className="text-[clamp(1.35rem,3.2vw,2.35rem)] font-bold uppercase leading-[1.08] tracking-[0.04em] text-[#030F03]"
                  >
                    {row.title}
                  </h3>
                </div>
                <div
                  id={`${row.id}-right`}
                  data-preiseberechnen-feature-row-right
                  className="flex flex-col gap-[clamp(1rem,2.5vw,1.35rem)] will-change-transform sm:flex-row sm:items-start sm:justify-between sm:gap-x-[clamp(1rem,3vw,1.75rem)]"
                >
                  <p
                    id={`${row.id}-description`}
                    className="max-w-[min(100%,42ch)] text-[clamp(0.85rem,1.35vw,1rem)] leading-[1.55] text-[#030F03]/78"
                  >
                    {row.description}
                  </p>
                  <figure
                    id={`${row.id}-figure`}
                    className="relative mx-auto aspect-[5/4] w-full max-w-[min(100%,clamp(9rem,22vw,13rem))] shrink-0 overflow-hidden rounded-[clamp(0.45rem,1.2vw,0.65rem)] sm:mx-0"
                  >
                    <Image
                      src={row.imageSrc}
                      alt={row.imageAlt}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 28vw, 208px"
                    />
                  </figure>
                </div>
              </article>
            </li>
          ))}
        </ul>

        <div
          id={`${sectionId}-deliverables-rechner-cta`}
          className="mt-[clamp(1.25rem,3vw,2rem)] flex w-full justify-start bg-[var(--foreground)] pb-[var(--preiseberechnen-section-padding-block)] pt-[clamp(0.75rem,2.5vw,1.1rem)]"
        >
          <a
            id={`${sectionId}-rechner-link`}
            href="#preiseberechnen-kompakt-circle-section"
            className="inline-flex h-11 items-center justify-center whitespace-nowrap rounded-full bg-[var(--background)] px-6 text-[0.95rem] font-medium text-[var(--foreground)] transition-colors duration-200 hover:bg-[#0a1f0a] active:bg-[#051005] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--foreground)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--foreground)]"
          >
            Rechner sehen
          </a>
        </div>
      </div>
    </div>
  );
}
