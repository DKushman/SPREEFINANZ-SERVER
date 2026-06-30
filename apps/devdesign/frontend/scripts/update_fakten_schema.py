#!/usr/bin/env python3
"""
Injects enriched 4-entity Schema.org JSON-LD into fakten/*.html files.
Schema per page: WebPage + LocalBusiness (canonical) + Article + FAQPage

Run from the frontend/ directory:
    python3 scripts/update_fakten_schema.py
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

# FAQ Q&A pairs per page (extracted from <details>/<summary> sections)
FAQ_DATA = {
    "was-kostet-website-agentur": [
        (
            "Warum kostet eine Website bei einer Agentur mehr als bei einem Freelancer?",
            "Agenturen liefern Strategie, Design, Entwicklung, Testing und Projektmanagement aus einer Hand. Mehrere Spezialisten erhöhen Qualität und Kosten im Vergleich zu einem Einzelnen."
        ),
        (
            "Kann ich eine professionelle Website auch für unter 3.000 Euro bekommen?",
            "Für sehr einfache Template-Projekte mit wenig Individualisierung ist das möglich. Für einen professionellen Markenauftritt ist ein höheres Budget meist sinnvoller."
        ),
        (
            "Was kostet ein Online-Shop im Vergleich zu einer normalen Website?",
            "Typischerweise 8.000–40.000 € wegen Produktmanagement, Zahlungsabwicklung, Versandlogik und erhöhtem Sicherheitsaufwand."
        ),
        (
            "Lohnt sich eine teure Website für ein kleines Unternehmen?",
            "Das hängt von den Zielen ab: Soll die Website Leads und Umsatz bringen, amortisiert sie sich oft schnell. Entscheidend ist der ROI, nicht allein der Preis."
        ),
        (
            "Wie kann ich Website-Kosten steuerlich absetzen?",
            "Meist als Betriebsausgaben; bei größeren Investitionen kann eine Abschreibung sinnvoll sein – bitte mit dem Steuerberater klären."
        ),
    ],
    "versteckte-kosten-webdesign": [
        (
            "Welche Kosten werden am häufigsten vergessen?",
            "Hosting, SSL, Plugin- und Schriftlizenzen, DSGVO-Cookie-Lösungen und regelmäßige Security-Updates gehören zu den am häufigsten übersehenen Kostenposten."
        ),
        (
            "Wie erkenne ich ein seriöses Angebot?",
            "Klare Leistungsauflistung, definierte Revisionsanzahl, eindeutiger Projektumfang und transparente Hinweise zu laufenden Kosten sind gute Zeichen."
        ),
        (
            "Was kostet ein SSL-Zertifikat?",
            "Viele Hoster bieten Basis-SSL kostenlos an (z. B. Let's Encrypt). Erweiterte Zertifikate kosten oft ca. 50–300 € pro Jahr."
        ),
        (
            "Muss ich für DSGVO-Konformität extra zahlen?",
            "Das sollte im Standard enthalten sein. Manche Agenturen berechnen Cookie-Banner, Datenschutzseite oder sichere Formulare separat – das vorher klären."
        ),
        (
            "Wie vermeide ich Nachzahlungen bei Änderungswünschen?",
            "Revisionsrunden und Preise für Extra-Änderungen schriftlich festlegen. Ein gutes Briefing zu Beginn reduziert nachträgliche Wünsche erheblich."
        ),
    ],
    "webagentur-beauftragen-tipps": [
        (
            "Wie lange dauert ein typisches Website-Projekt?",
            "Je nach Umfang etwa 4–16 Wochen. Einfache Sites sind oft in 4–6 Wochen fertig; komplexere Projekte mit Webapps brauchen entsprechend länger."
        ),
        (
            "Brauche ich ein Lastenheft oder Briefing?",
            "Ein Briefing ist der wichtigste Startpunkt. Es muss nicht perfekt sein – gute Agenturen strukturieren die Anforderungen im Erstgespräch gemeinsam mit Ihnen."
        ),
        (
            "Wie viele Agenturen sollte ich anfragen?",
            "Drei bis fünf Agenturen sind ideal für einen aussagekräftigen Vergleich, ohne sich zu überfordern. Qualität der Anfragen geht vor Quantität."
        ),
        (
            "Was passiert, wenn ich mit dem Ergebnis nicht zufrieden bin?",
            "Definierte Meilensteine und Feedback-Runden verhindern Überraschungen. Mehrere Korrekturschleifen sind bei seriösen Agenturen üblich und vertraglich geregelt."
        ),
        (
            "Sollte ich eine lokale oder eine Remote-Agentur wählen?",
            "Beides funktioniert gut. Lokal ermöglicht persönliche Treffen, Remote oft mehr Flexibilität. Entscheidend ist die Kommunikationsqualität."
        ),
    ],
    "agentur-vs-freelancer": [
        (
            "Kann ein Freelancer alles, was eine Agentur kann?",
            "Theoretisch ja, praktisch selten: Die meisten Freelancer spezialisieren sich auf ein bis zwei Bereiche. Ganzheitliche Projekte brauchen mehrere Freelancer oder eine Agentur."
        ),
        (
            "Wie finde ich einen guten Freelancer?",
            "Über LinkedIn, Upwork oder Empfehlungen. Portfolio, Bewertungen und Referenzen prüfen. Ein kleines Testprojekt kann helfen, die Arbeitsweise kennenzulernen."
        ),
        (
            "Ist eine kleine Agentur günstiger als eine große?",
            "Oft ja, wegen geringerem Overhead. Agenturen mit 2–5 Personen bieten häufig ein gutes Preis-Leistungs-Verhältnis."
        ),
        (
            "Kann ich mitten im Projekt wechseln?",
            "Möglich, aber kostspielig: Einarbeitung und Nacharbeit kosten Zeit und Geld. Daher ist die richtige Wahl zu Beginn besonders wichtig."
        ),
        (
            "Was ist ein Hybrid-Modell?",
            "Agentur für Konzept und Design, spezialisierte Freelancer für Teilentwicklung. Braucht klare Steuerung, kann aber Kosten sparen."
        ),
    ],
    "fragen-an-agentur": [
        (
            "Wie verbindlich ist ein Angebot?",
            "Rechtlich verbindlich, wenn nicht ausdrücklich als unverbindlich gekennzeichnet. Gültigkeit und genauen Leistungsumfang prüfen."
        ),
        (
            "Muss ich eine Anzahlung leisten?",
            "30–50 % Anzahlung sind in der Branche üblich. Idealerweise an konkrete Meilenstein-Lieferungen gekoppelt."
        ),
        (
            "Was ist ein NDA und brauche ich eins?",
            "Eine Geheimhaltungsvereinbarung. Vor dem Austausch sensibler Unternehmensdaten vor Projektstart sinnvoll."
        ),
        (
            "Kann ich den Vertrag vorzeitig kündigen?",
            "Das hängt vom Vertrag ab. Kosten bei vorzeitigem Ende und Nutzungsrechte an Zwischenergebnissen vorab klären."
        ),
        (
            "Sollte ich einen Anwalt den Vertrag prüfen lassen?",
            "Ab ca. 10.000 € Projektvolumen oft ratsam. Ein IT-Rechtsanwalt kann kritische Klauseln aufdecken."
        ),
    ],
    "website-wichtig-wie-mitarbeiter": [
        (
            "Brauche ich wirklich eine Website, wenn ich schon auf Instagram aktiv bin?",
            "Ja. Social-Media-Profile gehören der Plattform. Eine eigene Website gibt Ihnen Kontrolle über Marke, Inhalte und Kundenbeziehungen."
        ),
        (
            "Wie schnell amortisiert sich eine Website?",
            "Das hängt vom Geschäftsmodell ab. Bei hohem Kundenwert können wenige zusätzliche Anfragen die Investition schnell ausgleichen."
        ),
        (
            "Reicht eine einfache Visitenkarten-Website?",
            "Als Minimum ja – aber das verschenkt Potenzial. Eine Strategie mit CTAs, SEO und Leadgenerierung nutzt die Website aktiv als Vertriebskanal."
        ),
        (
            "Wie messe ich, ob meine Website erfolgreich ist?",
            "Mit KPIs wie Traffic, Verweildauer, Anfragen, Conversion-Rate und organischem Traffic – zum Beispiel mit Google Analytics."
        ),
        (
            "Sollte ich meine Website selbst bauen oder professionell erstellen lassen?",
            "Baukästen sind ein Einstieg, stoßen aber bei Design, Performance und SEO schnell an Grenzen. Für seriösen Kundengewinn lohnt eine Agentur oft."
        ),
    ],
    "website-relaunch-wann-lohnt": [
        (
            "Wie oft sollte man seine Website relaunchen?",
            "Grob alle 3–5 Jahre. Kleinere Updates können größere Relaunches nach hinten verschieben, wenn sie die Kernprobleme beheben."
        ),
        (
            "Verliere ich bei einem Relaunch mein Google-Ranking?",
            "Nicht bei sauberer SEO-Migration: 301-Redirects, aktualisierte Sitemap und sauberer Code sorgen dafür, dass Ranking erhalten bleibt oder sich verbessert."
        ),
        (
            "Wie lange dauert ein Website Relaunch?",
            "Ca. 6–16 Wochen je nach Umfang. Weniger bei bestehendem Content, mehr bei komplett neuem Konzept und Texten."
        ),
        (
            "Kann ich während des Relaunches die alte Website weiter nutzen?",
            "Ja. Die neue Version wird auf einem Staging-Server entwickelt. Die Live-Site bleibt bis zum Go-live unverändert."
        ),
        (
            "Lohnt sich ein Relaunch auch für kleine Unternehmen?",
            "Ja. Ein Relaunch kann Sichtbarkeit, Anfragen und den professionellen Eindruck gegenüber größeren Wettbewerbern deutlich verbessern."
        ),
    ],
    "kosten-schlechte-website": [
        (
            "Wie erkenne ich, ob meine Website schlecht ist?",
            "Ladezeit über 3 Sekunden ist kritisch. Mobile Darstellung testen und Absprungrate in Analytics prüfen – über 70 % ist problematisch."
        ),
        (
            "Kann ich meine Website selbst verbessern?",
            "Kleines wie Texte und Bilder ja. Bei Design, Performance und SEO ist professionelle Hilfe meist effizienter und nachhaltiger."
        ),
        (
            "Wie schnell wirkt sich eine bessere Website auf den Umsatz aus?",
            "Conversion-Verbesserungen sind oft in Wochen spürbar. SEO braucht typischerweise 3–6 Monate für die volle Wirkung."
        ),
        (
            "Was ist der ROI einer professionellen Website?",
            "Stark branchenabhängig. Beispiel: Bei 1.000 € Kundenwert können wenige zusätzliche Aufträge eine 10.000 €-Investition schnell rechtfertigen."
        ),
        (
            "Lohnt es sich, in eine teure Website zu investieren, wenn ich ein kleines Unternehmen bin?",
            "Oft ja. Eine professionelle Website als Hauptkanal gleicht Größennachteile aus und wirkt professioneller gegenüber größeren Mitbewerbern."
        ),
    ],
    "agentur-preis-enthalten": [
        (
            "Was ist der Unterschied zwischen Pauschalpreis und Abrechnung nach Aufwand?",
            "Pauschal bedeutet Festpreis für das gesamte Projekt. Aufwand bedeutet bezahlte Ist-Stunden. Pauschal gibt Planungssicherheit, Stunden bieten mehr Flexibilität bei Änderungen."
        ),
        (
            "Warum sind die Preise zwischen Agenturen so unterschiedlich?",
            "Teamgröße, Erfahrung, Standort und Leistungsumfang variieren stark. Ein Senior-Setup mit UX-Expertise liefert andere Qualität als ein Template-basierter Einzelkämpfer."
        ),
        (
            "Sind Hosting und Domain im Agenturpreis enthalten?",
            "Das ist unterschiedlich. Manche Agenturen rechnen alles inklusive ab, andere separat. Explizit nach den Gesamtkosten inklusive laufender Posten fragen."
        ),
        (
            "Was kostet die Wartung nach dem Launch?",
            "Je nach Paket oft ca. 50–500 €/Monat für Updates, Backups, Content-Pflege und Support."
        ),
        (
            "Kann ich Teile des Projekts selbst übernehmen, um Kosten zu sparen?",
            "Ja, zum Beispiel Texte oder Bildrecherche. Das vorab mit der Agentur abstimmen, damit Eigenleistung sinnvoll eingebunden wird."
        ),
    ],
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


def build_schema(canonical_url, title, description, og_image, faq_pairs):
    headline = re.sub(r'\s*\|\s*DEVDESIGN.*$', '', title).strip()

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
                {"@type": "ListItem", "position": 2, "name": "Fakten", "item": f"{BASE_URL}/fakten/Fakten"},
                {"@type": "ListItem", "position": 3, "name": headline, "item": canonical_url},
            ],
        },
    }

    article = {
        "@context": "https://schema.org",
        "@type": "Article",
        "@id": f"{canonical_url}#article",
        "headline": headline,
        "description": description,
        "url": canonical_url,
        "datePublished": "2026-05-18",
        "dateModified": "2026-05-18",
        "inLanguage": "de-DE",
        "image": {
            "@type": "ImageObject",
            "url": og_image,
            "width": 1200,
            "height": 630,
        },
        "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": f"{canonical_url}#webpage",
        },
        "author": {
            "@type": "Organization",
            "@id": f"{BASE_URL}/#organization",
            "name": "DEVDESIGN",
        },
        "publisher": {
            "@type": "Organization",
            "@id": f"{BASE_URL}/#organization",
            "name": "DEVDESIGN",
            "logo": {
                "@type": "ImageObject",
                "url": "https://res.cloudinary.com/dqcdbdt4v/image/upload/f_svg/DEVDESIGN_risffk.svg",
            },
        },
    }

    faq_entities = [
        {
            "@type": "Question",
            "name": q,
            "acceptedAnswer": {"@type": "Answer", "text": a},
        }
        for q, a in faq_pairs
    ]

    faq_page = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "@id": f"{canonical_url}#faq",
        "mainEntity": faq_entities,
    }

    return [webpage, LOCAL_BUSINESS, article, faq_page]


def process_file(filepath: Path) -> bool:
    slug = filepath.stem
    faq_pairs = FAQ_DATA.get(slug)

    if faq_pairs is None:
        # Skip files without FAQ data (Fakten.html, fakten1.html, übersicht.html)
        print(f"  SKIP (no FAQ data): {filepath.name}")
        return False

    html = filepath.read_text(encoding="utf-8")
    description = extract_meta_description(html)
    title = extract_title(html)
    canonical_url = extract_canonical(html)
    og_image = extract_og_image(html)

    if not canonical_url:
        print(f"  SKIP (no canonical): {filepath.name}", file=sys.stderr)
        return False

    schema = build_schema(canonical_url, title, description, og_image, faq_pairs)
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
    fakten_dir = frontend_root / "fakten"

    html_files = sorted(fakten_dir.glob("*.html"))
    print(f"Processing {len(html_files)} fakten files...\n")
    modified = 0

    for f in html_files:
        if process_file(f):
            print(f"  OK  {f.name}")
            modified += 1

    print(f"\nDone. Modified: {modified}")


if __name__ == "__main__":
    main()
