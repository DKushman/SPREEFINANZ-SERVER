/**
 * Build public/sitemap.xml from canonical URLs in source HTML (excludes dist/).
 * Omits pages with noindex in meta robots.
 */
import { readdirSync, readFileSync, statSync, writeFileSync, mkdirSync, chmodSync } from 'fs';
import { join, relative } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const ROOT = join(__dirname, '..');
const PUBLIC = join(ROOT, 'public');
const OUT = join(PUBLIC, 'sitemap.xml');
const BASE = 'https://devdesignstudio.de';

/** Legacy branch overviews replaced by the 5 new category pages. */
const LEGACY_BRANCH_PATHS = new Set([
  '/leistungen/gesundheits-wellness',
  '/leistungen/kanzleien-berater',
  '/leistungen/planung-design',
  '/leistungen/produkte-lifestyle',
  '/leistungen/technologie-finanz',
]);

function shouldIncludeInSitemap(canonicalUrl) {
  let path;
  try {
    path = new URL(canonicalUrl).pathname.replace(/\/+$/, '') || '/';
  } catch {
    return false;
  }

  // Old persona/service URLs under /leistungsunterpunkte/ — canonical persona pages use /leistungen/…
  if (path.startsWith('/leistungsunterpunkte/')) {
    return false;
  }

  if (LEGACY_BRANCH_PATHS.has(path)) {
    return false;
  }

  return true;
}

const skipDirs = new Set(['node_modules', 'dist', 'MEDIA CDN']);

function walkHtmlFiles(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    let st;
    try {
      st = statSync(full);
    } catch {
      continue;
    }
    if (st.isDirectory()) {
      if (skipDirs.has(name)) continue;
      walkHtmlFiles(full, out);
    } else if (name.endsWith('.html')) {
      if (name === 'index backup.html' || name === 'unterpunkte-standard.html') continue;
      out.push(full);
    }
  }
  return out;
}

function hasNoindex(html) {
  const m = html.match(/<meta\s+name="robots"\s+content="([^"]*)"/i);
  if (!m) return false;
  return /\bnoindex\b/i.test(m[1]);
}

function extractCanonical(html) {
  const m = html.match(/<link\s+rel="canonical"\s+href="([^"]+)"/i);
  return m ? m[1].trim() : null;
}

function escapeXmlUrl(url) {
  return url
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function main() {
  const files = walkHtmlFiles(ROOT);
  const urls = new Set();

  for (const abs of files) {
    const raw = readFileSync(abs, 'utf8');
    if (!raw.includes('<!DOCTYPE html>')) continue;
    if (hasNoindex(raw)) continue;

    const loc = extractCanonical(raw);
    if (!loc) {
      console.warn('skip (no canonical):', relative(ROOT, abs));
      continue;
    }
    if (!loc.startsWith(BASE)) {
      console.warn('skip (unexpected host):', loc, relative(ROOT, abs));
      continue;
    }
    if (!shouldIncludeInSitemap(loc)) {
      continue;
    }
    urls.add(loc);
  }

  const sorted = [...urls].sort();
  const today = new Date().toISOString().slice(0, 10);

  const body = sorted
    .map(
      (u) => `  <url>
    <loc>${escapeXmlUrl(u)}</loc>
    <lastmod>${today}</lastmod>
  </url>`
    )
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`;

  mkdirSync(PUBLIC, { recursive: true });
  writeFileSync(OUT, xml, 'utf8');
  chmodSync(OUT, 0o644);
  console.log(`sitemap: ${sorted.length} URLs -> ${relative(ROOT, OUT)}`);
}

main();
