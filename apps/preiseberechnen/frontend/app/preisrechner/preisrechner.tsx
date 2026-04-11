import Image from "next/image";
import Link from "next/link";

export type PreisrechnerKachel = {
  id: string;
  title: string;
  href: string;
  imageSrc: string;
  imageAlt: string;
};

export const PREISRECHNER_KACHELN: readonly PreisrechnerKachel[] = [
  {
    id: "preisrechner-kachel-tuev",
    title: "TÜV Rechner",
    href: "/tuev-kosten-rechner",
    imageSrc: "/pexels-georgesultan-1409999_comp.webp",
    imageAlt: "Fahrzeug bei der technischen Inspektion – TÜV Preisrechner",
  },
] as const;

/** Wie Karte „tuev-weitere-vorbereitung“ auf /tuev-kosten-rechner (Zoom + Blur + Overlay). */
const TUEV_WEITERE_IMG_HOVER =
  "scale-100 transform-gpu transition-transform duration-700 ease-[cubic-bezier(0.22,0.61,0.36,1)] will-change-transform motion-reduce:transition-none motion-reduce:group-hover:scale-100 group-hover:scale-[1.06] group-hover:blur-[2px] motion-reduce:group-hover:blur-none";

const DEFAULT_IMG_HOVER =
  "transition-[filter] duration-[420ms] ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none group-hover:blur-md motion-reduce:group-hover:blur-none";

export function PreisrechnerSammlung() {
  return (
    <div
      id="preiseberechnen-preisrechner-grid"
      className="grid w-full grid-cols-1 gap-[clamp(1rem,3vw,1.75rem)] sm:grid-cols-2 lg:grid-cols-3"
    >
      {PREISRECHNER_KACHELN.map((item) => {
        const tuevWeitereStyle = item.id === "preisrechner-kachel-tuev";
        return (
          <Link
            key={item.id}
            href={item.href}
            id={item.id}
            className={`group relative aspect-square w-full overflow-hidden rounded-[clamp(0.85rem,2vw,1.25rem)] outline-none focus-visible:ring-2 focus-visible:ring-[#ffffe3] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] ${
              tuevWeitereStyle
                ? ""
                : "ring-1 ring-[rgba(255,255,227,0.14)] transition-shadow duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.35)]"
            }`}
          >
            <Image
              src={item.imageSrc}
              alt={item.imageAlt}
              fill
              className={`pointer-events-none select-none object-cover ${
                tuevWeitereStyle ? TUEV_WEITERE_IMG_HOVER : DEFAULT_IMG_HOVER
              }`}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              priority={item.id === "preisrechner-kachel-tuev"}
            />
            <div
              className={`pointer-events-none absolute inset-0 bg-gradient-to-t from-[#030F03]/75 via-[#030F03]/25 to-[#030F03]/35 ${
                tuevWeitereStyle
                  ? "transition-opacity duration-500 motion-reduce:transition-none group-hover:opacity-90"
                  : ""
              }`}
              aria-hidden
            />
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-[clamp(0.75rem,2.5vw,1.25rem)]">
              <span className="text-center font-[family-name:var(--font-clash-display)] text-[clamp(1.05rem,3.8vw,1.45rem)] font-semibold leading-tight tracking-[-0.02em] text-[#ffffe3] drop-shadow-[0_2px_12px_rgba(0,0,0,0.45)]">
                {item.title}
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
