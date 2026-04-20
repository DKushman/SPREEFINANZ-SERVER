import { HeaderDesktopPill } from "./HeaderDesktopPill";
import { MOBILE_NAV_ITEMS } from "./headerNav";

export function Header() {
  return (
    <header
      id="preiseberechnen-site-header"
      className="pointer-events-none fixed inset-x-0 top-0 z-[220] w-full px-[2vh] pt-[clamp(0.45rem,min(1rem,2.4svh),1rem)] pb-[clamp(0.35rem,min(0.5rem,1.2svh),0.5rem)]"
    >
      <input
        type="checkbox"
        id="preiseberechnen-nav-toggle"
        className="peer sr-only"
      />

      {/*
        Desktop: Frosted-Glass-Pille (wächst mit Rechner-Untermenü). Mobil: keine Pille.
      */}
      <div className="pointer-events-auto relative mx-auto w-full max-w-[min(72rem,calc(100vw-4vh))]">
        <div
          className="pointer-events-none absolute inset-0 hidden rounded-[clamp(1rem,min(1.75rem,3.2svh),1.75rem)] border border-white/35 bg-[#030F03]/22 shadow-[0_6px_28px_rgba(0,0,0,0.08)] backdrop-blur-md md:block"
          aria-hidden
        />
        <HeaderDesktopPill />
      </div>

      <label
        htmlFor="preiseberechnen-nav-toggle"
        id="preiseberechnen-site-header-mobile-overlay"
        className="pointer-events-none fixed inset-0 z-[9999] cursor-default peer-checked:pointer-events-auto md:hidden"
      >
        <span className="absolute inset-0 bg-black/55" aria-hidden />
      </label>

      <label
        htmlFor="preiseberechnen-nav-toggle"
        id="preiseberechnen-site-header-mobile-panel"
        className="pointer-events-none fixed right-0 top-0 z-[10000] flex h-full w-[min(18rem,90vw)] cursor-default flex-col gap-5 border-l border-black/10 bg-[#ffffe3] px-5 py-6 text-[#1c120e] shadow-2xl peer-checked:pointer-events-auto md:hidden"
      >
        <div className="flex items-center justify-between border-b border-black/10 pb-4">
          <span className="text-xs font-medium uppercase tracking-[0.14em] text-black/55">
            Menü
          </span>
          <label
            htmlFor="preiseberechnen-nav-toggle"
            className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-black/15"
            aria-label="Menü schließen"
          >
            <span className="relative block h-3.5 w-3.5" aria-hidden>
              <span className="absolute left-0 top-1/2 h-[2px] w-full -translate-y-1/2 rotate-45 bg-black/70" />
              <span className="absolute left-0 top-1/2 h-[2px] w-full -translate-y-1/2 -rotate-45 bg-black/70" />
            </span>
          </label>
        </div>
        <nav
          id="preiseberechnen-site-header-nav-mobile"
          className="flex flex-col gap-1"
          aria-label="Mobile Navigation"
        >
          {MOBILE_NAV_ITEMS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="rounded-lg py-3.5 text-[1.05rem] outline-none ring-offset-2 ring-offset-[#ffffe3] hover:bg-black/[0.04] focus-visible:ring-2 focus-visible:ring-[#1c120e]"
            >
              {item.label}
            </a>
          ))}
        </nav>
      </label>
    </header>
  );
}
