const navItems = [
  { label: "Rechner", href: "#" },
  { label: "Über uns", href: "#" },
  { label: "Blog", href: "#" },
  { label: "Kontakt", href: "#" },
];

export function Header() {
  return (
    <header className="flex items-center justify-between py-5 border-b border-[rgba(255,255,227,0.12)]">
      <div className="text-lg tracking-[0.04em] font-semibold">
        preiseberechnen.de
      </div>

      {/* Desktop-Navigation */}
      <nav className="hidden md:flex items-center gap-8 text-[0.95rem]">
        <div className="flex items-center gap-2 cursor-pointer">
          <span>Rechner</span>
          <span className="text-[0.65rem]">▾</span>
        </div>
        <button
          type="button"
          aria-label="Suche"
          className="w-6 h-6 rounded-full border border-[rgba(255,255,227,0.2)] flex items-center justify-center"
        >
          <span className="w-3 h-3 rounded-full border-2 border-[rgba(255,255,227,0.9)] relative block">
            <span className="absolute w-[0.45rem] h-[2px] bg-[rgba(255,255,227,0.9)] rotate-45 -right-1 -bottom-0.5 origin-center" />
          </span>
        </button>
        <a href="#" className="hover:underline">
          Über uns
        </a>
        <a href="#" className="hover:underline">
          Blog
        </a>
        <span>|</span>
        <a href="#" className="hover:underline">
          Kontakt
        </a>
      </nav>

      {/* Burger + Mobile-Menü: reine HTML/CSS, kein JavaScript */}
      <input
        type="checkbox"
        id="burger-toggle"
        className="peer sr-only"
        aria-hidden
      />
      <label
        htmlFor="burger-toggle"
        className="md:hidden relative w-9 h-9 flex items-center justify-center cursor-pointer"
      >
        <span className="block w-5 h-[2px] bg-[rgba(255,255,227,0.9)] rounded-full" />
        <span className="absolute block w-5 h-[2px] bg-[rgba(255,255,227,0.9)] rounded-full -translate-y-2" />
        <span className="absolute block w-5 h-[2px] bg-[rgba(255,255,227,0.9)] rounded-full translate-y-2" />
      </label>

      {/* Overlay – Klick schließt Menü, mit Tailwind-Transition */}
      <label
        htmlFor="burger-toggle"
        className="fixed inset-0 z-[9999] cursor-default opacity-0 pointer-events-none peer-checked:opacity-100 peer-checked:pointer-events-auto transition-opacity duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]"
      >
        <span className="absolute inset-0 bg-black/60" aria-hidden />
      </label>

      {/* Panel – Slide-in von rechts, mit Tailwind-Transition */}
      <label
        htmlFor="burger-toggle"
        className="fixed right-0 top-0 h-full w-64 z-[10000] cursor-default translate-x-full pointer-events-none peer-checked:translate-x-0 peer-checked:pointer-events-auto bg-[#ffffe3] text-[#1c120e] border-l border-black/10 px-5 py-6 flex flex-col gap-6 shadow-2xl transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]"
      >
        <div className="flex items-center justify-between">
          <span className="text-sm tracking-[0.12em] uppercase text-black/60">
            Menü
          </span>
          <span
            className="w-8 h-8 flex items-center justify-center rounded-full border border-black/20"
            aria-hidden
          >
            <span className="relative block w-4 h-4">
              <span className="absolute top-1/2 left-0 w-full h-[2px] bg-black/70 rotate-45 -translate-y-1/2" />
              <span className="absolute top-1/2 left-0 w-full h-[2px] bg-black/70 -rotate-45 -translate-y-1/2" />
            </span>
          </span>
        </div>
        <nav className="flex flex-col gap-4 text-base">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="py-1 border-b border-black/8 last:border-none"
            >
              {item.label}
            </a>
          ))}
        </nav>
      </label>
    </header>
  );
}
