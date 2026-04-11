"use client";

import { useEffect } from "react";
import { getGsap, loadSplitTextPlugin } from "@/app/lib/gsap-client";

const SECTION_ID = "preiseberechnen-dual-cta-section";

export function DualCTAHeadingsAnimator() {
  useEffect(() => {
    const section = document.getElementById(SECTION_ID);
    if (!section) return;

    const gsap = getGsap();
    let ctx: gsap.Context | undefined;
    const splitInstances: Array<{ revert?: () => void }> = [];
    let isCancelled = false;

    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion) {
      section.querySelectorAll<HTMLElement>("[data-split-heading]").forEach((el) => {
        el.style.opacity = "1";
      });
      return;
    }

    const io = new IntersectionObserver(
      async (entries) => {
        const inView = entries.some((e) => e.isIntersecting);
        if (!inView) return;

        io.disconnect();
        if (isCancelled) return;

        await document.fonts.ready;
        if (isCancelled) return;

        const SplitText = await loadSplitTextPlugin();
        if (isCancelled) return;

        const targets = section.querySelectorAll<HTMLElement>("[data-split-heading]");
        if (!targets.length) return;

        ctx = gsap.context(() => {
          targets.forEach((el) => {
            gsap.set(el, { opacity: 1 });

            SplitText.create(el, {
              type: "words,lines",
              linesClass: "line",
              autoSplit: true,
              mask: "lines",
              onSplit: (self: { lines: Element[]; revert?: () => void }) => {
                splitInstances.push(self);
                return gsap.from(self.lines, {
                  duration: 0.55,
                  yPercent: 100,
                  opacity: 0,
                  stagger: 0.08,
                  ease: "expo.out",
                });
              },
            });
          });
        }, section);
      },
      {
        threshold: 0.35,
        rootMargin: "0px 0px -8% 0px",
      },
    );

    io.observe(section);

    return () => {
      isCancelled = true;
      io.disconnect();
      ctx?.revert();
      splitInstances.forEach((s) => s.revert?.());
    };
  }, []);

  return null;
}
