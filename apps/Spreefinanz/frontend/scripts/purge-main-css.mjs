#!/usr/bin/env node
/**
 * Copy the full CMS main stylesheet to a versioned filename for cache-busting.
 *
 * Edit `style.css` only — this script produces an identical `style.<version>.css`
 * HTML should link to the versioned file; change the basename when you want clients
 * to fetch fresh CSS without changing content.
 *
 * Writes a `.bak` of the previous versioned file before overwriting.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FRONTEND = path.resolve(__dirname, '..');
const CSS_INPUT = path.join(FRONTEND, 'style.css');
const CSS_OUTPUT = path.join(FRONTEND, 'style.20260528.css');
const BACKUP = CSS_OUTPUT + '.bak';

if (!fs.existsSync(CSS_INPUT)) {
  console.error('Missing:', CSS_INPUT);
  process.exit(1);
}

const before = fs.statSync(CSS_INPUT).size;

if (fs.existsSync(CSS_OUTPUT)) {
  fs.copyFileSync(CSS_OUTPUT, BACKUP);
  console.log('Backup:', path.relative(FRONTEND, BACKUP));
}

fs.copyFileSync(CSS_INPUT, CSS_OUTPUT);
const after = fs.statSync(CSS_OUTPUT).size;

if (before !== after) {
  console.error('Copy size mismatch; aborting.');
  process.exit(1);
}

console.log(
  `Copied ${path.basename(CSS_INPUT)} → ${path.basename(CSS_OUTPUT)} (${after} bytes, identical)`,
);
