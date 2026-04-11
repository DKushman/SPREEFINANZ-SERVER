"use client";

import { useOpenTuevPreisrechner } from "./TuevPreisrechnerOverlayProvider";

function StarIcon({ filled, id }: { filled: boolean; id: string }) {
  return (
    <svg
      id={id}
      width="14"
      height="14"
      viewBox="0 0 20 20"
      fill={filled ? "#ffffe3" : "none"}
      stroke="#ffffe3"
      strokeWidth="1.5"
      aria-hidden="true"
    >
      <path d="M10 1.5l2.47 5.01 5.53.8-4 3.9.94 5.49L10 14.27 5.06 16.7 6 11.21l-4-3.9 5.53-.8L10 1.5z" />
    </svg>
  );
}

export function TuevHeroSection() {
  const openPreisrechner = useOpenTuevPreisrechner();

  return (
    <section
      id="tuev-hero"
      className="relative flex min-h-[95vh] flex-col items-center text-center"
      aria-labelledby="tuev-hero-heading"
    >
      <div
        id="tuev-hero-announcement"
        className="w-[calc(100%+4vh)] mx-[-2vh] absolute top-0 left-0 right-0 flex flex-col items-center justify-center gap-1.5 border-b border-t border-[rgba(232,168,74,0.32)] bg-[rgba(232,168,74,0.09)] py-[clamp(0.65rem,1.4vw,0.9rem)] px-[clamp(0.75rem,2vw,1.25rem)] sm:flex-row sm:gap-[clamp(0.4rem,0.8vw,0.6rem)] sm:py-[clamp(0.6rem,1.2vw,0.85rem)]"
      >
        <span
          id="tuev-hero-announcement-dot"
          className="size-[clamp(0.55rem,0.9vw,0.7rem)] shrink-0 rounded-full bg-[#e8a84a] tuev-heartbeat-dot motion-reduce:animate-none"
          aria-hidden="true"
        />
        <p
          id="tuev-hero-announcement-text"
          className="text-[clamp(0.68rem,1.3vw,0.92rem)] font-light text-[#e8a84a]"
        >
          Erhalte sofort ein Angebot zum Downloaden, um maximales Geld bei
          deinem Dienstleister zu sparen
        </p>
      </div>

      <div
        id="tuev-hero-trust-block"
        role="group"
        aria-label="Community: 4 von 5 Sternen, 75 Bewertungen"
        className="absolute left-1/2 top-20 z-10 w-[min(calc(100%_-_1.5rem),17rem)] -translate-x-1/2 rounded-2xl bg-[#030F03]/38 px-4 py-3 text-center shadow-lg backdrop-blur-sm"
      >
        <div className="flex flex-col items-center gap-1.5 opacity-[0.62]">
          <p
            id="tuev-hero-rating-number"
            className="text-sm text-[rgba(255,255,227,0.28)]"
          >
            4.0
          </p>
          <div
            id="tuev-hero-stars"
            className="flex gap-0.5"
            aria-hidden="true"
          >
            {[true, true, true, true, false].map((filled, i) => (
              <StarIcon key={i} filled={filled} id={`tuev-hero-star-${i + 1}`} />
            ))}
          </div>
          <div id="tuev-hero-avatars" className="flex items-center pt-0.5">
            {["MK", "LS", "JB", "TW"].map((initials, i) => (
              <span
                key={i}
                id={`tuev-hero-avatar-${i + 1}`}
                className="-ml-1.5 flex size-7 items-center justify-center rounded-full border-2 border-[#030F03] bg-white/[0.07] text-[0.5rem] font-semibold text-[rgba(255,255,227,0.62)] first:ml-0"
              >
                {initials}
              </span>
            ))}
            <span
              id="tuev-hero-avatar-count"
              className="-ml-1.5 flex size-7 items-center justify-center rounded-full border-2 border-[#030F03] bg-white/[0.05] text-[0.5rem] font-semibold text-white/32"
            >
              +70
            </span>
          </div>
          <p
            id="tuev-hero-review-count"
            className="text-xs text-[rgba(255,255,227,0.24)]"
          >
            75 Bewertungen
          </p>
        </div>
      </div>

      <div
        id="tuev-hero-main"
        className="flex w-full flex-1 flex-col items-center justify-center gap-[clamp(1.25rem,3vw,2rem)] pt-[clamp(2rem,1vh,7.5rem)]"
      >
        <p
          id="tuev-hero-kicker"
          className="text-[clamp(0.85rem,1.5vw,1.1rem)] font-light text-[#ffffe3] tracking-wide"
        >
          kostenloser Preisrechner für TÜV-Kosten
        </p>

        <h1
          id="tuev-hero-heading"
          className="max-w-[52rem] text-[clamp(2.6rem,7vw,3.8rem)] leading-[1.04] font-normal tracking-[-0.02em]"
        >
          Was kostet{" "}
          <strong className="font-semibold">dein</strong> TÜV wirklich?
        </h1>

        <p
          id="tuev-hero-subtitle"
          className="max-w-[clamp(28rem,58vw,42rem)] text-[clamp(0.95rem,1.8vw,1.35rem)] leading-[1.45] text-[rgba(255,255,227,0.41)]"
        >
        Kein Formular, kein Spam. Beantworte kurze Fragen zu Fahrzeug, Frist
        und Prüfumfeld – und sieh deinen Preis live entstehen
        </p>

        <div
          id="tuev-hero-trust-indicators"
          className="flex flex-wrap items-center justify-center gap-x-[clamp(0.75rem,2vw,1.5rem)] gap-y-[clamp(0.35rem,0.8vw,0.5rem)] text-[clamp(0.72rem,1.1vw,0.85rem)] font-light text-[#ffffe3]"
        >
          <span id="tuev-hero-indicator-unverbindlich" className="flex items-center gap-[clamp(0.25rem,0.5vw,0.35rem)]">
            <span className="size-[clamp(0.28rem,0.45vw,0.35rem)] rounded-full bg-[#ffffe3]" aria-hidden="true" />
            <span>unverbindlich</span>
          </span>
          <span className="h-[clamp(0.85rem,1.6vw,1.2rem)] w-px bg-[rgba(255,255,227,0.2)]" aria-hidden="true" />
          <span id="tuev-hero-indicator-speed" className="flex items-center gap-[clamp(0.25rem,0.5vw,0.35rem)]">
            <span className="size-[clamp(0.28rem,0.45vw,0.35rem)] rounded-full bg-[#ffffe3]" aria-hidden="true" />
            <span>
              Ergebnis in <strong className="font-semibold">60</strong> Sekunden
            </span>
          </span>
          <span className="h-[clamp(0.85rem,1.6vw,1.2rem)] w-px bg-[rgba(255,255,227,0.2)]" aria-hidden="true" />
          <span id="tuev-hero-indicator-kostenlos" className="flex items-center gap-[clamp(0.25rem,0.5vw,0.35rem)]">
            <span className="size-[clamp(0.28rem,0.45vw,0.35rem)] rounded-full bg-[#ffffe3]" aria-hidden="true" />
            <span>kostenlos</span>
          </span>
        </div>

        <button
          id="tuev-hero-cta"
          type="button"
          onClick={openPreisrechner}
          className="mt-[clamp(0.5rem,1.5vw,1rem)] inline-flex cursor-pointer items-center gap-[clamp(0.5rem,1vw,0.75rem)] rounded-[clamp(0.7rem,1.2vw,0.9rem)] bg-[#ffffe3] px-[clamp(1.5rem,3vw,2.25rem)] py-[clamp(0.75rem,1.4vw,1rem)] text-[clamp(0.95rem,1.6vw,1.25rem)] font-normal text-[#251914] transition-[filter] duration-200 hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffffe3] focus-visible:ring-offset-2 focus-visible:ring-offset-[#030F03]"
        >
          <svg
            id="tuev-hero-cta-icon"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            aria-hidden="true"
            className="size-[clamp(1.1rem,1.8vw,1.35rem)]"
          >
            <circle cx="12" cy="12" r="10" />
            <polygon points="10,8 16,12 10,16" fill="currentColor" stroke="none" />
          </svg>
          <span id="tuev-hero-cta-label">
            Jetzt Preis berechnen
          </span>
        </button>
      </div>

      <div
        id="tuev-hero-scroll-indicator"
        className="absolute bottom-[calc(env(safe-area-inset-bottom,0px)+clamp(2.25rem,5.5vh,3rem))] left-1/2 -translate-x-1/2"
        aria-hidden="true"
      >
        <svg
          width="36"
          height="36"
          viewBox="0 0 24 24"
          fill="none"
          stroke="rgba(255,255,227,0.35)"
          strokeWidth="1.5"
          className="size-[clamp(2rem,4vw,3rem)] animate-bounce"
        >
          <polyline points="6,9 12,15 18,9" />
        </svg>
      </div>
    </section>
  );
}
