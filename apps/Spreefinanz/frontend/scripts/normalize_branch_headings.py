#!/usr/bin/env python3
"""Normalize headings in SpreeFinanz HTML: first heading in scope becomes h1, others keep relative depth."""
from __future__ import annotations

import re
from pathlib import Path


FRONTEND = Path(__file__).resolve().parents[1]

OPEN_HEADING = re.compile(r"<h([1-6])(\b[^>]*)>", re.IGNORECASE)


def extract_main_regions(html: str) -> tuple[str | None, str | None, str]:
    """Return (before, main_fragment, after) for ###maincontent### block, or seo-landing <main>.

    Fallback: empty — caller skips.
    """
    m_mc = re.search(
        r"(.*)(<!--###maincontent### begin -->)(.*?)(<!--###maincontent### end -->)(.*)",
        html,
        re.DOTALL,
    )
    if m_mc:
        before = m_mc.group(1) + m_mc.group(2)
        frag = m_mc.group(3)
        after = m_mc.group(4) + m_mc.group(5)
        return before, frag, after

    # New layout: first <main id="seo-landing-content"> ... </main>
    m_main = re.search(
        r"(.*)(<main\b[^>]*\bid\s*=\s*[\"']seo-landing-content[\"'][^>]*>)(.*?)(</main>)(.*)",
        html,
        re.DOTALL | re.IGNORECASE,
    )
    if m_main:
        before = m_main.group(1) + m_main.group(2)
        frag = m_main.group(3)
        after = m_main.group(4) + m_main.group(5)
        return before, frag, after

    return None, None, html


def _iter_heading_blocks(fragment: str):
    """Yield (start, end, old_lvl, attrs, inner) for each hx block; linear scan."""
    pos = 0
    while True:
        m = OPEN_HEADING.search(fragment, pos)
        if not m:
            return
        old_lvl = int(m.group(1))
        attrs = m.group(2)
        start = m.start()
        inner_start = m.end()
        close_re = re.compile(rf"</h{old_lvl}\s*>", re.IGNORECASE)
        mc = close_re.search(fragment, inner_start)
        if not mc:
            pos = start + 1  # malformed / truncated tag; skip this "<h" and continue
            continue
        inner = fragment[inner_start : mc.start()]
        end = mc.end()
        yield start, end, old_lvl, attrs, inner
        pos = end


def normalize_headings(fragment: str) -> tuple[str, bool]:
    """First heading → h1; follow headings keep deltas but never skip more than one level.

    Turns e.g. h1 → h3 → h3 into h1 → h2 → h2.
    """
    blocks = list(_iter_heading_blocks(fragment))
    if not blocks:
        return fragment, False

    old_levels = [b[2] for b in blocks]
    new_levels: list[int] = [0] * len(blocks)
    new_levels[0] = 1
    for i in range(1, len(blocks)):
        cand = new_levels[i - 1] + (old_levels[i] - old_levels[i - 1])
        if cand > new_levels[i - 1] + 1:
            cand = new_levels[i - 1] + 1
        new_levels[i] = max(2, min(6, cand))

    out: list[str] = []
    pos = 0
    changed = False
    for i, (start, end, old, attrs, body) in enumerate(blocks):
        new = new_levels[i]
        out.append(fragment[pos:start])
        if old != new:
            changed = True
        out.append(f"<h{new}{attrs}>{body}</h{new}>")
        pos = end

    out.append(fragment[pos:])
    return "".join(out), changed


def menu_branch_files() -> list[Path]:
    wf = FRONTEND / "unfallversicherung.html"
    wf_txt = wf.read_text(encoding="utf-8", errors="replace")

    def branch_hrefs_between(start_id: str, end_id: str) -> set[str]:
        pat = re.compile(
            re.escape('id="' + start_id + '"')
            + r".*?"
            + re.escape('id="' + end_id + '"'),
            re.DOTALL,
        )
        m = pat.search(wf_txt)
        if not m:
            return set()
        return set(re.findall(r'href="([^"#?]+\.html)"', m.group(0)))

    ef = FRONTEND / "ENG" / "private_accident_insurance.html"
    ef_txt = ef.read_text(encoding="utf-8", errors="replace")

    def branch_en(start_id: str, end_id: str) -> set[str]:
        pat = re.compile(
            re.escape('id="' + start_id + '"')
            + r".*?"
            + re.escape('id="' + end_id + '"'),
            re.DOTALL,
        )
        m = pat.search(ef_txt)
        if not m:
            return set()
        return set(re.findall(r'href="([^"#?]+\.html)"', m.group(0)))

    de = branch_hrefs_between("page-1241193", "page-1241194") | branch_hrefs_between(
        "page-1241194", "page-1241195"
    )
    en = branch_en("page-1311286", "page-1311303") | branch_en(
        "page-1311303", "page-1241840"
    )

    paths: list[Path] = []
    for href in sorted(de):
        p = FRONTEND / href
        if p.is_file():
            paths.append(p)
    for href in sorted(en):
        p = FRONTEND / "ENG" / href
        if p.is_file():
            paths.append(p)
    return paths


def main() -> None:
    files = menu_branch_files()
    changed_files: list[str] = []
    for path in sorted(files):
        html = path.read_text(encoding="utf-8", errors="replace")
        before, frag, after = extract_main_regions(html)
        if before is None or frag is None:
            continue
        new_frag, did = normalize_headings(frag)
        if did:
            path.write_text(before + new_frag + after, encoding="utf-8")
            changed_files.append(str(path.relative_to(FRONTEND)))

    print(f"Normalized headings in {len(changed_files)} file(s)")
    for f in changed_files:
        print(" ", f)


if __name__ == "__main__":
    main()
