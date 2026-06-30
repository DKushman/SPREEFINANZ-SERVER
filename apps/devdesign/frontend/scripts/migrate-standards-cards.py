#!/usr/bin/env python3
"""Migrate service-standards to TravelPerk-style icon cards."""

import re
from pathlib import Path

BASE = Path("/root/projects/apps/devdesign/frontend/leistungsunterpunkte")

ICONS = [
    (
        "standards-card-icon--1",
        '<svg class="standards-card-svg" viewBox="0 0 24 24" fill="none" aria-hidden="true">'
        '<path d="M12 3l8 3v6c0 5-3.5 9-8 9s-8-4-8-9V6l8-3z" stroke="currentColor" stroke-width="1.75" stroke-linejoin="round"/>'
        '<path d="M9 12l2 2 4-4" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    ),
    (
        "standards-card-icon--2",
        '<svg class="standards-card-svg" viewBox="0 0 24 24" fill="none" aria-hidden="true">'
        '<path d="M12 2L2 7l10 5 10-5-10-5z" stroke="currentColor" stroke-width="1.75" stroke-linejoin="round"/>'
        '<path d="M2 12l10 5 10-5M2 17l10 5 10-5" stroke="currentColor" stroke-width="1.75" stroke-linejoin="round"/></svg>',
    ),
    (
        "standards-card-icon--3",
        '<svg class="standards-card-svg" viewBox="0 0 24 24" fill="none" aria-hidden="true">'
        '<path d="M3 17l6-6 4 4 8-8" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/>'
        '<path d="M14 7h7v7" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    ),
    (
        "standards-card-icon--4",
        '<svg class="standards-card-svg" viewBox="0 0 24 24" fill="none" aria-hidden="true">'
        '<rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" stroke-width="1.75"/>'
        '<circle cx="8.5" cy="10.5" r="1.75" stroke="currentColor" stroke-width="1.75"/>'
        '<path d="M21 15l-5.2-5.2a1.2 1.2 0 00-1.7 0L5 19" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/></svg>',
    ),
]


def extract_header(section: str) -> tuple[str, str, str]:
    title = re.search(
        r'<h2 id="standards-heading" class="standards-title">(.*?)</h2>',
        section,
        re.DOTALL,
    )
    desc = re.search(r'<p class="standards-desc">(.*?)</p>', section, re.DOTALL)
    cta = re.search(
        r'(<a href="[^"]*" class="button standards-cta">.*?</a>)',
        section,
        re.DOTALL,
    )
    return (
        title.group(1).strip() if title else "",
        desc.group(1).strip() if desc else "",
        cta.group(1).strip() if cta else "",
    )


def extract_items(section: str) -> list[tuple[str, str]]:
    items: list[tuple[str, str]] = []

    accordion = re.search(r'<div class="standards-accordion">(.*?)</div>\s*(?:</div>\s*)?</section>', section, re.DOTALL)
    if accordion:
        content = accordion.group(1)
        for block in re.finditer(
            r'<details class="standards-item"[^>]*>.*?</details>|'
            r'<div class="standards-item standards-item--static">.*?</div>',
            content,
            re.DOTALL,
        ):
            chunk = block.group(0)
            title = re.search(r'class="feature-title">(.*?)</span>', chunk, re.DOTALL)
            desc = re.search(r'class="feature-desc">(.*?)</p>', chunk, re.DOTALL)
            items.append(
                (
                    title.group(1).strip() if title else "",
                    desc.group(1).strip() if desc else "",
                )
            )
        return items

    ul = re.search(r'<ul class="standards-features" role="list">(.*?)</ul>', section, re.DOTALL)
    if ul:
        for chunk in re.finditer(r'<li class="standards-feature">.*?</li>', ul.group(1), re.DOTALL):
            block = chunk.group(0)
            title = re.search(r'class="feature-title">(.*?)</h3>', block, re.DOTALL)
            desc = re.search(r'class="feature-desc">(.*?)</p>', block, re.DOTALL)
            items.append(
                (
                    title.group(1).strip() if title else "",
                    desc.group(1).strip() if desc else "",
                )
            )
    return items


def build_card(index: int, title: str, desc: str) -> str:
    icon_class, icon_svg = ICONS[index]
    desc_html = f'\n                            <p class="standards-card-desc">{desc}</p>' if desc else ""
    return (
        f'                        <li class="standards-card">\n'
        f'                            <span class="standards-card-icon {icon_class}" aria-hidden="true">\n'
        f"                                {icon_svg}\n"
        f"                            </span>\n"
        f'                            <h3 class="standards-card-title">{title}</h3>{desc_html}\n'
        f"                        </li>"
    )


def build_section(title: str, desc: str, cta: str, items: list[tuple[str, str]]) -> str:
    cards = "\n".join(build_card(i, t, d) for i, (t, d) in enumerate(items[:4]))
    footer = f'\n                    <div class="standards-footer">\n                        {cta}\n                    </div>' if cta else ""
    return (
        '            <section class="service-standards" aria-labelledby="standards-heading">\n'
        '                <div class="standards-layout">\n'
        '                    <div class="standards-header">\n'
        f'                        <h2 id="standards-heading" class="standards-title">{title}</h2>\n'
        f'                        <p class="standards-desc">{desc}</p>\n'
        "                    </div>\n"
        '                    <ul class="standards-cards" role="list">\n'
        f"{cards}\n"
        "                    </ul>"
        f"{footer}\n"
        "                </div>\n"
        "            </section>"
    )


def transform_content(content: str) -> str | None:
    match = re.search(
        r'<section class="service-standards" aria-labelledby="standards-heading">.*?</section>',
        content,
        re.DOTALL,
    )
    if not match:
        return None

    section = match.group(0)
    title, desc, cta = extract_header(section)
    items = extract_items(section)
    if not title or len(items) < 1:
        return None

    new_section = build_section(title, desc, cta, items)
    return content.replace(section, new_section, 1)


def main() -> None:
    updated = 0
    for path in BASE.rglob("*.html"):
        content = path.read_text(encoding="utf-8")
        if "service-standards" not in content:
            continue
        new_content = transform_content(content)
        if new_content and new_content != content:
            path.write_text(new_content, encoding="utf-8")
            updated += 1
            print(f"Updated: {path}")
    print(f"Done. {updated} files updated.")


if __name__ == "__main__":
    main()
