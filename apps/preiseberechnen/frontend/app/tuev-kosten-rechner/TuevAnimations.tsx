"use client";

import { useEffect } from "react";
import { getGsap } from "@/app/lib/gsap-client";

const ANIMATED_SECTIONS = [
  "tuev-zahlen-section",
  "tuev-zielgruppe-section",
  "tuev-fallstricke-section",
  "tuev-weitere-fragen-section",
] as const;

export function TuevAnimations() {
  useEffect(() => {
    const reduceMotion = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    )?.matches;

    if (reduceMotion) return;

    const gsap = getGsap();
    const ctx = gsap.context(() => {
      ANIMATED_SECTIONS.forEach((sectionId) => {
        const section = document.getElementById(sectionId);
        if (!section) return;

        const header = section.querySelector("header");
        const contentChildren = section.querySelectorAll(
          "ul, ol, nav, table, .overflow-x-auto",
        );

        if (header) {
          gsap.from(header, {
            y: 40,
            opacity: 0,
            duration: 0.7,
            ease: "power3.out",
            scrollTrigger: {
              trigger: section,
              start: "top 80%",
              once: true,
            },
          });
        }

        contentChildren.forEach((child, i) => {
          gsap.from(child, {
            y: 50,
            opacity: 0,
            duration: 0.7,
            delay: 0.15 + i * 0.1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: section,
              start: "top 75%",
              once: true,
            },
          });
        });
      });
    });

    return () => ctx.revert();
  }, []);

  return null;
}
