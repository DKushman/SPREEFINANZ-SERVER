#!/usr/bin/env node
/**
 * Inserts submenu item "Rechtsschutz Expats" under "Deutsche im Ausland"
 * (after Haftpflichtversicherung) into DE pages using menutype4.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FRONTEND = path.resolve(__dirname, '..');

const NEW_ITEM =
  '<li class="menusubitem" id="page-1290200" role="none"><a aria-label="Rechtsschutz Expats" href="rechtsschutz_expats" id="page-1290200-link" role="menuitem">Rechtsschutz Expats</a><span class="submenutoggle"></span></li>';

const INSERT_RE = new RegExp(
  '(id="page-1241298-link"[^>]*>Haft[­\\s]*pflichtversicherung</a><span class="submenutoggle"></span></li>)' +
    '(<li class="menusubitem[^"]*" id="page-1241299")',
  'g'
);

function collectHtmlFiles(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (['_assets', 'node_modules', '.git', 'ENG'].includes(e.name)) continue;
      if (full.includes(`${path.sep}_assets${path.sep}external`)) continue;
      collectHtmlFiles(full, out);
    } else if (e.name.endsWith('.html')) {
      out.push(full);
    }
  }
  return out;
}

let updated = 0;
let skipped = 0;

for (const fileAbs of collectHtmlFiles(FRONTEND)) {
  let raw = fs.readFileSync(fileAbs, 'utf8');
  if (!raw.includes('menutype4 responsive_dontslide') || !raw.includes('id="page-1241193"')) {
    skipped++;
    continue;
  }
  if (raw.includes('Rechtsschutz Expats')) {
    skipped++;
    continue;
  }
  if (!INSERT_RE.test(raw)) {
    console.warn('[skip pattern]', path.relative(FRONTEND, fileAbs));
    skipped++;
    continue;
  }
  INSERT_RE.lastIndex = 0;
  const next = raw.replace(INSERT_RE, `$1${NEW_ITEM}$2`);
  if (next !== raw) {
    fs.writeFileSync(fileAbs, next, 'utf8');
    updated++;
    console.log('updated', path.relative(FRONTEND, fileAbs));
  }
}

console.log(`Done: ${updated} updated, ${skipped} skipped.`);
