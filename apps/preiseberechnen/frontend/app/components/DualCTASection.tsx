import { DualCTAHeadingsAnimator } from "./animations/DualCTAHeadingsAnimator";

function DocumentIcon({ id, className }: { id: string; className?: string }) {
  return (
    <svg
      id={id}
      className={className}
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect
        x="5"
        y="3"
        width="14"
        height="18"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M8 8h8M8 12h8M8 16h5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function DualCTASection() {
  return (
    <section
      id="preiseberechnen-dual-cta-section"
      className="w-[calc(100%+4vh)] mx-[-2vh] bg-[#030F03] px-[2vh] py-[var(--preiseberechnen-section-padding-block)] text-[#ffffe3]"
      aria-labelledby="preiseberechnen-dual-cta-left-heading"
    >
      <DualCTAHeadingsAnimator />

      <div
        id="preiseberechnen-dual-cta-grid"
        className="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-[clamp(1rem,3vw,1.75rem)] items-stretch"
      >
        <article
          id="preiseberechnen-dual-cta-card-calculators"
          className="group min-h-[clamp(12rem,28vw,16rem)]"
        >
          <div
            id="preiseberechnen-dual-cta-card-calculators-surface"
            className="relative flex h-full min-h-[inherit] flex-col justify-between rounded-[clamp(1rem,2vw,1.75rem)] border border-[rgba(255,255,227,0.22)] bg-[#0a120a] p-[clamp(1.25rem,3vw,2rem)] transition-[filter] duration-300 ease-out group-hover:brightness-110"
          >
            <div
              id="preiseberechnen-dual-cta-card-calculators-inner"
              className="flex flex-1 flex-col justify-between gap-[clamp(1rem,2.5vw,1.75rem)] transition-transform duration-300 ease-out will-change-transform group-hover:scale-[1.02] origin-center"
            >
              <header
                id="preiseberechnen-dual-cta-card-calculators-header"
                className="flex flex-col gap-[clamp(0.45rem,1.2vw,0.75rem)] text-left"
              >
                <h2
                  id="preiseberechnen-dual-cta-left-heading"
                  className="text-[clamp(1.12rem,3.8vw,2.15rem)] sm:text-[clamp(1.35rem,3.4vw,2.15rem)] font-semibold leading-[1.12] tracking-[-0.02em]"
                >
                  <a
                    id="preiseberechnen-dual-cta-calculators-link"
                    href="#preiseberechnen-feature-section"
                    className="text-[#ffffe3] outline-none focus-visible:ring-2 focus-visible:ring-[#ffffe3] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a120a] rounded-sm"
                  >
                    <span data-split-heading className="opacity-0 block">
                      Guck dir unsere Preisrechner an!
                    </span>
                  </a>
                </h2>
                <p
                  id="preiseberechnen-dual-cta-left-sub"
                  className="text-[clamp(0.92rem,1.8vw,1.05rem)] leading-relaxed text-[rgba(255,255,227,0.55)]"
                >
                  Wir hoffen wir können dir helfen :)
                </p>
              </header>

              <footer
                id="preiseberechnen-dual-cta-card-calculators-footer"
                className="flex items-end justify-between gap-4 pt-[clamp(0.5rem,1.5vw,1rem)]"
              >
                <a
                  id="preiseberechnen-dual-cta-contact-link"
                  href="#"
                  className="text-[clamp(0.88rem,1.5vw,1rem)] text-[#ffffe3] underline underline-offset-4 decoration-[rgba(255,255,227,0.45)] hover:decoration-[#ffffe3] outline-none focus-visible:ring-2 focus-visible:ring-[#ffffe3] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a120a] rounded-sm"
                >
                  Bei Fragen kannst du uns auch gerne schreiben
                </a>
                <DocumentIcon
                  id="preiseberechnen-dual-cta-document-icon-left"
                  className="shrink-0 text-[#ffffe3]"
                />
              </footer>
            </div>
          </div>
        </article>

        <article
          id="preiseberechnen-dual-cta-card-why"
          className="group min-h-[clamp(12rem,28vw,16rem)]"
        >
          <div
            id="preiseberechnen-dual-cta-card-why-surface"
            className="relative flex h-full min-h-[inherit] flex-col justify-between rounded-[clamp(1rem,2vw,1.75rem)] bg-[#ffffe3] p-[clamp(1.25rem,3vw,2rem)] text-[#1c120e] transition-[filter] duration-300 ease-out group-hover:brightness-105"
          >
            <div
              id="preiseberechnen-dual-cta-card-why-inner"
              className="flex flex-1 flex-col justify-between gap-[clamp(1rem,2.5vw,1.75rem)] transition-transform duration-300 ease-out will-change-transform group-hover:scale-[1.02] origin-center"
            >
              <header
                id="preiseberechnen-dual-cta-card-why-header"
                className="flex flex-col text-left"
              >
                <h2
                  id="preiseberechnen-dual-cta-right-heading"
                  className="text-[clamp(1.02rem,3.2vw,1.75rem)] sm:text-[clamp(1.2rem,2.8vw,1.75rem)] font-semibold leading-[1.15] tracking-[-0.02em]"
                >
                  <a
                    id="preiseberechnen-dual-cta-why-link"
                    href="#"
                    className="text-[#1c120e] outline-none focus-visible:ring-2 focus-visible:ring-[#1c120e] focus-visible:ring-offset-2 focus-visible:ring-offset-[#ffffe3] rounded-sm"
                  >
                    <span data-split-heading className="opacity-0 block">
                      Du fragst dich warum wir das machen?
                    </span>
                  </a>
                </h2>
              </header>

              <footer
                id="preiseberechnen-dual-cta-card-why-footer"
                className="flex justify-end pt-[clamp(0.5rem,1.5vw,1rem)]"
              >
                <DocumentIcon
                  id="preiseberechnen-dual-cta-document-icon-right"
                  className="shrink-0 text-[#1c120e]"
                />
              </footer>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
