"""Content allocation, headline heuristics, and summary synthesis for persona pages."""
from __future__ import annotations

import re

from content_research import (
    FUNNEL_FALLBACK,
    KG_PROCESS,
    PAIN_FALLBACK,
    STAT_FALLBACKS,
    WEBSITE_PROCESS,
    kg_gruende,
    kg_standards,
    website_standards,
)

KG_AUDIENCE_KEYWORD: dict[str, str] = {
    "gesundheit-praxen": "Patientengewinnung",
    "recht-beratung": "Mandantengewinnung",
    "marken-shops": "Kundengewinnung",
    "buero-projekte": "Kundengewinnung",
    "tech-finanz": "Kundengewinnung",
}

BRANCH_SHORT_FALLBACKS: dict[str, list[str]] = {
    "gesundheit-praxen": ["Spezialisierung", "Terminbuchung", "Vertrauen", "Sichtbarkeit"],
    "recht-beratung": ["Vertrauen", "Mandanten", "Compliance", "Sichtbarkeit"],
    "marken-shops": ["Conversion", "Marke", "Shop-Funnel", "SEO"],
    "buero-projekte": ["Referenzen", "Anfragen", "Portfolio", "Sichtbarkeit"],
    "tech-finanz": ["Anfragen", "Demo", "Funnel", "Tracking"],
}

BRANCH_HEADLINE_SUFFIX_FALLBACKS: dict[str, list[str]] = {
    "gesundheit-praxen": [
        "Terminbuchung entlastet Ihr Team",
        "Local SEO für Spitzenplatzierungen",
        "Vertrauen schafft der erste Eindruck",
    ],
    "recht-beratung": [
        "Compliance-sichere Online-Kommunikation",
        "Vertrauen schafft der erste Eindruck",
        "Formulare qualifizieren Anfragen",
    ],
    "marken-shops": [
        "Shop-Funnel für mehr Bestellungen",
        "SEO-Sichtbarkeit für relevante Anfragen",
        "Conversion statt reiner Reichweite",
    ],
    "buero-projekte": [
        "Referenzen überzeugen vor dem Erstgespräch",
        "Portfolio sichtbar machen",
        "Formulare qualifizieren Anfragen",
    ],
    "tech-finanz": [
        "Demo-Pfade für B2B-Entscheider",
        "Funnel führt Interessenten gezielt weiter",
        "Messbarkeit statt Marketing-Bauchgefühl",
    ],
}

SHORT_HEADLINE_PATTERNS: list[tuple[str, str]] = [
    (r"(?i)terminbuchung|online-termin", "Terminbuchung"),
    (r"(?i)schema\.org|strukturierte daten", "Schema-Markup"),
    (r"(?i)spezialisierung|nisch", "Spezialisierung"),
    (r"(?i)jameda|bewertungsportal|einzige online-quelle", "Portale"),
    (r"(?i)local pack|lokale such|maps", "Local SEO"),
    (r"(?i)bewertung|rezension", "Bewertungen"),
    (r"(?i)landingpage|lead", "Landingpages"),
    (r"(?i)funnel|conversion|akquise", "Funnel"),
    (r"(?i)performance|ladezeit|core web|mobile", "Performance"),
    (r"(?i)seo|suchmasch|google|rank|sichtbar", "SEO"),
    (r"(?i)vertrauen|seriös|professionell", "Vertrauen"),
    (r"(?i)content|inhalte|blog", "Content"),
    (r"(?i)tracking|messbar|analytics", "Tracking"),
    (r"(?i)demo|trial|saas", "Demo-Pfade"),
    (r"(?i)shop|warenkorb|e-commerce", "Shop-Funnel"),
    (r"(?i)portfolio|referenz|projekt", "Referenzen"),
    (r"(?i)formular|anfrage", "Formulare"),
    (r"(?i)compliance|berufsrecht|ymyl", "Compliance"),
]

STOPWORDS = {
    "eine", "ein", "der", "die", "das", "und", "oder", "für", "mit", "von", "zu", "auf",
    "in", "ist", "sind", "wird", "ihre", "ihr", "sie", "wir", "nicht", "auch", "als", "bei",
    "dass", "durch", "mehr", "wenn", "kann", "können", "haben", "hat", "nur", "über", "aus",
    "dem", "den", "des", "einer", "einem", "einen", "es", "an", "am", "im", "zum", "zur",
    "website", "online", "digital", "digitale", "digitale", "typische", "viele", "wichtig",
}

HEADLINE_PATTERNS: list[tuple[str, str]] = [
    (r"(?i)terminbuchung|online-termin", "Terminbuchung entlastet Ihr Team"),
    (r"(?i)schema\.org|strukturierte daten", "Schema-Markup stärkt Google-Signale"),
    (r"(?i)spezialisierung|nisch", "Nischenspezialisierung schlägt Generika"),
    (r"(?i)jameda|bewertungsportal|einzige online-quelle", "Eigene Website statt Portal-Abhängigkeit"),
    (r"(?i)local pack|lokale such|maps", "Local SEO für Spitzenplatzierungen"),
    (r"(?i)bewertung|rezension", "Bewertungen aktiv mitgestalten"),
    (r"(?i)landingpage|lead", "Landingpages für qualifizierte Leads"),
    (r"(?i)funnel|conversion|akquise", "Funnel führt Interessenten gezielt weiter"),
    (r"(?i)performance|ladezeit|core web|mobile", "Schnelle, mobile UX hält Besucher"),
    (r"(?i)seo|suchmasch|google|rank|sichtbar", "SEO-Sichtbarkeit für relevante Anfragen"),
    (r"(?i)vertrauen|seriös|professionell", "Vertrauen schafft der erste Eindruck"),
    (r"(?i)content|inhalte|blog", "Inhalte ziehen organischen Traffic an"),
    (r"(?i)tracking|messbar|analytics", "Messbarkeit statt Marketing-Bauchgefühl"),
    (r"(?i)demo|trial|saas", "Demo-Pfade für B2B-Entscheider"),
    (r"(?i)shop|warenkorb|e-commerce", "Shop-Funnel für mehr Bestellungen"),
    (r"(?i)portfolio|referenz|projekt", "Referenzen überzeugen vor dem Erstgespräch"),
    (r"(?i)formular|anfrage", "Formulare qualifizieren Anfragen"),
    (r"(?i)compliance|berufsrecht|ymyl", "Compliance-sichere Online-Kommunikation"),
]


def kg_online_label(branche: str) -> str:
    keyword = KG_AUDIENCE_KEYWORD.get(branche, "Kundengewinnung")
    return f"Online {keyword}"


def kg_h1(persona_name: str, branche: str) -> str:
    return f"{kg_online_label(branche)} für {persona_name}"


def kg_meta_title(persona_name: str, branche: str) -> str:
    return f"{kg_h1(persona_name, branche)} | DEVDESIGN"


def _is_good_headline(phrase: str, *, max_len: int = 58) -> bool:
    if not phrase or phrase == "Wichtiger Vorteil":
        return False
    if phrase.endswith("…") or len(phrase) > max_len:
        return False
    lowered = phrase.lower()
    if "klassisches pain point" in lowered or lowered.startswith("generische "):
        return False
    return True


def derive_text_h2(blocks: dict[str, list[str]], branche: str, *, page_type: str) -> str:
    """Keyword-free section heading from persona Excel content."""
    pains = blocks.get("pain_point", [])
    start = 1 if page_type == "kundengewinnung" and len(pains) > 1 else 0
    for pain in pains[start:]:
        headline = benefit_headline(pain)
        if _is_good_headline(headline):
            return headline

    if page_type == "kundengewinnung":
        for funnel in blocks.get("funnel", []):
            headline = benefit_headline(funnel)
            if _is_good_headline(headline):
                return headline

    fallbacks = BRANCH_HEADLINE_SUFFIX_FALLBACKS.get(branche, ["Typische Hürden im digitalen Erstkontakt"])
    return fallbacks[start % len(fallbacks)]


def derive_hero_headline_suffix(
    blocks: dict[str, list[str]],
    branche: str,
    *,
    avoid: str,
    page_type: str,
) -> str:
    """Benefit suffix for p.hero-service-headline — from vorteil, distinct from h2."""
    avoid_norm = avoid.strip().lower()
    vorteile = blocks.get("vorteil", [])
    start = 1 if page_type == "kundengewinnung" and len(vorteile) > 1 else 0
    for vorteil in vorteile[start:]:
        suffix = benefit_headline(vorteil, max_words=6)
        if _is_good_headline(suffix, max_len=52) and suffix.lower() != avoid_norm:
            return suffix

    fallbacks = BRANCH_HEADLINE_SUFFIX_FALLBACKS.get(branche, ["Mehr qualifizierte Anfragen"])
    for i, fallback in enumerate(fallbacks):
        idx = (start + i) % len(fallbacks)
        candidate = fallbacks[idx]
        if candidate.lower() != avoid_norm:
            return candidate
    return "Mehr qualifizierte Anfragen"


def benefit_headline_short(
    text: str,
    branche: str = "",
    index: int = 0,
    max_words: int = 2,
    avoid: set[str] | None = None,
) -> str:
    """1–2 word summary for website gründe (Option D: patterns + extraction + branch fallback)."""
    avoid = avoid or set()
    clean = re.sub(r"\*\*", "", text or "").strip()
    fallbacks = BRANCH_SHORT_FALLBACKS.get(branche, ["Vorteil", "Mehrwert", "SEO", "Vertrauen"])
    candidates: list[str] = []

    if not clean:
        for j, fb in enumerate(fallbacks):
            candidate = fallbacks[(index + j) % len(fallbacks)]
            if candidate not in avoid:
                return candidate
        return fallbacks[index % len(fallbacks)]

    for pattern, headline in SHORT_HEADLINE_PATTERNS:
        if re.search(pattern, clean):
            candidates.append(" ".join(headline.split()[:max_words]))

    pct = re.search(r"(?i)(?:bis zu\s+)?(\d+(?:[.,]\d+)?)\s*(?:prozent|%)", clean)
    if pct:
        candidates.append(f"{pct.group(1).replace(',', '.')}%")

    nouns = re.findall(r"\b([A-ZÄÖÜ][a-zäöüß-]+(?:-[a-zäöüß]+)?)\b", clean)
    filtered = [n for n in nouns if n.lower() not in STOPWORDS]
    if filtered:
        candidates.append(" ".join(filtered[:max_words]))

    words = [
        w for w in re.findall(r"\b[\wäöüß-]+\b", clean)
        if w.lower() not in STOPWORDS and len(w) > 3
    ]
    if words:
        candidates.append(" ".join(words[:max_words]))

    candidates.extend(fallbacks)

    seen: set[str] = set()
    for candidate in candidates:
        if candidate in seen or candidate in avoid:
            continue
        seen.add(candidate)
        return candidate

    for j, fb in enumerate(fallbacks):
        candidate = fallbacks[(index + j) % len(fallbacks)]
        if candidate not in avoid:
            return candidate
    return fallbacks[index % len(fallbacks)]


def benefit_headline(text: str, max_words: int = 7) -> str:
    """Derive a short benefit headline from a vorteil/funnel paragraph (Option B)."""
    clean = re.sub(r"\*\*", "", text or "").strip()
    if not clean:
        return "Wichtiger Vorteil"

    for pattern, headline in HEADLINE_PATTERNS:
        if re.search(pattern, clean):
            return headline

    pct = re.search(r"(?i)(?:bis zu\s+)?(\d+(?:[.,]\d+)?)\s*(?:prozent|%)", clean)
    if pct:
        topic = "weniger Aufwand"
        if re.search(r"(?i)anruf|telefon", clean):
            topic = "weniger Telefonaufwand"
        elif re.search(r"(?i)klick|conversion|anfrage", clean):
            topic = "mehr Anfragen"
        return f"{pct.group(1).replace(',', '.')} % {topic}"

    first = re.split(r"\s[–—]\s", clean, maxsplit=1)[0]
    first = first.split(":")[0].split(".")[0].strip()
    first = re.sub(r"^(Eine|Ein|Der|Die|Das)\s+", "", first, flags=re.I)

    words = first.split()
    if len(words) > max_words:
        return " ".join(words[:max_words]).rstrip(",;:") + "…"
    if len(first) > 52:
        return first[:51].rsplit(" ", 1)[0] + "…"
    return first or "Wichtiger Vorteil"


def synthesize_summary(page_type: str, persona_name: str) -> list[str]:
    """Executive summary bullets — synthetic, not recycled Excel sentences."""
    if page_type == "website":
        return [
            f"Vertrauenswürdiger Webauftritt für {persona_name} – klar strukturiert und mobil optimiert.",
            "Inhalte und UX auf typische Entscheidungswege Ihrer Zielgruppe ausgerichtet.",
            "Technische Basis für SEO, Performance und spätere Erweiterungen gelegt.",
            "Schrittweise umsetzbar – ohne monatelangen Big-Bang-Relaunch.",
        ][:4]
    return [
        f"Digitale Akquise für {persona_name}: SEO, Landingpages und messbare Funnel-Schritte.",
        "Kanäle priorisiert, die in Ihrem Segment realistisch qualifizierte Anfragen liefern.",
        "Tracking zeigt, welche Maßnahmen Termine, Mandate oder Leads bringen.",
        "Iterative Optimierung statt einmaliger Kampagne ohne Follow-up.",
    ][:4]


class ContentPool:
    """Assign each Excel row to at most one on-page slot."""

    def __init__(self, blocks: dict[str, list[str]]):
        self.pain = list(blocks.get("pain_point", []))
        self.stats = list(blocks.get("statistik", []))
        self.vorteile = list(blocks.get("vorteil", []))
        self.funnels = list(blocks.get("funnel", []))
        self._used: set[str] = set()

    def claim(self, text: str | None) -> str | None:
        if not text or text in self._used:
            return None
        self._used.add(text)
        return text

    def take_pain(self, index: int, fallback: str = PAIN_FALLBACK) -> str:
        if index < len(self.pain):
            claimed = self.claim(self.pain[index])
            if claimed:
                return claimed
        return fallback

    def take_stat(self, indices: list[int]) -> list[str]:
        out: list[str] = []
        for i in indices:
            if i < len(self.stats):
                claimed = self.claim(self.stats[i])
                if claimed:
                    out.append(claimed)
        fi = 0
        while len(out) < 3 and fi < len(STAT_FALLBACKS):
            candidate = STAT_FALLBACKS[fi]
            fi += 1
            if candidate not in self._used:
                self._used.add(candidate)
                out.append(candidate)
        return out[:3]

    def take_vorteile_for_gruende(
        self,
        limit: int = 5,
        *,
        page_type: str = "website",
        branche: str = "",
    ) -> list[tuple[str, str]]:
        items: list[tuple[str, str]] = []
        used_titles: set[str] = set()
        for i, v in enumerate(self.vorteile):
            if v in self._used:
                continue
            self._used.add(v)
            if page_type == "website":
                title = benefit_headline_short(v, branche, i, avoid=used_titles)
            else:
                title = benefit_headline(v)
            used_titles.add(title)
            items.append((title, v))
            if len(items) >= limit:
                break
        return items

    def take_funnel(self, index: int = 0) -> str | None:
        if index < len(self.funnels):
            return self.claim(self.funnels[index])
        return None

    def take_remaining_for_faq(self, page_type: str, limit: int = 5) -> list[tuple[str, str]]:
        faqs: list[tuple[str, str]] = []

        for p in self.pain:
            if p not in self._used and len(faqs) < limit:
                self._used.add(p)
                faqs.append(("Was hält viele Anbieter in diesem Segment zurück?", p))

        for s in self.stats:
            if s not in self._used and len(faqs) < limit:
                self._used.add(s)
                faqs.append(("Warum lohnt sich der Einstieg jetzt?", s))

        for f in self.funnels:
            if f not in self._used and len(faqs) < limit:
                self._used.add(f)
                q = (
                    "Wie sieht ein typischer Akquise-Funnel aus?"
                    if page_type == "kundengewinnung"
                    else "Wie unterstützt ein Funnel Ihre Website?"
                )
                faqs.append((q, f))

        return faqs[:limit]


def build_page_content(
    page_type: str,
    persona_name: str,
    h1: str,
    meta_title: str,
    blocks: dict[str, list[str]],
    branche: str,
) -> dict:
    pool = ContentPool(blocks)
    kg_label = kg_online_label(branche)
    text_h2 = derive_text_h2(blocks, branche, page_type=page_type)
    headline_suffix = derive_hero_headline_suffix(
        blocks, branche, avoid=text_h2, page_type=page_type
    )

    if page_type == "website":
        headline = f"{h1} – {headline_suffix}"
        hero_p = (
            f"Wir gestalten Websites für {persona_name}, die Vertrauen aufbauen, "
            f"Leistungen verständlich erklären und Besucher zuverlässig zu Anfragen führen."
        )
        text_p = pool.take_pain(0)
        standards = website_standards(persona_name)
        prozess_steps = WEBSITE_PROCESS
        gruende = pool.take_vorteile_for_gruende(5, page_type="website", branche=branche)
        stat_indices = [0, 1, 2]
        gruende_title = f"Gründe für eine starke Website für {persona_name}"
        standards_title = f"Website-Standards für {persona_name}"
        prozess_title = f"So entwickeln wir Websites für {persona_name}"
        related_label = "Website & Online-Präsenz"
        sister_label = kg_label
        sister_desc = "Funnels, SEO und Terminbuchung für mehr qualifizierte Anfragen."
        faq_topic = "Websites"
    else:
        h1 = kg_h1(persona_name, branche)
        meta_title = kg_meta_title(persona_name, branche)
        headline = f"{h1} – {headline_suffix}"
        hero_p = (
            f"Wir planen digitale Akquise für {persona_name}: von SEO und Landingpages "
            f"über Terminbuchung bis zu Funnels, die Anfragen vorqualifizieren."
        )
        text_p = pool.take_funnel(0) or pool.take_pain(0, FUNNEL_FALLBACK)
        standards = kg_standards(persona_name)
        prozess_steps = KG_PROCESS
        gruende = [(h, b) for h, b in kg_gruende(branche, persona_name)]
        for title, body in gruende:
            pool._used.add(body)
        stat_indices = [3, 4, 5]
        gruende_title = f"Gründe für {kg_label} für {persona_name}"
        standards_title = f"{kg_label} – unsere Standards für {persona_name}"
        prozess_title = f"So bauen wir Akquise-Systeme für {persona_name}"
        related_label = kg_label
        sister_label = "Website & Online-Präsenz"
        sister_desc = "Professionelle Webauftritte, die Vertrauen schaffen und Besucher ansprechen."
        faq_topic = kg_label

    zusammen = synthesize_summary(page_type, persona_name)
    stat_items = pool.take_stat(stat_indices)

    faq_qs = pool.take_remaining_for_faq(page_type, limit=3)
    faq_qs.append(
        (
            "Wie starten wir am sinnvollsten?",
            f"In einem Erstgespräch priorisieren wir gemeinsam die nächsten Schritte – "
            f"abgestimmt auf Zielgruppe und Ressourcen bei {persona_name}.",
        )
    )
    faq_qs.append(
        (
            "Arbeitet DEVDESIGN auch langfristig?",
            "Ja. Wir begleiten Relaunch, SEO, Conversion-Optimierung und neue Funktionen als Partner – "
            "nicht nur als Einmal-Projekt.",
        )
    )
    faq_qs = faq_qs[:5]

    while len(gruende) < 4:
        filler_body = (
            f"Eine durchdachte digitale Präsenz stärkt {persona_name} "
            f"im Wettbewerb um den digitalen Erstkontakt."
        )
        if filler_body not in pool._used:
            pool._used.add(filler_body)
            if page_type == "website":
                filler_title = benefit_headline_short(filler_body, branche, len(gruende))
            else:
                filler_title = benefit_headline(filler_body)
            gruende.append((filler_title, filler_body))

    return {
        "h1": h1,
        "meta_title": meta_title,
        "meta_description": _meta_description(meta_title, pool.pain, pool.vorteile),
        "headline": headline,
        "hero_p": hero_p,
        "text_h2": text_h2,
        "text_p": text_p,
        "zusammen": zusammen,
        "standards_title": standards_title,
        "standards": standards,
        "stat_items": stat_items,
        "prozess_title": prozess_title,
        "prozess_steps": prozess_steps,
        "gruende_title": gruende_title,
        "gruende": gruende,
        "faq_topic": faq_topic,
        "faq_qs": faq_qs,
        "related_label": related_label,
        "sister_label": sister_label,
        "sister_desc": sister_desc,
        "contact_p": (
            f"Sie möchten {persona_name} digital stärker aufstellen? "
            f"Wir helfen beim Sortieren, Priorisieren und Umsetzen."
        ),
    }


def _meta_description(meta_title: str, pain_points: list[str], vorteile: list[str]) -> str:
    base = meta_title.split("|")[0].strip()
    detail = pain_points[0] if pain_points else (vorteile[0] if vorteile else "")
    desc = f"{base}. {detail}" if detail else base
    if "DEVDESIGN" not in desc:
        desc = f"{desc} — DEVDESIGN Berlin."
    if len(desc) > 160:
        desc = desc[:157].rstrip(" ,.;—") + "…"
    return desc
