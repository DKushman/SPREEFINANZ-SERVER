#!/usr/bin/env python3
"""Migrate service-standards from grid to accordion layout."""

import re
from pathlib import Path

BASE = Path("/root/projects/apps/devdesign/frontend/leistungsunterpunkte")

LI_PATTERN = re.compile(
    r'<li class="standards-feature">\s*'
    r'<span class="feature-number" aria-hidden="true">(\d+)</span>\s*'
    r'<h3 class="feature-title">(.*?)</h3>\s*'
    r'(?:<p class="feature-desc">(.*?)</p>\s*)?'
    r'</li>',
    re.DOTALL,
)


def build_item(number: str, title: str, desc: str | None, is_open: bool) -> str:
    num = number.zfill(2)
    title = title.strip()
    desc = (desc or "").strip()

    if desc:
        open_attr = " open" if is_open else ""
        return (
            f'                        <details class="standards-item"{open_attr}>\n'
            f'                            <summary class="standards-item-trigger">\n'
            f'                                <span class="feature-number" aria-hidden="true">{num}</span>\n'
            f'                                <span class="feature-title">{title}</span>\n'
            f'                                <span class="standards-item-chevron" aria-hidden="true"></span>\n'
            f"                            </summary>\n"
            f'                            <div class="standards-item-panel">\n'
            f'                                <p class="feature-desc">{desc}</p>\n'
            f"                            </div>\n"
            f"                        </details>"
        )

    return (
        f'                        <div class="standards-item standards-item--static">\n'
        f'                            <div class="standards-item-trigger">\n'
        f'                                <span class="feature-number" aria-hidden="true">{num}</span>\n'
        f'                                <span class="feature-title">{title}</span>\n'
        f"                            </div>\n"
        f"                        </div>"
    )


def transform_content(content: str) -> str | None:
    block_match = re.search(
        r'<ul class="standards-features" role="list">.*?</ul>\s*<aside class="standards-sidebar">.*?</aside>',
        content,
        flags=re.DOTALL,
    )
    if not block_match:
        return None

    ul_match = re.search(
        r'<ul class="standards-features" role="list">\s*(.*?)\s*</ul>',
        block_match.group(0),
        flags=re.DOTALL,
    )
    aside_match = re.search(
        r'<aside class="standards-sidebar">\s*(.*?)\s*</aside>',
        block_match.group(0),
        flags=re.DOTALL,
    )
    if not ul_match or not aside_match:
        return None

    items = LI_PATTERN.findall(ul_match.group(1))
    if not items:
        return None

    first_open = False
    accordion_parts = ['                    <div class="standards-accordion">']
    for number, title, desc in items:
        is_open = False
        if desc and desc.strip() and not first_open:
            is_open = True
            first_open = True
        accordion_parts.append(build_item(number, title, desc, is_open))
    accordion_parts.append("                    </div>")

    header = (
        "                    <header class=\"standards-sidebar\">\n"
        f"{aside_match.group(1).strip()}\n"
        "                    </header>"
    )

    new_block = header + "\n" + "\n".join(accordion_parts)
    return content.replace(block_match.group(0), new_block, 1)


def main() -> None:
    updated = 0
    for path in BASE.rglob("*.html"):
        content = path.read_text(encoding="utf-8")
        if "standards-features" not in content:
            continue
        new_content = transform_content(content)
        if new_content and new_content != content:
            path.write_text(new_content, encoding="utf-8")
            updated += 1
            print(f"Updated: {path}")
    print(f"Done. {updated} files updated.")


if __name__ == "__main__":
    main()
