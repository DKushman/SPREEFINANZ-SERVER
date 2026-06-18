#!/usr/bin/env node
/**
 * Inserts top-level menu item "International employee health insurance"
 * into ENG pages using menutype4 (between "Germans abroad" and "We & Sustainable").
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ENG = path.resolve(__dirname, '../ENG');

const NEW_ITEM =
  '<li class="menuitem" id="page-1290100-en" role="none"><a aria-label="International employee health insurance" href="international_employee_health_insurance.html" id="page-1290100-en-link" role="menuitem">International employee health insurance</a><span class="submenutoggle"></span></li>';

const INSERT_RE = new RegExp(
  '(id="page-1311321-link"[^>]*>Insurance checklist for Germans abroad</a><span class="submenutoggle"></span></li></ul></li>)' +
    '(<li class="menuitem[^"]*" id="page-1241840")',
  'g'
);

let updated = 0;
let skipped = 0;

for (const name of fs.readdirSync(ENG)) {
  if (!name.endsWith('.html')) continue;
  const fileAbs = path.join(ENG, name);
  let raw = fs.readFileSync(fileAbs, 'utf8');
  if (!raw.includes('menutype4 responsive_dontslide') || !raw.includes('id="page-1311303"')) {
    skipped++;
    continue;
  }
  if (raw.includes('International employee health insurance')) {
    skipped++;
    continue;
  }
  if (!INSERT_RE.test(raw)) {
    console.warn('[skip pattern]', name);
    skipped++;
    continue;
  }
  INSERT_RE.lastIndex = 0;
  const next = raw.replace(INSERT_RE, `$1${NEW_ITEM}$2`);
  if (next !== raw) {
    fs.writeFileSync(fileAbs, next, 'utf8');
    updated++;
    console.log('updated', name);
  }
}

console.log(`Done: ${updated} updated, ${skipped} skipped.`);
