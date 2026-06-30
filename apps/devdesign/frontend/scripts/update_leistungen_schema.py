#!/usr/bin/env python3
"""
Adds @id, logo, image, sameAs to LocalBusiness blocks in Leistungen/*.html files.
Also adds @id to Service provider references.
Also upgrades LocalBusiness in leistungen/ category hub pages.

Run from the frontend/ directory:
    python3 scripts/update_leistungen_schema.py
"""

import re
import sys
from pathlib import Path

BASE_URL = "https://devdesignstudio.de"

# Fields to inject into every LocalBusiness block that lacks @id
CANONICAL_LB_ADDITIONS = {
    "after_name": ''',
            "@id": "https://devdesignstudio.de/#organization"''',
    "after_url": ''',
            "logo": "https://res.cloudinary.com/dqcdbdt4v/image/upload/f_svg/DEVDESIGN_risffk.svg",
            "image": "https://res.cloudinary.com/dqcdbdt4v/image/upload/w_1200,h_630,c_pad,b_rgb:ffffff,q_auto,f_png/DD._fjnryj"''',
}


def patch_local_business_block(html: str) -> str:
    """
    Find LocalBusiness objects in a JSON-LD script and:
    1. Add @id after "name": "DEVDESIGN"
    2. Add logo + image after "url": "https://devdesignstudio.de"
    3. Add sameAs before the closing brace of the top-level LocalBusiness
    4. Add @id to provider blocks that reference DEVDESIGN
    """
    # ── 1. Add @id to the main LocalBusiness block ────────────────────────────
    # Match:  "name": "DEVDESIGN",  (without @id already on the next line)
    # Insert @id right after
    html = re.sub(
        r'("name":\s*"DEVDESIGN")(\s*,\s*\n(?!\s*"@id"))',
        r'\1,\n            "@id": "https://devdesignstudio.de/#organization"\2',
        html,
    )

    # ── 2. Add logo + image after "url": "https://devdesignstudio.de", ───────
    html = re.sub(
        r'("url":\s*"https://devdesignstudio\.de")(\s*,\s*\n(?!\s*"logo"))',
        r'\1,\n            "logo": "https://res.cloudinary.com/dqcdbdt4v/image/upload/f_svg/DEVDESIGN_risffk.svg",'
        r'\n            "image": "https://res.cloudinary.com/dqcdbdt4v/image/upload/w_1200,h_630,c_pad,b_rgb:ffffff,q_auto,f_png/DD._fjnryj"\2',
        html,
    )

    # ── 3. Add sameAs before "serviceType" / closing of top-level LB block ────
    # Insert sameAs before the closing "serviceType" key or before the "},"
    # that ends the LocalBusiness when openingHours is the last key.
    # Strategy: find openingHours line and add sameAs after it if not already there
    html = re.sub(
        r'("openingHours":\s*"[^"]*")\s*\n(\s*(?!"sameAs"))',
        lambda m: (
            m.group(1) + ',\n'
            + '            "sameAs": ["https://www.linkedin.com/company/122473914/"],\n'
            + '            "priceRange": "€€",\n'
            + m.group(2)
            if '"sameAs"' not in m.group(0)
            else m.group(0)
        ),
        html,
    )

    # ── 4. Add @id to provider references inside Service blocks ───────────────
    html = re.sub(
        r'("provider":\s*\{[^}]*"@type":\s*"LocalBusiness",\s*\n\s*"name":\s*"DEVDESIGN")',
        r'\1,\n                "@id": "https://devdesignstudio.de/#organization"',
        html,
    )

    return html


def process_file(filepath: Path) -> bool:
    html = filepath.read_text(encoding="utf-8")

    # Quick check: skip if already has @id on the LocalBusiness
    if '"@id": "https://devdesignstudio.de/#organization"' in html:
        print(f"  SKIP (already patched): {filepath.name}")
        return False

    new_html = patch_local_business_block(html)

    if new_html == html:
        print(f"  WARN (no change): {filepath.name}")
        return False

    filepath.write_text(new_html, encoding="utf-8")
    return True


def main():
    frontend_root = Path(__file__).parent.parent

    # Leistungen/ (capital L) - main service pages
    target_files = [
        frontend_root / "Leistungen" / "websites.html",
        frontend_root / "Leistungen" / "webapps.html",
        frontend_root / "Leistungen" / "integrationen.html",
        frontend_root / "Leistungen" / "Leistungen.html",
    ]

    # leistungen/ (lowercase) - category hub pages
    leistungen_lower = frontend_root / "leistungen"
    if leistungen_lower.is_dir():
        target_files += list(leistungen_lower.glob("*.html"))

    print(f"Processing {len(target_files)} Leistungen files...\n")
    modified = 0

    for f in target_files:
        if not f.exists():
            print(f"  NOT FOUND: {f.name}", file=sys.stderr)
            continue
        if process_file(f):
            print(f"  OK  {f.relative_to(frontend_root)}")
            modified += 1

    print(f"\nDone. Modified: {modified}")


if __name__ == "__main__":
    main()
