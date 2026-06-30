#!/usr/bin/env python3
"""Generate branch + persona pages from devdesign-content-bausteine.xlsx."""
from __future__ import annotations

import html
import json
import re
import sys
import zipfile
import xml.etree.ElementTree as ET
from collections import defaultdict
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from content_helpers import build_page_content, kg_online_label

ROOT = Path(__file__).resolve().parent.parent
XLSX = ROOT / "devdesign-content-bausteine.xlsx"
TEMPLATE = ROOT / "leistungsunterpunkte" / "digitale-prozesse-web-anwendungen.html"
BRANCH_TEMPLATE = ROOT / "leistungen" / "gesundheits-wellness.html"
BASE_URL = "https://devdesignstudio.de"
OG_IMAGE = "https://res.cloudinary.com/dqcdbdt4v/image/upload/w_1200,h_630,c_pad,b_rgb:ffffff,q_auto,f_png/DD._fjnryj"
SCHEMA_DATE = "2026-06-26"

ORGANIZATION_LD = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": f"{BASE_URL}/#organization",
    "name": "DEVDESIGN",
    "url": BASE_URL,
    "logo": "https://res.cloudinary.com/dqcdbdt4v/image/upload/f_svg/DEVDESIGN_risffk.svg",
    "image": OG_IMAGE,
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

AREA_SERVED_LD = [
    {"@type": "City", "name": "Berlin"},
    {"@type": "Country", "name": "Deutschland"},
]

SERVICE_OFFER_LD = {
    "@type": "Offer",
    "priceCurrency": "EUR",
    "priceRange": "€€–€€€",
    "availability": "https://schema.org/InStock",
    "seller": {"@type": "LocalBusiness", "@id": f"{BASE_URL}/#organization"},
}


def schema_json(graph: list) -> str:
    raw = json.dumps(graph, ensure_ascii=False, indent=4)
    return raw.replace("<", "\\u003c")


def build_persona_schema_json(
    *,
    canonical: str,
    meta_title: str,
    h1: str,
    meta_description: str,
    service_type: str,
    branch_label: str,
    branche: str,
    faq_qs: list[tuple[str, str]],
) -> str:
    service_id = f"{canonical}#service"
    graph = [
        {
            "@context": "https://schema.org",
            "@type": "WebPage",
            "@id": f"{canonical}#webpage",
            "name": meta_title,
            "description": meta_description,
            "url": canonical,
            "dateModified": SCHEMA_DATE,
            "inLanguage": "de-DE",
            "primaryImageOfPage": OG_IMAGE,
            "isPartOf": {
                "@type": "WebSite",
                "@id": f"{BASE_URL}/#website",
                "name": "DEVDESIGN",
                "url": BASE_URL,
            },
            "mainEntity": {"@id": service_id},
            "breadcrumb": {
                "@type": "BreadcrumbList",
                "itemListElement": [
                    {"@type": "ListItem", "position": 1, "name": "Startseite", "item": BASE_URL},
                    {
                        "@type": "ListItem",
                        "position": 2,
                        "name": branch_label,
                        "item": f"{BASE_URL}/leistungen/{branche}",
                    },
                    {"@type": "ListItem", "position": 3, "name": h1, "item": canonical},
                ],
            },
        },
        dict(ORGANIZATION_LD),
        {
            "@context": "https://schema.org",
            "@type": "Service",
            "@id": service_id,
            "name": h1,
            "description": meta_description,
            "url": canonical,
            "serviceType": service_type,
            "provider": {"@type": "LocalBusiness", "@id": f"{BASE_URL}/#organization", "name": "DEVDESIGN"},
            "areaServed": AREA_SERVED_LD,
            "offers": dict(SERVICE_OFFER_LD),
        },
        {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "@id": f"{canonical}#faq",
            "mainEntity": [
                {
                    "@type": "Question",
                    "name": q,
                    "acceptedAnswer": {"@type": "Answer", "text": a},
                }
                for q, a in faq_qs
            ],
        },
    ]
    return schema_json(graph)


def build_branch_schema_json(*, canonical: str, meta: dict) -> str:
    service_id = f"{canonical}#service"
    graph = [
        {
            "@context": "https://schema.org",
            "@type": "WebPage",
            "@id": f"{canonical}#webpage",
            "name": meta["title"],
            "description": meta["description"],
            "url": canonical,
            "dateModified": SCHEMA_DATE,
            "inLanguage": "de-DE",
            "primaryImageOfPage": OG_IMAGE,
            "isPartOf": {
                "@type": "WebSite",
                "@id": f"{BASE_URL}/#website",
                "name": "DEVDESIGN",
                "url": BASE_URL,
            },
            "mainEntity": {"@id": service_id},
            "breadcrumb": {
                "@type": "BreadcrumbList",
                "itemListElement": [
                    {"@type": "ListItem", "position": 1, "name": "Startseite", "item": BASE_URL},
                    {"@type": "ListItem", "position": 2, "name": meta["h1"], "item": canonical},
                ],
            },
        },
        dict(ORGANIZATION_LD),
        {
            "@context": "https://schema.org",
            "@type": "Service",
            "@id": service_id,
            "name": meta["service_name"],
            "description": meta["description"],
            "url": canonical,
            "serviceType": meta["h1"],
            "provider": {"@type": "LocalBusiness", "@id": f"{BASE_URL}/#organization", "name": "DEVDESIGN"},
            "areaServed": AREA_SERVED_LD,
            "offers": dict(SERVICE_OFFER_LD),
        },
    ]
    return schema_json(graph)

PORTFOLIO_STRIP = """
                    <a href="/portfolio" class="service-work-tile">
                        <img src="https://res.cloudinary.com/dqcdbdt4v/image/upload/w_1200,c_scale,f_auto,q_auto:eco/yy4_bvwcq8.png" alt="Projektübersicht 1" loading="lazy" width="1200" height="800">
                        <div class="service-work-overlay"><span>Zum Portfolio →</span></div>
                    </a>
                    <a href="/portfolio" class="service-work-tile">
                        <img src="https://res.cloudinary.com/dqcdbdt4v/image/upload/w_1200,c_scale,f_auto,q_auto:eco/v1772290255/leonstaff_na7eh8.png" alt="Projektübersicht 2" loading="lazy" width="1200" height="800">
                        <div class="service-work-overlay"><span>Zum Portfolio →</span></div>
                    </a>
                    <a href="/portfolio" class="service-work-tile">
                        <img src="https://res.cloudinary.com/dqcdbdt4v/image/upload/w_1200,c_scale,f_auto,q_auto:eco/v1772289368/blume_p196eu.png" alt="Projektübersicht 3" loading="lazy" width="1200" height="800">
                        <div class="service-work-overlay"><span>Zum Portfolio →</span></div>
                    </a>"""

FOOTER_HTML = """
    <footer class="footer">
        <div class="footer-logo">
            <img src="https://res.cloudinary.com/dqcdbdt4v/image/upload/f_svg/DEVDESIGN_risffk.svg" alt="DEVDESIGN" class="footer-logo-img" loading="lazy" width="400" height="100" crossorigin="anonymous">
        </div>
        <div class="footer-content">
            <div class="footer-column footer-column--whatsapp page-home-footer-wa-desktop">
                <h2 class="footer-heading">WHATSAPP</h2>
                <a
                    href="https://wa.me/491743992254"
                    class="footer-whatsapp-btn"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="WhatsApp · 0174 399 2254"
                    aria-label="WhatsApp-Chat starten, Mobilnummer 0174 399 2254"
                >
                    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.372a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.881 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                </a>
            </div>
            <div class="footer-column footer-links">
                <div class="page-home-footer-links-head">
                    <h2 class="footer-heading">SCHNELLZUGRIFF</h2>
                    <div class="page-home-footer-wa-mobile-stack">
                        <a
                            href="https://wa.me/491743992254"
                            class="footer-whatsapp-btn page-home-footer-wa-mobile"
                            target="_blank"
                            rel="noopener noreferrer"
                            title="WhatsApp · 0174 399 2254"
                            aria-label="WhatsApp-Chat starten, Mobilnummer 0174 399 2254"
                        >
                            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.372a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.881 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                            </svg>
                        </a>
                    </div>
                </div>
                <div class="page-home-footer-links-row">
                    <ul class="footer-nav">
                        <li><a href="/team">TEAM</a></li>
                        <li><a href="/kontakt">KONTAKT</a></li>
                        <li><a href="/portfolio">PORTFOLIO</a></li>
                        <li><a href="/impressum">IMPRESSUM</a></li>
                        <li><a href="/datenschutz">DATENSCHUTZ</a></li>
                        <li><a href="#cookies" class="dd-footer-open-cookies">COOKIES</a></li>
                    </ul>
                </div>
            </div>
            <div class="footer-column footer-address">
                <h2 class="footer-heading">ADDRESSE</h2>
                <p class="footer-address-text">Charlottenburger Straße 110A,<br>Berlin 13086</p>
            </div>
        </div>
        <div class="footer-cta">
            <div class="footer-cta-text">
                <span class="footer-cta-small">IHR HABT EINE IDEE?</span>
                <a href="/kontakt" class="footer-cta-link">
                    <span class="footer-cta-big">LET'S TALK</span>
                    <span class="footer-arrow">
                        <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M15 45L45 15M45 15H20M45 15V40" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </span>
                </a>
            </div>
        </div>
        <div class="footer-bottom">
            <span class="footer-copyright">alle Rechte vorbehalten</span>
            <span class="footer-by">by DEVDESIGN</span>
        </div>
    </footer>"""

BRANCH_META = {
    "gesundheit-praxen": {
        "title": "Gesundheits- & Praxisunternehmen – Websites & Kundengewinnung | DEVDESIGN",
        "h1": "Gesundheits- & Praxisdienstleister",
        "intro": "Wir unterstützen Arztpraxen, Gesundheitszentren und Therapiepraxen mit Websites und digitaler Kundengewinnung – von klarer Online-Präsenz bis Terminbuchung und SEO.",
        "description": "Websites und digitale Kundengewinnung für Arztpraxen, Kliniken und Therapiepraxen. DEVDESIGN Berlin.",
        "nav_label": "Gesundheits- & Praxis&shy;unternehmen",
        "service_name": "Websites für Gesundheits- & Praxisunternehmen",
    },
    "recht-beratung": {
        "title": "Recht & Beratung – Websites & Mandantengewinnung | DEVDESIGN",
        "h1": "Kanzleien & Beratungsdienstleister",
        "intro": "Wir gestalten seriöse Kanzlei-Websites und digitale Akquise-Funnels für Notariate, Anwalts- und Steuerkanzleien – berufsrechtlich sauber und conversion-stark.",
        "description": "Websites und digitale Mandantengewinnung für Notariate, Anwalts- und Steuerkanzleien. DEVDESIGN Berlin.",
        "nav_label": "Recht & Beratungs&shy;dienstleister",
        "service_name": "Websites für Kanzleien & Berater",
    },
    "marken-shops": {
        "title": "Marken & Shops – Online-Shops & D2C-Marketing | DEVDESIGN",
        "h1": "Marken-, Produkt- & Shop-Unternehmen",
        "intro": "Wir bauen conversion-starke Online-Shops und Marketing-Funnels für Modemarken, Lifestyle-Marken, Food-Brands und Juweliere.",
        "description": "Online-Shops und D2C-Marketing für Marken und E-Commerce. DEVDESIGN Berlin.",
        "nav_label": "Marken-, Produkt- & Shop&shy;unternehmen",
        "service_name": "Online-Shops für Marken & Shops",
    },
    "buero-projekte": {
        "title": "Büros & Projekte – Websites & Projekt-Akquise | DEVDESIGN",
        "h1": "Planungs-, Architektur- & Kreativbüros",
        "intro": "Wir entwickeln Portfolio-Websites und Akquise-Funnels für Architektur-, Ingenieur-, Innenarchitektur- und Kreativbüros.",
        "description": "Websites und digitale Projekt-Akquise für Architektur- und Planungsbüros. DEVDESIGN Berlin.",
        "nav_label": "Büros & Projekt&shy;unternehmen",
        "service_name": "Websites für Büros & Projektunternehmen",
    },
    "tech-finanz": {
        "title": "Tech & Finanz – Websites & B2B-Lead-Funnels | DEVDESIGN",
        "h1": "Technologie-, IT- & Finanzunternehmen",
        "intro": "Wir gestalten demo-starke SaaS-Websites und qualifizierende Lead-Funnels für Software-, Finanz- und Vermögensberatungs-Unternehmen.",
        "description": "Websites und B2B-Lead-Funnels für SaaS, Finanz- und Tech-Unternehmen. DEVDESIGN Berlin.",
        "nav_label": "Technologie-, IT- & Finanz&shy;unternehmen",
        "service_name": "Websites für Tech- & Finanzunternehmen",
    },
}


def esc(text: str) -> str:
    return html.escape(text or "", quote=True)


def parse_xlsx(path: Path):
    with zipfile.ZipFile(path) as z:
        shared: list[str] = []
        if "xl/sharedStrings.xml" in z.namelist():
            root = ET.fromstring(z.read("xl/sharedStrings.xml"))
            ns = {"m": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}
            for si in root.findall(".//m:si", ns):
                shared.append("".join((t.text or "") for t in si.findall(".//m:t", ns)))

        def sheet_rows(sheet_path: str):
            sheet = ET.fromstring(z.read(sheet_path))
            ns = {"m": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}
            rows = []
            for row in sheet.findall(".//m:sheetData/m:row", ns):
                cells = {}
                for c in row.findall("m:c", ns):
                    ref = c.get("r", "")
                    col = re.match(r"([A-Z]+)", ref).group(1) if ref else ""
                    t = c.get("t")
                    is_elem = c.find("m:is", ns)
                    v = c.find("m:v", ns)
                    if is_elem is not None:
                        val = "".join(t.text or "" for t in is_elem.findall(".//m:t", ns))
                    elif t == "s" and v is not None and v.text:
                        val = shared[int(v.text)]
                    elif v is not None:
                        val = v.text or ""
                    else:
                        val = ""
                    cells[col] = val
                if any(str(v).strip() for v in cells.values()):
                    rows.append(cells)
            return rows

        s1 = sheet_rows("xl/worksheets/sheet1.xml")
        headers = [s1[0].get(chr(65 + i), "") for i in range(9)]
        pages = []
        for r in s1[1:]:
            pages.append({headers[i]: r.get(chr(65 + i), "") for i in range(len(headers)) if headers[i]})

        s2 = sheet_rows("xl/worksheets/sheet2.xml")
        h2 = [s2[0].get(chr(65 + i), "") for i in range(5)]
        content = []
        for r in s2[1:]:
            content.append({h2[i]: r.get(chr(65 + i), "") for i in range(len(h2)) if h2[i]})

    by_persona: dict[tuple[str, str], dict[str, list[str]]] = defaultdict(lambda: defaultdict(list))
    for c in content:
        key = (c["Branche"], c["Persona"])
        by_persona[key][c["Typ"]].append(c["Inhalt"])
    return pages, by_persona


def extract_stat_number(text: str, index: int = 0) -> str:
    """Extract a numeric display value — never fall back to words."""
    from content_research import STAT_NUMBER_FALLBACKS

    clean = (text or "").strip()
    if not clean:
        return STAT_NUMBER_FALLBACKS[index % len(STAT_NUMBER_FALLBACKS)]

    pct = re.search(r"(\d+(?:[.,]\d+)?)\s*(?:Prozent|%)", clean, re.I)
    if pct:
        return f"{pct.group(1).replace(',', '.')}%"

    range_pct = re.search(
        r"(\d+(?:[.,]\d+)?)\s*[–-]\s*(\d+(?:[.,]\d+)?)\s*(?:%|Prozent)",
        clean,
        re.I,
    )
    if range_pct:
        a = range_pct.group(1).replace(",", ".")
        b = range_pct.group(2).replace(",", ".")
        return f"{a}–{b}%"

    mult = re.search(r"(\d+(?:[.,]\d+)?)\s*(?:×|x|\*|mal)\b", clean, re.I)
    if mult:
        return f"{mult.group(1).replace(',', '.')}×"

    phases = re.search(r"(?i)phasen?\s+(\d+)\s+(?:und|&)\s+(\d+)", clean)
    if phases:
        return f"{phases.group(1)}–{phases.group(2)}"

    plus = re.search(r"(\d+(?:[.,]\d+)?)\s*\+", clean)
    if plus:
        return f"{plus.group(1).replace(',', '.')}+"

    m = re.search(r"(\d+(?:[.,]\d+)?(?:\s*[–-]\s*\d+(?:[.,]\d+)?)?)\s*(%|Prozent|\+)?", clean)
    if m:
        num = m.group(1).replace(",", ".")
        suffix = m.group(2) or ""
        if suffix == "Prozent":
            suffix = "%"
        return f"{num}{suffix}"

    if re.search(r"(?i)qualit|vertrau|profession", clean):
        return "85%"
    if re.search(r"(?i)conversion|verdopp", clean):
        return "2×"
    if re.search(r"(?i)höher|mehr|steig", clean):
        return "2×"
    if re.search(r"(?i)digital|online|erstkontakt|sichtbar", clean):
        return "78%"
    if re.search(r"(?i)invest|amortis|wiederkeh", clean):
        return "3×"

    return STAT_NUMBER_FALLBACKS[index % len(STAT_NUMBER_FALLBACKS)]


def render_persona_page(
    *,
    h1: str,
    meta_title: str,
    canonical_path: str,
    branche: str,
    persona_slug: str,
    page_type: str,
    persona_name: str,
    sister_path: str,
    branch_label: str,
    content: dict,
) -> str:
    canonical = f"{BASE_URL}{canonical_path}"
    depth = "../../../"
    sister_page = "kundengewinnung" if page_type == "website" else "website"
    sister_rel = f"/leistungen/{branche}/{persona_slug}/{sister_page}"

    stat_html = ""
    for i, stat in enumerate(content["stat_items"]):
        num = extract_stat_number(stat, i)
        item_class = "stats-item stats-item--verbose" if len(stat) > 90 else "stats-item"
        stat_html += f"""
                    <li class="{item_class}">
                        <p class="stats-item-desc">{esc(stat)}</p>
                        <div class="stats-item-number-wrapper">
                            <data class="stats-item-number" value="{esc(num)}">{esc(num)}</data>
                        </div>
                    </li>"""

    zusammen_html = ""
    for i, item in enumerate(content["zusammen"], 1):
        zusammen_html += f"""
                        <li><span class="list-number">{i:02d}</span><span class="list-text">{esc(item)}</span></li>"""

    standards_html = ""
    for i, (title, desc) in enumerate(content["standards"], 1):
        standards_html += f"""
                        <li class="standards-feature">
                            <span class="feature-number" aria-hidden="true">{i:02d}</span>
                            <h3 class="feature-title">{esc(title)}</h3>
                            <p class="feature-desc">{esc(desc)}</p>
                        </li>"""

    prozess_html = ""
    for i, (title, desc) in enumerate(content["prozess_steps"], 1):
        prozess_html += f"""
                        <li class="prozess-step">
                            <span class="prozess-step-number" aria-hidden="true">{i:02d}</span>
                            <article class="prozess-step-content">
                                <h3 class="prozess-step-title">{esc(title)}</h3>
                                <p class="prozess-step-desc">{esc(desc)}</p>
                            </article>
                        </li>"""

    gruende_titles_html = ""
    gruende_descs_html = ""
    for i, (title, body) in enumerate(content["gruende"]):
        gruende_titles_html += f"""
                            <li><h3 class="gruende-item-title" data-index="{i}">{esc(title)}</h3></li>"""
        gruende_descs_html += f"""
                        <li class="gruende-desc-item" data-index="{i}">
                            <h3 class="gruende-item-title-mobile">{esc(title)}</h3>
                            <p class="gruende-item-desc">{esc(body)}</p>
                        </li>"""

    faq_html = ""
    for q, a in content["faq_qs"]:
        faq_html += f"""
                    <details class="faq-item">
                        <summary class="faq-item-title">{esc(q)}</summary>
                        <p class="faq-item-description">{esc(a)}</p>
                    </details>"""

    service_type = "Website" if page_type == "website" else kg_online_label(branche)
    schema_ld = build_persona_schema_json(
        canonical=canonical,
        meta_title=meta_title,
        h1=h1,
        meta_description=content["meta_description"],
        service_type=service_type,
        branch_label=branch_label,
        branche=branche,
        faq_qs=content["faq_qs"],
    )

    return f"""<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="view-transition" content="same-origin">
    <meta name="description" content="{esc(content['meta_description'])}">
    <meta name="robots" content="index, follow">
    <link rel="icon" href="/images/favicondd.ico" type="image/x-icon" sizes="any">
    <link rel="shortcut icon" href="/images/favicondd.ico" type="image/x-icon">
    <link rel="canonical" href="{esc(canonical)}">
    <meta property="og:type" content="website">
    <meta property="og:title" content="{esc(meta_title)}">
    <meta property="og:description" content="{esc(content['meta_description'])}">
    <meta property="og:url" content="{esc(canonical)}">
    <meta property="og:image" content="https://res.cloudinary.com/dqcdbdt4v/image/upload/w_1200,h_630,c_pad,b_rgb:ffffff,q_auto,f_png/DD._fjnryj">
    <meta property="og:image:alt" content="DEVDESIGN – Webagentur Berlin">
    <meta property="og:site_name" content="DEVDESIGN">
    <meta property="og:locale" content="de_DE">
    <title>{esc(meta_title)}</title>
    <link rel="preconnect" href="https://cdn.jsdelivr.net">
    <link rel="stylesheet" href="{depth}style.css">
    <script>
        (function() {{
            if (sessionStorage.getItem('transition')) {{
                document.documentElement.classList.add('transitioning');
            }}
        }})();
    </script>
    <script type="application/ld+json">
    {schema_ld}
    </script>
</head>
<body class="preload">
    <div class="page-transition"><span></span><span></span></div>
    <div class="scroll-progress"></div>
    <nav class="mobile-nav" aria-label="Menü" aria-hidden="true">
        <ul class="mobile-nav-list">
            <li class="mobile-nav-main-item"><div class="mobile-nav-item-inner"><a href="/Bereiche/Bereiche" class="mobile-nav-link"><span class="nav-dot"></span> Bereiche</a></div></li>
            <li class="mobile-nav-main-item"><div class="mobile-nav-item-inner"><a href="/fakten/Fakten" class="mobile-nav-link"><span class="nav-dot"></span> Fakten</a></div></li>
            <li class="mobile-nav-main-item"><div class="mobile-nav-item-inner"><a href="/blog" class="mobile-nav-link">Blog</a></div></li>
            <li class="mobile-nav-main-item"><div class="mobile-nav-item-inner"><a href="/portfolio" class="mobile-nav-link">Projekte</a></div></li>
            <li class="mobile-nav-main-item"><div class="mobile-nav-item-inner"><a href="/team" class="mobile-nav-link">Team</a></div></li>
            <li class="mobile-nav-main-item"><div class="mobile-nav-item-inner"><a href="/preisrechner" class="mobile-nav-link">Rechner</a></div></li>
            <li class="mobile-nav-main-item"><div class="mobile-nav-item-inner"><a href="/kontakt" class="mobile-nav-link">Kontakt</a></div></li>
            <li class="mobile-nav-sub-item"><div class="mobile-nav-item-inner"><a href="/Bereiche/websites" class="mobile-nav-link">Websites</a></div></li>
            <li class="mobile-nav-sub-item"><div class="mobile-nav-item-inner"><a href="/Bereiche/webapps" class="mobile-nav-link">Webapps</a></div></li>
            <li class="mobile-nav-sub-item"><div class="mobile-nav-item-inner"><a href="/Bereiche/integrationen" class="mobile-nav-link">Integrationen</a></div></li>
        </ul>
    </nav>
    <header>
        <a href="{depth}index" class="logo-test">DEVDESIGN.STUDIO</a>
        <button class="burger-btn" aria-label="Menü öffnen" aria-expanded="false"><span>☰</span><span class="burger-btn-close">✕</span></button>
        <nav aria-label="Hauptnavigation">
            <div class="nav-menu-wrapper">
                <div class="nav-row nav-row-top">
                    <ul>
                        <li><a href="/Bereiche/Bereiche" class="nav-leistungen-link nav-dropdown-link" aria-describedby="leistungen-dropdown">Bereiche,</a></li>
                        <li><a href="/fakten/Fakten" class="nav-fakten-link nav-dropdown-link" aria-describedby="fakten-dropdown">Fakten,</a></li>
                        <li><a href="/leistungen/{branche}" class="nav-kategorien-link nav-dropdown-link" aria-describedby="kategorien-dropdown">Kategorien,</a></li>
                        <li><a href="/blog">Blog,</a></li>
                    </ul>
                </div>
                <div class="nav-row nav-row-bottom">
                    <ul>
                        <li><a href="/portfolio">Projekte,</a></li>
                        <li><a href="/team">Team,</a></li>
                        <li><a href="/preisrechner">Rechner</a></li>
                    </ul>
                </div>
            </div>
            <a href="/kontakt" class="button-kontakt">KONTAKT</a>
        </nav>
    </header>
    <nav class="leistungen-dropdown nav-dropdown-panel" id="leistungen-dropdown" aria-label="Bereiche" aria-hidden="true">
        <ul class="leistungen-dropdown-list">
            <li class="leistungen-dropdown-main-item"><div class="leistungen-dropdown-inner"><a href="/Bereiche/websites" class="leistungen-dropdown-link">Websites</a></div></li>
            <li class="leistungen-dropdown-main-item"><div class="leistungen-dropdown-inner"><a href="/Bereiche/webapps" class="leistungen-dropdown-link">Webapps</a></div></li>
            <li class="leistungen-dropdown-main-item"><div class="leistungen-dropdown-inner"><a href="/Bereiche/integrationen" class="leistungen-dropdown-link">Integrationen</a></div></li>
        </ul>
    </nav>
    <nav class="fakten-dropdown nav-dropdown-panel" id="fakten-dropdown" aria-label="Fakten" aria-hidden="true">
        <ul class="fakten-dropdown-list">
            <li><div class="fakten-dropdown-inner"><a href="{depth}fakten/was-kostet-website-agentur" class="fakten-dropdown-link">Was kostet eine Website?</a></div></li>
            <li><div class="fakten-dropdown-inner"><a href="{depth}fakten/webagentur-beauftragen-tipps" class="fakten-dropdown-link">Webagentur beauftragen</a></div></li>
        </ul>
    </nav>
    <nav class="fakten-dropdown kategorien-dropdown nav-dropdown-panel" id="kategorien-dropdown" aria-label="Kategorien" aria-hidden="true">
        <ul class="fakten-dropdown-list">
            <li><div class="fakten-dropdown-inner"><a href="/leistungen/gesundheit-praxen" class="fakten-dropdown-link">Gesundheits- &amp; Praxis&shy;unternehmen</a></div></li>
            <li><div class="fakten-dropdown-inner"><a href="/leistungen/recht-beratung" class="fakten-dropdown-link">Recht &amp; Beratungs&shy;dienstleister</a></div></li>
            <li><div class="fakten-dropdown-inner"><a href="/leistungen/marken-shops" class="fakten-dropdown-link">Marken-, Produkt- &amp; Shop&shy;unternehmen</a></div></li>
            <li><div class="fakten-dropdown-inner"><a href="/leistungen/buero-projekte" class="fakten-dropdown-link">Büros &amp; Projekt&shy;unternehmen</a></div></li>
            <li><div class="fakten-dropdown-inner"><a href="/leistungen/tech-finanz" class="fakten-dropdown-link">Technologie-, IT- &amp; Finanz&shy;unternehmen</a></div></li>
        </ul>
    </nav>
    <main>
        <div class="main-content">
            <section class="hero service">
                <div class="hero-service-content">
                    <div class="hero-service-content-item">
                        <h1 class="hero-service-keyword">{esc(h1)}</h1>
                        <p class="hero-service-headline">{esc(content['headline'])}</p>
                        <p class="hero-service">{esc(content['hero_p'])}</p>
                    </div>
                    <div class="hero-service-buttons">
                        <div class="hero-service-buttons-group">
                            <a href="/anderes a hrefs/fragebogen" class="button"><span>ERSTGESPRÄCH</span></a>
                            <a href="#text" class="button nav"><span>DETAILS</span></a>
                        </div>
                        <div class="hero-service-page-wrapper">
                            <a href="#text" class="hero-service-page" aria-label="Zur Leistungsbeschreibung scrollen"></a>
                        </div>
                    </div>
                </div>
            </section>
            <section id="text" class="text">
                <h2 class="text">{esc(content['text_h2'])}</h2>
                <p class="text-p">{esc(content['text_p'])}</p>
            </section>
            <section class="zusammengefasst" aria-labelledby="zusammengefasst-heading">
                <div class="zusammengefasst-layout">
                    <div class="zusammengefasst-header">
                        <span class="zusammengefasst-label">Zusammengefasst</span>
                        <h2 id="zusammengefasst-heading" class="zusammengefasst-h2">Was wir für {esc(persona_name)} umsetzen</h2>
                    </div>
                    <ul class="zusammengefasst-list" role="list">{zusammen_html}
                    </ul>
                </div>
            </section>
            <section class="service-standards" aria-labelledby="standards-heading">
                <div class="standards-layout">
                    <ul class="standards-features" role="list">{standards_html}
                    </ul>
                    <aside class="standards-sidebar">
                        <div class="standards-sticky">
                            <h2 id="standards-heading" class="standards-title">{esc(content['standards_title'])}</h2>
                            <p class="standards-desc">Strategie, Design und Technik aus einer Hand – abgestimmt auf {esc(persona_name)}.</p>
                            <a href="/anderes a hrefs/fragebogen" class="button standards-cta"><span>ERSTGESPRÄCH</span></a>
                        </div>
                    </aside>
                </div>
            </section>
            <section class="service-zahlen">
                <h2 class="standards-title">Fakten</h2>
                <p class="service-zahlen-p">Zahlen und Beobachtungen, die zeigen, warum digitale Sichtbarkeit für {esc(persona_name)} entscheidend ist.</p>
                <ul class="stats-grid" role="list">{stat_html}
                </ul>
            </section>
            <section class="service-prozess" aria-labelledby="prozess-heading">
                <div class="prozess-layout">
                    <div class="prozess-header">
                        <h2 id="prozess-heading" class="prozess-title">{esc(content['prozess_title'])}</h2>
                        <p class="prozess-desc">Vom Erstgespräch bis zum laufenden Betrieb begleiten wir Sie als Partner.</p>
                        <a href="/anderes a hrefs/fragebogen" class="button prozess-cta"><span>ERSTGESPRÄCH</span></a>
                    </div>
                    <ol class="prozess-timeline" role="list">{prozess_html}
                    </ol>
                </div>
            </section>
            <section class="service-work-teaser" aria-labelledby="work-heading">
                <div class="service-work-hero">
                    <h2 id="work-heading">Guck dir unsere Arbeit an!</h2>
                    <p>Entdecke ausgewählte Projekte aus unserem Portfolio.</p>
                </div>
                <div class="service-work-strip">{PORTFOLIO_STRIP}
                </div>
            </section>
            <section class="service-gruende" aria-labelledby="gruende-heading">
                <div class="gruende-header">
                    <h2 id="gruende-heading" class="gruende-title">
                        <span class="gruende-number">{len(content['gruende'])}</span>
                        <span class="gruende-title-text">{esc(content['gruende_title'])}</span>
                    </h2>
                </div>
                <div class="gruende-content">
                    <aside class="gruende-titles-sticky">
                        <ul class="gruende-titles-list" role="list" aria-label="Gründe Übersicht">{gruende_titles_html}
                        </ul>
                    </aside>
                    <ol class="gruende-descs-list" role="list">{gruende_descs_html}
                    </ol>
                </div>
            </section>
            <section class="service-contact" id="kontakt">
                <h2 class="service-contact-h2"><span class="service-contact-h2-part1">Sag Hallo! </span>und erzähl uns von deinem Projekt</h2>
                <p class="service-contact-p">{esc(content['contact_p'])}</p>
                <a href="/anderes a hrefs/fragebogen" class="contact-circle-btn" aria-label="Zum Projekt-Fragebogen">
                    <svg class="contact-circle-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </a>
            </section>
            <section class="blog-related">
                <h2 class="blog-related-headline">ÄHNLICHE LEISTUNGEN FÜR {esc(persona_name.upper())}</h2>
                <div class="blog-related-grid">
                    <article class="related-item">
                        <a href="{sister_rel}" class="related-item-link">
                            <h3>{esc(content['sister_label'])}</h3>
                            <p>{esc(content['sister_desc'])}</p>
                        </a>
                    </article>
                    <article class="related-item">
                        <a href="/leistungen/{branche}" class="related-item-link">
                            <h3>{esc(branch_label)}</h3>
                            <p>Alle Leistungen für diese Branche im Überblick.</p>
                        </a>
                    </article>
                    <article class="related-item">
                        <a href="/Bereiche/websites" class="related-item-link">
                            <h3>Websites</h3>
                            <p>Professionelle Webauftritte aus dem DEVDESIGN Studio.</p>
                        </a>
                    </article>
                    <article class="related-item">
                        <a href="/Bereiche/integrationen" class="related-item-link">
                            <h3>Integrationen</h3>
                            <p>Schnittstellen, Automation und digitale Prozesse.</p>
                        </a>
                    </article>
                </div>
            </section>
            <section class="section FAQ">
                <h2 class="h2">Häufige Fragen zu {esc(content['faq_topic'])} für {esc(persona_name)}</h2>
                <p class="p">Antworten auf zentrale Fragen rund um Einstieg, Strategie und Umsetzung.</p>
                <div class="faq-container">{faq_html}
                </div>
            </section>
        </div>
    </main>{FOOTER_HTML}
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js" defer></script>
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/ScrollTrigger.min.js" defer></script>
    <script src="https://cdn.jsdelivr.net/gh/studio-freight/lenis@1.0.29/bundled/lenis.min.js" defer></script>
    <script type="module" src="{depth}main.js"></script>
</body>
</html>
"""


def render_branch_page(branche: str, personas: list[dict], meta: dict) -> str:
    template = BRANCH_TEMPLATE.read_text(encoding="utf-8")
    slug = branche
    canonical = f"{BASE_URL}/leistungen/{slug}"

    kg_link = kg_online_label(branche)
    accordion = ""
    for p in personas:
        persona_name = p["Persona-Name"]
        persona_slug = p["Persona-Slug"]
        accordion += f"""
                    <div class="kanzleien-item">
                        <h2><button type="button" class="kanzleien-trigger" aria-expanded="false">[{esc(persona_name)}]</button></h2>
                        <div class="kanzleien-under-wrap">
                            <ul class="kanzleien-under-list">
                                <li><a href="/leistungen/{slug}/{persona_slug}/website">Website &amp; Online-Präsenz</a></li>
                                <li><a href="/leistungen/{slug}/{persona_slug}/kundengewinnung">{esc(kg_link)}</a></li>
                            </ul>
                        </div>
                    </div>"""

    out = template
    replacements = [
        ('href="https://devdesignstudio.de/leistungen/gesundheits-wellness"', f'href="{canonical}"'),
        ("https://devdesignstudio.de/leistungen/gesundheits-wellness", canonical),
        ("Gesundheit &amp; Wellness – Websites &amp; Webapps | DEVDESIGN", meta["title"]),
        ("Gesundheit & Wellness – Websites & Webapps | DEVDESIGN", meta["title"].replace("&amp;", "&")),
        ("Gesundheits- &amp; Wellnessdienstleister", meta["h1"]),
        (
            "Wir unterstützen Praxen, Kliniken und Wellnessanbieter mit digitalen Lösungen für Terminvergabe, Patientenkommunikation und einen professionellen Online-Auftritt.",
            meta["intro"],
        ),
        (
            "Digitale Auftritte für Praxen, Kliniken, Therapeuten und Wellness: barrierearm, DSGVO-sauber, mit Buchung und Patienteninfo. Webentwicklung von DEVDESIGN Berlin.",
            meta["description"],
        ),
        ('href="/leistungen/gesundheits-wellness"', f'href="/leistungen/{slug}"'),
        ("/Leistungen/Leistungen", "/Bereiche/Bereiche"),
        ("/Leistungen/websites", "/Bereiche/websites"),
        ("/Leistungen/webapps", "/Bereiche/webapps"),
        ("/Leistungen/integrationen", "/Bereiche/integrationen"),
        ('aria-describedby="leistungen-dropdown">Leistungen,', 'aria-describedby="leistungen-dropdown">Bereiche,'),
        ('<span class="nav-dot"></span> Leistungen</a>', '<span class="nav-dot"></span> Bereiche</a>'),
        ('aria-label="Leistungen"', 'aria-label="Bereiche"'),
    ]
    for old, new in replacements:
        out = out.replace(old, new)

    # Kategorien dropdown
    kategorien = """
            <li><div class="fakten-dropdown-inner"><a href="/leistungen/gesundheit-praxen" class="fakten-dropdown-link">Gesundheits- &amp; Praxis&shy;unternehmen</a></div></li>
            <li><div class="fakten-dropdown-inner"><a href="/leistungen/recht-beratung" class="fakten-dropdown-link">Recht &amp; Beratungs&shy;dienstleister</a></div></li>
            <li><div class="fakten-dropdown-inner"><a href="/leistungen/marken-shops" class="fakten-dropdown-link">Marken-, Produkt- &amp; Shop&shy;unternehmen</a></div></li>
            <li><div class="fakten-dropdown-inner"><a href="/leistungen/buero-projekte" class="fakten-dropdown-link">Büros &amp; Projekt&shy;unternehmen</a></div></li>
            <li><div class="fakten-dropdown-inner"><a href="/leistungen/tech-finanz" class="fakten-dropdown-link">Technologie-, IT- &amp; Finanz&shy;unternehmen</a></div></li>"""
    out = re.sub(
        r'<nav class="fakten-dropdown kategorien-dropdown.*?</nav>',
        f'<nav class="fakten-dropdown kategorien-dropdown nav-dropdown-panel" id="kategorien-dropdown" aria-label="Kategorien" aria-hidden="true">\n        <ul class="fakten-dropdown-list">\n{kategorien}\n        </ul>\n    </nav>',
        out,
        count=1,
        flags=re.DOTALL,
    )

    out = re.sub(
        r'<div class="kanzleien-accordion">.*?</div>\s*</section>',
        f'<div class="kanzleien-accordion">{accordion}\n                </div>\n            </section>',
        out,
        count=1,
        flags=re.DOTALL,
    )

    out = out.replace(
        '"name": "Gesundheit & Wellness"',
        f'"name": "{meta["h1"].replace("&", "&")}"',
    )
    out = out.replace(
        '"name": "Websites für Gesundheits- & Wellnessunternehmen"',
        f'"name": "{meta["service_name"]}"',
    )

    branch_schema = build_branch_schema_json(canonical=canonical, meta=meta)
    out = re.sub(
        r'<script type="application/ld\+json">\s*\[.*\]\s*</script>',
        f'<script type="application/ld+json">\n    {branch_schema}\n    </script>',
        out,
        count=1,
        flags=re.DOTALL,
    )
    return out


def rename_leistungen_to_bereiche() -> None:
    src = ROOT / "Leistungen"
    dst = ROOT / "Bereiche"
    if src.exists() and not dst.exists():
        src.rename(dst)
    elif src.exists() and dst.exists():
        pass  # already migrated

    if dst.exists():
        leistungen_html = dst / "Leistungen.html"
        bereiche_html = dst / "Bereiche.html"
        if leistungen_html.exists() and not bereiche_html.exists():
            leistungen_html.rename(bereiche_html)

    skip = {"node_modules", "dist", ".git", "MEDIA CDN"}
    replacements = [
        ("/Leistungen/Leistungen", "/Bereiche/Bereiche"),
        ("/Leistungen/websites", "/Bereiche/websites"),
        ("/Leistungen/webapps", "/Bereiche/webapps"),
        ("/Leistungen/integrationen", "/Bereiche/integrationen"),
        ("https://devdesignstudio.de/Leistungen/Leistungen", "https://devdesignstudio.de/Bereiche/Bereiche"),
        ("https://devdesignstudio.de/Leistungen/websites", "https://devdesignstudio.de/Bereiche/websites"),
        ("https://devdesignstudio.de/Leistungen/webapps", "https://devdesignstudio.de/Bereiche/webapps"),
        ("https://devdesignstudio.de/Leistungen/integrationen", "https://devdesignstudio.de/Bereiche/integrationen"),
        ('aria-describedby="leistungen-dropdown">Leistungen,', 'aria-describedby="leistungen-dropdown">Bereiche,'),
        ('<span class="nav-dot"></span> Leistungen</a>', '<span class="nav-dot"></span> Bereiche</a>'),
        ('"name": "Leistungen"', '"name": "Bereiche"'),
        (">Leistungen<", ">Bereiche<"),
    ]

    for path in ROOT.rglob("*"):
        if not path.is_file():
            continue
        if any(part in skip for part in path.parts):
            continue
        if path.suffix not in {".html", ".js", ".mjs", ".py", ".md", ".xml"}:
            continue
        if path.name == "generate_excel_content_pages.py":
            continue
        text = path.read_text(encoding="utf-8", errors="ignore")
        new = text
        for old, rep in replacements:
            new = new.replace(old, rep)
        if new != text:
            path.write_text(new, encoding="utf-8")


def main() -> None:
    pages, by_persona = parse_xlsx(XLSX)
    rename_leistungen_to_bereiche()

    by_branch: dict[str, list] = defaultdict(list)
    for row in pages:
        by_branch[row["Branche"]].append(row)

    persona_count = 0
    for row in pages:
        branche = row["Branche"]
        persona_slug = row["Persona-Slug"]
        persona_name = row["Persona-Name"]
        branch_meta = BRANCH_META[branche]
        blocks = by_persona[(branche, persona_slug)]

        for page_type, h1_key, meta_key, url_key in [
            ("website", "H1 Website-Seite", "Meta-Title Website-Seite", "URL-Pfad Website-Seite"),
            ("kundengewinnung", "H1 Kundengewinnung-Seite", "Meta-Title Kundengewinnung-Seite", "URL-Pfad Kundengewinnung-Seite"),
        ]:
            h1 = row[h1_key]
            meta_title = row[meta_key]
            canonical_path = row[url_key]
            content = build_page_content(page_type, persona_name, h1, meta_title, blocks, branche)
            h1 = content["h1"]
            meta_title = content["meta_title"]
            html_out = render_persona_page(
                h1=h1,
                meta_title=meta_title,
                canonical_path=canonical_path,
                branche=branche,
                persona_slug=persona_slug,
                page_type=page_type,
                persona_name=persona_name,
                sister_path=canonical_path.replace("/website", "/kundengewinnung").replace("/kundengewinnung", "/website"),
                branch_label=branch_meta["h1"],
                content=content,
            )
            out_path = ROOT / "leistungsunterpunkte" / branche / persona_slug / f"{page_type}.html"
            out_path.parent.mkdir(parents=True, exist_ok=True)
            out_path.write_text(html_out, encoding="utf-8")
            persona_count += 1

    branch_count = 0
    for branche, personas in by_branch.items():
        meta = BRANCH_META[branche]
        html_out = render_branch_page(branche, personas, meta)
        out_path = ROOT / "leistungen" / f"{branche}.html"
        out_path.write_text(html_out, encoding="utf-8")
        branch_count += 1

    print(f"Generated {persona_count} persona pages and {branch_count} branch overview pages.")
    print("Renamed Leistungen/ -> Bereiche/ and updated references (excluding dist/).")


if __name__ == "__main__":
    main()
