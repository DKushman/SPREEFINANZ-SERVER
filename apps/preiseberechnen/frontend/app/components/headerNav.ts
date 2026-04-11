export const RECHNER_SUBLINKS = [
  { label: "Alle Preisrechner", href: "/preisrechner" },
  { label: "TÜV Rechner", href: "/tuev-kosten-rechner" },
] as const;

export const DESKTOP_NAV_TAIL = [
  { label: "Über uns", href: "/ueber-uns" },
  { label: "Blog", href: "#" },
  { label: "Kontakt", href: "/kontakt" },
] as const;

export const MOBILE_NAV_ITEMS = [
  ...RECHNER_SUBLINKS,
  ...DESKTOP_NAV_TAIL,
] as const;
