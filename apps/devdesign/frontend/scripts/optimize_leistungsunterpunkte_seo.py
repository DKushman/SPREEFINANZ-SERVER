#!/usr/bin/env python3
"""
SEO optimization for all leistungsunterpunkte/ HTML pages.

Changes per file:
  1. <title> + og:title  → "{keyword_h1} | DEVDESIGN Berlin"
  2. meta description + og:description  → keyword-optimized ≤155 chars
  3. Hero:  h1.hero-service  →  h1.hero-service-keyword (new keyword)
            + p.hero-service-headline (old h1 text demoted)
  4. H2 content sections: zusammengefasst-h2, standards-heading updated
     SEO slug: also updates #text, prozess, FAQ h2s to "Online Marketing"
  5. JSON-LD: Service.name, Service.serviceType, WebPage.name aligned

Keyword rules (per service slug):
  website-online-praesenz         → Website für {Branche}
  landingpages-leadgenerierung    → Landingpages für {Branche}
  online-terminbuchung-*          → Terminportal für {Branche}  (or Kundenportal)
  digitale-prozesse-*             → {Branche} Software entwickeln lassen
  seo-performance-optimierung     → Online Marketing für {Branche}

Hub pages (root level, no branche) use "… in Berlin".

Run from frontend/ directory:
    python3 scripts/optimize_leistungsunterpunkte_seo.py [--dry-run]
"""

from __future__ import annotations

import json
import re
import sys
from html import escape, unescape
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BASE_URL = "https://devdesignstudio.de"

# ─────────────────────────────────────────────────────────────────────────────
# Taxonomy
# ─────────────────────────────────────────────────────────────────────────────

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

BRANCHEN: dict[str, str] = {
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

# Terminportal (appointment-focused) vs. Kundenportal (self-service/account)
TERMIN_VARIANT: dict[str, str] = {
    "kliniken-zentren":                 "terminportal",
    "praxen-aerzte":                    "terminportal",
    "therapeuten":                      "terminportal",
    "wellness-spa":                     "terminportal",
    "weitere-gesundheitsdienstleister": "terminportal",
    "beauty-kosmetik":                  "terminportal",
    "kanzleien":                        "terminportal",
    "notare":                           "terminportal",
    "steuerberater":                    "terminportal",
    "vermoegensberater":                "terminportal",
    "architekturbueros":                "terminportal",
    "designstudios":                    "terminportal",
    "innenarchitektur":                 "terminportal",
    "ingenieurbueros":                  "terminportal",
    # self-service/account portals
    "software-saas":                    "kundenportal",
    "it-infrastruktur":                 "kundenportal",
    "finanzdienstleister":              "kundenportal",
    "weitere-tech-finanz":              "kundenportal",
    "food-beverage":                    "kundenportal",
    "mode-accessoires":                 "kundenportal",
    "lifestyle-interior":               "kundenportal",
    "weitere-lifestylemarken":          "kundenportal",
    "unternehmensberater":              "kundenportal",
    "weitere":                          "kundenportal",
    "weitere-planung-design":           "kundenportal",
}

VALID_SERVICES = frozenset({
    "website-online-praesenz",
    "landingpages-leadgenerierung",
    "online-terminbuchung-kundenportale",
    "digitale-prozesse-web-anwendungen",
    "seo-performance-optimierung",
})

# ─────────────────────────────────────────────────────────────────────────────
# Content builders
# ─────────────────────────────────────────────────────────────────────────────

def _termin_label(branche_slug: str) -> str:
    variant = TERMIN_VARIANT.get(branche_slug, "terminportal")
    return "Terminportal" if variant == "terminportal" else "Kundenportal"


def get_keyword_h1(service_slug: str, branche: str, branche_slug: str) -> str:
    if service_slug == "website-online-praesenz":
        return f"Website für {branche}"
    if service_slug == "landingpages-leadgenerierung":
        return f"Landingpages für {branche}"
    if service_slug == "online-terminbuchung-kundenportale":
        return f"{_termin_label(branche_slug)} für {branche}"
    if service_slug == "digitale-prozesse-web-anwendungen":
        return f"{branche} Software entwickeln lassen"
    if service_slug == "seo-performance-optimierung":
        return f"Online Marketing für {branche}"
    return branche


def get_service_type(service_slug: str, branche_slug: str) -> str:
    if service_slug == "website-online-praesenz":
        return "Webdesign"
    if service_slug == "landingpages-leadgenerierung":
        return "Landingpages"
    if service_slug == "online-terminbuchung-kundenportale":
        return _termin_label(branche_slug)
    if service_slug == "digitale-prozesse-web-anwendungen":
        return "Softwareentwicklung"
    if service_slug == "seo-performance-optimierung":
        return "Online Marketing"
    return "Webdesign"


def get_meta_description(service_slug: str, branche: str, branche_slug: str) -> str:
    if service_slug == "website-online-praesenz":
        return (
            f"Website für {branche} von DEVDESIGN Berlin – klar strukturiert, "
            f"schnell und auf Anfragen optimiert. Jetzt Erstgespräch anfragen."
        )
    if service_slug == "landingpages-leadgenerierung":
        return (
            f"Landingpages für {branche} – klares Nutzenversprechen, "
            f"Conversion-Fokus und messbares Tracking. DEVDESIGN Berlin."
        )
    if service_slug == "online-terminbuchung-kundenportale":
        label = _termin_label(branche_slug)
        return (
            f"{label} für {branche} – digitale Self-Service-Lösung, "
            f"sauber integriert und einfach zu nutzen. DEVDESIGN Berlin."
        )
    if service_slug == "digitale-prozesse-web-anwendungen":
        return (
            f"{branche} Software entwickeln lassen – individuelle Webanwendungen "
            f"und automatisierte Abläufe. DEVDESIGN Berlin."
        )
    if service_slug == "seo-performance-optimierung":
        return (
            f"Online Marketing für {branche} – technisches SEO, Performance "
            f"und Informationsarchitektur für stabile Sichtbarkeit. DEVDESIGN Berlin."
        )
    return f"Professionelle digitale Lösungen für {branche} von DEVDESIGN Berlin."


def get_h2_templates(service_slug: str, branche: str, branche_slug: str) -> dict[str, str]:
    """Return a map of {key: new_h2_text} for content-section h2 replacements."""
    if service_slug == "website-online-praesenz":
        return {
            "zusammengefasst": f"Was eine professionelle Website für {branche} leistet",
            "standards": f"Standards für Websites von {branche}",
        }
    if service_slug == "landingpages-leadgenerierung":
        return {
            "zusammengefasst": f"Was starke Landingpages für {branche} ausmacht",
            "standards": f"Standards für Landingpages von {branche}",
        }
    if service_slug == "online-terminbuchung-kundenportale":
        label = _termin_label(branche_slug)
        return {
            "zusammengefasst": f"Was ein {label} für {branche} leisten kann",
            "standards": f"{label}-Lösungen für {branche}, die wirklich genutzt werden",
        }
    if service_slug == "digitale-prozesse-web-anwendungen":
        return {
            "zusammengefasst": f"Was individuelle Software für {branche} leisten kann",
            "standards": f"Software-Entwicklung für {branche} – unsere Standards",
        }
    if service_slug == "seo-performance-optimierung":
        return {
            "text_intro": "Online Marketing auf einer sauberen technischen Basis",
            "zusammengefasst": f"Was Online Marketing für {branche} erreichen kann",
            "standards": f"Online Marketing für {branche} – unsere Standards",
            "prozess": "So gehen wir bei Online Marketing vor",
            "faq": "Häufige Fragen zu Online Marketing",
        }
    return {}


# ─────────────────────────────────────────────────────────────────────────────
# Schema builders
# ─────────────────────────────────────────────────────────────────────────────

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


def _build_service_block(canonical_url, keyword_h1, meta_desc, service_type, kat_name, branche_name, branche_slug):
    return {
        "@context": "https://schema.org",
        "@type": "Service",
        "@id": f"{canonical_url}#service",
        "name": keyword_h1,
        "description": meta_desc,
        "url": canonical_url,
        "serviceType": service_type,
        "provider": {
            "@type": "LocalBusiness",
            "@id": f"{BASE_URL}/#organization",
            "name": "DEVDESIGN",
        },
        "areaServed": [
            {"@type": "City", "name": "Berlin"},
            {"@type": "Country", "name": "Deutschland"},
        ],
        **({"audience": {"@type": "Audience", "audienceType": branche_name}} if branche_name else {}),
        **({"category": f"Webagentur – {kat_name}"} if kat_name else {}),
        "offers": {
            "@type": "Offer",
            "priceCurrency": "EUR",
            "priceRange": "€€–€€€",
            "availability": "https://schema.org/InStock",
            "seller": {"@type": "LocalBusiness", "@id": f"{BASE_URL}/#organization"},
        },
    }


def build_leaf_schema(canonical_url, keyword_h1, meta_desc, page_title,
                       kategorie_slug, branche_slug, service_slug):
    kat = KATEGORIEN[kategorie_slug]
    branche_name = BRANCHEN[branche_slug]
    service_type = get_service_type(service_slug, branche_slug)
    breadcrumb_short = {
        "website-online-praesenz": "Website",
        "landingpages-leadgenerierung": "Landingpages",
        "online-terminbuchung-kundenportale": _termin_label(branche_slug),
        "digitale-prozesse-web-anwendungen": "Software",
        "seo-performance-optimierung": "Online Marketing",
    }.get(service_slug, keyword_h1.split(" für ")[0] if " für " in keyword_h1 else keyword_h1)
    breadcrumb_label = f"{branche_name} – {breadcrumb_short}"

    webpage = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "@id": f"{canonical_url}#webpage",
        "name": page_title,
        "description": meta_desc,
        "url": canonical_url,
        "dateModified": "2026-06-01",
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
    service = _build_service_block(
        canonical_url, keyword_h1, meta_desc, service_type,
        kat["name"], branche_name, branche_slug
    )
    return [webpage, LOCAL_BUSINESS, service]


def build_hub_schema(canonical_url, keyword_h1, meta_desc, page_title, service_slug):
    service_type = get_service_type(service_slug, "")

    webpage = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "@id": f"{canonical_url}#webpage",
        "name": page_title,
        "description": meta_desc,
        "url": canonical_url,
        "dateModified": "2026-06-01",
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
                {"@type": "ListItem", "position": 3, "name": keyword_h1, "item": canonical_url},
            ],
        },
    }
    service = _build_service_block(
        canonical_url, keyword_h1, meta_desc, service_type,
        "", "", ""
    )
    return [webpage, LOCAL_BUSINESS, service]


# ─────────────────────────────────────────────────────────────────────────────
# Regex patterns
# ─────────────────────────────────────────────────────────────────────────────

LD_JSON_PATTERN = re.compile(
    r'([ \t]*<!--[^>]*Structured Data[^>]*-->\s*\n?)?'
    r'[ \t]*<script\s+type=["\']application/ld\+json["\'][^>]*>.*?</script>',
    re.DOTALL | re.IGNORECASE,
)

TITLE_PAT = re.compile(r'(<title[^>]*>)(.*?)(</title>)', re.IGNORECASE | re.DOTALL)

OG_TITLE_PAT = re.compile(
    r'(<meta\s[^>]*property=["\']og:title["\'][^>]*content=["\'])([^"\']*?)(["\'])',
    re.IGNORECASE,
)
OG_TITLE_PAT2 = re.compile(
    r'(<meta\s[^>]*content=["\'])([^"\']*?)(["\'][^>]*property=["\']og:title["\'])',
    re.IGNORECASE,
)

META_DESC_PAT = re.compile(
    r'(<meta\s[^>]*name=["\']description["\'][^>]*content=["\'])([^"\']*?)(["\'])',
    re.IGNORECASE,
)
META_DESC_PAT2 = re.compile(
    r'(<meta\s[^>]*content=["\'])([^"\']*?)(["\'][^>]*name=["\']description["\'])',
    re.IGNORECASE,
)

OG_DESC_PAT = re.compile(
    r'(<meta\s[^>]*property=["\']og:description["\'][^>]*content=["\'])([^"\']*?)(["\'])',
    re.IGNORECASE,
)
OG_DESC_PAT2 = re.compile(
    r'(<meta\s[^>]*content=["\'])([^"\']*?)(["\'][^>]*property=["\']og:description["\'])',
    re.IGNORECASE,
)

# Old hero h1 (not yet converted)
HERO_H1_PAT = re.compile(
    r'(<div class="hero-service-content-item">\s*)'
    r'<h1 class="hero-service">(.*?)</h1>',
    re.DOTALL,
)
# Already converted hero (idempotent update)
HERO_KEYWORD_PAT = re.compile(
    r'<h1 class="hero-service-keyword">.*?</h1>',
    re.DOTALL,
)
HERO_KEYWORD_EXISTS = re.compile(r'h1 class="hero-service-keyword"')

H2_ZUSAMMENGEFASST = re.compile(r'(<h2 class="zusammengefasst-h2">)(.*?)(</h2>)', re.DOTALL)
H2_STANDARDS = re.compile(r'(<h2 id="standards-heading" class="standards-title">)(.*?)(</h2>)', re.DOTALL)
H2_TEXT_INTRO = re.compile(
    r'(<section id="text"[^>]*>[\s\S]*?<h2 class="text">)(.*?)(</h2>)',
    re.DOTALL,
)
H2_PROZESS = re.compile(r'(<h2 id="prozess-heading" class="prozess-title">)(.*?)(</h2>)', re.DOTALL)
H2_FAQ = re.compile(r'(<h2 class="h2">)(Häufige Fragen[^<]*)(</h2>)', re.DOTALL)


# ─────────────────────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────────────────────

def extract_canonical(html: str) -> str:
    m = re.search(r'<link\s[^>]*rel=["\']canonical["\'][^>]*href=["\']([^"\']+)["\']', html, re.IGNORECASE)
    return m.group(1).rstrip("/") if m else ""


def _replace_attr(pattern, pattern2, html: str, value: str) -> str:
    """Replace meta attribute content, trying primary pattern first, then fallback."""
    if pattern.search(html):
        return pattern.sub(lambda m: m.group(1) + value + m.group(3), html, count=1)
    if pattern2 and pattern2.search(html):
        return pattern2.sub(lambda m: m.group(1) + value + m.group(3), html, count=1)
    return html


# ─────────────────────────────────────────────────────────────────────────────
# Main file processor
# ─────────────────────────────────────────────────────────────────────────────

def process_file(filepath: Path, dry_run: bool = False) -> tuple[bool, list[str]]:
    """Process a single HTML file. Returns (modified, warnings)."""
    warnings: list[str] = []
    html = filepath.read_text(encoding="utf-8")

    canonical_url = extract_canonical(html)
    if not canonical_url:
        return False, ["SKIP: no canonical tag"]

    rel = filepath.relative_to(ROOT / "leistungsunterpunkte")
    parts = rel.parts
    service_slug = filepath.stem

    if service_slug not in VALID_SERVICES:
        return False, [f"SKIP: unknown service slug '{service_slug}'"]

    is_hub = len(parts) == 1
    is_leaf = len(parts) == 3

    if not (is_hub or is_leaf):
        return False, [f"SKIP: unexpected path depth ({len(parts)})"]

    if is_leaf:
        kategorie_slug, branche_slug = parts[0], parts[1]
        if kategorie_slug not in KATEGORIEN:
            return False, [f"SKIP: unknown kategorie '{kategorie_slug}'"]
        if branche_slug not in BRANCHEN:
            return False, [f"SKIP: unknown branche '{branche_slug}'"]
        branche = BRANCHEN[branche_slug]
        keyword_h1 = get_keyword_h1(service_slug, branche, branche_slug)
        meta_desc = get_meta_description(service_slug, branche, branche_slug)
    else:
        # Hub page
        kategorie_slug = branche_slug = ""
        branche = "Unternehmen in Berlin"
        keyword_h1 = get_keyword_h1(service_slug, branche, branche_slug)
        if service_slug == "digitale-prozesse-web-anwendungen":
            keyword_h1 = "Software entwickeln lassen in Berlin"
        meta_desc = get_meta_description(service_slug, branche, branche_slug)

    page_title = f"{keyword_h1} | DEVDESIGN Berlin"
    title_len = len(page_title)
    if title_len > 65:
        warnings.append(f"WARN: title length {title_len} chars: {page_title}")

    kw_esc = escape(keyword_h1)
    title_esc = escape(page_title)
    desc_esc = escape(meta_desc)

    new_html = html

    # ── 1. <title> ────────────────────────────────────────────────────────────
    new_html = TITLE_PAT.sub(lambda m: m.group(1) + title_esc + m.group(3), new_html, count=1)

    # ── 2. og:title ───────────────────────────────────────────────────────────
    new_html = _replace_attr(OG_TITLE_PAT, OG_TITLE_PAT2, new_html, title_esc)

    # ── 3. meta description ───────────────────────────────────────────────────
    new_html = _replace_attr(META_DESC_PAT, META_DESC_PAT2, new_html, desc_esc)

    # ── 4. og:description ─────────────────────────────────────────────────────
    new_html = _replace_attr(OG_DESC_PAT, OG_DESC_PAT2, new_html, desc_esc)

    # ── 5. Hero H1 ────────────────────────────────────────────────────────────
    if HERO_KEYWORD_EXISTS.search(new_html):
        # Already converted: update keyword text only
        new_html = HERO_KEYWORD_PAT.sub(
            f'<h1 class="hero-service-keyword">{kw_esc}</h1>',
            new_html, count=1,
        )
    else:
        # First conversion: demote h1.hero-service → p.hero-service-headline, add keyword h1
        if HERO_H1_PAT.search(new_html):
            def rewrite_hero(m: re.Match) -> str:
                prefix = m.group(1)
                old_h1_content = m.group(2)
                indent_m = re.search(r'\n(\s+)$', prefix)
                indent = indent_m.group(1) if indent_m else "                        "
                return (
                    f"{prefix}"
                    f'<h1 class="hero-service-keyword">{kw_esc}</h1>\n'
                    f"{indent}"
                    f'<p class="hero-service-headline">{old_h1_content}</p>'
                )
            new_html = HERO_H1_PAT.sub(rewrite_hero, new_html, count=1)
        else:
            warnings.append("WARN: hero h1 not found")

    # ── 6. H2 content sections ────────────────────────────────────────────────
    h2_tpl = get_h2_templates(service_slug, branche, branche_slug)

    if "zusammengefasst" in h2_tpl:
        val = escape(h2_tpl["zusammengefasst"])
        new_html = H2_ZUSAMMENGEFASST.sub(lambda m: m.group(1) + val + m.group(3), new_html, count=1)

    if "standards" in h2_tpl:
        val = escape(h2_tpl["standards"])
        new_html = H2_STANDARDS.sub(lambda m: m.group(1) + val + m.group(3), new_html, count=1)

    if "text_intro" in h2_tpl:
        val = escape(h2_tpl["text_intro"])
        new_html = H2_TEXT_INTRO.sub(lambda m: m.group(1) + val + m.group(3), new_html, count=1)

    if "prozess" in h2_tpl:
        val = escape(h2_tpl["prozess"])
        new_html = H2_PROZESS.sub(lambda m: m.group(1) + val + m.group(3), new_html, count=1)

    if "faq" in h2_tpl:
        val = escape(h2_tpl["faq"])
        new_html = H2_FAQ.sub(lambda m: m.group(1) + val + m.group(3), new_html, count=1)

    # ── 7. JSON-LD Schema ─────────────────────────────────────────────────────
    if is_leaf:
        schema = build_leaf_schema(
            canonical_url, keyword_h1, meta_desc, page_title,
            kategorie_slug, branche_slug, service_slug,
        )
    else:
        schema = build_hub_schema(canonical_url, keyword_h1, meta_desc, page_title, service_slug)

    json_str = json.dumps(schema, ensure_ascii=False, indent=4)
    new_block = (
        '    <!-- Structured Data for Google -->\n'
        '    <script type="application/ld+json">\n'
        f'    {json_str}\n'
        '    </script>'
    )
    new_html, n = LD_JSON_PATTERN.subn(new_block, new_html, count=1)
    if n == 0:
        warnings.append("WARN: ld+json block not found/replaced")

    if new_html == html:
        return False, warnings

    if not dry_run:
        filepath.write_text(new_html, encoding="utf-8")

    return True, warnings


# ─────────────────────────────────────────────────────────────────────────────
# Entry point
# ─────────────────────────────────────────────────────────────────────────────

def main() -> None:
    dry_run = "--dry-run" in sys.argv
    if dry_run:
        print("DRY RUN – no files will be written\n")

    html_files = sorted(
        f for f in (ROOT / "leistungsunterpunkte").rglob("*.html")
        if "dist" not in f.parts and "node_modules" not in f.parts
    )

    print(f"Processing {len(html_files)} files …\n")
    modified = skipped = 0
    all_warnings: list[str] = []

    for filepath in html_files:
        label = str(filepath.relative_to(ROOT))
        changed, warns = process_file(filepath, dry_run=dry_run)
        if changed:
            print(f"  OK  {label}")
            modified += 1
        else:
            reason = warns[0] if warns else "unchanged"
            if not reason.startswith("WARN"):
                print(f"  --  {label}  ({reason})", file=sys.stderr)
            skipped += 1
        for w in warns:
            if w.startswith("WARN"):
                all_warnings.append(f"{label}: {w}")

    print(f"\nDone. Modified: {modified}  Skipped/unchanged: {skipped}")
    if all_warnings:
        print(f"\n{len(all_warnings)} warnings:")
        for w in all_warnings:
            print(f"  {w}")


if __name__ == "__main__":
    main()
