"use client";

import { useEffect } from "react";
import { getGsap, loadSplitTextPlugin } from "@/app/lib/gsap-client";

export function PrincipleQuoteAnimator() {
  useEffect(() => {
    const section = document.getElementById("preiseberechnen-principle-quote-section");
    const splitTarget = document.getElementById("preiseberechnen-principle-quote-text");
    if (!section || !splitTarget) return;

    const gsap = getGsap();
    let ctx: gsap.Context | undefined;
    let splitInstance: { revert?: () => void } | undefined;
    let isCancelled = false;

    const io = new IntersectionObserver(
      async (entries) => {
        const inView = entries.some((entry) => entry.isIntersecting);
        if (!inView) return;

        io.disconnect();
        if (isCancelled) return;

        await document.fonts.ready;
        if (isCancelled) return;

        const SplitText = await loadSplitTextPlugin();
        if (isCancelled) return;

        ctx = gsap.context(() => {
          gsap.set(splitTarget, { opacity: 1 });

          SplitText.create(splitTarget, {
            type: "words,lines",
            linesClass: "line",
            autoSplit: true,
            mask: "lines",
            onSplit: (self: { lines: Element[]; revert?: () => void }) => {
              splitInstance = self;
              return gsap.from(self.lines, {
                duration: 0.6,
                yPercent: 100,
                opacity: 0,
                stagger: 0.1,
                ease: "expo.out",
              });
            },
          });
        }, section);
      },
      {
        threshold: 0.45,
        rootMargin: "0px 0px -10% 0px",
      },
    );

    io.observe(section);

    return () => {
      isCancelled = true;
      io.disconnect();
      ctx?.revert();
      splitInstance?.revert?.();
    };
  }, []);

  return null;
}

