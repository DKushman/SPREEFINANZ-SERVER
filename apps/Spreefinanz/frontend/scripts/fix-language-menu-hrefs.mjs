#!/usr/bin/env node
/**
 * Sets header language-switch links (#page-1257016-link on ENG, #page-1257017-link on DE)
 * from <link rel="alternate" hreflang="de|en"> in the same file (relative paths).
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FRONTEND = path.resolve(__dirname, '..');

function collectHtmlFiles(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (['_assets', 'node_modules', '.git'].includes(e.name)) continue;
      if (full.includes(`${path.sep}_assets${path.sep}external`)) continue;
      collectHtmlFiles(full, out);
    } else if (e.name.endsWith('.html')) {
      out.push(full);
    }
  }
  return out;
}

/** @returns {Record<string, string>} hreflang → absolute URL */
function parseAlternateHrefs(html) {
  /** @type {Record<string, string>} */
  const map = {};
  for (const m of html.matchAll(/<link\b[^>]*>/gi)) {
    const tag = m[0];
    if (!/\brel\s*=\s*["']alternate["']/i.test(tag)) continue;
    const hl = /\bhreflang\s*=\s*["']([^"']+)["']/i.exec(tag);
    const hr = /\bhref\s*=\s*["']([^"']+)["']/i.exec(tag);
    if (!hl || !hr) continue;
    map[hl[1].trim().toLowerCase()] = hr[1].trim();
  }
  return map;
}

/**
 * Map finanz-expat pathname to filesystem file under FRONTEND.
 */
function absoluteUrlToFrontendFile(absUrl) {
  let u;
  try {
    u = new URL(absUrl);
  } catch {
    return null;
  }
  let p = u.pathname.replace(/\/+$/, '');
  if (!p || p === '/') {
    return path.join(FRONTEND, 'index.html');
  }
  const segments = p.split('/').filter(Boolean);
  const last = segments[segments.length - 1];
  if (!last.includes('.')) {
    return path.join(FRONTEND, ...segments, 'index.html');
  }
  return path.join(FRONTEND, ...segments);
}

function hrefFromSourceToTarget(sourceFileAbs, targetFileAbs) {
  let rel = path.relative(path.dirname(sourceFileAbs), targetFileAbs);
  rel = rel.split(path.sep).join('/');
  if (rel === '') rel = '.';
  return rel;
}

/**
 * Replace href on the `<a>` that owns `id="linkId"` (single-line / CMS markup).
 */
function setAnchorHref(html, linkId, newHref) {
  const needle = `id="${linkId}"`;
  const idIx = html.indexOf(needle);
  if (idIx === -1) return { html, changed: false };
  const aStart = html.lastIndexOf('<a', idIx);
  if (aStart === -1) return { html, changed: false };
  const gt = html.indexOf('>', idIx);
  const tagEnd = gt === -1 ? idIx + needle.length : gt + 1;
  const anchor = html.slice(aStart, Math.max(tagEnd, aStart + 1));
  if (!/^<a\b/i.test(anchor) || anchor.indexOf(needle) === -1) {
    return { html, changed: false };
  }
  const replaced = anchor.replace(/href="[^"]*"/i, () => `href="${newHref}"`);
  if (replaced === anchor) return { html, changed: false };
  const next = html.slice(0, aStart) + replaced + html.slice(tagEnd);
  return { html: next, changed: true };
}

const files = collectHtmlFiles(FRONTEND);
let updatedFiles = 0;
let skippedNoAlternate = 0;
let skippedNoLink = 0;

for (const fileAbs of files) {
  const rel = path.relative(FRONTEND, fileAbs);
  const normalized = rel.split(path.sep).join('/');
  const isEng =
    normalized.startsWith('ENG/') || normalized === 'ENG'; // ENG root only if ever

  const linkId = isEng ? 'page-1257016-link' : 'page-1257017-link';
  const targetLang = isEng ? 'de' : 'en';

  let raw = fs.readFileSync(fileAbs, 'utf8');
  if (!raw.includes(linkId)) {
    skippedNoLink++;
    continue;
  }

  const alternates = parseAlternateHrefs(raw);
  const targetUrl = alternates[targetLang];
  if (!targetUrl) {
    skippedNoAlternate++;
    continue;
  }

  const targetFile = absoluteUrlToFrontendFile(targetUrl);
  if (!targetFile || !fs.existsSync(targetFile)) {
    console.warn('[skip missing file]', normalized, '→', targetUrl);
    skippedNoAlternate++;
    continue;
  }

  const newHref = hrefFromSourceToTarget(fileAbs, targetFile);
  const { html: next, changed } = setAnchorHref(raw, linkId, newHref);
  if (!changed) {
    continue;
  }
  if (next !== raw) {
    fs.writeFileSync(fileAbs, next, 'utf8');
    updatedFiles++;
    console.log(updatedFiles, normalized, linkId, '→', newHref);
  }
}

console.log(
  `Done: ${updatedFiles} files updated, ${skippedNoLink} files without language menu link, ${skippedNoAlternate} skipped (no hreflang target or missing file — see warnings).`
);
