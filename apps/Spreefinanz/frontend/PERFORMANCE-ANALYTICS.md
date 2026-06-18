# Analytics after removing Maklerhomepage stat scripts

## What was removed

The **stat / track** snippets that called Maklerhomepage/CMS endpoints (for example `stat/track__q_mode_js_user_id_*.php` and related `noscript` fallbacks) were **pageview beacons**. They reported visits into the hosting/CMS analytics, not into Google Analytics by default. Removing them **drops that built-in traffic reporting**; it does not by itself add GA4 or any replacement.

## Why Lighthouse “performance” looked bad

Poor **Performance** scores are mostly driven by **main-thread work**, **large images (LCP)****, **render-blocking CSS/JS**, and **third-party widgets** — not by removing these stat calls. Stat scripts were still extra requests and JavaScript; removing them helps a bit, but **hero image weight**, **CSS delivery**, and **widgets (e.g. Elfsight)** usually matter more.

## Options if you still want analytics

Choose based on privacy, consent, and who must see the data.

1. **Server / CDN logs**  
   No extra scripts. Your host or reverse proxy (e.g. nginx access logs) already records page hits. You aggregate with log tools or a log drain. No cookies; GDPR still applies if you process IPs as personal data — document retention and purpose.

2. **Plausible, Fathom, or similar**  
   Small scripts, often **cookie-light** and privacy-oriented. Still classify under marketing/statistics in many setups and load **only after consent** if you use a consent banner (here: align with `digidor.cookieblocker` categories).

3. **Matomo (self-hosted)**  
   Full control over data. More setup; same consent story for cookies or identifiable tracking.

4. **Google Analytics 4**  
   Common for agencies; heavier and stricter consent expectations in the EU. Load **after** the user accepts the relevant category (typically “statistics” / your mapped category in the cookie blocker).

## Wiring with the existing cookie blocker

Embeds that use `data-ehcookieblocker` / `digidor.cookieblocker` should run **only after** the user accepts the category you assign. Any new analytics script should:

- Be tagged with the **same pattern** as other non-essential scripts (obligatory vs. blocked until consent), and  
- Be documented so future exports from the CMS do not strip or duplicate the tag.

## Script loading (static export)

Typical page after cleanup:

| Script | Purpose |
|--------|---------|
| `main.7a280948f1e2.js` (defer) | Menu, cookie banner, overlays, CMS behaviour |
| `marketing-consent.js`, `ga-bootstrap.js`, `linkedin-insight.js` (defer, nginx inject at `</body>`) | Marketing consent helper; GA4 and LinkedIn Insight Tag load only after consent |
| Page-specific bundles | Only where needed (e.g. Bedarfsanalyse widget on `absicherungsbedarf_ermitteln.html`) |

Removed as unnecessary on most pages:

- `digidor-local-bridge.js` — empty stub; `main.js` already initializes `digidor`
- Duplicate `minified.js.php` tags — pointed at missing `local-cdn` paths (404) or duplicated Delightchat/CMS bundles already covered by `main.js`

Homepages (`index.html`, `ENG/index.html`) load **one** site script: deferred `main.js`.

### Elfsight (LinkedIn feed)

Only on DE/EN homepages. Loads **only when**:

1. User accepted **other** cookies, and  
2. Feed is near the viewport (`elfsight-lazy.js` + `IntersectionObserver`)

No `platform.js` request on initial load or before scroll.

### Vite — does it help here?

**For your custom scripts** (`ga-bootstrap.js`, `elfsight-lazy.js`, `form-inquiry.js`): **yes.**  
Run from `frontend/`:

```bash
npm install
npm run build:custom
```

That minifies the small custom files via esbuild (typically a few hundred bytes saved).

**For `main.7a280948f1e2.js` (~615 KB):** **not directly.** That file is a pre-built Digidor/CMS export. Vite cannot shrink it unless you:

- replace it with a fresh build from source (you do not have that source in this repo), or  
- split features manually (high effort, breaks CMS updates).

**When a full Vite (or similar) pipeline is worth it:**

- You rebuild pages as components (Astro, Eleventy + Vite, etc.) instead of static CMS HTML dumps  
- You own the JS modules and import only what each page needs (tree-shaking)  
- You migrate off the monolithic `main.js` over time  

Until then, the biggest wins are: **fewer script tags**, **defer**, **consent-gated analytics**, **lazy third parties**, and **image/CSS** work — not rebundling `main.js` with Vite alone.

## Performance roadmap (applied)

| Item | Change |
|------|--------|
| **style2 non-blocking** | `media="print"` + `onload="this.media='all'"` on all site pages (~93 templates) |
| **Main style.css** | Stays **render-blocking** (async caused CLS > 1); **PurgeCSS** shrank file ~40% (backup: `style.d91abdee017b.css.bak`) |
| **Caddy compression** | `encode gzip zstd` on `www.finanz-expat.de` |
| **Broken minified.css** | Removed dead `minified.css` links |
| **Images** | Cloudinary `f_auto,q_auto`; lazy below-fold; DE + EN home LCP hero + preload |
| **nginx cache** | Long cache for hashed assets; **1h** for `/assets/local-head/*` (unversioned scripts) |
| **preconnect** | Cloudinary in `<head>` |
| **Elfsight** | Kept; lazy via `elfsight-lazy.js` + CLS reserve (`.spreefinanz-elfsight-feed`) |

Lighthouse (mobile, May 2026) before → after gzip + purge + style2 defer:

| Page | Perf | LCP | CLS |
|------|------|-----|-----|
| DE Home | 51 → 67 | 9.3s → 4.5s | 0.32 |
| EN Home | 47 → 64 | 9.2s → 4.4s | 0.45 |
| Inner | 70 → 91 | 7.4s → 3.4s | 0 |

Re-apply HTML patches after CMS re-exports (does **not** re-purge CSS):

```bash
python3 scripts/patch-performance-roadmap.py
node scripts/purge-main-css.mjs   # optional, after HTML export
```

