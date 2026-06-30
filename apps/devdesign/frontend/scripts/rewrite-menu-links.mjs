/**
 * Replace internal links that point at /menu/* hubs with canonical root paths (/blog, …).
 * Only touches *.html outside dist/.
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const ROOT = join(__dirname, '..');
const skipDirs = new Set(['node_modules', 'dist', 'MEDIA CDN']);

const HUBS = ['blog', 'portfolio', 'kontakt', 'team', 'impressum', 'datenschutz'];

function walk(dir, out = []) {
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
      walk(full, out);
    } else if (name.endsWith('.html')) {
      out.push(full);
    }
  }
  return out;
}

function rewriteHtml(html) {
  let s = html;
  for (const hub of HUBS) {
    // Absolute /menu/hub
    s = s.replaceAll(`href="/menu/${hub}"`, `href="/${hub}"`);
    s = s.replaceAll(`href='/menu/${hub}'`, `href='/${hub}'`);
    // Relative …/menu/hub (any depth)
    const reRel = new RegExp(`href="((?:\\.\\./)+)menu/${hub}"`, 'g');
    s = s.replace(reRel, `href="/${hub}"`);
    const reRel2 = new RegExp(`href='((?:\\.\\./)+)menu/${hub}'`, 'g');
    s = s.replace(reRel2, `href='/${hub}'`);
    // index-style menu/hub (no leading slash)
    s = s.replaceAll(`href="menu/${hub}"`, `href="/${hub}"`);
    s = s.replaceAll(`href='menu/${hub}'`, `href='/${hub}'`);
  }
  return s;
}

function main() {
  const files = walk(ROOT);
  let n = 0;
  for (const abs of files) {
    const raw = readFileSync(abs, 'utf8');
    const next = rewriteHtml(raw);
    if (next !== raw) {
      writeFileSync(abs, next, 'utf8');
      n++;
    }
  }
  console.log(`rewrote menu hub links in ${n} files`);
}

main();
