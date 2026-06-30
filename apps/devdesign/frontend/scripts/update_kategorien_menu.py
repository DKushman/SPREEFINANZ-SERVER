#!/usr/bin/env python3
"""Sync Kategorien navigation (desktop dropdown + mobile submenu) to new branch slugs."""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SKIP = {"node_modules", "dist", ".git", "MEDIA CDN"}

KATEGORIEN_DROPDOWN = """<nav class="fakten-dropdown kategorien-dropdown nav-dropdown-panel" id="kategorien-dropdown" aria-label="Kategorien" aria-hidden="true">
        <ul class="fakten-dropdown-list">
            <li><div class="fakten-dropdown-inner"><a href="/leistungen/gesundheit-praxen" class="fakten-dropdown-link">Gesundheits- &amp; Praxis&shy;unternehmen</a></div></li>
            <li><div class="fakten-dropdown-inner"><a href="/leistungen/recht-beratung" class="fakten-dropdown-link">Recht &amp; Beratungs&shy;dienstleister</a></div></li>
            <li><div class="fakten-dropdown-inner"><a href="/leistungen/marken-shops" class="fakten-dropdown-link">Marken-, Produkt- &amp; Shop&shy;unternehmen</a></div></li>
            <li><div class="fakten-dropdown-inner"><a href="/leistungen/buero-projekte" class="fakten-dropdown-link">Büros &amp; Projekt&shy;unternehmen</a></div></li>
            <li><div class="fakten-dropdown-inner"><a href="/leistungen/tech-finanz" class="fakten-dropdown-link">Technologie-, IT- &amp; Finanz&shy;unternehmen</a></div></li>
        </ul>
    </nav>"""

MOBILE_KATEGORIEN = """<li class="mobile-nav-sub-group mobile-nav-sub-group-kategorien">
                <ul class="mobile-nav-sub-list">
                    <li class="mobile-nav-sub-item"><div class="mobile-nav-item-inner"><a href="/leistungen/gesundheit-praxen" class="mobile-nav-link">Gesundheits- &amp; Praxis&shy;unternehmen</a></div></li>
                    <li class="mobile-nav-sub-item"><div class="mobile-nav-item-inner"><a href="/leistungen/recht-beratung" class="mobile-nav-link">Recht &amp; Beratungs&shy;dienstleister</a></div></li>
                    <li class="mobile-nav-sub-item"><div class="mobile-nav-item-inner"><a href="/leistungen/marken-shops" class="mobile-nav-link">Marken-, Produkt- &amp; Shop&shy;unternehmen</a></div></li>
                    <li class="mobile-nav-sub-item"><div class="mobile-nav-item-inner"><a href="/leistungen/buero-projekte" class="mobile-nav-link">Büros &amp; Projekt&shy;unternehmen</a></div></li>
                    <li class="mobile-nav-sub-item"><div class="mobile-nav-item-inner"><a href="/leistungen/tech-finanz" class="mobile-nav-link">Technologie-, IT- &amp; Finanz&shy;unternehmen</a></div></li>
                </ul>
            </li>"""

RE_KAT_DROPDOWN = re.compile(
    r'<nav class="fakten-dropdown kategorien-dropdown nav-dropdown-panel" id="kategorien-dropdown"[^>]*>.*?</nav>',
    re.DOTALL,
)
RE_MOBILE_KAT = re.compile(
    r'<li class="mobile-nav-sub-group mobile-nav-sub-group-kategorien">.*?</li>',
    re.DOTALL,
)

HREF_REPLACEMENTS = [
    ('href="/leistungen/gesundheits-wellness"', 'href="/leistungen/gesundheit-praxen"'),
    ('href="/leistungen/kanzleien-berater"', 'href="/leistungen/recht-beratung"'),
    ('href="/leistungen/planung-design"', 'href="/leistungen/buero-projekte"'),
    ('href="/leistungen/produkte-lifestyle"', 'href="/leistungen/marken-shops"'),
    ('href="/leistungen/technologie-finanz"', 'href="/leistungen/tech-finanz"'),
]

LABEL_REPLACEMENTS = [
    ("Wellness- &amp; Gesundheits&shy;unternehmen", "Gesundheits- &amp; Praxis&shy;unternehmen"),
    ("Kanzleien &amp; Beratungs&shy;dienstleister", "Recht &amp; Beratungs&shy;dienstleister"),
    ("Planungs- &amp; Design&shy;unternehmen", "Büros &amp; Projekt&shy;unternehmen"),
    ("Marken-, Produkt- &amp; Lifestyle&shy;unternehmen", "Marken-, Produkt- &amp; Shop&shy;unternehmen"),
]


def update_file(path: Path) -> bool:
    text = path.read_text(encoding="utf-8")
    new = text
    for old, rep in HREF_REPLACEMENTS:
        new = new.replace(old, rep)
    for old, rep in LABEL_REPLACEMENTS:
        new = new.replace(old, rep)
    if RE_KAT_DROPDOWN.search(new):
        new = RE_KAT_DROPDOWN.sub(KATEGORIEN_DROPDOWN, new, count=1)
    elif "nav-kategorien-link" in new:
        # Page references Kategorien in nav but has no dropdown panel yet.
        marker = "</header>"
        if marker in new:
            new = new.replace(marker, f"{marker}\n    {KATEGORIEN_DROPDOWN}", 1)
    if RE_MOBILE_KAT.search(new):
        new = RE_MOBILE_KAT.sub(MOBILE_KATEGORIEN, new, count=1)
    if new != text:
        path.write_text(new, encoding="utf-8")
        return True
    return False


def main() -> None:
    n = 0
    for path in ROOT.rglob("*.html"):
        if any(part in SKIP for part in path.parts):
            continue
        if update_file(path):
            n += 1
    print(f"Updated Kategorien menu in {n} HTML files")


if __name__ == "__main__":
    main()
