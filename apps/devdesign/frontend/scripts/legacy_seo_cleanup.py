#!/usr/bin/env python3
"""
Legacy SEO cleanup: noindex + canonical targets on old HTML, nginx 301 map for redirects.

Targets:
  - leistungsunterpunkte/{legacy-branch}/…  (5 old branch folders)
  - leistungsunterpunkte/*.html             (service hub pages)
  - leistungen/{legacy-branch}.html         (old branch overviews)

Run from frontend/:
    python3 scripts/legacy_seo_cleanup.py [--dry-run]
"""

from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BASE_URL = "https://devdesignstudio.de"

LEGACY_BRANCH_FOLDERS = frozenset(
    {
        "gesundheits-wellness",
        "kanzleien-berater",
        "planung-design",
        "produkte-lifestyle",
        "technologie-finanz",
    }
)

LEGACY_BRANCH_TO_NEW: dict[str, str] = {
    "gesundheits-wellness": "gesundheit-praxen",
    "kanzleien-berater": "recht-beratung",
    "planung-design": "buero-projekte",
    "produkte-lifestyle": "marken-shops",
    "technologie-finanz": "tech-finanz",
}

# (legacy_branch, legacy_persona) -> (new_branch, new_persona) or None for branch-only fallback
PERSONA_MAP: dict[tuple[str, str], tuple[str, str] | None] = {
    ("gesundheits-wellness", "praxen-aerzte"): ("gesundheit-praxen", "arztpraxen"),
    ("gesundheits-wellness", "kliniken-zentren"): ("gesundheit-praxen", "kliniken-gesundheitszentren"),
    ("gesundheits-wellness", "therapeuten"): ("gesundheit-praxen", "physio-therapiepraxen"),
    ("gesundheits-wellness", "weitere-gesundheitsdienstleister"): None,
    ("gesundheits-wellness", "wellness-spa"): None,
    ("kanzleien-berater", "notare"): ("recht-beratung", "notariate"),
    ("kanzleien-berater", "kanzleien"): ("recht-beratung", "rechtsanwaltskanzleien"),
    ("kanzleien-berater", "steuerberater"): ("recht-beratung", "steuerkanzleien"),
    ("kanzleien-berater", "unternehmensberater"): None,
    ("kanzleien-berater", "weitere"): None,
    ("planung-design", "architekturbueros"): ("buero-projekte", "architekturbueros"),
    ("planung-design", "ingenieurbueros"): ("buero-projekte", "ingenieurbueros"),
    ("planung-design", "innenarchitektur"): ("buero-projekte", "innenarchitekturbueros"),
    ("planung-design", "designstudios"): ("buero-projekte", "kreativagenturen-videoproduktion"),
    ("planung-design", "weitere-planung-design"): None,
    ("produkte-lifestyle", "mode-accessoires"): ("marken-shops", "modemarken"),
    ("produkte-lifestyle", "lifestyle-interior"): ("marken-shops", "lifestyle-interior-marken"),
    ("produkte-lifestyle", "food-beverage"): ("marken-shops", "food-getraenkemarken"),
    ("produkte-lifestyle", "beauty-kosmetik"): ("marken-shops", "juweliere"),
    ("produkte-lifestyle", "weitere-lifestylemarken"): None,
    ("technologie-finanz", "software-saas"): ("tech-finanz", "saas-software-unternehmen"),
    ("technologie-finanz", "finanzdienstleister"): ("tech-finanz", "finanzdienstleister"),
    ("technologie-finanz", "vermoegensberater"): ("tech-finanz", "vermoegens-anlageberater"),
    ("technologie-finanz", "it-infrastruktur"): None,
    ("technologie-finanz", "weitere-tech-finanz"): None,
}

LEGACY_PAGE_TO_NEW: dict[str, str | None] = {
    "website-online-praesenz": "website",
    "online-terminbuchung-kundenportale": "website",
    "landingpages-leadgenerierung": "kundengewinnung",
    "seo-performance-optimierung": "kundengewinnung",
    "digitale-prozesse-web-anwendungen": None,
}

ROOT_HUB_REDIRECTS: dict[str, str] = {
    "website-online-praesenz": "/Bereiche/websites",
    "online-terminbuchung-kundenportale": "/Bereiche/integrationen",
    "landingpages-leadgenerierung": "/Bereiche/websites",
    "seo-performance-optimierung": "/Bereiche/websites",
    "digitale-prozesse-web-anwendungen": "/Bereiche/webapps",
}

WEBAPPS_PATH = "/Bereiche/webapps"

ROBOTS_RE = re.compile(r'<meta name="robots" content="[^"]*">')
CANONICAL_RE = re.compile(r'<link rel="canonical" href="[^"]*">')
OG_URL_RE = re.compile(r'<meta property="og:url" content="[^"]*">')


def branch_overview_path(legacy_branch: str) -> str:
    return f"/leistungen/{LEGACY_BRANCH_TO_NEW[legacy_branch]}"


def resolve_persona_target(legacy_branch: str, legacy_persona: str, legacy_page: str) -> str:
    new_page = LEGACY_PAGE_TO_NEW.get(legacy_page)
    if new_page is None:
        return WEBAPPS_PATH

    mapped = PERSONA_MAP.get((legacy_branch, legacy_persona))
    if mapped is None:
        return branch_overview_path(legacy_branch)

    new_branch, new_persona = mapped
    return f"/leistungen/{new_branch}/{new_persona}/{new_page}"


def patch_html(path: Path, canonical_path: str, dry_run: bool) -> bool:
    text = path.read_text(encoding="utf-8")
    canonical_url = f"{BASE_URL}{canonical_path}"

    updated = text
    updated = ROBOTS_RE.sub('<meta name="robots" content="noindex, follow">', updated, count=1)
    updated = CANONICAL_RE.sub(f'<link rel="canonical" href="{canonical_url}">', updated, count=1)
    updated = OG_URL_RE.sub(f'<meta property="og:url" content="{canonical_url}">', updated, count=1)

    if updated == text:
        return False
    if not dry_run:
        path.write_text(updated, encoding="utf-8")
    return True


def collect_redirects() -> dict[str, str]:
    redirects: dict[str, str] = {}

    for legacy_branch, new_branch in LEGACY_BRANCH_TO_NEW.items():
        redirects[f"/leistungen/{legacy_branch}"] = f"/leistungen/{new_branch}"

    leistungs_dir = ROOT / "leistungsunterpunkte"
    for legacy_branch in sorted(LEGACY_BRANCH_FOLDERS):
        branch_dir = leistungs_dir / legacy_branch
        if not branch_dir.is_dir():
            continue
        for persona_dir in sorted(branch_dir.iterdir()):
            if not persona_dir.is_dir():
                continue
            legacy_persona = persona_dir.name
            for html_file in sorted(persona_dir.glob("*.html")):
                legacy_page = html_file.stem
                legacy_uri = f"/leistungsunterpunkte/{legacy_branch}/{legacy_persona}/{legacy_page}"
                target = resolve_persona_target(legacy_branch, legacy_persona, legacy_page)
                redirects[legacy_uri] = target

    for slug, target in ROOT_HUB_REDIRECTS.items():
        redirects[f"/leistungsunterpunkte/{slug}"] = target

    return redirects


def patch_legacy_html(redirects: dict[str, str], dry_run: bool) -> int:
    changed = 0

    for legacy_branch in LEGACY_BRANCH_FOLDERS:
        branch_dir = ROOT / "leistungsunterpunkte" / legacy_branch
        if not branch_dir.is_dir():
            continue
        for html_file in branch_dir.rglob("*.html"):
            rel = html_file.relative_to(ROOT / "leistungsunterpunkte")
            legacy_uri = f"/leistungsunterpunkte/{rel.with_suffix('').as_posix()}"
            target = redirects.get(legacy_uri)
            if not target:
                continue
            if patch_html(html_file, target, dry_run):
                changed += 1

    for legacy_branch in LEGACY_BRANCH_FOLDERS:
        html_name = "kanzlein&berater.html" if legacy_branch == "kanzleien-berater" else f"{legacy_branch}.html"
        html_path = ROOT / "leistungen" / html_name
        if not html_path.is_file():
            continue
        target = branch_overview_path(legacy_branch)
        if patch_html(html_path, target, dry_run):
            changed += 1

    for slug in ROOT_HUB_REDIRECTS:
        html_path = ROOT / "leistungsunterpunkte" / f"{slug}.html"
        if html_path.is_file() and patch_html(html_path, ROOT_HUB_REDIRECTS[slug], dry_run):
            changed += 1

    standard = ROOT / "leistungsunterpunkte" / "unterpunkte-standard.html"
    if standard.is_file() and patch_html(standard, "/leistungen", dry_run):
        changed += 1

    return changed


def write_nginx_map(redirects: dict[str, str], dry_run: bool) -> None:
    out = ROOT / "nginx" / "legacy-redirect-map.inc"
    lines = [
        "# Auto-generated by scripts/legacy_seo_cleanup.py — do not edit manually.",
        f"# {len(redirects)} legacy URL redirects.",
    ]
    for source, target in sorted(redirects.items()):
        lines.append(f"    {source} {target};")

    content = "\n".join(lines) + "\n"
    if dry_run:
        print(f"Would write {out} ({len(redirects)} entries)")
        return
    out.write_text(content, encoding="utf-8")
    print(f"Wrote {out} ({len(redirects)} entries)")


def update_robots_txt(dry_run: bool) -> None:
    robots_path = ROOT / "public" / "robots.txt"
    content = robots_path.read_text(encoding="utf-8")
    disallow = "Disallow: /leistungsunterpunkte/"
    if disallow in content:
        return
    block = (
        "User-agent: *\n"
        "Allow: /\n"
        "Disallow: /leistungsunterpunkte/\n"
        "\n"
        "Sitemap: https://devdesignstudio.de/sitemap.xml\n"
    )
    if not dry_run:
        robots_path.write_text(block, encoding="utf-8")
    print("Updated public/robots.txt (Disallow /leistungsunterpunkte/)")


def main() -> int:
    parser = argparse.ArgumentParser(description="Legacy SEO cleanup: noindex, canonicals, nginx 301 map")
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    redirects = collect_redirects()
    changed = patch_legacy_html(redirects, args.dry_run)
    write_nginx_map(redirects, args.dry_run)
    update_robots_txt(args.dry_run)

    mode = "Would patch" if args.dry_run else "Patched"
    print(f"{mode} {changed} HTML files")
    return 0


if __name__ == "__main__":
    sys.exit(main())
