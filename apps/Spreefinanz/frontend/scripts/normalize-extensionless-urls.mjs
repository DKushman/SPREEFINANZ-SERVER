#!/usr/bin/env node
/**
 * Align spreefinanz.de URLs with nginx extensionless routing:
 * - canonical, og:url, hreflang, JSON-LD: absolute URLs without .html
 * - internal <a href>: relative paths without .html
 * - sitemap.xml: loc/hreflang without .html
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FRONTEND = path.resolve(__dirname, '..');
const SITE = 'https://www.spreefinanz.de';

const SKIP_DIRS = new Set(['node_modules', '.git']);
const ASSET_EXT =
  /\.(css|js|png|jpe?g|gif|webp|svg|ico|woff2?|ttf|eot|pdf|xml|json|php)(\?|#|$)/i;

function collectHtmlFiles(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (SKIP_DIRS.has(e.name)) continue;
      if (full.includes(`${path.sep}_assets${path.sep}external`)) continue;
      collectHtmlFiles(full, out);
    } else if (e.name.endsWith('.html')) {
      out.push(full);
    }
  }
  return out;
}

/** @param {string} url */
function canonicalizeSpreefinanzUrl(url) {
  if (!url.includes('spreefinanz.de')) return url;
  url = url.replace(`${SITE}/ENG/index.html`, `${SITE}/ENG/`);
  url = url.replace(`${SITE}/index.html`, `${SITE}/`);
  return url.replace(/(https:\/\/www\.spreefinanz\.de\/[^"?#]*?)\.html/g, '$1');
}

/**
 * @param {string} href
 * @param {string} fileAbs absolute path to source HTML file
 */
function normalizeRelativePageHref(href, fileAbs) {
  if (!href || /^(https?:|\/\/|#|mailto:|tel:|javascript:)/i.test(href)) return href;
  if (ASSET_EXT.test(href)) return href;
  if (href.startsWith('/assets/') || href.startsWith('assets/') || href.startsWith('../assets/')) {
    return href;
  }
  if (href.includes('/eh-content/') || href.includes('/_assets/')) return href;

  const relFile = path.relative(FRONTEND, fileAbs).split(path.sep).join('/');
  const inEng = relFile.startsWith('ENG/');

  const hashIdx = href.search(/[#?]/);
  const pathPart = hashIdx === -1 ? href : href.slice(0, hashIdx);
  const suffix = hashIdx === -1 ? '' : href.slice(hashIdx);

  if (pathPart === 'index.html' || pathPart === './index.html') {
    return (inEng ? '/ENG/' : '/') + suffix;
  }
  if (pathPart === '../index.html') {
    return '/' + suffix;
  }
  if (pathPart.endsWith('.html')) {
    return pathPart.slice(0, -5) + suffix;
  }
  return href;
}

function transformHtml(content, fileAbs) {
  let next = content;

  next = next.replace(/https:\/\/www\.spreefinanz\.de\/[^"'<>\s]*/g, (match) =>
    canonicalizeSpreefinanzUrl(match)
  );

  next = next.replace(/(<a\b[^>]*\bhref\s*=\s*["'])([^"']+)(["'])/gi, (full, pre, href, post) => {
    const normalized = normalizeRelativePageHref(href, fileAbs);
    return normalized === href ? full : `${pre}${normalized}${post}`;
  });

  return next;
}

function transformSitemap(content) {
  return content.replace(/https:\/\/www\.spreefinanz\.de\/[^<\s]*/g, (match) =>
    canonicalizeSpreefinanzUrl(match)
  );
}

function patchFile(fileAbs, transform) {
  const raw = fs.readFileSync(fileAbs, 'utf8');
  const next = transform(raw, fileAbs);
  if (next === raw) return false;
  fs.writeFileSync(fileAbs, next, 'utf8');
  return true;
}

let htmlUpdated = 0;
for (const file of collectHtmlFiles(FRONTEND)) {
  if (patchFile(file, transformHtml)) {
    htmlUpdated++;
    console.log('html', path.relative(FRONTEND, file));
  }
}

const sitemapPath = path.join(FRONTEND, 'sitemap.xml');
if (fs.existsSync(sitemapPath)) {
  const raw = fs.readFileSync(sitemapPath, 'utf8');
  const next = transformSitemap(raw);
  if (next !== raw) {
    fs.writeFileSync(sitemapPath, next, 'utf8');
    console.log('sitemap.xml updated');
  }
}

console.log(`Done: ${htmlUpdated} HTML files updated.`);
