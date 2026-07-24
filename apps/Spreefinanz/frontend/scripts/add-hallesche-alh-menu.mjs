#!/usr/bin/env node
/**
 * Inserts nested submenu "Hallesche / ALH Group" under Krankenversicherung
 * (after Foyer) with HiGermany PKV and Zusatzversicherungen zur GKV.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FRONTEND = path.resolve(__dirname, '..');

const HALLESCHE_GROUP =
  '<li class="menusubitem lastitem" id="page-1290300" role="none"><a aria-label="Hallesche / ALH Group" href="higermany_pkv_voll_visum" id="page-1290300-link" onclick="return false" role="menuitem">Hallesche / ALH Group</a><span class="submenutoggle"></span><ul aria-labelledby="page-1290300-link" role="menu"><li class="menusubitem firstitem" id="page-1290301" role="none"><a aria-label="HiGermany PKV Voll Visum" href="higermany_pkv_voll_visum" id="page-1290301-link" role="menuitem">HiGermany PKV Voll Visum</a><span class="submenutoggle"></span></li><li class="menusubitem lastitem" id="page-1290302" role="none"><a aria-label="Zusatzversicherungen zur GKV" href="hallesche_zusatzversicherungen_gkv" id="page-1290302-link" role="menuitem">Zusatzversicherungen zur GKV</a><span class="submenutoggle"></span></li></ul></li>';

const INSERT_RE = new RegExp(
  '(<li class="menusubitem) lastitem(" id="page-1288749" role="none"><a aria-label="Foyer" href="foyer" id="page-1288749-link" role="menuitem">Foyer</a><span class="submenutoggle"></span></li>)' +
    '(</ul></li><li class="menusubitem[^"]*" id="page-1241289")',
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
  if (!raw.includes('menutype4 responsive_dontslide') || !raw.includes('id="page-1288743"')) {
    skipped++;
    continue;
  }
  if (raw.includes('id="page-1290300"')) {
    skipped++;
    continue;
  }
  if (!INSERT_RE.test(raw)) {
    console.warn('[skip pattern]', path.relative(FRONTEND, fileAbs));
    skipped++;
    continue;
  }
  INSERT_RE.lastIndex = 0;
  const next = raw.replace(INSERT_RE, `$1$2${HALLESCHE_GROUP}$3`);
  if (next !== raw) {
    fs.writeFileSync(fileAbs, next, 'utf8');
    updated++;
    console.log('updated', path.relative(FRONTEND, fileAbs));
  }
}

console.log(`Done: ${updated} updated, ${skipped} skipped.`);
