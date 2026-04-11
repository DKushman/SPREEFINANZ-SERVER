const menuLinks = [
  {
    id: "preiseberechnen-footer-nav-ueber-uns",
    label: "Über Uns",
    href: "/ueber-uns",
  },
  { id: "preiseberechnen-footer-nav-rechner", label: "Rechner", href: "#preiseberechnen-feature-section" },
  { id: "preiseberechnen-footer-nav-blog", label: "Blog", href: "#" },
  { id: "preiseberechnen-footer-nav-kontakt", label: "Kontakt", href: "/kontakt" },
] as const;

const legalLinks = [
  { id: "preiseberechnen-footer-nav-datenschutz", label: "Datenschutz", href: "/datenschutz" },
  { id: "preiseberechnen-footer-nav-impressum", label: "Impressum", href: "/impressum" },
] as const;

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      id="preiseberechnen-site-footer"
      className="relative z-[15] mt-auto w-full bg-[#030F03]"
      role="contentinfo"
    >
      <div
        id="preiseberechnen-footer-surface"
        className="w-full rounded-t-[clamp(1.25rem,2.5vw,2rem)] bg-[#ffffe3] text-[#1c120e] py-[clamp(2rem,4.5vw,3.25rem)]"
      >
        <div
          id="preiseberechnen-footer-inner"
          className="w-full max-w-none mx-0 px-[clamp(1rem,2vh,1.75rem)]"
        >
          <div
            id="preiseberechnen-footer-grid"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-[clamp(1.25rem,3vw,2.5rem)] gap-y-[clamp(1.5rem,3.5vw,2.25rem)]"
          >
            <nav
              id="preiseberechnen-footer-nav-menu"
              className="flex flex-col gap-[clamp(0.65rem,1.4vw,0.9rem)]"
              aria-labelledby="preiseberechnen-footer-heading-menu"
            >
              <h3
                id="preiseberechnen-footer-heading-menu"
                className="text-[clamp(0.95rem,1.6vw,1.08rem)] font-semibold"
              >
                Menü
              </h3>
              <ul
                id="preiseberechnen-footer-list-menu"
                className="flex flex-col gap-[clamp(0.4rem,1vw,0.55rem)] text-[clamp(0.88rem,1.45vw,0.98rem)] font-normal text-[#1c120e]/85"
              >
                {menuLinks.map((item) => (
                  <li key={item.id}>
                    <a
                      id={item.id}
                      href={item.href}
                      className="outline-none rounded-sm hover:underline underline-offset-4 decoration-[#1c120e]/35 focus-visible:ring-2 focus-visible:ring-[#1c120e] focus-visible:ring-offset-2 focus-visible:ring-offset-[#ffffe3] transition-colors"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <nav
              id="preiseberechnen-footer-nav-legal"
              className="flex flex-col gap-[clamp(0.65rem,1.4vw,0.9rem)]"
              aria-labelledby="preiseberechnen-footer-heading-legal"
            >
              <h3
                id="preiseberechnen-footer-heading-legal"
                className="text-[clamp(0.95rem,1.6vw,1.08rem)] font-semibold"
              >
                Rechtliches
              </h3>
              <ul
                id="preiseberechnen-footer-list-legal"
                className="flex flex-col gap-[clamp(0.4rem,1vw,0.55rem)] text-[clamp(0.88rem,1.45vw,0.98rem)] font-normal text-[#1c120e]/85"
              >
                {legalLinks.map((item) => (
                  <li key={item.id}>
                    <a
                      id={item.id}
                      href={item.href}
                      className="outline-none rounded-sm hover:underline underline-offset-4 decoration-[#1c120e]/35 focus-visible:ring-2 focus-visible:ring-[#1c120e] focus-visible:ring-offset-2 focus-visible:ring-offset-[#ffffe3] transition-colors"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <div
              id="preiseberechnen-footer-meta"
              className="sm:col-span-2 lg:col-span-1 flex flex-col gap-[clamp(0.55rem,1.2vw,0.85rem)]"
            >
              <p
                id="preiseberechnen-footer-heading-year"
                className="text-[clamp(0.95rem,1.6vw,1.08rem)] font-semibold"
              >
                @{year}
              </p>
              <a
                id="preiseberechnen-footer-email"
                href="mailto:info@preiseberechnen.de"
                className="w-fit text-[clamp(0.88rem,1.45vw,0.98rem)] underline underline-offset-4 decoration-[#1c120e]/40 hover:decoration-[#1c120e] outline-none focus-visible:ring-2 focus-visible:ring-[#1c120e] focus-visible:ring-offset-2 focus-visible:ring-offset-[#ffffe3] rounded-sm transition-colors"
              >
                info@preiseberechnen.de
              </a>
              <address
                id="preiseberechnen-footer-address"
                className="not-italic text-[clamp(0.88rem,1.45vw,0.98rem)] leading-[1.45] text-[#1c120e]/80"
              >
                Charlottenburger Straße 110A, 13086 Berlin
              </address>
            </div>
          </div>

          <div
            id="preiseberechnen-footer-divider"
            className="my-[clamp(1.35rem,2.8vw,2.25rem)] h-px w-full bg-[#1c120e]/12"
            aria-hidden="true"
          />

          <div
            id="preiseberechnen-footer-bottom"
            className="flex flex-col gap-[clamp(0.5rem,1.2vw,0.75rem)] sm:flex-row sm:items-center sm:justify-between text-[clamp(0.78rem,1.25vw,0.88rem)] text-[#1c120e]/55"
          >
            <p id="preiseberechnen-footer-copyright">
              alle Rechte vorbehalten @preiseberechnen
            </p>
            <p id="preiseberechnen-footer-credit">
              <a
                id="preiseberechnen-footer-credit-link"
                href="https://devdesign.studios"
                target="_blank"
                rel="noopener noreferrer"
                className="outline-none rounded-sm hover:text-[#1c120e] hover:underline underline-offset-4 focus-visible:ring-2 focus-visible:ring-[#1c120e] focus-visible:ring-offset-2 focus-visible:ring-offset-[#ffffe3] transition-colors"
              >
                Website von DEVDESIGN.STUDIOS
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
