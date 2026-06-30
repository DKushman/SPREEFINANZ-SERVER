#!/usr/bin/env python3
"""Update service-standards sections in leistungsunterpunkte HTML files."""

import re
from pathlib import Path

BASE = Path("/root/projects/apps/devdesign/frontend/leistungsunterpunkte")
WEBSITE_TXT = Path("/root/projects/apps/devdesign/frontend/website-anforderungen-pro-persona.txt")
KG_TXT = Path("/root/projects/apps/devdesign/frontend/online-kundengewinnung-pro-persona.txt")

PERSONA_META = {
    "arztpraxen": ("Arztpraxen", "Patientengewinnung", "Terminanfragen"),
    "kliniken-gesundheitszentren": ("Gesundheitszentren", "Patientengewinnung", "Terminanfragen"),
    "physio-therapiepraxen": ("Therapiepraxen", "Patientengewinnung", "Terminanfragen"),
    "notariate": ("Notariate", "Mandantengewinnung", "Mandatsanfragen"),
    "rechtsanwaltskanzleien": ("Rechtsanwaltskanzleien", "Mandantengewinnung", "Mandatsanfragen"),
    "steuerkanzleien": ("Steuerkanzleien", "Mandantengewinnung", "Mandatsanfragen"),
    "modemarken": ("Modemarken", "Kundengewinnung", "Online-Verkäufe"),
    "lifestyle-interior-marken": ("Interior-Marken", "Kundengewinnung", "Online-Verkäufe"),
    "food-getraenkemarken": ("Getränkemarken", "Kundengewinnung", "Online-Verkäufe"),
    "juweliere": ("Juweliere", "Kundengewinnung", "Online-Verkäufe"),
    "architekturbueros": ("Architekturbüros", "Kundengewinnung", "Projektanfragen"),
    "ingenieurbueros": ("Ingenieurbüros", "Kundengewinnung", "Projektanfragen"),
    "innenarchitekturbueros": ("Innenarchitekturbüros", "Kundengewinnung", "Projektanfragen"),
    "kreativagenturen-videoproduktion": ("Kreativagenturen", "Kundengewinnung", "Projektanfragen"),
    "saas-software-unternehmen": ("Software-Unternehmen", "Leadgewinnung", "Demo-Anfragen"),
    "finanzdienstleister": ("Finanzdienstleister", "Kundengewinnung", "Beratungsanfragen"),
    "vermoegens-anlageberater": ("Vermögensberater", "Kundengewinnung", "Beratungsanfragen"),
}

TXT_TO_SLUG = {
    "ARZTPRAXEN": "arztpraxen",
    "KLINIKEN & GESUNDHEITSZENTREN": "kliniken-gesundheitszentren",
    "PHYSIO- & THERAPIEPRAXEN": "physio-therapiepraxen",
    "NOTARIATE": "notariate",
    "RECHTSANWALTSKANZLEIEN": "rechtsanwaltskanzleien",
    "STEUERKANZLEIEN": "steuerkanzleien",
    "MODEMARKEN": "modemarken",
    "LIFESTYLE- & INTERIOR-MARKEN": "lifestyle-interior-marken",
    "FOOD- & GETRÄNKEMARKEN": "food-getraenkemarken",
    "JUWELIERE": "juweliere",
    "ARCHITEKTURBÜROS": "architekturbueros",
    "INGENIEURBÜROS": "ingenieurbueros",
    "INNENARCHITEKTURBÜROS": "innenarchitekturbueros",
    "KREATIVAGENTUREN & VIDEOPRODUKTION": "kreativagenturen-videoproduktion",
    "SAAS- & SOFTWARE-UNTERNEHMEN": "saas-software-unternehmen",
    "FINANZDIENSTLEISTER": "finanzdienstleister",
    "VERMÖGENS- & ANLAGEBERATER": "vermoegens-anlageberater",
}


def parse_txt(path: Path) -> dict[str, list[str]]:
    text = path.read_text(encoding="utf-8")
    sections: dict[str, list[str]] = {}
    current_slug: str | None = None
    current_bullet: list[str] = []

    def flush_bullet() -> None:
        nonlocal current_bullet
        if current_slug and current_bullet:
            joined = current_bullet[0]
            for part in current_bullet[1:]:
                if joined.endswith("-"):
                    joined += part
                else:
                    joined += " " + part
            joined = re.sub(r"\s+", " ", joined).strip()
            sections[current_slug].append(joined)
        current_bullet = []

    for raw_line in text.splitlines():
        line = raw_line.rstrip()
        stripped = line.strip()
        header = stripped.upper()

        if header in TXT_TO_SLUG:
            flush_bullet()
            current_slug = TXT_TO_SLUG[header]
            sections[current_slug] = []
            continue

        if stripped.startswith("=") or stripped.startswith("---") or not stripped:
            continue

        if stripped.startswith("- "):
            flush_bullet()
            current_bullet = [stripped[2:].strip()]
        elif current_bullet and (line.startswith("  ") or line.startswith("\t")):
            current_bullet.append(stripped)

    flush_bullet()
    return sections


def split_bullet(bullet: str) -> tuple[str, str]:
    if ": " in bullet:
        title, desc = bullet.split(": ", 1)
        return title.strip(), desc.strip()
    if " – " in bullet:
        title, desc = bullet.split(" – ", 1)
        return title.strip(), desc.strip()
    for sep in (", damit ", ", um ", ", ohne ", ", wenn "):
        if sep in bullet:
            title, desc = bullet.split(sep, 1)
            return title.strip(), (sep.strip(", ") + " " + desc.strip()).strip()
    return bullet, ""


def escape_html(text: str) -> str:
    return (
        text.replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace('"', "&quot;")
    )


def normalize_features_html(bullets: list[str]) -> str:
    inner: list[str] = ['<ul class="standards-features" role="list">']
    for i, bullet in enumerate(bullets[:4]):
        title, desc = split_bullet(bullet)
        num = f"{i + 1:02d}"
        inner.append('    <li class="standards-feature">')
        inner.append(f'        <span class="feature-number" aria-hidden="true">{num}</span>')
        inner.append(f'        <h3 class="feature-title">{escape_html(title)}</h3>')
        if desc:
            inner.append(f'        <p class="feature-desc">{escape_html(desc)}</p>')
        inner.append("    </li>")
    inner.append("</ul>")
    return "\n".join("                    " + line for line in inner)


def website_h2(display_name: str) -> str:
    return f"Webdesign für {display_name}: 4 Punkte für einen professionellen Online-Auftritt"


def kg_h2(display_name: str, gewinnung: str, goal: str) -> str:
    return f"{gewinnung} für {display_name}: 4 essenzielle Strategien für mehr {goal}"


def find_html_file(slug: str) -> tuple[Path | None, Path | None]:
    website_path = None
    kg_path = None
    for p in BASE.rglob("website.html"):
        if p.parent.name == slug:
            website_path = p
    for p in BASE.rglob("kundengewinnung.html"):
        if p.parent.name == slug:
            kg_path = p
    return website_path, kg_path


def update_file(path: Path, features_html: str, h2_text: str) -> None:
    content = path.read_text(encoding="utf-8")
    content = re.sub(
        r'<div class="standards-layout">\s*<ul class="standards-features" role="list">.*?</ul>',
        '<div class="standards-layout">\n' + features_html,
        content,
        count=1,
        flags=re.DOTALL,
    )
    content = re.sub(
        r'(<h2 id="standards-heading" class="standards-title">)(.*?)(</h2>)',
        lambda m: m.group(1) + escape_html(h2_text) + m.group(3),
        content,
        count=1,
    )
    path.write_text(content, encoding="utf-8")
    print(f"Updated: {path}")


def main() -> None:
    website_data = parse_txt(WEBSITE_TXT)
    kg_data = parse_txt(KG_TXT)

    for slug, (display_name, gewinnung, goal) in PERSONA_META.items():
        website_path, kg_path = find_html_file(slug)

        if website_path and slug in website_data:
            bullets = website_data[slug]
            if len(bullets) != 4:
                print(f"WARN website {slug}: expected 4 bullets, got {len(bullets)}")
            update_file(website_path, normalize_features_html(bullets), website_h2(display_name))

        if kg_path and slug in kg_data:
            bullets = kg_data[slug]
            if len(bullets) != 4:
                print(f"WARN kg {slug}: expected 4 bullets, got {len(bullets)}")
            update_file(kg_path, normalize_features_html(bullets), kg_h2(display_name, gewinnung, goal))


if __name__ == "__main__":
    main()
