/**
 * Diagnose: scroll position on fresh page load (incognito-like).
 * Run: npx playwright test scripts/test-scroll-on-load.mjs  OR node with playwright directly
 */
import { chromium } from 'playwright';

const URL = process.env.TEST_URL || 'https://devdesignstudio.de/';

async function sample(page, label) {
  return page.evaluate((lbl) => {
    const hero = document.querySelector('.hero.hero-minimal');
    const timelineIntro = document.querySelector('.timeline-intro-h2');
    const heroRect = hero?.getBoundingClientRect();
    const timelineRect = timelineIntro?.getBoundingClientRect();
    const heroVisible =
      heroRect && heroRect.top < window.innerHeight && heroRect.bottom > 0;
    const timelineVisible =
      timelineRect &&
      timelineRect.top < window.innerHeight * 0.5 &&
      timelineRect.bottom > 0;
    return {
      label: lbl,
      scrollY: Math.round(window.scrollY),
      scrollMax: Math.round(
        document.documentElement.scrollHeight - window.innerHeight
      ),
      heroTop: heroRect ? Math.round(heroRect.top) : null,
      timelineTop: timelineRect ? Math.round(timelineRect.top) : null,
      heroVisible,
      timelineInUpperViewport: timelineVisible,
      timelineText: timelineIntro?.textContent?.trim().slice(0, 40) || null,
      heroHeadline: document
        .querySelector('.hero-minimal-headline')
        ?.textContent?.trim()
        .slice(0, 40) || null,
      bodyClasses: document.body.className,
      htmlClasses: document.documentElement.className,
      lenis: typeof window.Lenis !== 'undefined',
      scrollTrigger: typeof window.ScrollTrigger !== 'undefined',
      gsap: typeof window.gsap !== 'undefined',
    };
  }, label);
}

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1280, height: 800 },
  userAgent:
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
});
const page = await context.newPage();

const consoleLogs = [];
page.on('console', (msg) => {
  if (msg.type() === 'error' || msg.type() === 'warning') {
    consoleLogs.push(`[${msg.type()}] ${msg.text()}`);
  }
});

console.log(`\n=== Scroll diagnosis: ${URL} ===\n`);

await page.goto(URL, { waitUntil: 'domcontentloaded' });

const checkpoints = [
  { ms: 0, wait: 0 },
  { ms: 100, wait: 100 },
  { ms: 500, wait: 400 },
  { ms: 1000, wait: 500 },
  { ms: 2000, wait: 1000 },
  { ms: 3000, wait: 1000 },
  { ms: 4000, wait: 1000 },
  { ms: 5500, wait: 1500 },
  { ms: 7000, wait: 1500 },
];

const results = [];
for (const cp of checkpoints) {
  if (cp.wait > 0) await page.waitForTimeout(cp.wait);
  const s = await sample(page, `${cp.ms}ms`);
  results.push(s);
  const view =
    s.timelineInUpperViewport && !s.heroVisible
      ? 'TIMELINE (not hero)'
      : s.heroVisible
        ? 'HERO'
        : 'other/mixed';
  console.log(
    `[${cp.ms}ms] scrollY=${s.scrollY} | view=${view} | heroTop=${s.heroTop} timelineTop=${s.timelineTop} | ST=${s.scrollTrigger} Lenis=${s.lenis}`
  );
}

// Final: what element is at center of viewport
const centerEl = await page.evaluate(() => {
  const y = window.innerHeight / 2;
  const el = document.elementFromPoint(window.innerWidth / 2, y);
  const section = el?.closest('section');
  return {
    tag: el?.tagName,
    class: el?.className?.slice?.(0, 80) || '',
    sectionId: section?.id || section?.className?.slice(0, 60) || 'none',
  };
});
console.log('\n--- Center viewport element (at 7s) ---');
console.log(centerEl);

if (consoleLogs.length) {
  console.log('\n--- Console errors/warnings ---');
  consoleLogs.slice(0, 15).forEach((l) => console.log(l));
}

// Detect jump: scrollY change > 500 between samples
console.log('\n--- Scroll jumps (>500px between checkpoints) ---');
for (let i = 1; i < results.length; i++) {
  const delta = results[i].scrollY - results[i - 1].scrollY;
  if (Math.abs(delta) > 500) {
    console.log(
      `JUMP: ${results[i - 1].label} → ${results[i].label}: Δ${delta}px (ST loaded: ${results[i].scrollTrigger}, was: ${results[i - 1].scrollTrigger})`
    );
  }
}

await browser.close();
console.log('\nDone.\n');
