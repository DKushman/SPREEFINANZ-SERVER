#!/usr/bin/env python3
"""
Injects enriched 3-entity Schema.org JSON-LD into all blog/*.html files.
Replaces: LocalBusiness (thin) + BlogPosting (incomplete)
With:     WebPage + LocalBusiness (canonical) + BlogPosting (full)

Run from the frontend/ directory:
    python3 scripts/update_blog_schema.py
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

PERSONS = {
    "Leon Chiosea": {
        "@type": "Person",
        "name": "Leon Chiosea",
        "jobTitle": "Backend-Developer",
        "url": f"{BASE_URL}/team",
        "image": "https://res.cloudinary.com/dqcdbdt4v/image/upload/v1773142106/leon_rbinpu.jpg",
        "sameAs": "https://www.linkedin.com/in/leon-chiosea-33b371242/",
        "worksFor": {"@type": "Organization", "@id": f"{BASE_URL}/#organization", "name": "DEVDESIGN"},
    },
    "David Joel Chiosea": {
        "@type": "Person",
        "name": "David Joel Chiosea",
        "jobTitle": "Frontend-Developer",
        "url": f"{BASE_URL}/team",
        "image": "https://res.cloudinary.com/dqcdbdt4v/image/upload/v1772028127/joey_me8ade.jpg",
        "sameAs": "https://www.linkedin.com/in/david-joel-chiosea-90523126a/",
        "worksFor": {"@type": "Organization", "@id": f"{BASE_URL}/#organization", "name": "DEVDESIGN"},
    },
}

# Typo correction map (visible HTML text → correct name)
AUTHOR_TYPO_FIX = {
    "Dabid CHiosea": "David Joel Chiosea",
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


def extract_author_name(html):
    """Extract author name from blog-hero-author-name span."""
    m = re.search(r'class=["\']blog-hero-author-name["\'][^>]*>\s*([^<]+)\s*<', html)
    if m:
        raw = m.group(1).strip()
        return AUTHOR_TYPO_FIX.get(raw, raw)
    return "DEVDESIGN"


def build_schema(canonical_url, title, description, og_image, author_name):
    headline = re.sub(r'\s*\|\s*DEVDESIGN.*$', '', title).strip()

    author = PERSONS.get(author_name, {
        "@type": "Organization",
        "@id": f"{BASE_URL}/#organization",
        "name": "DEVDESIGN",
    })

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
                {"@type": "ListItem", "position": 2, "name": "Blog", "item": f"{BASE_URL}/blog"},
                {"@type": "ListItem", "position": 3, "name": headline, "item": canonical_url},
            ],
        },
    }

    blog_posting = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
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
        "author": author,
        "publisher": {
            "@type": "Organization",
            "@id": f"{BASE_URL}/#organization",
            "name": "DEVDESIGN",
            "logo": {
                "@type": "ImageObject",
                "url": "https://res.cloudinary.com/dqcdbdt4v/image/upload/f_svg/DEVDESIGN_risffk.svg",
            },
        },
        "isPartOf": {
            "@type": "Blog",
            "name": "DEVDESIGN Blog",
            "url": f"{BASE_URL}/blog",
        },
    }

    return [webpage, LOCAL_BUSINESS, blog_posting]


def process_file(filepath: Path, frontend_root: Path) -> bool:
    html = filepath.read_text(encoding="utf-8")

    description = extract_meta_description(html)
    title = extract_title(html)
    canonical_url = extract_canonical(html)
    og_image = extract_og_image(html)
    author_name = extract_author_name(html)

    if not canonical_url:
        print(f"  SKIP (no canonical): {filepath.name}", file=sys.stderr)
        return False

    schema = build_schema(canonical_url, title, description, og_image, author_name)
    json_str = json.dumps(schema, ensure_ascii=False, indent=4)
    new_block = f"    <!-- Structured Data for Google -->\n    <script type=\"application/ld+json\">\n    {json_str}\n    </script>"

    new_html, count = LD_JSON_PATTERN.subn(new_block, html, count=1)
    if count == 0:
        print(f"  WARN (no ld+json found): {filepath.name}", file=sys.stderr)
        return False

    # Fix author typo in visible HTML too
    for wrong, correct in AUTHOR_TYPO_FIX.items():
        new_html = new_html.replace(f">{wrong}<", f">{correct}<")

    filepath.write_text(new_html, encoding="utf-8")
    return True


def main():
    frontend_root = Path(__file__).parent.parent
    blog_dir = frontend_root / "blog"

    html_files = sorted(blog_dir.glob("*.html"))
    print(f"Processing {len(html_files)} blog files...\n")
    modified = 0

    for f in html_files:
        if process_file(f, frontend_root):
            author = extract_author_name(f.read_text(encoding="utf-8"))
            print(f"  OK  {f.name}  (author: {author})")
            modified += 1

    print(f"\nDone. Modified: {modified}")


if __name__ == "__main__":
    main()
