#!/usr/bin/env python3
"""Rewrites JSON-LD in leistungen/ category hub pages cleanly."""

import json
import re
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

KATEGORIEN = {
    "gesundheits-wellness": {
        "name": "Gesundheit & Wellness",
        "service": "Websites für Gesundheits- & Wellnessunternehmen",
    },
    "kanzleien-berater": {
        "name": "Kanzleien & Beratungsdienstleister",
        "service": "Websites für Kanzleien & Beratungsdienstleister",
    },
    "planung-design": {
        "name": "Planungs- & Designunternehmen",
        "service": "Websites für Planungs- & Designunternehmen",
    },
    "produkte-lifestyle": {
        "name": "Marken-, Produkt- & Lifestyle-Unternehmen",
        "service": "Websites für Marken-, Produkt- & Lifestyle-Unternehmen",
    },
    "technologie-finanz": {
        "name": "Technologie-, IT- & Finanzunternehmen",
        "service": "Websites für Technologie-, IT- & Finanzunternehmen",
    },
}

LD_JSON_PATTERN = re.compile(
    r"([ \t]*<!--[^>]*Structured Data[^>]*-->\s*\n?)?"
    r"[ \t]*<script\s+type=[\"']application/ld\+json[\"'][^>]*>.*?</script>",
    re.DOTALL | re.IGNORECASE,
)


def main():
    frontend_root = Path(__file__).parent.parent
    leistungen_dir = frontend_root / "leistungen"

    for fpath in sorted(leistungen_dir.glob("*.html")):
        html = fpath.read_text(encoding="utf-8")

        # Extract canonical
        m = re.search(r'<link\s[^>]*rel=["\']canonical["\'][^>]*href=["\']([^"\']+)["\']', html, re.IGNORECASE)
        canonical = m.group(1).rstrip("/") if m else ""
        kat_slug = canonical.split("/")[-1] if canonical else ""

        kat_data = KATEGORIEN.get(kat_slug)
        if not kat_data:
            print(f"  SKIP (unknown kat): {fpath.name}")
            continue

        m_title = re.search(r"<title[^>]*>(.*?)</title>", html, re.IGNORECASE | re.DOTALL)
        title = unescape(m_title.group(1).strip()) if m_title else ""

        m_desc = re.search(
            r'<meta\s[^>]*name=["\']description["\'][^>]*content=["\']([^"\']*)["\']'
            r'|<meta\s[^>]*content=["\']([^"\']*)["\'][^>]*name=["\']description["\']',
            html, re.IGNORECASE,
        )
        desc = unescape(m_desc.group(1) or m_desc.group(2)) if m_desc else ""

        webpage = {
            "@context": "https://schema.org",
            "@type": "WebPage",
            "@id": f"{canonical}#webpage",
            "name": title,
            "description": desc,
            "url": canonical,
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
                    {"@type": "ListItem", "position": 2, "name": kat_data["name"], "item": canonical},
                ],
            },
        }

        service = {
            "@context": "https://schema.org",
            "@type": "Service",
            "@id": f"{canonical}#service",
            "name": kat_data["service"],
            "description": desc,
            "url": canonical,
            "provider": {
                "@type": "LocalBusiness",
                "@id": f"{BASE_URL}/#organization",
                "name": "DEVDESIGN",
            },
            "areaServed": [
                {"@type": "City", "name": "Berlin"},
                {"@type": "Country", "name": "Deutschland"},
            ],
            "audience": {
                "@type": "Audience",
                "audienceType": kat_data["name"],
            },
        }

        schema = [webpage, LOCAL_BUSINESS, service]
        json_str = json.dumps(schema, ensure_ascii=False, indent=4)
        new_block = (
            '    <!-- Structured Data for Google -->\n'
            '    <script type="application/ld+json">\n'
            f'    {json_str}\n'
            '    </script>'
        )

        new_html, count = LD_JSON_PATTERN.subn(new_block, html, count=1)
        if count == 0:
            print(f"  WARN (no match): {fpath.name}")
            continue

        fpath.write_text(new_html, encoding="utf-8")
        print(f"  OK  {fpath.name}")

    print("\nDone.")


if __name__ == "__main__":
    main()
