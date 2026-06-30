# On-Page SEO Checklist

Canonical on-page SEO reference for this project. Every blog post, service page, and static page must satisfy every applicable item below.

**Every page-generation skill (`write-blog-post.md`, `write-service-page.md`, etc.) must read this file first. Every page shipped must pass every applicable item.**

---

## HEAD / METADATA

- [ ] **Title tag**: 50–60 chars, primary keyword near the start
- [ ] **Meta description**: 150–160 chars, primary keyword + benefit + soft CTA
- [ ] **Canonical URL** set to prevent duplicates
- [ ] **Open Graph tags**: `og:title`, `og:description`, `og:image` (1200×630), `og:url`, `og:type`
- [ ] **Twitter Card tags**: `twitter:card=summary_large_image`, `twitter:title`, `twitter:description`, `twitter:image`
- [ ] **Language attribute** on `<html>` (e.g. `lang="en"`)
- [ ] **Viewport meta tag** (`<meta name="viewport" content="width=device-width, initial-scale=1">`)
- [ ] **Favicon** + `apple-touch-icon`
- [ ] **Charset meta** (`<meta charset="utf-8">`)

## URL STRUCTURE

- [ ] **Short slug** (under 60 chars)
- [ ] **Primary keyword** in the slug
- [ ] **Hyphens** only — never underscores
- [ ] **Lowercase** only
- [ ] **No stop words** ("the", "a", "of") unless necessary for clarity
- [ ] **Logical hierarchy**: `/services/[service-name]`, `/blog/[post-slug]`

## HEADINGS

- [ ] **Exactly one H1** per page, contains primary keyword
- [ ] **Logical H2 → H3** hierarchy (never skip levels)
- [ ] **H2s** use supporting keywords + questions from the cluster
- [ ] **No keyword stuffing** — write naturally

## COPY / BODY

- [ ] **Primary keyword** in the first 100 words
- [ ] **Direct answer** to the query in the first paragraph
- [ ] **Length** matches SERP average (within 20% of top-3 word count)
- [ ] **Short paragraphs** (1–4 sentences)
- [ ] **Readability**: 8th–10th grade level
- [ ] **Active voice** preferred
- [ ] **Bold key phrases** (sparingly)
- [ ] **Bullets and numbered lists** where appropriate

## FAQ SECTION (every blog post)

- [ ] **4–8 questions** from SEMRush Questions tab + "People Also Ask"
- [ ] **Direct, clear answers** (2–4 sentences each)
- [ ] **FAQ schema** (JSON-LD) applied

## IMAGES

- [ ] **Alt text** describes the image + keyword where natural
- [ ] **Descriptive filenames** with hyphens (e.g. `emergency-plumber-toronto.webp`)
- [ ] **WebP format**, compressed under 200 KB
- [ ] **Width/height attributes** specified (prevents CLS)
- [ ] **Lazy loading** (`loading="lazy"`) for below-fold images
- [ ] **Responsive srcset** where needed
- [ ] **Featured/hero image** for social sharing

## INTERNAL LINKS

- [ ] **3–5 internal links** per post
- [ ] Link to **related blog posts** and **relevant service pages**
- [ ] **Descriptive anchor text** — never "click here" or "read more"
- [ ] **Contextually placed** in body copy
- [ ] **Breadcrumb navigation** on every page

## EXTERNAL LINKS

- [ ] **2–3 external links** to authoritative sources (.gov, .edu, major industry sites)
- [ ] **Relevant** to the topic
- [ ] Open in **new tab** with `rel="noopener"`
- [ ] `rel="nofollow"` for sponsored links

## SCHEMA MARKUP (JSON-LD in `<head>`)

- [ ] **Article** schema on blog posts
- [ ] **LocalBusiness** schema on homepage, about, contact (use most specific subtype — `Plumber`, `Dentist`, etc.)
- [ ] **Service** schema on service pages
- [ ] **FAQ** schema wherever an FAQ section exists
- [ ] **BreadcrumbList** schema on every page
- [ ] **Organization** schema (site-wide)
- [ ] **Author/Person** schema for author bylines

## E-E-A-T SIGNALS

- [ ] **Author byline** with name on every blog post
- [ ] **Author bio** with credentials (years experience, qualifications)
- [ ] Link to **author's dedicated page**
- [ ] **Published date** displayed on page
- [ ] **"Last updated" date** when content is refreshed
- [ ] **Real stories, real numbers, real opinions** (from the business voice file)
- [ ] **Cite authoritative sources**
- [ ] **About page** with full company credentials
- [ ] **Contact page** with real address, phone, business hours

## ACCESSIBILITY (affects SEO)

- [ ] **Semantic HTML5** tags: `<header>`, `<nav>`, `<main>`, `<article>`, `<aside>`, `<footer>`
- [ ] **ARIA labels** on interactive elements where needed
- [ ] **Color contrast** meets WCAG AA (4.5:1 for body text)
- [ ] **Focus indicators** visible on all interactive elements
- [ ] **Alt text** on ALL images (empty `alt=""` for decorative only)
- [ ] **Descriptive link text**
- [ ] **Skip-to-content** link for keyboard users

## MOBILE / RESPONSIVE

- [ ] **Responsive layout** (Tailwind handles this)
- [ ] **Touch targets** minimum 48×48 px
- [ ] **Body font size** minimum 16 px
- [ ] **No horizontal scroll** at any viewport
- [ ] **No intrusive interstitials**

## SOCIAL PREVIEW

- [ ] **Open Graph image** optimized (1200×630, under 1 MB)
- [ ] **Twitter Card image** (1200×600)
- [ ] **Compelling `og:description`** (different from meta if valuable)

## CONVERSION ELEMENTS (service pages only)

- [ ] **Primary CTA** above the fold
- [ ] **Phone number** with click-to-call (`tel:` links)
- [ ] **Multiple CTA placements** throughout the page
- [ ] **Trust signals**: reviews, ratings, licenses, years in business
- [ ] **Testimonials** with names (and photos where possible)
- [ ] **Service-area coverage** listed
- [ ] **Business hours** displayed
- [ ] **Physical address** with embedded map (for local businesses)

## LONG-FORM CONTENT (1500+ words)

- [ ] **Table of contents** with anchor links at the top
- [ ] **Jump links** for each H2 section
- [ ] **Back-to-top** button

---

## How to use this file

1. Every page-generation skill reads this file before generating any page.
2. Every page must satisfy every applicable item — no exceptions.
3. **Conversion Elements** apply to service pages only.
4. **Long-Form Content** items apply to any post 1500+ words.
5. Run `scripts/verify-seo.ts` against any built page to check compliance — it should fail the build if any required item is missing.
