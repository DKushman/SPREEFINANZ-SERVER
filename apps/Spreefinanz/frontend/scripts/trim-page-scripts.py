#!/usr/bin/env python3
"""Remove unnecessary script tags from static HTML exports."""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SKIP_PARTS = ("_assets/external",)

BRIDGE_RE = re.compile(
    r'<script[^>]*src="[^"]*digidor-local-bridge[^"]*"[^>]*>\s*</script>\s*',
    re.I,
)
MINIFIED_RE = re.compile(
    r'<script[^>]*src="[^"]*minified\.js[^"]*"[^>]*>\s*</script>\s*',
    re.I,
)

NEEDS_ANALYSIS_WIDGET = (
    "_assets/external/cdn.digidor.de/content/js/"
    "minified.js__q_user_19259_landingpage_0_data_"
    "W3sidCI6MSwiaSI6MzEsInAiOltdLCJjIjoiZjkxN2Q2OTcifSx7InQiOjEsImkiOjcsInAiOnsidXNlciI6MTkyNTl9LCJjIjoiMjFmYTA0MDEifV0_3D.php"
)
NEEDS_ANALYSIS_TAG = (
    f'<script charset="UTF-8" data-ehcookieblocker-obligatory="" '
    f'defer src="{NEEDS_ANALYSIS_WIDGET}"></script>'
)


def should_skip(path: Path) -> bool:
    rel = path.as_posix()
    return any(part in rel for part in SKIP_PARTS)


def trim_html(text: str, path: Path) -> tuple[str, dict[str, int]]:
    stats = {"bridge_removed": 0, "minified_removed": 0, "minified_kept": 0}

    new_text, n = BRIDGE_RE.subn("", text)
    stats["bridge_removed"] = n

    if path.name == "absicherungsbedarf_ermitteln.html":
        new_text, n = MINIFIED_RE.subn("", new_text)
        stats["minified_removed"] = n
        marker = '<script data-ehcookieblocker-obligatory="">'
        if NEEDS_ANALYSIS_WIDGET not in new_text and marker in new_text:
            new_text = new_text.replace(marker, NEEDS_ANALYSIS_TAG + marker, 1)
            stats["minified_kept"] = 1
    else:
        new_text, n = MINIFIED_RE.subn("", new_text)
        stats["minified_removed"] = n

    return new_text, stats


def main() -> None:
    totals = {"files": 0, "bridge_removed": 0, "minified_removed": 0, "minified_kept": 0}
    for path in sorted(ROOT.rglob("*.html")):
        if should_skip(path):
            continue
        original = path.read_text(encoding="utf-8", errors="ignore")
        updated, stats = trim_html(original, path)
        if updated != original:
            path.write_text(updated, encoding="utf-8")
            totals["files"] += 1
            for key in ("bridge_removed", "minified_removed", "minified_kept"):
                totals[key] += stats[key]

    print(
        f"Updated {totals['files']} files — "
        f"removed {totals['bridge_removed']} bridge tags, "
        f"{totals['minified_removed']} minified tags, "
        f"kept {totals['minified_kept']} widget bundle(s)."
    )


if __name__ == "__main__":
    main()
