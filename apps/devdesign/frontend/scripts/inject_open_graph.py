#!/usr/bin/env python3
"""Insert Open Graph meta tags after <link rel="canonical"> in static HTML (excludes dist/).

Standard preview image (1200x630, PNG via Cloudinary):
https://res.cloudinary.com/dqcdbdt4v/image/upload/w_1200,h_630,c_pad,b_rgb:ffffff,q_auto,f_png/DD._fjnryj
og:site_name = DEVDESIGN, og:locale = de_DE. Blog posts under blog/ use og:type article.
"""
from __future__ import annotations

import html
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OG_IMAGE = (
    "https://res.cloudinary.com/dqcdbdt4v/image/upload/"
    "w_1200,h_630,c_pad,b_rgb:ffffff,q_auto,f_png/DD._fjnryj"
)
OG_SITE_NAME = "DEVDESIGN"
OG_LOCALE = "de_DE"
OG_IMAGE_ALT = "DEVDESIGN – Webagentur Berlin"


def escape_attr(s: str) -> str:
    return html.escape(s, quote=True)


def extract(pattern: str, text: str) -> str | None:
    m = re.search(pattern, text, re.DOTALL | re.IGNORECASE)
    return m.group(1).strip() if m else None


def og_block(*, og_type: str, title: str, description: str, url: str) -> str:
    return (
        f'    <meta property="og:type" content="{og_type}">\n'
        f'    <meta property="og:title" content="{escape_attr(title)}">\n'
        f'    <meta property="og:description" content="{escape_attr(description)}">\n'
        f'    <meta property="og:url" content="{escape_attr(url)}">\n'
        f'    <meta property="og:image" content="{OG_IMAGE}">\n'
        f'    <meta property="og:image:alt" content="{escape_attr(OG_IMAGE_ALT)}">\n'
        f'    <meta property="og:site_name" content="{escape_attr(OG_SITE_NAME)}">\n'
        f'    <meta property="og:locale" content="{OG_LOCALE}">\n'
    )


def inject_file(path: Path) -> bool:
    raw = path.read_text(encoding="utf-8")
    if 'property="og:title"' in raw:
        return False
    if "<!DOCTYPE html>" not in raw:
        return False

    canon = extract(r'<link\s+rel="canonical"\s+href="([^"]+)"', raw)
    if not canon:
        print(f"skip (no canonical): {path.relative_to(ROOT)}")
        return False

    title_raw = extract(r"<title>([^<]*)</title>", raw)
    if not title_raw:
        print(f"skip (no title): {path.relative_to(ROOT)}")
        return False

    desc_m = re.search(
        r'<meta\s+name="description"\s+content="([^"]*)"', raw, re.IGNORECASE
    )
    if not desc_m:
        desc_m = re.search(
            r'<meta\s+content="([^"]*)"\s+name="description"', raw, re.IGNORECASE
        )
    desc_raw = desc_m.group(1) if desc_m else title_raw

    title = html.unescape(title_raw)
    description = html.unescape(desc_raw)

    rel = path.relative_to(ROOT).as_posix()
    og_type = "article" if rel.startswith("blog/") else "website"

    block = og_block(og_type=og_type, title=title, description=description, url=canon)

    new_raw, n = re.subn(
        r'(<link\s+rel="canonical"\s+href="[^"]+"\s*>)',
        r"\1\n" + block.rstrip("\n"),
        raw,
        count=1,
    )
    if n != 1:
        print(f"skip (canonical replace failed): {path.relative_to(ROOT)}")
        return False

    path.write_text(new_raw, encoding="utf-8")
    return True


def main() -> None:
    n = 0
    for path in sorted(ROOT.rglob("*.html")):
        if "dist" in path.parts:
            continue
        if inject_file(path):
            n += 1
    print(f"Injected Open Graph into {n} files under {ROOT}")


if __name__ == "__main__":
    main()
