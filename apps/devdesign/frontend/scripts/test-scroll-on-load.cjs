const { chromium } = require('playwright');

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
      heroTop: heroRect ? Math.round(heroRect.top) : null,
      timelineTop: timelineRect ? Math.round(timelineRect.top) : null,
      heroVisible,
      timelineInUpperViewport: timelineVisible,
      scrollTrigger: typeof window.ScrollTrigger !== 'undefined',
      lenis: typeof window.Lenis !== 'undefined',
      gsap: typeof window.gsap !== 'undefined',
    };
  }, label);
}

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: '/usr/bin/chromium-browser',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const isMobile = process.env.MOBILE === '1';
  const context = await browser.newContext({
    viewport: isMobile ? { width: 390, height: 844 } : { width: 1280, height: 800 },
    userAgent: isMobile
      ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
      : undefined,
  });
  const page = await context.newPage();
  const consoleLogs = [];
  page.on('console', (msg) => {
    if (['error', 'warning'].includes(msg.type())) {
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
        ? 'TIMELINE'
        : s.heroVisible
          ? 'HERO'
          : 'mixed/other';
    console.log(
      `[${cp.ms}ms] scrollY=${s.scrollY} view=${view} heroTop=${s.heroTop} timelineTop=${s.timelineTop} ST=${s.scrollTrigger} Lenis=${s.lenis}`
    );
  }

  const centerEl = await page.evaluate(() => {
    const el = document.elementFromPoint(window.innerWidth / 2, window.innerHeight / 2);
    const section = el?.closest('section');
    return { section: section?.id || section?.className?.slice(0, 50) };
  });
  console.log('\nCenter viewport section:', centerEl.section);

  console.log('\n--- Scroll jumps (>500px) ---');
  for (let i = 1; i < results.length; i++) {
    const delta = results[i].scrollY - results[i - 1].scrollY;
    if (Math.abs(delta) > 500) {
      console.log(
        `JUMP ${results[i - 1].label} → ${results[i].label}: Δ${delta}px (ST: ${results[i - 1].scrollTrigger} → ${results[i].scrollTrigger})`
      );
    }
  }

  if (consoleLogs.length) {
    console.log('\n--- Console ---');
    consoleLogs.slice(0, 10).forEach((l) => console.log(l));
  }

  await browser.close();
})();
