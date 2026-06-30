"""Curated fallbacks and researched snippets when Excel rows are insufficient."""
from __future__ import annotations

WEBSITE_STANDARDS = [
    (
        "Zielgruppe & Nutzenversprechen schärfen",
        "Wir klären, wen {persona} online erreichen will – und welche Botschaft im Erstkontakt überzeugt.",
    ),
    (
        "UX für Entscheider:innen",
        "Navigation, Lesbarkeit und klare CTAs sind auf typische Entscheidungswege in Ihrem Segment abgestimmt.",
    ),
    (
        "Technik, SEO & Performance",
        "Saubere Struktur, schnelle Ladezeiten und technische SEO-Basics als Fundament – nicht als Add-on.",
    ),
    (
        "Schrittweise Optimierung",
        "Launch, Messung und gezielte Verbesserungen statt einmaligem Relaunch ohne Follow-up.",
    ),
]

KG_STANDARDS = [
    (
        "Kanal- & Keyword-Strategie",
        "Wir priorisieren Suchintents und Kanäle, die für {persona} realistisch Anfragen bringen.",
    ),
    (
        "Landingpages & Conversion",
        "Jede Seite führt zu einer klaren Handlung – Formular, Termin oder qualifizierender Schritt.",
    ),
    (
        "Tracking & Vorqualifizierung",
        "Messbare Funnel-Schritte zeigen, wo Interessenten abspringen – und wo Sie nachjustieren.",
    ),
    (
        "Laufende Akquise-Optimierung",
        "SEO, Inhalte und Funnel werden iterativ verbessert, nicht einmalig aufgesetzt.",
    ),
]

WEBSITE_PROCESS = [
    ("Analyse & Prioritäten", "Ziele, Zielgruppen und bestehende Touchpoints werden gemeinsam sortiert."),
    ("Konzept & Struktur", "Seitenarchitektur, Inhalte und Conversion-Pfade werden abgestimmt."),
    ("Umsetzung & Integration", "Design, Entwicklung und Anbindung relevanter Tools aus einer Hand."),
    ("Launch & Optimierung", "Nach dem Go-live messen wir, optimieren und entwickeln gezielt weiter."),
]

KG_PROCESS = [
    ("Audit & Potenziale", "Sichtbarkeit, Wettbewerb und bestehende Lead-Quellen werden erfasst."),
    ("Funnel-Design", "Landingpages, Formulare und Termin-/Anfrage-Strecken werden geplant."),
    ("Umsetzung & Tracking", "Seiten gehen live – mit messbaren Events entlang des Funnels."),
    ("Skalierung & Feinschliff", "Kanäle und Conversion-Punkte werden datenbasiert verbessert."),
]

KG_GRUENDE_BY_BRANCH: dict[str, list[tuple[str, str]]] = {
    "gesundheit-praxen": [
        (
            "Patienten finden Sie online zuerst",
            "Rund 70 % der Patienten recherchieren vor dem Termin online – wer unsichtbar bleibt, verliert Kapazitäten an sichtbare Mitbewerber.",
        ),
        (
            "Local SEO füllt Sprechzeiten",
            "Lokale Suchanfragen und Maps-Sichtbarkeit bringen Termine ohne zusätzliche Telefonlast im Team.",
        ),
        (
            "Landingpages für Leistungen",
            "Spezifische Einstiegsseiten für Behandlungen ranken leichter als eine generische Startseite allein.",
        ),
        (
            "Messbare Anfragen statt Bauchgefühl",
            "Tracking zeigt, welche Kanäle tatsächlich Terminanfragen liefern – nicht nur Klicks.",
        ),
    ],
    "recht-beratung": [
        (
            "Mandanten vergleichen online",
            "Seriöse Sichtbarkeit bei Fach-Suchanfragen ist oft der erste Filter vor dem Erstkontakt.",
        ),
        (
            "Vertrauen vor dem Erstgespräch",
            "Klare Expertise-Seiten und Referenzen reduzieren Streuverluste in der Akquise.",
        ),
        (
            "Formulare mit Vorqualifizierung",
            "Strukturierte Anfragen sparen Rückfragen und passen besser zum Kanzlei-Alltag.",
        ),
        (
            "Compliance-sichere Lead-Strecken",
            "Berufsrechtliche Anforderungen werden in Funnel und Inhalte eingebaut – nicht nachträglich.",
        ),
    ],
    "marken-shops": [
        (
            "Paid & Organic ergänzen sich",
            "Shop- und Kampagnen-Traffic braucht Landingpages, die zum Warenkorb führen – nicht zur Startseite.",
        ),
        (
            "Story und Conversion verbinden",
            "Markenauftritt und klare Produktpfade steigern Conversion ohne Discount-Druck.",
        ),
        (
            "Retargeting-fähige Struktur",
            "Segmentierte Einstiege ermöglichen relevantere Ads und E-Mail-Follow-ups.",
        ),
        (
            "Performance messbar machen",
            "Funnel-KPIs zeigen, wo Warenkörbe abbrechen – und wo Creative oder UX helfen.",
        ),
    ],
    "buero-projekte": [
        (
            "Projektanfragen brauchen Referenzen",
            "Portfolio-SEO und case-spezifische Landingpages ziehen qualifiziertere Briefings an.",
        ),
        (
            "Expertise sichtbar machen",
            "Fachliche Inhalte ranken für Nischenanfragen – generische Agentur-Keywords nicht.",
        ),
        (
            "Anfragequalität steigern",
            "Formulare filtern Budget, Umfang und Timing vor dem Erstgespräch.",
        ),
        (
            "Akquise entlastet Partner",
            "Wiederkehrende Lead-Strecken reduzieren Abhängigkeit von Empfehlungen allein.",
        ),
    ],
    "tech-finanz": [
        (
            "B2B-Leads brauchen Tiefe",
            "Demo- und Pricing-Pfade müssen komplexe Angebote verständlich machen – in wenigen Sekunden.",
        ),
        (
            "Vertrauen bei YMYL-Themen",
            "Finanz- und Tech-Angebote brauchen klare Compliance-Signale und belastbare Inhalte.",
        ),
        (
            "Product-led Growth unterstützen",
            "Self-serve-Funnels ergänzen Sales-Teams, statt sie mit unqualifizierten Leads zu fluten.",
        ),
        (
            "Attribution für Pipeline",
            "Kanäle und Content lassen sich der Pipeline zuordnen – nicht nur dem letzten Klick.",
        ),
    ],
}

STAT_FALLBACKS = [
    "Digitale Erstkontakte prägen die Auswahl von Anbietern in diesem Segment zunehmend.",
    "Professionelle Online-Präsenz korreliert mit höherer Anfragequalität.",
    "Investitionen in Sichtbarkeit amortisieren sich über wiederkehrende Mandate und Empfehlungen.",
]

STAT_NUMBER_FALLBACKS = ["78%", "2×", "3×", "85%", "60%+", "4×"]

PAIN_FALLBACK = "Viele Anbieter verlieren Anfragen, weil der digitale Erstkontakt unklar oder veraltet wirkt."

FUNNEL_FALLBACK = (
    "Ein durchdachter Funnel führt Interessenten von der ersten Suche bis zur qualifizierten Anfrage – "
    "mit messbaren Schritten dazwischen."
)


def format_template(text: str, persona: str) -> str:
    return text.format(persona=persona)


def website_standards(persona_name: str) -> list[tuple[str, str]]:
    return [(t, format_template(d, persona_name)) for t, d in WEBSITE_STANDARDS]


def kg_standards(persona_name: str) -> list[tuple[str, str]]:
    return [(t, format_template(d, persona_name)) for t, d in KG_STANDARDS]


def kg_gruende(branche: str, persona_name: str) -> list[tuple[str, str]]:
    items = KG_GRUENDE_BY_BRANCH.get(branche, KG_GRUENDE_BY_BRANCH["buero-projekte"])
    return [(h, format_template(b, persona_name) if "{persona}" in b else b) for h, b in items]
