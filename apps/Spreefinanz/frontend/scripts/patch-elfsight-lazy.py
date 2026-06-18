#!/usr/bin/env python3
"""Lazy-load Elfsight on homepage feeds only (viewport + consent)."""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

# Remove cookie-blocker script stub; keep widget div + lazy loader script before </body>.
BLOCKED_SCRIPT_RE = re.compile(
    r'\s*<script async="" data-ehcookieblocker="other" '
    r'data-ehcookieblocker-src="https://elfsightcdn\.com/platform\.js" '
    r'src="[^"]*" type="text/plaintext"></script>',
    re.I,
)

LAZY_LOADER_DE = '<script defer src="assets/local-head/elfsight-lazy.js"></script>'
LAZY_LOADER_ENG = '<script defer src="../assets/local-head/elfsight-lazy.js"></script>'


def patch_file(path: Path) -> bool:
    text = path.read_text(encoding="utf-8", errors="ignore")
    if "elfsight-app-2c971556" not in text:
        return False

    updated = BLOCKED_SCRIPT_RE.sub("", text)
    loader = LAZY_LOADER_ENG if "/ENG/" in path.as_posix() else LAZY_LOADER_DE
    if loader not in updated:
        updated = updated.replace(
            "<script defer src=\"main.7a280948f1e2.js\"></script>",
            "<script defer src=\"main.7a280948f1e2.js\"></script>\n" + loader,
        )
        updated = updated.replace(
            "<script defer src=\"../main.7a280948f1e2.js\"></script>",
            "<script defer src=\"../main.7a280948f1e2.js\"></script>\n" + loader,
        )

    if updated != text:
        path.write_text(updated, encoding="utf-8")
        return True
    return False


def main() -> None:
    changed = 0
    for path in sorted(ROOT.rglob("*.html")):
        if "_assets/external" in path.as_posix():
            continue
        if patch_file(path):
            changed += 1
            print("patched", path.relative_to(ROOT))
    print(f"Done: {changed} file(s).")


if __name__ == "__main__":
    main()
