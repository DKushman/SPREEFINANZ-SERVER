#!/usr/bin/env python3
"""
Global nav refactor + pillar fixes for DEVDESIGN.

Walks every *.html under frontend/ (excluding node_modules, dist) and:

  1. Desktop nav: <button .nav-leistungen-btn>  ->  <a href="/Bereiche/Bereiche" .nav-leistungen-link>
                  <button .nav-fakten-btn>      ->  <a href="/fakten/Fakten"        .nav-fakten-link>
  2. Mobile nav: removes the nested sub-overlay (back-item + sub-groups).
                 Replaces mobile-nav-trigger buttons with direct <a> links.
  3. Pillar pages only (Leistungen/websites|webapps|integrationen.html):
        a. JSON-LD breadcrumb URL  /Leistungen  ->  /Bereiche/Bereiche
        b. Inserts an "Übersicht"-Tile at the top of the .blog-related-grid

  4. Sitemap: adds /Bereiche/Bereiche and /fakten/Fakten,
              replaces broken /fakten entry.

Idempotent: every change is detected before re-applying.
"""

from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SKIP_DIRS = {"node_modules", "dist", ".git", "Switzer_Complete", "MEDIA CDN"}
PILLAR_FILES = {"websites.html", "webapps.html", "integrationen.html"}


# ---------------------------------------------------------------------------
# 1) Desktop nav: button -> link
# ---------------------------------------------------------------------------
RE_DESKTOP_LEISTUNGEN_BTN = re.compile(
    r'<button\s+class="nav-leistungen-btn nav-dropdown-btn"[^>]*>\s*Leistungen,?\s*</button>',
    re.IGNORECASE,
)
RE_DESKTOP_FAKTEN_BTN = re.compile(
    r'<button\s+class="nav-fakten-btn nav-dropdown-btn"[^>]*>\s*Fakten,?\s*</button>',
    re.IGNORECASE,
)

DESKTOP_LEISTUNGEN_LINK = (
    '<a href="/Bereiche/Bereiche" class="nav-leistungen-link nav-dropdown-link" '
    'aria-describedby="leistungen-dropdown">Bereiche,</a>'
)
DESKTOP_FAKTEN_LINK = (
    '<a href="/fakten/Fakten" class="nav-fakten-link nav-dropdown-link" '
    'aria-describedby="fakten-dropdown">Fakten,</a>'
)


# ---------------------------------------------------------------------------
# 2) Mobile nav: trigger -> direct <a>, remove back-item + sub-groups
# ---------------------------------------------------------------------------
RE_MOBILE_LEISTUNGEN_TRIGGER = re.compile(
    r'<button\s+type="button"\s+class="mobile-nav-link mobile-nav-trigger mobile-nav-trigger-leistungen"[^>]*>'
    r'\s*<span class="nav-dot"></span>\s*Leistungen\s*</button>',
    re.IGNORECASE,
)
RE_MOBILE_FAKTEN_TRIGGER = re.compile(
    r'<button\s+type="button"\s+class="mobile-nav-link mobile-nav-trigger mobile-nav-trigger-fakten"[^>]*>'
    r'\s*<span class="nav-dot"></span>\s*Fakten\s*</button>',
    re.IGNORECASE,
)
MOBILE_LEISTUNGEN_LINK = (
    '<a href="/Bereiche/Bereiche" class="mobile-nav-link">'
    '<span class="nav-dot"></span> Bereiche</a>'
)
MOBILE_FAKTEN_LINK = (
    '<a href="/fakten/Fakten" class="mobile-nav-link">'
    '<span class="nav-dot"></span> Fakten</a>'
)

# Remove the entire <li class="mobile-nav-back-item">...</li> block (multi-line)
RE_MOBILE_BACK = re.compile(
    r'\s*<li\s+class="mobile-nav-back-item">.*?</li>\s*',
    re.DOTALL | re.IGNORECASE,
)
# Remove the <li class="mobile-nav-sub-group ...">...</li> blocks
RE_MOBILE_SUB_GROUP = re.compile(
    r'\s*<li\s+class="mobile-nav-sub-group[^"]*">.*?</li>\s*',
    re.DOTALL | re.IGNORECASE,
)


# ---------------------------------------------------------------------------
# 3) Pillar fixes
# ---------------------------------------------------------------------------
# (a) Breadcrumb: only the bare "/Leistungen" URL becomes "/Bereiche/Bereiche"
RE_BREADCRUMB_BARE = re.compile(
    r'"item":\s*"https://devdesignstudio\.de/Leistungen"(?=\s*\})',
)
BREADCRUMB_FIXED = '"item": "https://devdesignstudio.de/Bereiche/Bereiche"'

# (b) Übersicht-tile, inserted at top of .blog-related-grid IF not already there.
UEBERSICHT_TILE = (
    '\n                    <article class="related-item">\n'
    '                        <a href="/Bereiche/Bereiche" class="related-item-link">\n'
    '                            <h3>Übersicht</h3>\n'
    '                            <p>Alle drei Disziplinen auf einen Blick: Websites, Webapps und Integrationen.</p>\n'
    '                        </a>\n'
    '                    </article>'
)
RE_BLOG_GRID_OPEN = re.compile(r'<div\s+class="blog-related-grid">')


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def should_skip(path: Path) -> bool:
    return any(part in SKIP_DIRS for part in path.parts)


def transform_html(text: str, *, is_pillar: bool) -> tuple[str, list[str]]:
    """Apply all transforms. Returns (new_text, change_log)."""
    changes: list[str] = []
    new = text

    # Desktop nav buttons -> links
    if RE_DESKTOP_LEISTUNGEN_BTN.search(new):
        new = RE_DESKTOP_LEISTUNGEN_BTN.sub(DESKTOP_LEISTUNGEN_LINK, new)
        changes.append("desktop:leistungen-button->link")
    if RE_DESKTOP_FAKTEN_BTN.search(new):
        new = RE_DESKTOP_FAKTEN_BTN.sub(DESKTOP_FAKTEN_LINK, new)
        changes.append("desktop:fakten-button->link")

    # Mobile trigger buttons -> direct <a>
    if RE_MOBILE_LEISTUNGEN_TRIGGER.search(new):
        new = RE_MOBILE_LEISTUNGEN_TRIGGER.sub(MOBILE_LEISTUNGEN_LINK, new)
        changes.append("mobile:leistungen-trigger->link")
    if RE_MOBILE_FAKTEN_TRIGGER.search(new):
        new = RE_MOBILE_FAKTEN_TRIGGER.sub(MOBILE_FAKTEN_LINK, new)
        changes.append("mobile:fakten-trigger->link")

    # Remove mobile sub-overlay scaffolding (back-item, sub-groups)
    new, n_back = RE_MOBILE_BACK.subn('\n', new)
    if n_back:
        changes.append(f"mobile:back-item-removed x{n_back}")
    new, n_sub = RE_MOBILE_SUB_GROUP.subn('\n', new)
    if n_sub:
        changes.append(f"mobile:sub-group-removed x{n_sub}")

    if is_pillar:
        # JSON-LD breadcrumb fix
        if RE_BREADCRUMB_BARE.search(new):
            new = RE_BREADCRUMB_BARE.sub(BREADCRUMB_FIXED, new)
            changes.append("pillar:breadcrumb-fixed")

        # Insert Übersicht tile (if grid present and tile not yet there)
        if RE_BLOG_GRID_OPEN.search(new) and "/Bereiche/Bereiche" not in extract_blog_grid(new):
            new = RE_BLOG_GRID_OPEN.sub(
                lambda m: m.group(0) + UEBERSICHT_TILE,
                new,
                count=1,
            )
            changes.append("pillar:uebersicht-tile-inserted")

    return new, changes


def extract_blog_grid(html: str) -> str:
    """Return just the blog-related-grid block to check for existing Übersicht link."""
    m = re.search(r'<div\s+class="blog-related-grid">(.*?)</div>', html, re.DOTALL)
    return m.group(1) if m else ""


def update_sitemap(path: Path) -> bool:
    if not path.exists():
        return False
    text = path.read_text(encoding="utf-8")
    original = text

    # Replace broken /fakten entry's <loc> with /fakten/Fakten
    text = re.sub(
        r'<loc>https://devdesignstudio\.de/fakten</loc>',
        '<loc>https://devdesignstudio.de/fakten/Fakten</loc>',
        text,
    )

    # Add /Bereiche/Bereiche if missing
    if "https://devdesignstudio.de/Bereiche/Bereiche" not in text:
        new_entry = (
            "  <url>\n"
            "    <loc>https://devdesignstudio.de/Bereiche/Bereiche</loc>\n"
            "    <lastmod>2026-05-13</lastmod>\n"
            "  </url>\n"
        )
        text = text.replace("</urlset>", new_entry + "</urlset>")

    if text != original:
        path.write_text(text, encoding="utf-8")
        return True
    return False


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
def main() -> None:
    files_changed = 0
    total_changes: dict[str, int] = {}

    for path in ROOT.rglob("*.html"):
        if should_skip(path.relative_to(ROOT)):
            continue
        rel = path.relative_to(ROOT)
        is_pillar = (
            path.parent.name == "Leistungen"
            and path.name.lower() in PILLAR_FILES
        )
        try:
            text = path.read_text(encoding="utf-8")
        except (OSError, UnicodeDecodeError) as exc:
            print(f"  SKIP  {rel}: {exc}")
            continue

        new_text, changes = transform_html(text, is_pillar=is_pillar)
        if changes:
            path.write_text(new_text, encoding="utf-8")
            files_changed += 1
            for c in changes:
                total_changes[c] = total_changes.get(c, 0) + 1
            print(f"  EDIT  {rel}  ->  {', '.join(changes)}")

    # Sitemaps
    for sm in (ROOT / "public" / "sitemap.xml", ROOT / "dist" / "sitemap.xml"):
        if update_sitemap(sm):
            print(f"  EDIT  {sm.relative_to(ROOT)}  ->  sitemap-updated")

    print()
    print(f"Files changed: {files_changed}")
    for k, v in sorted(total_changes.items()):
        print(f"  {k}: {v}")


if __name__ == "__main__":
    main()
