"use client";

import type { ReactNode } from "react";
import { useEffect, useRef } from "react";
import { getGsap } from "@/app/lib/gsap-client";

type FillCircleVariant = "on-cream" | "on-green";

type FillCircleProps = {
  sectionId: string;
  /** Zentrierter Inhalt im Kreis (z. B. Überschrift) */
  children?: ReactNode;
  /** Größe des Wrappers, z. B. `w-[min(92vw,40rem)]` */
  className?: string;
  variant?: FillCircleVariant;
};

const VARIANT_STROKES: Record<
  FillCircleVariant,
  { track: string; progress: string }
> = {
  "on-cream": {
    track: "rgba(0,0,0,0.12)",
    progress: "#0a0a0a",
  },
  "on-green": {
    track: "rgba(255,255,227,0.16)",
    progress: "rgba(255,255,227,0.52)",
  },
};

export function FillCircle({
  sectionId,
  children,
  className,
  variant = "on-cream",
}: FillCircleProps) {
  const progressRef = useRef<SVGCircleElement | null>(null);
  const strokes = VARIANT_STROKES[variant];

  useEffect(() => {
    const gsap = getGsap();
    const el = progressRef.current;
    if (!el) return;

    const r = el.r.baseVal.value;
    const circumference = 2 * Math.PI * r;

    el.style.strokeDasharray = `${circumference}`;
    el.style.strokeDashoffset = `${circumference}`;

    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      el.style.strokeDashoffset = "0";
      return;
    }

    const ctx = gsap.context(() => {
      gsap.to(el, {
        strokeDashoffset: 0,
        duration: 2.6,
        ease: "power1.out",
        scrollTrigger: {
          trigger: `#${sectionId}`,
          start: "top 70%",
          once: true,
        },
      });
    });

    return () => ctx.revert();
  }, [sectionId]);

  const wrapId = `${sectionId}-fill-circle-wrap`;

  return (
    <div
      id={wrapId}
      className={`relative grid aspect-square place-items-center ${className ?? "w-[clamp(8rem,18vw,14rem)]"}`}
      aria-hidden={children ? undefined : true}
    >
      <svg
        id={`${sectionId}-fill-circle-svg`}
        viewBox="0 0 120 120"
        className="col-start-1 row-start-1 size-full"
      >
        <circle
          id={`${sectionId}-fill-circle-track`}
          cx="60"
          cy="60"
          r="51"
          fill="none"
          stroke={strokes.track}
          strokeWidth="10"
        />
        <circle
          id={`${sectionId}-fill-circle-progress`}
          ref={progressRef}
          cx="60"
          cy="60"
          r="51"
          fill="none"
          stroke={strokes.progress}
          strokeWidth="10"
          strokeLinecap="round"
          transform="rotate(-90 60 60)"
        />
      </svg>
      {children != null && (
        <div
          id={`${sectionId}-fill-circle-center`}
          className="col-start-1 row-start-1 z-[1] flex max-w-[min(72%,26ch)] flex-col items-center justify-center px-[clamp(0.5rem,3vw,1.25rem)] text-center"
        >
          {children}
        </div>
      )}
    </div>
  );
}
