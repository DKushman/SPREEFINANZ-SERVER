#!/usr/bin/env python3
"""Apply performance roadmap patches across static HTML exports."""
from __future__ import annotations

import re
from pathlib import Path

FRONTEND = Path(__file__).resolve().parents[1]
SKIP_PARTS = ("_assets/external", "node_modules", ".git")
STYLE2 = "style2.d4510679bb7f.css"
STYLE_MAIN = "style.d91abdee017b.css"
CRITICAL_CSS = "assets/local-head/critical-above-fold.css"
HEAD_STYLE_03 = "head-style-03.7b4d7ffb4b0e.css"
PRECONNECT = '<link rel="preconnect" href="https://res.cloudinary.com" crossorigin>'
CLOUDINARY_UPLOAD = re.compile(
    r"(https://res\.cloudinary\.com/dqcdbdt4v/image/upload/)(?!f_auto)(?!c_limit)(?!w_\d)(?!h_\d)(spreefinanz/)"
)
MINIFIED_CSS = re.compile(
    r'<link[^>]+href="[^"]*minified\.css[^"]*"[^>]*/?>',
    re.IGNORECASE,
)
STYLE2_BLOCKING = re.compile(
    rf'<link\b(?![^>]*\bmedia="print")(?![^>]*\bonload=)[^>]*href="((?:\.\./)*){re.escape(STYLE2)}"[^>]*/?>'
    rf'|<link\b(?![^>]*\bmedia="print")(?![^>]*\bonload=)[^>]*rel="stylesheet"[^>]*href="((?:\.\./)*){re.escape(STYLE2)}"[^>]*/?>',
    re.IGNORECASE,
)
STYLE_MAIN_BLOCKING = re.compile(
    rf'<link\b(?![^>]*\bmedia="print")(?![^>]*\bonload=)[^>]*href="((?:\.\./)*){re.escape(STYLE_MAIN)}"[^>]*/?>'
    rf'|<link\b(?![^>]*\bmedia="print")(?![^>]*\bonload=)[^>]*rel="stylesheet"[^>]*href="((?:\.\./)*){re.escape(STYLE_MAIN)}"[^>]*/?>',
    re.IGNORECASE,
)
HEAD_STYLE_03_BLOCKING = re.compile(
    rf'<link\b(?![^>]*\bmedia="print")(?![^>]*\bonload=)[^>]*href="((?:\.\./)*)assets/local-head/{re.escape(HEAD_STYLE_03)}"[^>]*/?>',
    re.IGNORECASE,
)
IMG_TAG = re.compile(r"<img\b[^>]*>", re.IGNORECASE)


def should_skip(path: Path) -> bool:
    s = str(path)
    return any(part in s for part in SKIP_PARTS)


def defer_style2(text: str) -> tuple[str, bool]:
    changed = False

    def repl(m: re.Match[str]) -> str:
        nonlocal changed
        tag = m.group(0)
        if 'media="print"' in tag or "onload=" in tag:
            return tag
        start = m.start()
        before = text[:start]
        if before.rfind("<noscript>") > before.rfind("</noscript>"):
            return tag
        prefix = m.group(1) or m.group(2) or ""
        changed = True
        href = f"{prefix}{STYLE2}"
        return (
            f'<link href="{href}" media="print" onload="this.media=\'all\'" rel="stylesheet"/>\n'
            f'    <noscript><link href="{href}" rel="stylesheet"/></noscript>'
        )

    new_text = STYLE2_BLOCKING.sub(repl, text)
    return new_text, changed


def fix_broken_style2_noscript(text: str) -> tuple[str, bool]:
    broken = re.compile(
        rf'<noscript><link href="((?:\.\./)*){re.escape(STYLE2)}" media="print" onload="this\.media=\'all\'" rel="stylesheet"/>\s*'
        rf'<noscript><link href="\1{re.escape(STYLE2)}" rel="stylesheet"/></noscript></noscript>',
        re.IGNORECASE,
    )

    def repl(m: re.Match[str]) -> str:
        prefix = m.group(1)
        href = f"{prefix}{STYLE2}"
        return f'<noscript><link href="{href}" rel="stylesheet"/></noscript>'

    new_text, n = broken.subn(repl, text)
    return new_text, n > 0


def _inside_noscript(text: str, pos: int) -> bool:
    before = text[:pos]
    return before.rfind("<noscript>") > before.rfind("</noscript>")


def defer_stylesheet(
    text: str,
    pattern: re.Pattern[str],
    css_name: str,
    *,
    include_critical: bool = False,
) -> tuple[str, bool]:
    changed = False

    def repl(m: re.Match[str]) -> str:
        nonlocal changed
        tag = m.group(0)
        if 'media="print"' in tag or "onload=" in tag:
            return tag
        if _inside_noscript(text, m.start()):
            return tag
        prefix = m.group(1) or ""
        changed = True
        href = f"{prefix}{css_name}"
        critical = ""
        if include_critical:
            crit_href = f"{prefix}{CRITICAL_CSS}"
            if crit_href not in text:
                critical = f'<link href="{crit_href}" rel="stylesheet"/>\n    '
        deferred = (
            f'{critical}<link href="{href}" media="print" '
            f'onload="this.media=\'all\'" rel="stylesheet"/>\n'
            f'    <noscript><link href="{href}" rel="stylesheet"/></noscript>'
        )
        return deferred

    return pattern.sub(repl, text), changed


def defer_main_style(text: str) -> tuple[str, bool]:
    if CRITICAL_CSS in text and f'media="print"' in text and STYLE_MAIN in text:
        # Already patched if main style is deferred and critical linked.
        if re.search(
            rf'href="(?:\.\./)*{re.escape(STYLE_MAIN)}" media="print"',
            text,
            re.I,
        ):
            return text, False
    return defer_stylesheet(text, STYLE_MAIN_BLOCKING, STYLE_MAIN, include_critical=True)


def defer_head_style_03(text: str) -> tuple[str, bool]:
    return defer_stylesheet(
        text,
        HEAD_STYLE_03_BLOCKING,
        f"assets/local-head/{HEAD_STYLE_03}",
        include_critical=False,
    )


def remove_minified_css(text: str) -> tuple[str, bool]:
    new_text, n = MINIFIED_CSS.subn("", text)
    return new_text, n > 0


def add_preconnect(text: str) -> tuple[str, bool]:
    if "res.cloudinary.com" in text and "preconnect" in text:
        return text, False
    marker = "<head>"
    if marker not in text:
        return text, False
    return text.replace(marker, f"{marker}\n{PRECONNECT}", 1), True


def optimize_cloudinary_urls(text: str) -> tuple[str, bool]:
    new_text, n = CLOUDINARY_UPLOAD.subn(r"\1f_auto,q_auto/\2", text)
    return new_text, n > 0


def should_skip_lazy(img_tag: str) -> bool:
    lower = img_tag.lower()
    if "loading=" in lower:
        return True
    if 'fetchpriority="high"' in lower or "lcp-hero-image" in lower:
        return True
    if ".svg" in lower:
        return True
    if "whatsapplogo" in lower:
        return True
    w = re.search(r'\bwidth="(\d+)"', img_tag, re.I)
    h = re.search(r'\bheight="(\d+)"', img_tag, re.I)
    if w and h and int(w.group(1)) <= 64 and int(h.group(1)) <= 64:
        return True
    return False


def add_lazy_loading(text: str) -> tuple[str, bool]:
    changed = False
    first_designstage_seen = False

    def repl(m: re.Match[str]) -> str:
        nonlocal changed, first_designstage_seen
        tag = m.group(0)
        if should_skip_lazy(tag):
            return tag
        # First hero designstage images often load via CSS background; skip early logos in header.
        if 'class="indistyle' in tag or "sitetitle_img" in tag:
            return tag
        if 'designstage_background' in text[max(0, m.start() - 120) : m.start()]:
            if not first_designstage_seen:
                first_designstage_seen = True
                return tag
        changed = True
        if tag.endswith("/>"):
            return tag[:-2] + ' loading="lazy" decoding="async"/>'
        return tag[:-1] + ' loading="lazy" decoding="async">'

    new_text = IMG_TAG.sub(repl, text)
    return new_text, changed


def patch_file(path: Path) -> dict[str, bool]:
    text = path.read_text(encoding="utf-8")
    orig = text
    flags: dict[str, bool] = {}

    text, flags["style2_noscript_fix"] = fix_broken_style2_noscript(text)
    # Main stylesheet must stay render-blocking — async load caused CLS > 1 in Lighthouse.
    # text, flags["style_main"] = defer_main_style(text)
    text, flags["head_style_03"] = defer_head_style_03(text)
    text, flags["style2"] = defer_style2(text)
    text, flags["minified"] = remove_minified_css(text)
    text, flags["preconnect"] = add_preconnect(text)
    text, flags["cloudinary"] = optimize_cloudinary_urls(text)
    text, flags["lazy"] = add_lazy_loading(text)

    if text != orig:
        path.write_text(text, encoding="utf-8")
    return flags


def main() -> None:
    html_files = sorted(FRONTEND.rglob("*.html"))
    totals = {
        "files": 0,
        "style_main": 0,
        "head_style_03": 0,
        "style2": 0,
        "style2_noscript_fix": 0,
        "minified": 0,
        "preconnect": 0,
        "cloudinary": 0,
        "lazy": 0,
    }
    for path in html_files:
        if should_skip(path):
            continue
        flags = patch_file(path)
        if any(flags.values()):
            totals["files"] += 1
            rel = path.relative_to(FRONTEND)
            applied = ",".join(k for k, v in flags.items() if v)
            print(f"updated {rel}: {applied}")
            for k, v in flags.items():
                if v:
                    totals[k] += 1
    print(
        f"\nDone. {totals['files']} files changed "
        f"(style_main={totals['style_main']}, head_style_03={totals['head_style_03']}, "
        f"style2={totals['style2']}, minified={totals['minified']}, "
        f"preconnect={totals['preconnect']}, cloudinary={totals['cloudinary']}, lazy={totals['lazy']})"
    )


if __name__ == "__main__":
    main()
