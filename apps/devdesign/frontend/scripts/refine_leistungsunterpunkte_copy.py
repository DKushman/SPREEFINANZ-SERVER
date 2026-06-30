#!/usr/bin/env python3
"""Replace generic Leistungsunterpunkt meta suffix with service-specific copy (meta, og, JSON-LD)."""
from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OLD = "Professionelle digitale Lösungen von DEVDESIGN Berlin."

SUFFIX: dict[str, str] = {
    "website-online-praesenz": (
        "Strukturierte Inhalte, schnelle Ladezeiten und klare Nutzerführung - "
        "Websites, die Vertrauen aufbauen. DEVDESIGN Berlin."
    ),
    "landingpages-leadgenerierung": (
        "Landingpages mit klarem Nutzenversprechen, Tracking und Fokus auf "
        "Konversion - für Kampagnen, die messbar liefern. DEVDESIGN Berlin."
    ),
    "online-terminbuchung-kundenportale": (
        "Online-Terminbuchung und Kundenportale, die Routine abnehmen und "
        "Besucher selbstständig weiterhelfen - sauber integriert. DEVDESIGN Berlin."
    ),
    "digitale-prozesse-web-anwendungen": (
        "Individuelle Webanwendungen und automatisierte Abläufe statt "
        "Insellösungen - von der Idee bis zum Betrieb. DEVDESIGN Berlin."
    ),
    "seo-performance-optimierung": (
        "Technisches SEO, Performance und saubere Informationsarchitektur für "
        "stabile Sichtbarkeit in der Suche. DEVDESIGN Berlin."
    ),
}


def refine_file(path: Path) -> bool:
    slug = path.stem
    if slug not in SUFFIX:
        return False
    raw = path.read_text(encoding="utf-8")
    if OLD not in raw:
        return False
    new = raw.replace(OLD, SUFFIX[slug])
    if new == raw:
        return False
    path.write_text(new, encoding="utf-8")
    return True


def main() -> None:
    base = ROOT / "Leistungsunterpunkte"
    n = 0
    for path in sorted(base.rglob("*.html")):
        if refine_file(path):
            n += 1
    print(f"Updated {n} Leistungsunterpunkt pages")


if __name__ == "__main__":
    main()
