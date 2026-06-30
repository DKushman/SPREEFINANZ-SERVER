#!/usr/bin/env python3
"""
Upgrades schema in all portfolio/*.html files.
Replaces: thin LocalBusiness + minimal CreativeWork
With:     WebPage + canonical LocalBusiness + enriched CreativeWork

Run from the frontend/ directory:
    python3 scripts/update_portfolio_schema.py
"""

import json
import re
import sys
from html import unescape
from pathlib import Path

BASE_URL = "https://devdesignstudio.de"

LOCAL_BUSINESS = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": f"{BASE_URL}/#organization",
    "name": "DEVDESIGN",
    "url": BASE_URL,
    "logo": "https://res.cloudinary.com/dqcdbdt4v/image/upload/f_svg/DEVDESIGN_risffk.svg",
    "image": "https://res.cloudinary.com/dqcdbdt4v/image/upload/w_1200,h_630,c_pad,b_rgb:ffffff,q_auto,f_png/DD._fjnryj",
    "description": "Webagentur Berlin für Websites, Webapps und Integrationen",
    "address": {
        "@type": "PostalAddress",
        "streetAddress": "Charlottenburger Straße 110A",
        "addressLocality": "Berlin",
        "postalCode": "13086",
        "addressCountry": "DE",
    },
    "geo": {"@type": "GeoCoordinates", "latitude": 52.5557, "longitude": 13.459},
    "telephone": "+491743992254",
    "email": "info@devdesignstudio.de",
    "openingHours": "Mo-Fr 11:00-18:00",
    "priceRange": "€€",
    "areaServed": [
        {"@type": "City", "name": "Berlin"},
        {"@type": "Country", "name": "Deutschland"},
    ],
    "sameAs": ["https://www.linkedin.com/company/122473914/"],
}

# Per-project data: project name, genre (type of work), URL slug
PROJECTS = {
    "yndygo": {
        "name": "YNDYGO",
        "genre": ["Webshop", "Webdesign", "Marketing-Automation"],
        "about": "Minimalistischer Markenauftritt mit Shop, Checkout und automatisierten Workflows für Rechnungen und Kundenkonten.",
    },
    "wavez": {
        "name": "WAVEZ",
        "genre": ["Webdesign", "SEO", "Performance-Optimierung"],
        "about": "Website für Foto- und Videoproduktion mit starkem Layout, SEO und performance-optimiertem Aufbau.",
    },
    "staffconnect": {
        "name": "StaffConnect",
        "genre": ["Technologie-Website", "SEO", "Webdesign"],
        "about": "Technologie-Website mit präziser SEO-Strategie und hoher Sichtbarkeit in der Nische.",
    },
    "behindbars": {
        "name": "Behind Bars",
        "genre": ["Web-App", "Online-Kalender", "System-Integration"],
        "about": "Gemeinsamer Online-Kalender und Admin-Portal für Terminplanung, synchron mit Google Calendar.",
    },
    "htw": {
        "name": "HTW Berlin",
        "genre": ["Hochschul-Website", "Bewerbungsportal", "Webdesign"],
        "about": "Moderne Hochschul-Website und wissenschaftlich fundiertes Bewerbungsportal für besseres Recruiting.",
    },
    "preisrechner": {
        "name": "Preisrechner StaffConnect",
        "genre": ["Web-Tool", "API-Integration", "Interaktives Tool"],
        "about": "Interaktiver Preisrechner mit API-Anbindung, nachvollziehbaren Schritten und kontinuierlichem Tracking.",
    },
    "blume": {
        "name": "Blumè",
        "genre": ["Web-App", "To-Do-App", "Webentwicklung"],
        "about": "Individuelle To-Do-Web-App – nicht erledigte Aufgaben rutschen automatisch auf den nächsten Tag.",
    },
}

LD_JSON_PATTERN = re.compile(
    r'([ \t]*<!--[^>]*Structured Data[^>]*-->\s*\n?)?'
    r'[ \t]*<script\s+type=["\']application/ld\+json["\'][^>]*>.*?</script>',
    re.DOTALL | re.IGNORECASE,
)


def extract_meta_description(html):
    m = re.search(
        r'<meta\s[^>]*name=["\']description["\'][^>]*content=["\']([^"\']*)["\']'
        r'|<meta\s[^>]*content=["\']([^"\']*)["\'][^>]*name=["\']description["\']',
        html, re.IGNORECASE,
    )
    return unescape(m.group(1) or m.group(2)) if m else ""


def extract_title(html):
    m = re.search(r"<title[^>]*>(.*?)</title>", html, re.IGNORECASE | re.DOTALL)
    return unescape(m.group(1).strip()) if m else ""


def extract_canonical(html):
    m = re.search(r'<link\s[^>]*rel=["\']canonical["\'][^>]*href=["\']([^"\']+)["\']', html, re.IGNORECASE)
    return m.group(1).rstrip("/") if m else ""


def extract_og_image(html):
    m = re.search(r'<meta\s[^>]*property=["\']og:image["\'][^>]*content=["\']([^"\']+)["\']', html, re.IGNORECASE)
    return m.group(1) if m else "https://res.cloudinary.com/dqcdbdt4v/image/upload/w_1200,h_630,c_pad,b_rgb:ffffff,q_auto,f_png/DD._fjnryj"


def build_schema(canonical_url, title, description, og_image, project_data):
    headline = re.sub(r'\s*[–—-]\s*Referenz.*$', '', title).strip()
    headline = re.sub(r'\s*[–—-]\s*Webprojekt.*$', '', headline).strip()

    webpage = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "@id": f"{canonical_url}#webpage",
        "name": title,
        "description": description,
        "url": canonical_url,
        "dateModified": "2026-05-18",
        "inLanguage": "de-DE",
        "isPartOf": {
            "@type": "WebSite",
            "@id": f"{BASE_URL}/#website",
            "name": "DEVDESIGN",
            "url": BASE_URL,
        },
        "breadcrumb": {
            "@type": "BreadcrumbList",
            "itemListElement": [
                {"@type": "ListItem", "position": 1, "name": "Startseite", "item": BASE_URL},
                {"@type": "ListItem", "position": 2, "name": "Projekte", "item": f"{BASE_URL}/portfolio"},
                {"@type": "ListItem", "position": 3, "name": project_data["name"], "item": canonical_url},
            ],
        },
    }

    creative_work = {
        "@context": "https://schema.org",
        "@type": "CreativeWork",
        "@id": f"{canonical_url}#project",
        "name": project_data["name"],
        "description": project_data["about"],
        "url": canonical_url,
        "image": og_image,
        "dateCreated": "2026-05-18",
        "inLanguage": "de-DE",
        "genre": project_data["genre"],
        "author": {
            "@type": "Organization",
            "@id": f"{BASE_URL}/#organization",
            "name": "DEVDESIGN",
        },
        "creator": {
            "@type": "Organization",
            "@id": f"{BASE_URL}/#organization",
            "name": "DEVDESIGN",
        },
    }

    return [webpage, LOCAL_BUSINESS, creative_work]


def process_file(filepath: Path, frontend_root: Path) -> bool:
    slug = filepath.stem
    project_data = PROJECTS.get(slug)

    if project_data is None:
        print(f"  SKIP (no project data): {filepath.name}")
        return False

    html = filepath.read_text(encoding="utf-8")
    description = extract_meta_description(html)
    title = extract_title(html)
    canonical_url = extract_canonical(html)
    og_image = extract_og_image(html)

    if not canonical_url:
        print(f"  SKIP (no canonical): {filepath.name}", file=sys.stderr)
        return False

    schema = build_schema(canonical_url, title, description, og_image, project_data)
    json_str = json.dumps(schema, ensure_ascii=False, indent=4)
    new_block = f"    <!-- Structured Data for Google -->\n    <script type=\"application/ld+json\">\n    {json_str}\n    </script>"

    new_html, count = LD_JSON_PATTERN.subn(new_block, html, count=1)
    if count == 0:
        print(f"  WARN (no ld+json found): {filepath.name}", file=sys.stderr)
        return False

    filepath.write_text(new_html, encoding="utf-8")
    return True


def main():
    frontend_root = Path(__file__).parent.parent
    portfolio_dir = frontend_root / "portfolio"

    html_files = sorted(portfolio_dir.glob("*.html"))
    print(f"Processing {len(html_files)} portfolio files...\n")
    modified = 0

    for f in html_files:
        if process_file(f, frontend_root):
            print(f"  OK  {f.name}")
            modified += 1

    print(f"\nDone. Modified: {modified}")


if __name__ == "__main__":
    main()
