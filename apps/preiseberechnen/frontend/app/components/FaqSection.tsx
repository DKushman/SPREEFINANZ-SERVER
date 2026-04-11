import type { ReactNode } from "react";

export type FaqItem = {
  id: string;
  indexLabel: string;
  question: string;
  answer: string;
  defaultOpen?: boolean;
};

const defaultFaqItems: FaqItem[] = [
  {
    id: "preiseberechnen-faq-item-01",
    indexLabel: "01",
    question:
      "Du kannst deine Frage nicht finden? Kontaktiere unseren Support!",
    answer:
      "Anwaltsgebühren, Notarkosten, Websitepreise – wir bringen Transparenz in die Themen, bei denen die meisten einfach zu viel bezahlen. Kostenlos, anonym, in unter einer Minute.",
    defaultOpen: true,
  },
  {
    id: "preiseberechnen-faq-item-02",
    indexLabel: "02",
    question:
      "Du kannst deine Frage nicht finden? Kontaktiere unseren Support!",
    answer:
      "Hier kannst du eine zweite Antwort einfügen. Die Details-Komponente bleibt vollständig ohne JavaScript bedienbar.",
  },
  {
    id: "preiseberechnen-faq-item-03",
    indexLabel: "03",
    question:
      "Du kannst deine Frage nicht finden? Kontaktiere unseren Support!",
    answer:
      "Weitere Infos folgen. Klicke auf die Zeile, um die Antwort ein- oder auszublenden.",
  },
  {
    id: "preiseberechnen-faq-item-04",
    indexLabel: "04",
    question:
      "Du kannst deine Frage nicht finden? Kontaktiere unseren Support!",
    answer:
      "Weitere Infos folgen. Klicke auf die Zeile, um die Antwort ein- oder auszublenden.",
  },
  {
    id: "preiseberechnen-faq-item-05",
    indexLabel: "05",
    question:
      "Du kannst deine Frage nicht finden? Kontaktiere unseren Support!",
    answer:
      "Weitere Infos folgen. Klicke auf die Zeile, um die Antwort ein- oder auszublenden.",
  },
];

type FaqSectionProps = {
  items?: FaqItem[];
  heading?: string;
  introText?: ReactNode;
};

export function FaqSection({
  items = defaultFaqItems,
  heading = "Eure wichtigsten Fragen",
  introText,
}: FaqSectionProps = {}) {
  return (
    <section
      id="preiseberechnen-faq-section"
      className="border-t border-[rgba(255,255,227,0.12)] bg-[#030F03] py-[var(--preiseberechnen-section-padding-block)] text-[#ffffe3]"
      aria-labelledby="preiseberechnen-faq-heading"
    >
      <div
        id="preiseberechnen-faq-inner"
        className="mx-0 w-full max-w-none px-0"
      >
        <div
          id="preiseberechnen-faq-grid"
          className="grid grid-cols-1 lg:grid-cols-[minmax(0,35%)_minmax(0,65%)] gap-[clamp(1.75rem,4vw,3rem)] lg:gap-0"
        >
          <header
            id="preiseberechnen-faq-intro"
            className="flex flex-col gap-[clamp(0.65rem,1.5vw,1rem)] lg:pr-[clamp(1.25rem,3vw,2.5rem)] lg:border-r lg:border-[rgba(255,255,227,0.12)]"
          >
            <h2
              id="preiseberechnen-faq-heading"
              className="text-[clamp(1.35rem,3.2vw,2.25rem)] font-semibold leading-[1.08] tracking-[-0.02em]"
            >
              {heading}
            </h2>
            <p
              id="preiseberechnen-faq-intro-text"
              className="text-[clamp(0.92rem,1.6vw,1.05rem)] leading-[clamp(1.45,1.55,1.65)] text-[rgba(255,255,227,0.65)]"
            >
              {introText ?? (
                <>
                  Du kannst deine Frage nicht finden? Kontaktiere unseren{" "}
                  <a
                    id="preiseberechnen-faq-support-link"
                    href="#preiseberechnen-footer-nav-kontakt"
                    className="text-[#ffffe3] underline underline-offset-4 decoration-[rgba(255,255,227,0.4)] hover:decoration-[#ffffe3] outline-none focus-visible:ring-2 focus-visible:ring-[#ffffe3] focus-visible:ring-offset-2 focus-visible:ring-offset-[#030F03] rounded-sm transition-colors"
                  >
                    Support!
                  </a>
                </>
              )}
            </p>
          </header>

          <div
            id="preiseberechnen-faq-list-wrap"
            className="min-w-0 lg:pl-[clamp(1.25rem,3vw,2.5rem)]"
          >
            {items.map((item) => (
              <details
                key={item.id}
                id={item.id}
                className="group border-b border-[rgba(255,255,227,0.12)] transition-[filter] duration-300 ease-out hover:brightness-110"
                open={item.defaultOpen}
              >
                <summary
                  id={`${item.id}-summary`}
                  className="flex cursor-pointer list-none items-start gap-[clamp(0.75rem,2vw,1.25rem)] py-[clamp(1rem,2.2vw,1.35rem)] pr-[clamp(0.25rem,1vw,0.5rem)] [&::-webkit-details-marker]:hidden"
                >
                  <span
                    id={`${item.id}-index`}
                    className="w-[clamp(1.75rem,4vw,2.25rem)] shrink-0 pt-[0.1em] text-[clamp(0.82rem,1.4vw,0.95rem)] tabular-nums text-[rgba(255,255,227,0.45)]"
                  >
                    {item.indexLabel}
                  </span>
                  <span
                    id={`${item.id}-question`}
                    className="min-w-0 flex-1 text-left text-[clamp(0.95rem,1.7vw,1.08rem)] font-medium leading-[1.35] text-[#ffffe3] transition-transform duration-300 ease-out will-change-transform group-hover:scale-[1.02] origin-left"
                  >
                    {item.question}
                  </span>
                  <span
                    className="preiseberechnen-faq-dot mt-[0.35em] size-[clamp(0.55rem,1.1vw,0.65rem)] shrink-0 rounded-full border-2 border-[#ffffe3]"
                    aria-hidden="true"
                  />
                </summary>
                <p
                  id={`${item.id}-answer`}
                  className="pb-[clamp(1rem,2.2vw,1.35rem)] pl-[calc(clamp(1.75rem,4vw,2.25rem)+clamp(0.75rem,2vw,1.25rem))] pr-[clamp(0.25rem,1vw,0.5rem)] text-[clamp(0.88rem,1.45vw,0.98rem)] leading-[clamp(1.5,1.6,1.7)] text-[rgba(255,255,227,0.55)]"
                >
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
