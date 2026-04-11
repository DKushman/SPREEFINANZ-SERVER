import type { ReactNode } from "react";
import { PrincipleQuoteAnimator } from "./animations/PrincipleQuoteAnimator";

type QuoteLineProps = {
  children: ReactNode;
};

function QuoteLine({ children }: QuoteLineProps) {
  return <>{children}</>;
}

export function PrincipleQuoteSection() {
  return (
    <section
      id="preiseberechnen-principle-quote-section"
      className="bg-[#060f06] text-[#ffffe3] rounded-[clamp(1.25rem,2.2vw,2.75rem)] w-[calc(100%+4vh)] mx-[-2vh] overflow-hidden py-[var(--preiseberechnen-section-padding-block)]"
      aria-labelledby="preiseberechnen-principle-quote-heading"
    >
      <div
        id="preiseberechnen-principle-quote-container"
        className="px-[2vh]"
      >
        <PrincipleQuoteAnimator />
        <h2
          id="preiseberechnen-principle-quote-heading"
          className="text-[clamp(1.05rem,2.6vw,1.45rem)] leading-tight font-semibold text-center text-[rgba(255,255,227,0.75)]"
        >
          Unser Grundsatz:
        </h2>

        <blockquote
          id="preiseberechnen-principle-quote-blockquote"
          className="relative mt-[clamp(1.25rem,3.2vw,2.25rem)] mx-auto max-w-5xl text-center"
        >
          <span
            id="preiseberechnen-principle-quote-open"
            aria-hidden="true"
            className="absolute left-0 top-[-0.25em] text-[clamp(2.6rem,7vw,4.3rem)] leading-none text-[#ffffe3]"
          >
            “
          </span>

          <p
            id="preiseberechnen-principle-quote-text"
            className="split opacity-0 block text-[clamp(1.2rem,4vw,3.1rem)] leading-[1.05] font-semibold tracking-[-0.02em]"
          >
            <QuoteLine>Wir wollen als unabhängige dritte Partei</QuoteLine>
            <br />
            <QuoteLine>fungieren. Verbraucher verdienen eine</QuoteLine>
            <br />
            <QuoteLine>faire Verhandlungsbasis!</QuoteLine>
          </p>

          <span
            id="preiseberechnen-principle-quote-close"
            aria-hidden="true"
            className="absolute right-0 bottom-[-0.35em] text-[clamp(2.6rem,7vw,4.3rem)] leading-none text-[#ffffe3]"
          >
            ”
          </span>
        </blockquote>
      </div>
    </section>
  );
}

