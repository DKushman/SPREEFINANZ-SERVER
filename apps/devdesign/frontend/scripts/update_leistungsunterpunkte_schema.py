#!/usr/bin/env python3
"""
Injects enriched 3-entity Schema.org JSON-LD into all leistungsunterpunkte/ HTML files.
Handles two cases:
  - Root hub: leistungsunterpunkte/<service>.html
  - Leaf:     leistungsunterpunkte/<kategorie>/<branche>/<service>.html

Run from the frontend/ directory:
    python3 scripts/update_leistungsunterpunkte_schema.py
"""

import json
import re
import sys
from html import unescape
from pathlib import Path

# ─────────────────────────────────────────────────────────────────────────────
# Taxonomy lookup tables
# ─────────────────────────────────────────────────────────────────────────────

BASE_URL = "https://devdesignstudio.de"

KATEGORIEN = {
    "gesundheits-wellness": {
        "name": "Gesundheit & Wellness",
        "url": f"{BASE_URL}/leistungen/gesundheits-wellness",
    },
    "kanzleien-berater": {
        "name": "Kanzleien & Beratungsdienstleister",
        "url": f"{BASE_URL}/leistungen/kanzleien-berater",
    },
    "planung-design": {
        "name": "Planungs- & Designunternehmen",
        "url": f"{BASE_URL}/leistungen/planung-design",
    },
    "produkte-lifestyle": {
        "name": "Marken-, Produkt- & Lifestyle-Unternehmen",
        "url": f"{BASE_URL}/leistungen/produkte-lifestyle",
    },
    "technologie-finanz": {
        "name": "Technologie-, IT- & Finanzunternehmen",
        "url": f"{BASE_URL}/leistungen/technologie-finanz",
    },
}

BRANCHEN = {
    # gesundheits-wellness
    "kliniken-zentren": "Kliniken & Zentren",
    "praxen-aerzte": "Praxen & Ärzte",
    "therapeuten": "Therapeuten",
    "weitere-gesundheitsdienstleister": "Weitere Gesundheitsdienstleister",
    "wellness-spa": "Wellness & Spa",
    # kanzleien-berater
    "kanzleien": "Kanzleien",
    "notare": "Notare",
    "steuerberater": "Steuerberater",
    "unternehmensberater": "Unternehmensberater",
    "weitere": "Weitere Kanzleien & Berater",
    # planung-design
    "architekturbueros": "Architekturbüros",
    "designstudios": "Designstudios",
    "ingenieurbueros": "Ingenieurbüros",
    "innenarchitektur": "Innenarchitektur",
    "weitere-planung-design": "Weitere Planungs- & Designunternehmen",
    # produkte-lifestyle
    "beauty-kosmetik": "Kosmetikstudios",
    "food-beverage": "E-Commerce",
    "lifestyle-interior": "Lifestylemarken",
    "mode-accessoires": "Modemarken",
    "weitere-lifestylemarken": "Sport & Outdoor",
    # technologie-finanz
    "finanzdienstleister": "Finanzdienstleister",
    "it-infrastruktur": "IT-Infrastruktur",
    "software-saas": "Software & SaaS",
    "vermoegensberater": "Vermögensberater",
    "weitere-tech-finanz": "Versicherungsdienstleister",
}

SERVICES = {
    "website-online-praesenz": {
        "name": "Website",
        "serviceType": "Webdesign",
    },
    "seo-performance-optimierung": {
        "name": "Online Marketing",
        "serviceType": "Online Marketing",
    },
    "landingpages-leadgenerierung": {
        "name": "Landingpages",
        "serviceType": "Landingpages",
    },
    "online-terminbuchung-kundenportale": {
        "name": "Terminportal",
        "serviceType": "Terminportal",
    },
    "digitale-prozesse-web-anwendungen": {
        "name": "Software entwickeln lassen",
        "serviceType": "Softwareentwicklung",
    },
}

# Branche slugs that get "Kundenportal" instead of "Terminportal"
_KUNDENPORTAL_SLUGS = frozenset({
    "software-saas", "it-infrastruktur", "finanzdienstleister", "weitere-tech-finanz",
    "food-beverage", "mode-accessoires", "lifestyle-interior", "weitere-lifestylemarken",
    "unternehmensberater", "weitere", "weitere-planung-design",
})

# Canonical LocalBusiness block (shared across all pages)
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
    "geo": {
        "@type": "GeoCoordinates",
        "latitude": 52.5557,
        "longitude": 13.459,
    },
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


# ─────────────────────────────────────────────────────────────────────────────
# Schema builders
# ─────────────────────────────────────────────────────────────────────────────

def build_leaf_schema(canonical_url, page_name, description, kategorie_slug, branche_slug, service_slug):
    """Build schema for a 3-level deep leaf page."""
    kat = KATEGORIEN[kategorie_slug]
    branche_name = BRANCHEN[branche_slug]
    svc = SERVICES[service_slug]
    # Use keyword-h1 pattern: "Website für {Branche}", "Online Marketing für {Branche}", etc.
    svc_short = svc["name"]
    if service_slug == "online-terminbuchung-kundenportale" and branche_slug in _KUNDENPORTAL_SLUGS:
        svc_short = "Kundenportal"
    if service_slug == "digitale-prozesse-web-anwendungen":
        service_full_name = f"{branche_name} {svc_short}"
    else:
        service_full_name = f"{svc_short} für {branche_name}"
    breadcrumb_label = f"{branche_name} – {svc_short}"

    webpage = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "@id": f"{canonical_url}#webpage",
        "name": page_name,
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
                {"@type": "ListItem", "position": 2, "name": kat["name"], "item": kat["url"]},
                {"@type": "ListItem", "position": 3, "name": breadcrumb_label, "item": canonical_url},
            ],
        },
    }

    service = {
        "@context": "https://schema.org",
        "@type": "Service",
        "@id": f"{canonical_url}#service",
        "name": service_full_name,
        "description": description,
        "url": canonical_url,
        "serviceType": svc_short if service_slug == "online-terminbuchung-kundenportale" else svc["serviceType"],
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
            "audienceType": branche_name,
        },
        "category": f"Webagentur – {kat['name']}",
        "offers": {
            "@type": "Offer",
            "priceCurrency": "EUR",
            "priceRange": "€€–€€€",
            "availability": "https://schema.org/InStock",
            "seller": {
                "@type": "LocalBusiness",
                "@id": f"{BASE_URL}/#organization",
            },
        },
    }

    return [webpage, LOCAL_BUSINESS, service]


def build_hub_schema(canonical_url, page_name, description, service_slug):
    """Build schema for a root hub page (no kategorie/branche)."""
    svc = SERVICES[service_slug]
    if service_slug == "digitale-prozesse-web-anwendungen":
        hub_service_name = "Software entwickeln lassen in Berlin"
    else:
        hub_service_name = f"{svc['name']} für Unternehmen in Berlin"

    webpage = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "@id": f"{canonical_url}#webpage",
        "name": page_name,
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
                {"@type": "ListItem", "position": 2, "name": "Bereiche", "item": f"{BASE_URL}/Bereiche/Bereiche"},
                {"@type": "ListItem", "position": 3, "name": svc["name"], "item": canonical_url},
            ],
        },
    }

    service = {
        "@context": "https://schema.org",
        "@type": "Service",
        "@id": f"{canonical_url}#service",
        "name": hub_service_name,
        "description": description,
        "url": canonical_url,
        "serviceType": svc["serviceType"],
        "provider": {
            "@type": "LocalBusiness",
            "@id": f"{BASE_URL}/#organization",
            "name": "DEVDESIGN",
        },
        "areaServed": [
            {"@type": "City", "name": "Berlin"},
            {"@type": "Country", "name": "Deutschland"},
        ],
        "offers": {
            "@type": "Offer",
            "priceCurrency": "EUR",
            "priceRange": "€€–€€€",
            "availability": "https://schema.org/InStock",
            "seller": {
                "@type": "LocalBusiness",
                "@id": f"{BASE_URL}/#organization",
            },
        },
    }

    return [webpage, LOCAL_BUSINESS, service]


# ─────────────────────────────────────────────────────────────────────────────
# File processing
# ─────────────────────────────────────────────────────────────────────────────

# Matches: <!-- Structured Data for Google --> (optional) + <script type="application/ld+json">...</script>
LD_JSON_PATTERN = re.compile(
    r'([ \t]*<!--[^>]*Structured Data[^>]*-->\s*\n?)?'
    r'[ \t]*<script\s+type=["\']application/ld\+json["\'][^>]*>.*?</script>',
    re.DOTALL | re.IGNORECASE,
)


def extract_meta(html_text, tag, attr="content"):
    """Extract a meta tag value using regex (avoids full parse for speed)."""
    pattern = re.compile(
        rf'<meta\s[^>]*name=["\']description["\'][^>]*content=["\']([^"\']*)["\']'
        rf'|<meta\s[^>]*content=["\']([^"\']*)["\'][^>]*name=["\']description["\']',
        re.IGNORECASE,
    ) if tag == "description" else None

    if tag == "description":
        m = pattern.search(html_text)
        if m:
            return unescape(m.group(1) or m.group(2))
        return ""

    if tag == "title":
        m = re.search(r"<title[^>]*>(.*?)</title>", html_text, re.IGNORECASE | re.DOTALL)
        if m:
            return unescape(m.group(1).strip())
        return ""

    return ""


def extract_canonical(html_text):
    m = re.search(r'<link\s[^>]*rel=["\']canonical["\'][^>]*href=["\']([^"\']+)["\']', html_text, re.IGNORECASE)
    if m:
        return m.group(1).rstrip("/")
    return ""


def process_file(filepath: Path, frontend_root: Path) -> bool:
    """Process a single HTML file. Returns True if modified."""
    html = filepath.read_text(encoding="utf-8")

    # Extract metadata
    description = extract_meta(html, "description")
    title = extract_meta(html, "title")
    canonical_url = extract_canonical(html)

    if not canonical_url:
        print(f"  SKIP (no canonical): {filepath.relative_to(frontend_root)}", file=sys.stderr)
        return False

    # Determine path type from parts relative to leistungsunterpunkte/
    rel = filepath.relative_to(frontend_root / "leistungsunterpunkte")
    parts = rel.parts  # e.g. ("gesundheits-wellness", "praxen-aerzte", "seo-performance-optimierung.html")
    service_slug = filepath.stem

    if service_slug not in SERVICES:
        print(f"  SKIP (unknown service slug '{service_slug}'): {filepath.relative_to(frontend_root)}", file=sys.stderr)
        return False

    if len(parts) == 1:
        # Root hub: leistungsunterpunkte/<service>.html
        schema = build_hub_schema(canonical_url, title, description, service_slug)
    elif len(parts) == 3:
        # Leaf: leistungsunterpunkte/<kategorie>/<branche>/<service>.html
        kategorie_slug = parts[0]
        branche_slug = parts[1]

        if kategorie_slug not in KATEGORIEN:
            print(f"  SKIP (unknown kategorie '{kategorie_slug}'): {filepath.relative_to(frontend_root)}", file=sys.stderr)
            return False
        if branche_slug not in BRANCHEN:
            print(f"  SKIP (unknown branche '{branche_slug}'): {filepath.relative_to(frontend_root)}", file=sys.stderr)
            return False

        schema = build_leaf_schema(canonical_url, title, description, kategorie_slug, branche_slug, service_slug)
    else:
        print(f"  SKIP (unexpected depth {len(parts)}): {filepath.relative_to(frontend_root)}", file=sys.stderr)
        return False

    # Render JSON (2-space indent, ensure_ascii=False to keep German characters)
    json_str = json.dumps(schema, ensure_ascii=False, indent=4)
    new_block = f"    <!-- Structured Data for Google -->\n    <script type=\"application/ld+json\">\n    {json_str}\n    </script>"

    # Replace existing block
    new_html, count = LD_JSON_PATTERN.subn(new_block, html, count=1)

    if count == 0:
        print(f"  WARN (no ld+json found): {filepath.relative_to(frontend_root)}", file=sys.stderr)
        return False

    filepath.write_text(new_html, encoding="utf-8")
    return True


def main():
    frontend_root = Path(__file__).parent.parent
    leistungsunterpunkte_dir = frontend_root / "leistungsunterpunkte"

    if not leistungsunterpunkte_dir.is_dir():
        print(f"ERROR: Directory not found: {leistungsunterpunkte_dir}", file=sys.stderr)
        sys.exit(1)

    # Collect all HTML files, excluding dist/
    html_files = [
        f for f in leistungsunterpunkte_dir.rglob("*.html")
        if "dist" not in f.parts
    ]
    html_files.sort()

    print(f"Processing {len(html_files)} files under leistungsunterpunkte/ ...\n")
    modified = 0
    skipped = 0

    for f in html_files:
        label = f.relative_to(frontend_root)
        if process_file(f, frontend_root):
            print(f"  OK  {label}")
            modified += 1
        else:
            skipped += 1

    print(f"\nDone. Modified: {modified}  Skipped: {skipped}")


if __name__ == "__main__":
    main()
