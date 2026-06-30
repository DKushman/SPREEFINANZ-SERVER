// Globale Lenis-Instanz
let lenis = null;

if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}

/** Nur echte Fragment-Anker (#section) — nicht mit Pfad /kontakt verwechseln. */
function hasScrollHash() {
    const hash = location.hash;
    return hash.length > 1;
}

/** Setzt native Scroll + Lenis zuverlässig auf Seitenanfang (ohne Hash). */
function resetPageScrollTop() {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    if (lenis) {
        lenis.scrollTo(0, { immediate: true });
    }
}

/** Verhindert Scroll-Sprung zur Timeline nach ScrollTrigger.refresh() (Startseite). */
let scrollInitLockActive = false;
let scrollTriggerConfigured = false;
let homeScrollAnchorGuardUntil = 0;
let scrollEnhancementsReady = false;

function isHomePage() {
    return document.body.classList.contains('page-home');
}

function shouldGuardHomeScrollAnchor() {
    return (
        isHomePage() &&
        !hasScrollHash() &&
        Date.now() < homeScrollAnchorGuardUntil
    );
}

/** Hält scrollY=0 während Init + window.load (Videos) — verhindert Timeline-Sprung. */
function armHomeScrollAnchorGuard(durationMs = 10000) {
    if (!isHomePage() || hasScrollHash()) return;
    homeScrollAnchorGuardUntil = Math.max(
        homeScrollAnchorGuardUntil,
        Date.now() + durationMs,
    );
}

function enforceHomeScrollAnchor() {
    if (!shouldGuardHomeScrollAnchor()) return;
    resetPageScrollTop();
}

function configureScrollTrigger() {
    if (scrollTriggerConfigured || typeof ScrollTrigger === 'undefined') return;
    scrollTriggerConfigured = true;

    // Kein Auto-refresh bei load/DOMContentLoaded — sonst Sprung zur Timeline nach Videos
    ScrollTrigger.config({
        autoRefreshEvents: 'visibilitychange,resize',
    });

    ScrollTrigger.addEventListener('refreshInit', enforceHomeScrollAnchor);
    ScrollTrigger.addEventListener('refresh', () => {
        enforceHomeScrollAnchor();
        requestAnimationFrame(enforceHomeScrollAnchor);
    });
}

function registerScrollRefreshGuard() {
    configureScrollTrigger();
}

function withScrollInitLock(run) {
    if (hasScrollHash()) {
        run();
        return;
    }

    scrollInitLockActive = true;
    const guardScroll = () => {
        if (scrollInitLockActive && window.scrollY !== 0 && !hasScrollHash()) {
            resetPageScrollTop();
        }
    };
    window.addEventListener('scroll', guardScroll, { passive: true, capture: true });

    try {
        run();
    } finally {
        scrollInitLockActive = false;
        window.removeEventListener('scroll', guardScroll, { capture: true });
        resetPageScrollTop();
    }
}

// Hilfsfunktionen
const isMobile = () => window.innerWidth < 769;
const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const DD_GA_MEASUREMENT_ID = 'G-RS2GHXLL6K';
const DD_COOKIE_CONSENT_KEY = 'dd_cookie_consent';
/** Cookie-Banner erst nach LCP-Fenster (kein Layout-/LCP-Konflikt). */
const DD_COOKIE_BANNER_DELAY_MS = 5000;

function isGaProductionHost() {
    const h = location.hostname;
    return h === 'devdesignstudio.de' || h === 'www.devdesignstudio.de';
}

function ensureGtagStub() {
    window.dataLayer = window.dataLayer || [];
    if (typeof window.gtag !== 'function') {
        window.gtag = function gtag() {
            window.dataLayer.push(arguments);
        };
    }
}

function ensureConsentDefaultsFromMain() {
    if (document.getElementById('dd-consent-bootstrap')) return;
    ensureGtagStub();
    if (window.__ddConsentDefaultsApplied) return;
    window.__ddConsentDefaultsApplied = true;
    window.gtag('consent', 'default', {
        ad_storage: 'denied',
        analytics_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
        wait_for_update: 500,
    });
}

function removeGtagLibraryScripts() {
    document.querySelectorAll('script[src*="googletagmanager.com/gtag/js"]').forEach((el) => {
        el.remove();
    });
}

/**
 * Lädt googletagmanager/gtag/js direkt (Consent Default bleibt denied bis „Analyse erlauben“).
 * Bei gespeichertem „rejected“ wird nichts geladen.
 */
function ensureGtagJsLoaded(measurementId) {
    if (!isGaProductionHost()) return;
    if (readCookieConsent() === 'rejected') return;
    if (window.__ddGtagScriptLoaded || window.__ddGtagScriptLoading) return;

    ensureGtagStub();
    window.__ddGtagScriptLoading = true;
    const gen = (window.__ddGtagLoadGen = (window.__ddGtagLoadGen || 0) + 1);
    const s = document.createElement('script');
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
    s.onload = () => {
        window.__ddGtagScriptLoading = false;
        if (gen !== window.__ddGtagLoadGen) {
            s.remove();
            return;
        }
        if (readCookieConsent() === 'rejected') {
            window.__ddGtagScriptLoaded = false;
            try {
                window.gtag('consent', 'update', {
                    analytics_storage: 'denied',
                });
            } catch {
                /* ignore */
            }
            s.remove();
            return;
        }
        window.__ddGtagScriptLoaded = true;
        window.gtag('js', new Date());
        window.gtag('config', measurementId, {
            send_page_view: true,
        });
        if (readCookieConsent() === 'accepted') {
            window.gtag('consent', 'update', {
                analytics_storage: 'granted',
            });
        }
    };
    s.onerror = () => {
        window.__ddGtagScriptLoading = false;
    };
    document.head.appendChild(s);
}

function revokeAnalyticsAndRemoveGtag() {
    window.__ddGtagLoadGen = (window.__ddGtagLoadGen || 0) + 1;
    window.__ddGtagScriptLoading = false;
    window.__ddGtagScriptLoaded = false;
    removeGtagLibraryScripts();
    if (typeof window.gtag === 'function') {
        try {
            window.gtag('consent', 'update', {
                analytics_storage: 'denied',
            });
        } catch {
            /* ignore */
        }
    }
}

function readCookieConsent() {
    try {
        return localStorage.getItem(DD_COOKIE_CONSENT_KEY);
    } catch {
        return null;
    }
}

function writeCookieConsent(value) {
    try {
        localStorage.setItem(DD_COOKIE_CONSENT_KEY, value);
    } catch {
        /* private mode */
    }
}

function removeCookieBanner() {
    document.getElementById('dd-cookie-banner')?.remove();
}

function showCookieBanner(measurementId, forceReopen) {
    if (forceReopen) removeCookieBanner();
    else if (document.getElementById('dd-cookie-banner')) return;

    const banner = document.createElement('div');
    banner.id = 'dd-cookie-banner';
    banner.className = 'dd-cookie-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-modal', 'false');
    banner.setAttribute('aria-label', 'Einwilligung zur Webanalyse');
    banner.setAttribute('aria-live', 'polite');

    banner.innerHTML = `
        <div class="dd-cookie-banner__inner">
            <p class="dd-cookie-banner__text">
                Wir nutzen <strong>Google Analytics 4</strong> nur mit Ihrer Einwilligung, um die Nutzung unserer Website auszuwerten.
                Details finden Sie in der <a href="/datenschutz">Datenschutzerklärung</a>.
            </p>
            <div class="dd-cookie-banner__actions">
                <button type="button" class="dd-cookie-banner__btn dd-cookie-banner__btn--secondary" data-dd-consent="reject">Ablehnen</button>
                <button type="button" class="dd-cookie-banner__btn dd-cookie-banner__btn--primary" data-dd-consent="accept">Analyse erlauben</button>
            </div>
        </div>
    `;

    banner.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-dd-consent]');
        if (!btn) return;
        const choice = btn.getAttribute('data-dd-consent');
        if (choice === 'accept') {
            writeCookieConsent('accepted');
            removeCookieBanner();
            ensureGtagStub();
            if (window.__ddGtagScriptLoaded) {
                window.gtag('consent', 'update', {
                    analytics_storage: 'granted',
                });
            } else {
                ensureGtagJsLoaded(measurementId);
            }
        } else if (choice === 'reject') {
            writeCookieConsent('rejected');
            removeCookieBanner();
            revokeAnalyticsAndRemoveGtag();
        }
    });

    document.body.appendChild(banner);
    const primary = banner.querySelector('.dd-cookie-banner__btn--primary');
    if (primary) primary.focus();
}

function openDdCookieConsentBanner() {
    if (!isGaProductionHost()) return;
    const measurementId = window.__DD_GA_MEASUREMENT_ID__ || DD_GA_MEASUREMENT_ID;
    ensureGtagStub();
    if (!document.getElementById('dd-consent-bootstrap')) {
        ensureConsentDefaultsFromMain();
    }
    showCookieBanner(measurementId, true);
}

function registerDdCookieFooterOpener() {
    if (window.__ddCookieFooterOpenerRegistered) return;
    window.__ddCookieFooterOpenerRegistered = true;
    document.addEventListener('click', (e) => {
        const a = e.target.closest('a.dd-footer-open-cookies');
        if (!a) return;
        e.preventDefault();
        openDdCookieConsentBanner();
    });
}

function scheduleCookieBannerShow(measurementId) {
    const show = () => {
        if (readCookieConsent() !== null) return;
        showCookieBanner(measurementId);
    };
    const run = () => setTimeout(show, DD_COOKIE_BANNER_DELAY_MS);
    if (document.readyState === 'complete') {
        run();
    } else {
        window.addEventListener('load', run, { once: true });
    }
}

function initCookieConsentAndGa() {
    if (!isGaProductionHost()) return;

    const measurementId = window.__DD_GA_MEASUREMENT_ID__ || DD_GA_MEASUREMENT_ID;
    ensureGtagStub();
    if (!document.getElementById('dd-consent-bootstrap')) {
        ensureConsentDefaultsFromMain();
    }

    const consent = readCookieConsent();
    if (consent === 'rejected') {
        return;
    }
    if (consent === 'accepted') {
        ensureGtagJsLoaded(measurementId);
        return;
    }
    scheduleCookieBannerShow(measurementId);
}

const GSAP_CORE_URL = 'https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js';
const SCROLL_TRIGGER_URL = 'https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/ScrollTrigger.min.js';
const LENIS_URL = 'https://cdn.jsdelivr.net/gh/studio-freight/lenis@1.0.29/bundled/lenis.min.js';

function loadScript(src) {
    return new Promise((resolve, reject) => {
        const existing = document.querySelector(`script[src="${src}"]`);
        if (existing) {
            if (existing.dataset.loaded === '1') {
                resolve();
                return;
            }
            existing.addEventListener('load', () => resolve(), { once: true });
            existing.addEventListener('error', () => reject(new Error(src)), { once: true });
            return;
        }

        const script = document.createElement('script');
        script.src = src;
        script.async = true;
        script.onload = () => {
            script.dataset.loaded = '1';
            resolve();
        };
        script.onerror = () => reject(new Error(src));
        document.head.appendChild(script);
    });
}

function waitForGlobal(name, maxAttempts = 200) {
    return new Promise((resolve) => {
        let attempts = 0;
        function check() {
            if (typeof window[name] !== 'undefined') {
                resolve(true);
            } else if (attempts++ < maxAttempts) {
                requestAnimationFrame(check);
            } else {
                resolve(false);
            }
        }
        requestAnimationFrame(check);
    });
}

/** ScrollTrigger + Lenis erst nach Idle oder Interaktion (weniger TBT beim Start). */
function deferScrollEnhancements(maxMs = 5000) {
    return new Promise((resolve) => {
        let settled = false;
        const finish = () => {
            if (settled) return;
            settled = true;
            resolve();
        };

        const timer = setTimeout(finish, maxMs);
        const opts = { passive: true, once: true };
        const onInteract = () => {
            window.removeEventListener('scroll', onInteract, opts);
            window.removeEventListener('wheel', onInteract, opts);
            window.removeEventListener('touchstart', onInteract, opts);
            window.removeEventListener('keydown', onInteract, opts);
            clearTimeout(timer);
            finish();
        };

        if ('requestIdleCallback' in window) {
            requestIdleCallback(
                () => {
                    window.addEventListener('scroll', onInteract, opts);
                    window.addEventListener('wheel', onInteract, opts);
                    window.addEventListener('touchstart', onInteract, opts);
                    window.addEventListener('keydown', onInteract, opts);
                },
                { timeout: Math.min(maxMs, 3000) },
            );
        } else {
            window.addEventListener('scroll', onInteract, opts);
            window.addEventListener('wheel', onInteract, opts);
            window.addEventListener('touchstart', onInteract, opts);
            window.addEventListener('keydown', onInteract, opts);
        }
    });
}

async function loadGsapCore() {
    if (typeof gsap !== 'undefined') return;
    await loadScript(GSAP_CORE_URL);
    await waitForGlobal('gsap');
}

async function loadScrollLibraries() {
    if (typeof gsap === 'undefined') {
        await loadGsapCore();
    }

    const loads = [];
    if (typeof ScrollTrigger === 'undefined') {
        loads.push(loadScript(SCROLL_TRIGGER_URL));
    }
    if (typeof Lenis === 'undefined') {
        loads.push(loadScript(LENIS_URL));
    }
    if (loads.length) {
        await Promise.all(loads);
    }
    await waitForGlobal('ScrollTrigger');
    configureScrollTrigger();
    await waitForGlobal('Lenis');
}


// Lenis Smooth Scrolling - Maximale Performance
function attachLenisScrollerProxy() {
    if (!lenis || typeof ScrollTrigger === 'undefined') return;

    ScrollTrigger.scrollerProxy(document.documentElement, {
        scrollTop(value) {
            if (arguments.length) {
                lenis.scrollTo(value, { immediate: true });
            }
            return lenis.scroll;
        },
        getBoundingClientRect() {
            return {
                top: 0,
                left: 0,
                width: window.innerWidth,
                height: window.innerHeight,
            };
        },
    });
}

function initLenis() {
    gsap.registerPlugin(ScrollTrigger);

    if (prefersReducedMotion() || isMobile()) {
        return;
    }

    lenis = new Lenis({
        duration: 1.0,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smooth: true,
        smoothTouch: false,
        touchMultiplier: 2,
        infinite: false,
    });

    lenis.on('scroll', () => {
        ScrollTrigger.update();
    });

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    gsap.ticker.lagSmoothing(0);
    ScrollTrigger.defaults({ limitCallbacks: true });

    window.addEventListener('beforeunload', () => {
        if (lenis) {
            lenis.destroy();
        }
    });
}

/** Passt H1 + Absatz per Skalierung exakt in den verfügbaren Hero-Textbereich (ResizeObserver + rAF). */
let scheduleHeroTextFit = null;

function initHeroTextFit() {
    const section = document.querySelector('main .hero.hero-minimal');
    const content = section?.querySelector('.hero-minimal-content');
    if (!section || !content) return;

    const MIN_SCALE = 0.42;
    const MAX_ITER = 12;
    let raf = 0;

    const fits = () =>
        content.scrollHeight <= content.clientHeight + 1 &&
        content.scrollWidth <= content.clientWidth + 1;

    const fit = () => {
        section.style.setProperty('--hero-fit-scale', '1');
        const availH = content.clientHeight;
        if (availH <= 0) return;

        // Höhe nur Desktop fixieren (CLS) — auf Mobile kein min-height-Lock
        const lockedH = content.offsetHeight;
        if (isMobile()) {
            content.style.minHeight = '';
        } else if (lockedH > 0) {
            content.style.minHeight = `${lockedH}px`;
        }

        if (fits()) {
            section.classList.add('hero-text-fit-ready');
            return;
        }

        let lo = MIN_SCALE;
        let hi = 1;
        let best = MIN_SCALE;

        for (let i = 0; i < MAX_ITER; i++) {
            const mid = (lo + hi) / 2;
            section.style.setProperty('--hero-fit-scale', mid.toFixed(4));
            if (fits()) {
                best = mid;
                lo = mid;
            } else {
                hi = mid;
            }
        }

        section.style.setProperty('--hero-fit-scale', best.toFixed(4));
        section.classList.add('hero-text-fit-ready');
    };

    scheduleHeroTextFit = () => {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(fit);
    };

    scheduleHeroTextFit();
    if (document.fonts?.ready) {
        document.fonts.ready.then(scheduleHeroTextFit).catch(() => {});
    }

    const ro = new ResizeObserver(scheduleHeroTextFit);
    ro.observe(section);
}

/** Portfolio-Videos: src im HTML, nur play/pause (kein Lazy-Load der Quelle). */
function initLeistungenVideos() {
    const videos = document.querySelectorAll('#leistungen video');
    if (!videos.length) return;

    const tryPlay = (video) => {
        if (prefersReducedMotion()) {
            video.pause();
            return;
        }
        const p = video.play();
        if (p && typeof p.catch === 'function') p.catch(() => {});
    };

    videos.forEach((video) => {
        tryPlay(video);
        video.addEventListener('loadeddata', () => tryPlay(video), { once: true });
    });

    if (!('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                const video = entry.target;
                if (entry.isIntersecting) {
                    tryPlay(video);
                } else {
                    video.pause();
                }
            });
        },
        { rootMargin: '80px 0px', threshold: 0.15 },
    );

    videos.forEach((video) => observer.observe(video));
}

/** Hero-Einstieg läuft per CSS; nach Ende Text-Fit neu berechnen. */
function initHeroMinimalEntrance() {
    const markDone = () => {
        document.body.classList.add('hero-minimal-anim-done');
        scheduleHeroTextFit?.();
    };

    if (prefersReducedMotion()) {
        markDone();
        return;
    }

    const lastWord = document.querySelector(
        '.hero-minimal-text .hero-split:last-of-type .hero-split__inner',
    );
    if (!lastWord) {
        markDone();
        return;
    }

    lastWord.addEventListener('animationend', markDone, { once: true });
}

function initScrollGsapEffects() {
    // Text Animation
    const textElement = document.querySelector(".text-p");
    if (textElement) {
        
        const rootStyles = getComputedStyle(document.documentElement);
        const colorBlack = rootStyles.getPropertyValue('--color-black').trim();
        const colorTextInactive = rootStyles.getPropertyValue('--color-text-inactive').trim();
        
        const words = textElement.textContent.split(" ");
        textElement.innerHTML = words.map(word => `<span style="color:${colorTextInactive};">${word}</span>`).join(" ");

        const wordSpans = document.querySelectorAll(".text-p span");
        const totalWords = wordSpans.length;

        gsap.to({ progress: 0 }, {
            progress: 1,
            ease: "none",
            scrollTrigger: {
                trigger: ".text",
                start: isMobile() ? "top 50%" : "top 50%",  // Früher auf Desktop
                end: isMobile() ? "bottom 90%" : "bottom 100%",
                scrub: 1,
                onUpdate: (self) => {
                    wordSpans.forEach((span, index) => {
                        const slowFactor = 1;
                        const wordProgress = (self.progress * totalWords * slowFactor - index);
                        if (wordProgress >= 0) {
                            span.style.color = colorBlack;
                        } else {
                            span.style.color = colorTextInactive;
                        }
                    });
                }
            }
        });
    }

    // Kundenkommen Text Color Swap Animation
    const kundenkommenP = document.querySelector(".kundenkommen-p");
    const teamList = document.querySelector(".team-list");

    if (kundenkommenP && teamList) {
        ScrollTrigger.create({
            trigger: teamList,
            start: "top -50%",
            end: "bottom 50%",
            onEnter: () => {
                kundenkommenP.classList.add("swapped");
            },

            onEnterBack: () => {
                kundenkommenP.classList.add("swapped");
            },
            onLeaveBack: () => {
                kundenkommenP.classList.remove("swapped");
            }
        });
    }

    // Header nach oben scrollen wenn Footer aufgedeckt wird
    const header = document.querySelector("header");
    const footerElement = document.querySelector(".footer");
    if (header && footerElement) {
        gsap.to(header, {
            y: -200,
            ease: "power2.out",
            scrollTrigger: {
                trigger: ".footer",
                start: "top bottom",
                end: "bottom bottom",
                scrub: 1
            }
        });
    }

    // Gründe Section Animation
    initGruendeAnimation();

    // Stats-Nummern: von unten nach oben einblenden wenn stats-grid sichtbar wird
    const statsGrid = document.querySelector(".stats-grid");
    if (statsGrid && !prefersReducedMotion()) {
        const numberEls = statsGrid.querySelectorAll(".stats-item-number");
        gsap.set(numberEls, { yPercent: 100 });

        ScrollTrigger.create({
            trigger: statsGrid,
            start: "top 80%",
            onEnter: () => {
                gsap.to(numberEls, {
                    yPercent: 0,
                    duration: 1.4,
                    ease: "power3.out",
                    stagger: 0.25,
                });
            },
        });
    }

    // Smooth Scroll für alle Anchor-Links mit Lenis
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#' || href === '#top') return;

            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                if (lenis) {
                    lenis.scrollTo(target, {
                        offset: 0,
                        duration: 1.2,
                        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
                    });
                } else {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        }, { passive: false });
    });
}

function initUiInteractions() {
    const burgerBtn = document.querySelector('.burger-btn');
    const footer = document.querySelector('.footer');
    const mobileNav = document.querySelector('.mobile-nav');

    if (burgerBtn && mobileNav) {
        // Cache DOM queries
        const mainItemInners = () => mobileNav.querySelectorAll('.mobile-nav-main-item .mobile-nav-item-inner');
        const allSubItems = () => mobileNav.querySelectorAll('.mobile-nav-sub-item');
        const openSubItemInners = () => mobileNav.querySelectorAll('.mobile-nav-sub-item.is-open .mobile-nav-item-inner');
        const allSubSubItems = () => mobileNav.querySelectorAll('.mobile-nav-sub-sub-item');
        const openSubSubItemInners = () => mobileNav.querySelectorAll('.mobile-nav-sub-sub-item.is-open .mobile-nav-item-inner');
        const TRANSITION_DURATION = 550;
        
        // Helper Functions
        const closeMainLinks = () => {
            mainItemInners().forEach(item => item.classList.remove('is-open'));
        };
        
        const openMainLinks = () => {
            const inners = mainItemInners();
            
            // Ensure all inner elements start without is-open class
            inners.forEach(item => {
                item.classList.remove('is-open');
            });
            
            // Single forced reflow to ensure browser recognizes initial state (batched)
            void mobileNav.offsetHeight;
            
            // Add is-open class with proper timing to trigger animation
            // Single requestAnimationFrame is sufficient
            requestAnimationFrame(() => {
                inners.forEach((item, index) => {
                    item.classList.add('is-open');
                });
            });
        };
        
        const closeSubLinks = (callback) => {
            // Remove is-open from all sub-link inners (triggers reverse animation)
            // IMPORTANT: Keep items with is-open so they remain visible during animation
            openSubItemInners().forEach(inner => inner.classList.remove('is-open'));
            
            // Close back button inner (triggers reverse animation)
            const backInner = mobileNav.querySelector('.mobile-nav-back-item .mobile-nav-item-inner');
            if (backInner) backInner.classList.remove('is-open');
            
            // Always wait for animation to complete before hiding containers
            setTimeout(() => {
                // Hide all sub-groups after animation completes
                mobileNav.querySelectorAll('.mobile-nav-sub-group').forEach(group => {
                    group.classList.remove('is-open');
                });
                
                // Remove is-open from all items after animation completes
                allSubItems().forEach(item => item.classList.remove('is-open'));
                
                // Call callback if provided
                if (callback) callback();
            }, TRANSITION_DURATION);
        };
        
        const hideSubItems = () => {
            // Hide all sub-groups (containers)
            mobileNav.querySelectorAll('.mobile-nav-sub-group').forEach(group => {
                group.classList.remove('is-open');
            });
            // Also hide individual items
            allSubItems().forEach(item => {
                item.classList.remove('is-open');
                const inner = item.querySelector('.mobile-nav-item-inner');
                if (inner) inner.classList.remove('is-open');
            });
        };
        
        const openSubLinks = (groupName) => {
            // Hide all sub-groups first
            mobileNav.querySelectorAll('.mobile-nav-sub-group').forEach(group => {
                group.classList.remove('is-open');
            });
            
            // Show the correct group container
            const group = mobileNav.querySelector(`.mobile-nav-sub-group-${groupName}`);
            if (!group) return;
            
            group.classList.add('is-open');
            
            // Get all sub-items within this group
            const subItems = group.querySelectorAll('.mobile-nav-sub-item');
            
            // Batch DOM operations
            const itemsData = Array.from(subItems).map((item, index) => {
                item.classList.add('is-open');
                const inner = item.querySelector('.mobile-nav-item-inner');
                const link = inner?.querySelector('.mobile-nav-link');
                if (link) link.style.transitionDelay = `${0.05 + (index * 0.05)}s`;
                return { item, inner };
            });
            
            // Force reflow
            if (itemsData.length > 0) {
                void itemsData[0].item.offsetHeight;
            }
            
            // Animate items
            const backItem = mobileNav.querySelector('.mobile-nav-back-item');
            const backInner = backItem?.querySelector('.mobile-nav-item-inner');
            
            requestAnimationFrame(() => {
                itemsData.forEach(({ inner }) => {
                    if (inner) inner.classList.add('is-open');
                });
                if (backInner) backInner.classList.add('is-open');
            });
        };
        
        // Sub-Sub-Links functions (exact copy of sub-links pattern)
        const closeSubSubLinks = (callback) => {
            openSubSubItemInners().forEach(inner => inner.classList.remove('is-open'));
            const backInner = mobileNav.querySelector('.mobile-nav-back-sub-item .mobile-nav-item-inner');
            if (backInner) {
                backInner.classList.remove('is-open');
            }
            if (callback) {
                setTimeout(callback, TRANSITION_DURATION);
            }
        };
        
        const hideSubSubItems = () => {
            allSubSubItems().forEach(item => item.classList.remove('is-open'));
        };
        
        const openSubSubLinks = (subSubItemsSelector) => {
            const subSubItems = mobileNav.querySelectorAll(subSubItemsSelector);
            const itemsData = Array.from(subSubItems).map((item, index) => {
                item.classList.add('is-open');
                const inner = item.querySelector('.mobile-nav-item-inner');
                const link = inner.querySelector('.mobile-nav-link');
                link.style.transitionDelay = `${0.05 + (index * 0.05)}s`;
                return { item, inner };
            });
            
            if (itemsData.length > 0) {
                void itemsData[0].item.offsetHeight;
            }
            
            const backItem = mobileNav.querySelector('.mobile-nav-back-sub-item');
            const backInner = backItem?.querySelector('.mobile-nav-item-inner');
            
            requestAnimationFrame(() => {
                itemsData.forEach(({ inner }) => {
                    inner.classList.add('is-open');
                });
                if (backInner) {
                    backInner.classList.add('is-open');
                }
            });
        };
        
        const closeMenu = () => {
            burgerBtn.classList.remove('active');
            mobileNav.classList.remove('is-open', 'has-subs-open', 'has-sub-subs-open');
            mobileNav.setAttribute('aria-hidden', 'true');
            burgerBtn.setAttribute('aria-expanded', 'false');
            if (footer) footer.classList.remove('is-hidden');
            document.body.classList.remove('menu-open');
            if (lenis) lenis.start();
        };
        
        const openMenu = () => {
            burgerBtn.classList.add('active');
            mobileNav.classList.add('is-open');
            mobileNav.classList.remove('has-subs-open', 'has-sub-subs-open');
            mobileNav.setAttribute('aria-hidden', 'false');
            burgerBtn.setAttribute('aria-expanded', 'true');
            if (footer) footer.classList.add('is-hidden');
            document.body.classList.add('menu-open');
            if (lenis) lenis.stop();
        };
        burgerBtn.addEventListener('click', (e) => {
            const clickedClose = e.target.closest('.burger-btn-close');
            const isOpen = burgerBtn.classList.contains('active');
            
            if (clickedClose) {
                // X geklickt: Menü schließen
                closeSubSubLinks();
                closeSubLinks();
                closeMainLinks();
                setTimeout(() => {
                    hideSubSubItems();
                    hideSubItems();
                    closeMenu();
                }, TRANSITION_DURATION);
            } else {
                // ☰ geklickt: Menü öffnen
                // Ensure preload is removed (in case menu opens before DOMContentLoaded completes)
                document.body.classList.remove('preload');
                
                // Ensure inner elements don't have is-open before opening
                mainItemInners().forEach(item => {
                    item.classList.remove('is-open');
                });
                
                openMenu();
                
                // Force reflow to ensure browser recognizes initial state before animating
                void mobileNav.offsetHeight;
                
                // Small delay to ensure browser recognizes initial state
                requestAnimationFrame(() => {
                    openMainLinks();
                });
                hideSubItems();
                hideSubSubItems();
            }
        }, { passive: true });
        
        // Schließe Mobile Nav beim Klick auf einen echten Link (but not triggers)
        mobileNav.addEventListener('click', (e) => {
            const link = e.target.closest('a.mobile-nav-link');
            const isTrigger = e.target.closest('.mobile-nav-trigger');
            if (link && !isTrigger) {
                hideSubSubItems();
                hideSubItems();
                closeMenu();
            }
        }, { passive: true });

        // Mobile Nav: Unterpunkte auf-/zuklappen (Leistungen + Fakten)
        mobileNav.querySelectorAll('.mobile-nav-trigger-leistungen, .mobile-nav-trigger-fakten, .mobile-nav-trigger-kategorien').forEach(trigger => {
            trigger.addEventListener('click', (e) => {
                e.preventDefault();
                
                closeMainLinks();
                hideSubItems();
                hideSubSubItems();
                
                setTimeout(() => {
                    mobileNav.classList.add('has-subs-open');
                    let groupName = 'fakten';
                    if (trigger.classList.contains('mobile-nav-trigger-leistungen')) {
                        groupName = 'leistungen';
                    } else if (trigger.classList.contains('mobile-nav-trigger-kategorien')) {
                        groupName = 'kategorien';
                    }
                    openSubLinks(groupName);
                }, TRANSITION_DURATION);
            });
        });
        
        // Back Button: Zurück zum Hauptmenü
        const backBtn = mobileNav.querySelector('.mobile-nav-back-btn');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                closeSubSubLinks();
                closeSubLinks(() => {
                    hideSubSubItems();
                    hideSubItems();
                    mobileNav.classList.remove('has-subs-open', 'has-sub-subs-open');
                    openMainLinks();
                });
            });
        }
        
    }
    
    // FAQ Accordion: Schließe andere Items wenn eines geöffnet wird
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        item.addEventListener('toggle', () => {
            if (item.open) {
                faqItems.forEach(otherItem => {
                    if (otherItem !== item && otherItem.open) {
                        otherItem.open = false;
                    }
                });
            }
        });
    });
}

// Gründe Section Scroll Animation
function initGruendeAnimation() {
    const descItems = document.querySelectorAll('.gruende-desc-item');
    const titles = document.querySelectorAll('.gruende-item-title');
    const descs = document.querySelectorAll('.gruende-item-desc');
    
    if (!descItems.length || !titles.length) return;
    
    // Mobile Detection - no animation on mobile
    if (isMobile()) return;
    
    // Helper to deactivate all
    function deactivateAll() {
        titles.forEach(t => t.classList.remove('is-active'));
        descs.forEach(d => d.classList.remove('is-active'));
    }
    
    descItems.forEach((descItem) => {
        const index = descItem.dataset.index;
        const desc = descItem.querySelector('.gruende-item-desc');
        const title = document.querySelector(`.gruende-item-title[data-index="${index}"]`);
        
        if (!title || !desc) return;
        
        // ScrollTrigger for each description
        ScrollTrigger.create({
            trigger: descItem,
            start: 'top 50%',
            end: 'bottom 50%',
            onEnter: () => {
                deactivateAll();
                title.classList.add('is-active');
                desc.classList.add('is-active');
            },
            onLeave: () => {
                title.classList.remove('is-active');
                desc.classList.remove('is-active');
            },
            onEnterBack: () => {
                deactivateAll();
                title.classList.add('is-active');
                desc.classList.add('is-active');
            },
            onLeaveBack: () => {
                title.classList.remove('is-active');
                desc.classList.remove('is-active');
            }
        });
    });
}

/**
 * Sections: einmal Schwellpunkt im Viewport → dann nacheinander weiche Einblendung (CSS transition).
 */
function initSectionScrollReveal() {
    if (prefersReducedMotion()) return;

    const main = document.querySelector('main');
    if (!main) return;

    const sections = main.querySelectorAll('section');
    if (!sections.length) return;

    document.documentElement.classList.add('dd-reveal-enabled');

    function collectRevealTargets(section) {
        const targets = [];
        for (const child of section.children) {
            if (child.matches('ul, ol')) {
                child.querySelectorAll(':scope > li').forEach((li) => targets.push(li));
            } else {
                targets.push(child);
            }
        }
        return targets;
    }

    sections.forEach((section) => {
        // Hero sofort sichtbar — kein opacity:0 beim Laden (verhindert leeren Viewport / falsches LCP)
        if (section.classList.contains('hero') || section.classList.contains('hero-minimal')) {
            section.classList.add('dd-reveal--in');
            return;
        }

        const targets = collectRevealTargets(section);
        targets.forEach((el, i) => {
            el.classList.add('dd-reveal-target');
            el.style.setProperty('--dd-reveal-i', String(i));
        });
    });

    const io = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('dd-reveal--in');
                io.unobserve(entry.target);
            });
        },
        {
            root: null,
            rootMargin: '0px 0px -22% 0px',
            threshold: 0,
        }
    );

    sections.forEach((section) => io.observe(section));
}

/** Desktop-Mega-Menü: Hover setzt body-Klasse, Overlay bleibt bis Klick auf Fläche ohne Unterlink (kein reines CSS-:hover am Panel). */
function initDesktopNavMegaMenu() {
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)');
    const openL = 'dd-nav-open--leistungen';
    const openF = 'dd-nav-open--fakten';
    const openK = 'dd-nav-open--kategorien';

    function closeAll() {
        document.body.classList.remove(openL, openF, openK);
    }

    function wireTriggers() {
        document.querySelectorAll('.nav-leistungen-link').forEach((el) => {
            el.addEventListener('mouseenter', () => {
                if (!mq.matches) return;
                document.body.classList.remove(openF, openK);
                document.body.classList.add(openL);
            });
        });
        document.querySelectorAll('.nav-fakten-link').forEach((el) => {
            el.addEventListener('mouseenter', () => {
                if (!mq.matches) return;
                document.body.classList.remove(openL, openK);
                document.body.classList.add(openF);
            });
        });
        document.querySelectorAll('.nav-kategorien-link').forEach((el) => {
            el.addEventListener('mouseenter', () => {
                if (!mq.matches) return;
                document.body.classList.remove(openL, openF);
                document.body.classList.add(openK);
            });
        });
    }

    document.addEventListener(
        'click',
        (e) => {
            if (!mq.matches) return;
            const panel = e.target.closest('#leistungen-dropdown, #fakten-dropdown, #kategorien-dropdown');
            if (!panel) return;
            if (e.target.closest('a.leistungen-dropdown-link, a.fakten-dropdown-link')) return;
            closeAll();
        },
        true
    );

    document.addEventListener('focusin', (e) => {
        if (!mq.matches) return;
        const t = e.target;
        if (t.closest('#leistungen-dropdown')) {
            document.body.classList.remove(openF, openK);
            document.body.classList.add(openL);
            return;
        }
        if (t.closest('#fakten-dropdown')) {
            document.body.classList.remove(openL, openK);
            document.body.classList.add(openF);
            return;
        }
        if (t.closest('#kategorien-dropdown')) {
            document.body.classList.remove(openL, openF);
            document.body.classList.add(openK);
            return;
        }
        if (t.closest('.nav-leistungen-link')) {
            document.body.classList.remove(openF, openK);
            document.body.classList.add(openL);
            return;
        }
        if (t.closest('.nav-fakten-link')) {
            document.body.classList.remove(openL, openK);
            document.body.classList.add(openF);
            return;
        }
        if (t.closest('.nav-kategorien-link')) {
            document.body.classList.remove(openL, openF);
            document.body.classList.add(openK);
        }
    });

    mq.addEventListener('change', () => {
        if (!mq.matches) closeAll();
    });

    wireTriggers();
}

/** ScrollTrigger-Layout neu berechnen, ohne sichtbaren Sprung von scrollY=0. */
function finalizeScrollLayout() {
    if (typeof ScrollTrigger === 'undefined') return;

    if (!hasScrollHash()) {
        resetPageScrollTop();
    }

    if (lenis) {
        lenis.stop();
    }

    ScrollTrigger.clearScrollMemory();
    ScrollTrigger.refresh();

    if (!hasScrollHash()) {
        resetPageScrollTop();
    }

    if (lenis) {
        lenis.scrollTo(0, { immediate: true });
        lenis.start();
    }

    ScrollTrigger.update();
}

function initScrollEnhancements() {
    armHomeScrollAnchorGuard();
    registerScrollRefreshGuard();

    withScrollInitLock(() => {
        initLenis();
        if (!hasScrollHash()) {
            resetPageScrollTop();
        }
        // Erst native Scroll + refresh (kein Lenis-Proxy) — vermeidet Start-Sprung
        initScrollGsapEffects();
        finalizeScrollLayout();
        attachLenisScrollerProxy();
        if (!hasScrollHash()) {
            resetPageScrollTop();
        }
        if (typeof ScrollTrigger !== 'undefined') {
            ScrollTrigger.update();
        }
    });

    scrollEnhancementsReady = true;
    syncScrollAfterFullLoad();
}

/** Nach window.load nur update + Scroll-Anker — kein refresh (Timeline-Sprung). */
function syncScrollAfterFullLoad() {
    const run = () => {
        if (!scrollEnhancementsReady || hasScrollHash()) return;
        enforceHomeScrollAnchor();
        if (typeof ScrollTrigger !== 'undefined') {
            ScrollTrigger.update();
        }
        requestAnimationFrame(enforceHomeScrollAnchor);
    };

    if (document.readyState === 'complete') {
        run();
    } else {
        window.addEventListener('load', run, { once: true });
    }
}

// Initialisierung
document.addEventListener('DOMContentLoaded', () => {
    if (!hasScrollHash()) {
        resetPageScrollTop();
    }
    armHomeScrollAnchorGuard();

    // Preload-Klasse entfernen synchron (verhindert Transitions beim Laden, aber erlaubt sie für Menü)
    document.body.classList.remove('preload');

    initCookieConsentAndGa();
    registerDdCookieFooterOpener();

    initPageTransition();
    initHeroTextFit();
    initSectionScrollReveal();
    initDesktopNavMegaMenu();
    
    // Zusammenfassung-Cards: Klick auf Card togglet Checkbox
    document.querySelectorAll('.fakten-zsmfassung-card').forEach(card => {
        const checkbox = card.querySelector('.fakten-zsmfassung-checkbox');
        if (!checkbox) return;
        card.addEventListener('click', (e) => {
            if (e.target === checkbox) return;
            checkbox.checked = !checkbox.checked;
            card.setAttribute('aria-pressed', checkbox.checked);
        });
        checkbox.addEventListener('change', () => {
            card.setAttribute('aria-pressed', checkbox.checked);
        });
    });
    
    // Leistungen + Fakten Dropdown (Desktop) – ein Delegat für alle
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('.nav-dropdown-btn');
        if (btn) {
            // Ensure preload is removed for desktop dropdown animations
            document.body.classList.remove('preload');
            
            const id = btn.getAttribute('aria-controls');
            const panel = id ? document.getElementById(id) : null;
            if (!panel) return;
            const isOpen = panel.classList.contains('is-open');
            
            // Close all panels and remove is-open from inner containers
            document.querySelectorAll('.nav-dropdown-panel').forEach(p => {
                p.classList.remove('is-open');
                p.classList.remove('has-subs-open');
                p.setAttribute('aria-hidden', 'true');
                // Remove is-open from inner containers and sub-items
                p.querySelectorAll('.leistungen-dropdown-inner, .fakten-dropdown-inner').forEach(inner => {
                    inner.classList.remove('is-open');
                });
            });
            document.querySelectorAll('.nav-dropdown-btn').forEach(b => b.setAttribute('aria-expanded', 'false'));
            
            if (!isOpen) {
                // Ensure inner containers don't have is-open before opening
                panel.querySelectorAll('.leistungen-dropdown-inner, .fakten-dropdown-inner').forEach(inner => {
                    inner.classList.remove('is-open');
                });
                
                panel.classList.add('is-open');
                panel.setAttribute('aria-hidden', 'false');
                btn.setAttribute('aria-expanded', 'true');
                
                // Force reflow to ensure browser recognizes initial state
                void panel.offsetHeight;
                
                // Animate links like mobile nav
                requestAnimationFrame(() => {
                    const inners = panel.querySelectorAll('.leistungen-dropdown-main-item .leistungen-dropdown-inner, .fakten-dropdown-inner');
                    inners.forEach(inner => {
                        inner.classList.add('is-open');
                    });
                });
                
                if (lenis) lenis.stop();
            } else if (lenis) lenis.start();
            return;
        }
        
        const link = e.target.closest('.leistungen-dropdown-link, .fakten-dropdown-link');
        const openPanel = document.querySelector('.nav-dropdown-panel.is-open');
        
        // Handle clicks on links (close immediately)
        if (link) {
            document.querySelectorAll('.nav-dropdown-panel').forEach(p => {
                p.classList.remove('is-open');
                p.classList.remove('has-subs-open');
                p.setAttribute('aria-hidden', 'true');
            });
            document.querySelectorAll('.nav-dropdown-btn').forEach(b => b.setAttribute('aria-expanded', 'false'));
            if (lenis) lenis.start();
            return;
        }
        
        // Handle clicks on overlay/backdrop (clicking on panel but not on interactive content) - close with reverse animation
        if (openPanel && openPanel.contains(e.target)) {
            // Check if clicking on backdrop (panel itself or list container, but not on list items, links, or buttons)
            const clickedOnListItem = e.target.closest('li');
            const clickedOnButton = e.target.closest('button');
            const clickedOnLink = e.target.closest('a');
            const clickedOnBackdrop = !clickedOnListItem && !clickedOnButton && !clickedOnLink && 
                                      (e.target === openPanel || e.target.classList.contains('leistungen-dropdown-list') || e.target.classList.contains('fakten-dropdown-list'));
            
            if (clickedOnBackdrop) {
                const TRANSITION_DURATION = 550;
                const mainItems = openPanel.querySelectorAll('.leistungen-dropdown-main-item');
                mainItems.forEach(item => {
                    const inner = item.querySelector('.leistungen-dropdown-inner');
                    if (inner) inner.classList.remove('is-open');
                });
                setTimeout(() => {
                    openPanel.classList.remove('is-open');
                    openPanel.setAttribute('aria-hidden', 'true');
                    document.querySelectorAll('.nav-dropdown-btn').forEach(b => b.setAttribute('aria-expanded', 'false'));
                    if (lenis) lenis.start();
                }, TRANSITION_DURATION);
            }
            return;
        }
    });
    
    // Fragebogen-Funktionalität (Fragebogen nutzt wie alle anderen Seiten das gleiche Menü)
    if (document.body.classList.contains('fragebogen-page')) {
        initFragebogen();
    }

    if (document.body.classList.contains('kontakt-page')) {
        initKontaktForm();
    }

    if (document.body.classList.contains('page-preisrechner')) {
        initPreisrechner();
        initCalcCostNav();
    }


    initUiInteractions();

    initHeroMinimalEntrance();
    initLeistungenVideos();

    deferScrollEnhancements()
        .then(() => loadScrollLibraries())
        .then(() => initScrollEnhancements())
        .catch((error) => console.warn('Scroll-Libraries konnten nicht geladen werden:', error));
});

window.addEventListener('pageshow', (event) => {
    if (hasScrollHash()) return;

    armHomeScrollAnchorGuard();

    if (event.persisted && typeof ScrollTrigger !== 'undefined') {
        withScrollInitLock(() => {
            resetPageScrollTop();
            if (lenis) lenis.stop();
            ScrollTrigger.clearScrollMemory();
            ScrollTrigger.refresh();
            resetPageScrollTop();
            if (lenis) {
                lenis.scrollTo(0, { immediate: true });
                lenis.start();
            }
            ScrollTrigger.update();
        });
        return;
    }

    enforceHomeScrollAnchor();
    if (typeof ScrollTrigger !== 'undefined') {
        ScrollTrigger.update();
    }
});

// Page Transition: View Transitions API when supported, else overlay (kept)
function initPageTransition() {
    const t = document.querySelector('.page-transition');
    const useViewTransitionApi = typeof document.startViewTransition === 'function';

    // Reveal: when arriving from overlay flow (fallback, no VT)
    if (t && sessionStorage.getItem('transition')) {
        sessionStorage.removeItem('transition');
        if (!hasScrollHash()) {
            resetPageScrollTop();
        }
        t.classList.add('reveal');
        setTimeout(() => {
            t.classList.remove('reveal');
            document.documentElement.classList.remove('transitioning');
        }, 550);
    }

    // Use View Transitions API: let browser navigate (cross-document VT runs). Else use overlay.
    if (useViewTransitionApi) return;

    if (!t) return;
    document.addEventListener('click', (e) => {
        const link = e.target.closest('a[href]');
        if (!link) return;

        const href = link.getAttribute('href');
        if (link.target === '_blank') return;
        if (link.hostname !== location.hostname) return;
        if (href.startsWith('javascript:') || href.startsWith('mailto:') || href.startsWith('tel:')) return;
        if (href.startsWith('#')) return;

        e.preventDefault();
        sessionStorage.setItem('transition', '1');
        document.documentElement.classList.add('transitioning');
        t.classList.add('active');
        setTimeout(() => location.href = link.href, 550);
    });
}

// ========================================
// Kontaktseite (/kontakt)
// ========================================

function initKontaktForm() {
    const form = document.getElementById('kontakt-form') || document.querySelector('.kontakt-form');
    if (!form) return;

    const statusEl = form.querySelector('.kontakt-form-status');
    const submitBtn = form.querySelector('button[type="submit"]');

    form.addEventListener(
        'submit',
        async (e) => {
            e.preventDefault();
            if (!form.checkValidity()) {
                form.reportValidity();
                return;
            }

            const vorname = (document.getElementById('vorname')?.value ?? '').trim();
            const nachname = (document.getElementById('nachname')?.value ?? '').trim();
            const email = (document.getElementById('email')?.value ?? '').trim();
            const service = document.getElementById('service')?.value ?? '';
            const beschreibung = (document.getElementById('beschreibung')?.value ?? '').trim();

            if (statusEl) {
                statusEl.textContent = '';
                statusEl.classList.remove('is-error', 'is-success');
            }
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.setAttribute('aria-busy', 'true');
            }

            try {
                const res = await fetch('/leads/kontakt', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                    },
                    body: JSON.stringify({
                        first_name: vorname,
                        last_name: nachname,
                        email,
                        service,
                        message: beschreibung,
                    }),
                });
                let errText = '';
                const data = await res.json().catch(() => ({}));
                if (!res.ok) {
                    if (typeof data.detail === 'string') {
                        errText = data.detail;
                    } else if (Array.isArray(data.detail)) {
                        errText = data.detail.map((d) => d.msg || JSON.stringify(d)).join(' ');
                    } else if (data.detail) {
                        errText = String(data.detail);
                    } else {
                        errText = res.statusText;
                    }
                    throw new Error(errText);
                }
                form.reset();
                if (statusEl) {
                    statusEl.textContent =
                        'Vielen Dank! Wir haben Ihre Nachricht erhalten und melden uns schnellstmöglich.';
                    statusEl.classList.add('is-success');
                }
            } catch (err) {
                console.error('Kontaktformular:', err);
                const hint = err.message ? ` (${err.message})` : '';
                if (statusEl) {
                    statusEl.textContent =
                        'Das Senden ist fehlgeschlagen. Bitte später erneut versuchen oder an info@devdesignstudio.de schreiben.' +
                        hint;
                    statusEl.classList.add('is-error');
                }
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.removeAttribute('aria-busy');
                }
            }
        },
        { passive: false }
    );
}

// ========================================
// Fragebogen Functionality
// ========================================

function initFragebogen() {
    const totalSteps = 5;
    let currentStep = 1;
    
    // DOM Elements
    const questionContainers = document.querySelectorAll('.question-container[data-step]');
    const successContainer = document.querySelector('.question-container[data-step="success"]');
    const backBtn = document.querySelector('.nav-btn--back');
    const nextBtn = document.querySelector('.nav-btn--next');
    const submitBtn = document.querySelector('.nav-btn--submit');
    const progressFill = document.querySelector('.progress-fill');
    const progressSteps = document.querySelectorAll('.progress-step');
    
    // Form data storage
    const formData = {};
    
    // Initialize
    updateUI();
    setupOptionListeners();
    setupNavigation();
    
    // Setup option card listeners using event delegation for better performance
    function setupOptionListeners() {
        // Event delegation for all question options
        const fragebogenWrapper = document.querySelector('.fragebogen-wrapper');
        if (fragebogenWrapper) {
            fragebogenWrapper.addEventListener('change', (e) => {
                const input = e.target;
                if (input.type === 'radio') {
                    formData[input.name] = input.value;
                    updateNextButtonState();
                } else if (input.type === 'checkbox') {
                    const container = input.closest('.question-container');
                    if (container) {
                        const checkedBoxes = container.querySelectorAll('input[type="checkbox"]:checked');
                        formData[input.name] = Array.from(checkedBoxes).map(cb => cb.value);
                        updateNextButtonState();
                    }
                }
            }, { passive: true });
            
            // Contact form inputs with debounce for better performance
            fragebogenWrapper.addEventListener('input', (e) => {
                const input = e.target;
                if (input.closest('.contact-form')) {
                    formData[input.name] = input.value;
                    updateNextButtonState();
                }
            }, { passive: true });
        }
    }
    
    // Setup navigation buttons
    function setupNavigation() {
        backBtn.addEventListener('click', () => {
            if (currentStep > 1) {
                goToStep(currentStep - 1);
            }
        });
        
        nextBtn.addEventListener('click', () => {
            if (currentStep < totalSteps && isStepValid(currentStep)) {
                goToStep(currentStep + 1);
            }
        });
        
        submitBtn.addEventListener('click', () => {
            if (isStepValid(currentStep)) {
                submitForm();
            }
        });
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                const activeElement = document.activeElement;
                if (activeElement.tagName !== 'TEXTAREA') {
                    e.preventDefault();
                    if (currentStep === totalSteps) {
                        if (isStepValid(currentStep)) submitForm();
                    } else if (isStepValid(currentStep)) {
                        goToStep(currentStep + 1);
                    }
                }
            }
        });
        
        // Progress step clicks
        progressSteps.forEach(step => {
            step.addEventListener('click', () => {
                const targetStep = parseInt(step.dataset.step);
                if (targetStep < currentStep || canGoToStep(targetStep)) {
                    goToStep(targetStep);
                }
            });
            step.style.cursor = 'pointer';
        });
    }
    
    // Check if all previous steps are valid to allow jumping
    function canGoToStep(targetStep) {
        for (let i = 1; i < targetStep; i++) {
            if (!isStepValid(i)) return false;
        }
        return true;
    }
    
    // Check if current step has valid input
    function isStepValid(step) {
        const container = document.querySelector(`.question-container[data-step="${step}"]`);
        if (!container) return false;
        
        const radioInputs = container.querySelectorAll('input[type="radio"]');
        const checkboxInputs = container.querySelectorAll('input[type="checkbox"]');
        const requiredInputs = container.querySelectorAll('input[required], textarea[required]');
        
        // Check radio buttons
        if (radioInputs.length > 0) {
            const isRadioChecked = Array.from(radioInputs).some(input => input.checked);
            if (!isRadioChecked) return false;
        }
        
        // Check checkboxes (step 4 - at least one should be checked, or skip is allowed)
        if (step === 4 && checkboxInputs.length > 0) {
            // Features are optional, so always valid
            return true;
        }
        
        // Check required form fields
        if (requiredInputs.length > 0) {
            return Array.from(requiredInputs).every(input => {
                if (input.type === 'email') {
                    return input.value && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value);
                }
                return input.value.trim() !== '';
            });
        }
        
        return true;
    }
    
    // Navigate to step
    function goToStep(step) {
        if (step < 1 || step > totalSteps) return;
        
        // Hide current
        const currentContainer = document.querySelector(`.question-container[data-step="${currentStep}"]`);
        if (currentContainer) {
            currentContainer.hidden = true;
        }
        
        // Show new
        currentStep = step;
        const newContainer = document.querySelector(`.question-container[data-step="${currentStep}"]`);
        if (newContainer) {
            newContainer.hidden = false;
            // Focus first input in new container
            const firstInput = newContainer.querySelector('input, textarea');
            if (firstInput && firstInput.type !== 'radio' && firstInput.type !== 'checkbox') {
                setTimeout(() => firstInput.focus(), 100);
            }
        }
        
        updateUI();
    }
    
    // Update all UI elements
    function updateUI() {
        updateProgressBar();
        updateProgressSteps();
        updateNavigationButtons();
        updateNextButtonState();
    }
    
    // Update progress bar fill
    function updateProgressBar() {
        const progress = ((currentStep - 1) / (totalSteps - 1)) * 100;
        if (progressFill) {
            progressFill.style.width = `${progress}%`;
        }
    }
    
    // Update progress step indicators
    function updateProgressSteps() {
        progressSteps.forEach(step => {
            const stepNum = parseInt(step.dataset.step);
            step.classList.remove('active', 'completed');
            
            if (stepNum === currentStep) {
                step.classList.add('active');
            } else if (stepNum < currentStep) {
                step.classList.add('completed');
            }
        });
    }
    
    // Update navigation buttons visibility
    function updateNavigationButtons() {
        // Back button
        if (backBtn) {
            backBtn.disabled = currentStep === 1;
        }
        
        // Next/Submit button toggle
        if (nextBtn && submitBtn) {
            if (currentStep === totalSteps) {
                nextBtn.hidden = true;
                submitBtn.hidden = false;
            } else {
                nextBtn.hidden = false;
                submitBtn.hidden = true;
            }
        }
    }
    
    // Update next button enabled state
    function updateNextButtonState() {
        const isValid = isStepValid(currentStep);
        
        if (nextBtn) {
            nextBtn.disabled = !isValid;
        }
        if (submitBtn) {
            submitBtn.disabled = !isValid;
        }
    }
    
    function showFragebogenSuccess() {
        questionContainers.forEach(container => {
            container.hidden = true;
        });
        if (backBtn) backBtn.hidden = true;
        if (nextBtn) nextBtn.hidden = true;
        if (submitBtn) submitBtn.hidden = true;
        if (successContainer) {
            successContainer.hidden = false;
        }
        if (progressFill) {
            progressFill.style.width = '100%';
        }
        progressSteps.forEach(step => {
            step.classList.remove('active');
            step.classList.add('completed');
        });
        setTimeout(() => {
            const progressBar = document.querySelector('.fragebogen-progress');
            const navBar = document.querySelector('.fragebogen-nav');
            if (progressBar) {
                progressBar.style.opacity = '0';
                progressBar.style.transform = 'translateY(100%)';
                progressBar.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
            }
            if (navBar) {
                navBar.style.opacity = '0';
                navBar.style.transition = 'opacity 0.4s ease';
            }
        }, 500);
    }

    async function submitForm() {
        if (!isStepValid(currentStep)) return;

        const industryEl = document.getElementById('industry');
        const nameEl = document.getElementById('name');
        const emailEl = document.getElementById('email');
        const companyEl = document.getElementById('company');
        const messageEl = document.getElementById('message');

        const payload = {
            project_type: formData['project-type'],
            budget: formData.budget,
            timeline: formData.timeline,
            industry: String(formData.industry ?? industryEl?.value ?? '').trim(),
            name: String(formData.name ?? nameEl?.value ?? '').trim(),
            email: String(formData.email ?? emailEl?.value ?? '').trim(),
            company: String(formData.company ?? companyEl?.value ?? '').trim(),
            message: String(formData.message ?? messageEl?.value ?? '').trim(),
        };

        if (!payload.project_type || !payload.budget || !payload.timeline || !payload.name || !payload.email) {
            window.alert('Bitte füllen Sie alle Pflichtfelder aus.');
            return;
        }

        submitBtn.disabled = true;
        submitBtn.setAttribute('aria-busy', 'true');

        try {
            const res = await fetch('/leads/fragebogen', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify(payload),
            });
            let errText = '';
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                if (typeof data.detail === 'string') {
                    errText = data.detail;
                } else if (Array.isArray(data.detail)) {
                    errText = data.detail.map((d) => d.msg || JSON.stringify(d)).join(' ');
                } else if (data.detail) {
                    errText = String(data.detail);
                } else {
                    errText = res.statusText;
                }
                throw new Error(errText);
            }
            showFragebogenSuccess();
        } catch (e) {
            console.error('Fragebogen:', e);
            window.alert(
                'Das Senden ist fehlgeschlagen. Bitte versuchen Sie es später erneut oder schreiben Sie uns an info@devdesignstudio.de.\n\n' +
                    (e.message || '')
            );
            submitBtn.disabled = false;
            submitBtn.removeAttribute('aria-busy');
        }
    }
}

// ========================================
// Preisrechner (/preisrechner)
// ========================================

function initPreisrechner() {
    const wrapper = document.getElementById('calcWrapper');
    const calcShell = document.querySelector('.calc-outer');
    const stepperEl = document.getElementById('calcStepper');
    if (!wrapper || !calcShell || !stepperEl) return;

    /* ═══════════════════════════════════════════════
       SVG ICON LIBRARY
    ═══════════════════════════════════════════════ */
    const S = (p) => `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;
    const ICONS = {
        // pages
        onepager: S('<path d="M5 2h7l4 4v12H5V2z"/><path d="M12 2v4h4"/><line x1="7" y1="10" x2="13" y2="10"/><line x1="7" y1="13" x2="11" y2="13"/>'),
        small:    S('<path d="M4 5h9l3 3v9H4V5z"/><path d="M13 5v3h3"/><line x1="6.5" y1="11" x2="13.5" y2="11"/><line x1="6.5" y1="13.5" x2="11" y2="13.5"/><line x1="2" y1="2" x2="2" y2="17"/><line x1="2" y1="2" x2="4" y2="2"/>'),
        medium:   S('<path d="M2 8h5l2-2h9v11H2V8z"/><line x1="2" y1="11" x2="18" y2="11"/><line x1="6" y1="14" x2="14" y2="14"/>'),
        large:    S('<ellipse cx="10" cy="5.5" rx="7" ry="2.5"/><path d="M3 5.5v9c0 1.38 3.13 2.5 7 2.5s7-1.12 7-2.5v-9"/><path d="M3 10c0 1.38 3.13 2.5 7 2.5s7-1.12 7-2.5"/>'),
        // design
        template: S('<rect x="2" y="2" width="16" height="16" rx="2"/><line x1="2" y1="7" x2="18" y2="7"/><line x1="8" y1="7" x2="8" y2="18"/>'),
        adjusted: S('<path d="M14 3l3 3-9 9H5v-3L14 3z"/><line x1="12" y1="5" x2="15" y2="8"/>'),
        custom:   S('<path d="M3 17l3-1 9.5-9.5-2-2L4 15l-1 2z"/><path d="M12.5 4.5l3 3"/><circle cx="16" cy="4" r="1.5"/>'),
        premium:  S('<polygon points="10,2 12.5,7.5 18.5,8 14,12.5 15.5,18.5 10,15.5 4.5,18.5 6,12.5 1.5,8 7.5,7.5"/>'),
        // features
        contact:  S('<rect x="2" y="4" width="16" height="13" rx="2"/><path d="M2 7l8 5 8-5"/>'),
        newsletter:S('<path d="M10 2a6 6 0 0 1 6 6c0 3.5-1 5-1 5H5S4 11.5 4 8a6 6 0 0 1 6-6z"/><line x1="8" y1="18" x2="12" y2="18"/>'),
        booking:  S('<rect x="2" y="3" width="16" height="15" rx="2"/><line x1="2" y1="8" x2="18" y2="8"/><line x1="6" y1="2" x2="6" y2="5"/><line x1="14" y1="2" x2="14" y2="5"/><line x1="6" y1="12" x2="6" y2="12" stroke-width="2.5"/><line x1="10" y1="12" x2="10" y2="12" stroke-width="2.5"/><line x1="14" y1="12" x2="14" y2="12" stroke-width="2.5"/>'),
        blog:     S('<line x1="4" y1="6" x2="16" y2="6"/><line x1="4" y1="10" x2="16" y2="10"/><line x1="4" y1="14" x2="10" y2="14"/><path d="M13 14l2 2 4-4" stroke-width="1.5"/>'),
        cms:      S('<rect x="2" y="2" width="16" height="4" rx="1"/><rect x="2" y="8" width="16" height="4" rx="1"/><rect x="2" y="14" width="16" height="4" rx="1"/>'),
        login:    S('<rect x="5" y="9" width="10" height="9" rx="1.5"/><path d="M7 9V6a3 3 0 0 1 6 0v3"/><circle cx="10" cy="14" r="1" fill="currentColor"/>'),
        shop:     S('<path d="M5 4h12l-1.5 9H6.5L5 4z"/><circle cx="8" cy="17" r="1.5"/><circle cx="14" cy="17" r="1.5"/><line x1="2" y1="2" x2="5" y2="4"/>'),
        payment:  S('<rect x="2" y="5" width="16" height="12" rx="2"/><line x1="2" y1="9" x2="18" y2="9"/><line x1="5" y1="13" x2="9" y2="13" stroke-width="2"/>'),
        api:      S('<polyline points="6,8 2,12 6,16"/><polyline points="14,8 18,12 14,16"/><line x1="11" y1="5" x2="9" y2="19"/>'),
        // languages
        lang1:    S('<circle cx="10" cy="10" r="7"/><path d="M10 3c-2.5 3-2.5 11 0 14"/><path d="M10 3c2.5 3 2.5 11 0 14"/><line x1="3" y1="8" x2="17" y2="8"/><line x1="3" y1="12" x2="17" y2="12"/>'),
        lang2:    S('<circle cx="10" cy="10" r="7"/><path d="M10 3c-2.5 3-2.5 11 0 14"/><path d="M10 3c2.5 3 2.5 11 0 14"/><line x1="3" y1="8" x2="17" y2="8"/><line x1="3" y1="12" x2="17" y2="12"/><circle cx="17" cy="4" r="2.5" fill="currentColor" stroke="none"/>'),
        lang3:    S('<circle cx="10" cy="11" r="7"/><path d="M10 4c-2.5 3-2.5 11 0 14"/><path d="M10 4c2.5 3 2.5 11 0 14"/><line x1="3" y1="9" x2="17" y2="9"/><line x1="3" y1="13" x2="17" y2="13"/><path d="M14 3h4M16 1v4" stroke-width="1.5"/>'),
        lang4:    S('<circle cx="9" cy="11" r="6.5"/><path d="M9 4.5c-2.2 2.8-2.2 10 0 13"/><path d="M9 4.5c2.2 2.8 2.2 10 0 13"/><line x1="2.5" y1="9" x2="15.5" y2="9"/><line x1="2.5" y1="13" x2="15.5" y2="13"/><circle cx="16.5" cy="5" r="2.5" fill="currentColor" stroke="none"/>'),
        lang5:    S('<circle cx="8" cy="12" r="6"/><path d="M8 6c-2 2.5-2 9 0 12"/><path d="M8 6c2 2.5 2 9 0 12"/><line x1="2" y1="10" x2="14" y2="10"/><line x1="2" y1="14" x2="14" y2="14"/><path d="M15 2h4M17 0v4M15 7h4M17 5v4" stroke-width="1.4"/>'),
        // seo
        seo0:     S('<path d="M3 3l14 14M10.5 5a7 7 0 0 1 7 7M5.7 5.7A7 7 0 0 0 3.5 12"/><line x1="2" y1="17" x2="4" y2="17"/>'),
        seo1:     S('<circle cx="9" cy="9" r="5.5"/><line x1="13.5" y1="13.5" x2="18" y2="18"/><line x1="6" y1="9" x2="12" y2="9"/><line x1="9" y1="6" x2="9" y2="12"/>'),
        seo2:     S('<path d="M10 2l1.5 4.5h4.5l-3.5 2.5 1.5 4.5L10 11l-4 2.5 1.5-4.5L4 6.5h4.5z"/><line x1="10" y1="14" x2="10" y2="18"/>'),
        seo3:     S('<polyline points="2,15 7,9 11,13 18,5"/><polyline points="14,5 18,5 18,9"/>'),
        // content
        content0: S('<path d="M4 4h12v2l-2 2H6L4 6V4z"/><path d="M4 6v10h12V6"/><line x1="7" y1="10" x2="13" y2="10"/><line x1="7" y1="13" x2="11" y2="13"/>'),
        content1: S('<path d="M3 14c0-2 1.5-3 3-3s3 1 3 1 1-1 3-1 3 1 3 3"/><circle cx="6" cy="7" r="3"/><circle cx="14" cy="7" r="3"/>'),
        content2: S('<line x1="4" y1="5" x2="16" y2="5"/><line x1="4" y1="9" x2="16" y2="9"/><line x1="4" y1="13" x2="10" y2="13"/><path d="M12 14l2 3h3l-2-3h2l-5-5z"/>'),
        content3: S('<rect x="2" y="5" width="16" height="12" rx="2"/><circle cx="10" cy="11" r="3"/><path d="M7 5l1-3h4l1 3"/><circle cx="15.5" cy="7.5" r="0.75" fill="currentColor" stroke="none"/>'),
    };

    /* ═══════════════════════════════════════════════
       STEP DATA  (source of truth — never mutated)
    ═══════════════════════════════════════════════ */
    const STEPS = [
        {
            id: 'design',
            question: 'Wie individuell soll das Design sein?',
            sub: 'Von schnellen Themes bis zu maßgeschneidertem UI/UX-Design mit Animationen.',
            multi: false,
            options: [
                { id: 'template', label: 'Template / Theme',       sub: 'Bewährtes Design',         price: [75,   325],   recommended: false },
                { id: 'adjusted', label: 'Leicht angepasst',       sub: 'Individualisiert',          price: [325,  800],  recommended: true  },
                { id: 'custom',   label: 'Individuelles UI/UX',    sub: 'Komplett maßgeschneidert',  price: [650,  2000],  recommended: false },
                { id: 'premium',  label: 'Premium + Animationen',  sub: 'Höchste Qualität',          price: [1600, 4000],  recommended: false },
            ],
        },
        {
            id: 'features',
            question: 'Was soll die Website können?',
            sub: 'Mehrfachauswahl möglich — wähle alle Funktionen, die du benötigst.',
            multi: true,
            options: [
                { id: 'contact',    label: 'Kontaktformular',       sub: '+75 – 300 €',       price: [75,   300]   },
                { id: 'newsletter', label: 'Newsletter',             sub: '+100 – 500 €',      price: [100,  500]   },
                { id: 'booking',    label: 'Terminbuchung',          sub: '+250 – 1.000 €',    price: [250,  1000]  },
                { id: 'blog',       label: 'Blog / News-System',     sub: '+400 – 1.200 €',    price: [400,  1200]  },
                { id: 'cms',        label: 'CMS',                    sub: '+500 – 1.800 €',    price: [500,  1800]  },
                { id: 'login',      label: 'Login / Benutzerbereich',sub: '+750 – 3.500 €',    price: [750,  3500]  },
                { id: 'shop',       label: 'Online-Shop',            sub: '+1.000 – 7.500 €',  price: [1000, 7500]  },
                { id: 'payment',    label: 'Zahlungsintegration',    sub: '+250 – 1.500 €',    price: [250,  1500]  },
                { id: 'api',        label: 'API / externe Systeme',  sub: '+500 – 3.500 €',    price: [500,  3500]  },
            ],
        },
        {
            id: 'languages',
            question: 'Wie viele Sprachen?',
            sub: 'Jede weitere Sprache bedeutet Übersetzung, SEO-Anpassung und mehr Pflegeaufwand.',
            multi: false,
            options: [
                { id: 'lang1', label: '1 Sprache',    sub: 'Kein Aufpreis',      price: [0,    0],     recommended: false },
                { id: 'lang2', label: '2 Sprachen',   sub: '+125 – 600 €',       price: [125,  600],   recommended: true  },
                { id: 'lang3', label: '3 Sprachen',   sub: '+325 – 1.200 €',     price: [325,  1200],  recommended: false },
                { id: 'lang4', label: '4–5 Sprachen', sub: '+600 – 2.400 €',     price: [600,  2400],  recommended: false },
                { id: 'lang5', label: '5+ Sprachen',  sub: '+1.200 – 4.000 €',   price: [1200, 4000],  recommended: false },
            ],
        },
        {
            id: 'seo',
            question: 'Wie sichtbar soll die Seite sein?',
            sub: 'SEO entscheidet darüber, ob deine Website auf Google gefunden wird.',
            multi: false,
            options: [
                { id: 'seo0', label: 'Kein SEO',               sub: '0 – 150 €',            price: [0,    150],  recommended: false, monthly: false },
                { id: 'seo1', label: 'Basis-SEO',              sub: '150 – 750 €',          price: [150,  750],  recommended: false, monthly: false },
                { id: 'seo2', label: 'Professionelles Setup',  sub: '750 – 2.000 €',        price: [750,  2000], recommended: true,  monthly: false },
                { id: 'seo3', label: 'Laufende Betreuung',     sub: '200 – 750 €/Monat',    price: [200,  750],  recommended: false, monthly: true  },
            ],
        },
        {
            id: 'pages',
            question: 'Wie groß wird die Website?',
            sub: 'Die Seitenanzahl beeinflusst Planung, Design und Entwicklungsaufwand maßgeblich.',
            multi: false,
            options: [
                { id: 'onepager', label: '1 Seite',      sub: 'Onepager',          price: [325,   950],  recommended: false },
                { id: 'small',    label: '5–10 Seiten',  sub: 'Kleines Projekt',   price: [950,  2800],  recommended: true  },
                { id: 'medium',   label: '10–30 Seiten', sub: 'Mittleres Projekt', price: [2800,  8000], recommended: false },
                { id: 'large',    label: '30+ Seiten',   sub: 'Großes Projekt',    price: [6400,  16000], recommended: false },
            ],
        },
        {
            id: 'content',
            question: 'Wer erstellt den Content?',
            sub: 'Texte, Bilder und Videos sind ein wesentlicher Teil des Projektaufwands.',
            multi: false,
            options: [
                { id: 'content0', label: 'Kunde liefert alles',      sub: 'Kein Aufpreis',      price: [0,    0],    recommended: false },
                { id: 'content1', label: 'Leichte Unterstützung',    sub: '+150 – 750 €',       price: [150,  750],  recommended: true  },
                { id: 'content2', label: 'Komplette Erstellung',     sub: '+500 – 3.000 €',     price: [500,  3000], recommended: false },
                { id: 'content3', label: 'Foto-/Videoproduktion',    sub: '+500 – 4.000 €',     price: [500,  4000], recommended: false },
            ],
        },
    ];

    const TOTAL_STEPS = STEPS.length;
    const STEP_LABELS = ['Design', 'Funktionen', 'Sprachen', 'SEO', 'Umfang', 'Content', 'Ergebnis'];

    /* ═══════════════════════════════════════════════
       STATE
    ═══════════════════════════════════════════════ */
    const state = {
        step: 1,       // 1-based; TOTAL_STEPS + 1 = result
        answers: {},   // { stepId: optionId | optionId[] }
        priceMin: 0,
        priceMax: 0,
    };

    /* ═══════════════════════════════════════════════
       PRICE
    ═══════════════════════════════════════════════ */
    function calcPrice() {
        let min = 0, max = 0, hasMonthly = false;
        for (const step of STEPS) {
            const ans = state.answers[step.id];
            if (!ans) continue;
            if (step.multi) {
                for (const id of (Array.isArray(ans) ? ans : [])) {
                    const opt = step.options.find(o => o.id === id);
                    if (opt) { min += opt.price[0]; max += opt.price[1]; }
                }
            } else {
                const opt = step.options.find(o => o.id === ans);
                if (opt) {
                    min += opt.price[0]; max += opt.price[1];
                    if (opt.monthly) hasMonthly = true;
                }
            }
        }
        return { min, max, hasMonthly };
    }

    function fmt(n) { return n.toLocaleString('de-DE'); }

    function applyPriceEl(el, min, max, hasMonthly) {
        if (!el) return;
        el.innerHTML = priceParts(min, max, hasMonthly);
    }

    /* ── Counter animation ── */
    let _raf = null;
    function animatePrice(fromMin, fromMax, toMin, toMax, hasMonthly, dur = 400) {
        if (_raf) cancelAnimationFrame(_raf);
        const el = document.getElementById('calcPriceDisplay');
        if (!el) return;
        const t0 = performance.now();
        const ease = t => t < 0.5 ? 2*t*t : -1 + (4 - 2*t)*t;
        const tick = now => {
            const p = Math.min((now - t0) / dur, 1);
            const e = ease(p);
            const cMin = Math.round(fromMin + (toMin - fromMin) * e);
            const cMax = Math.round(fromMax + (toMax - fromMax) * e);
            applyPriceEl(el, cMin, cMax, hasMonthly);
            if (p < 1) { _raf = requestAnimationFrame(tick); }
            else { state.priceMin = toMin; state.priceMax = toMax; }
        };
        _raf = requestAnimationFrame(tick);
    }

    function priceParts(min, max, monthly) {
        const suffix = monthly ? '<span class="calc-price-suffix">/Monat*</span>' : '';
        if (min === max) {
            return '€' + fmt(min) + suffix;
        }
        return '€' + fmt(min) +
            '<span class="calc-price-sep">–</span>' +
            '€' + fmt(max) +
            suffix;
    }

    function formatPriceText(min, max, hasMonthly) {
        const monthlyNote = hasMonthly ? ' (+ monatliche SEO-Betreuung)' : '';
        if (min === max) return '€' + fmt(min) + monthlyNote;
        return '€' + fmt(min) + ' – €' + fmt(max) + monthlyNote;
    }

    function answerLabelForStep(step) {
        const ans = state.answers[step.id];
        if (!ans) return '';
        if (step.multi) {
            const ids = Array.isArray(ans) ? ans : [];
            if (!ids.length) return '';
            return ids.map(id => step.options.find(o => o.id === id)?.label).filter(Boolean).join(', ');
        }
        return step.options.find(o => o.id === ans)?.label || '';
    }

    function buildCalculatorSummary() {
        const { min, max, hasMonthly } = calcPrice();
        const lines = [
            '── Website-Kostenrechner (devdesignstudio.de/preisrechner) ──',
            '',
            'Geschätztes Gesamtbudget: ' + formatPriceText(min, max, hasMonthly),
            '',
            'Deine Angaben:',
        ];
        for (const step of STEPS) {
            const label = answerLabelForStep(step);
            if (label) lines.push('• ' + step.question + ': ' + label);
        }
        const unanswered = STEPS.filter(s => !answerLabelForStep(s));
        if (unanswered.length) {
            lines.push('', 'Nicht beantwortet: ' + unanswered.map(s => s.question).join('; '));
        }
        return lines.join('\n');
    }

    function splitContactName(full) {
        const parts = full.trim().split(/\s+/).filter(Boolean);
        if (!parts.length) return { first_name: '', last_name: '' };
        if (parts.length === 1) return { first_name: parts[0], last_name: '—' };
        return { first_name: parts[0], last_name: parts.slice(1).join(' ') };
    }

    function buildCostLineItems() {
        const items = [];
        for (const step of STEPS) {
            const ans = state.answers[step.id];
            if (!ans) continue;
            if (step.multi) {
                for (const id of (Array.isArray(ans) ? ans : [])) {
                    const opt = step.options.find(o => o.id === id);
                    if (opt) {
                        items.push({
                            category: step.question,
                            label: opt.label,
                            price_min: opt.price[0],
                            price_max: opt.price[1],
                            monthly: !!opt.monthly,
                        });
                    }
                }
            } else {
                const opt = step.options.find(o => o.id === ans);
                if (opt) {
                    items.push({
                        category: step.question,
                        label: opt.label,
                        price_min: opt.price[0],
                        price_max: opt.price[1],
                        monthly: !!opt.monthly,
                    });
                }
            }
        }
        return items;
    }

    /** Gleicher Endpunkt wie menu/kontakt.html (initKontaktForm) – plus strukturierte Kostendaten. */
    async function submitPreisrechnerLead(payload) {
        const res = await fetch('/leads/preisrechner', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            body: JSON.stringify(payload),
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
            let errText = '';
            if (typeof data.detail === 'string') errText = data.detail;
            else if (Array.isArray(data.detail)) {
                errText = data.detail.map((d) => d.msg || JSON.stringify(d)).join(' ');
            } else if (data.detail) errText = String(data.detail);
            else errText = res.statusText;
            throw new Error(errText);
        }
    }

    async function sendSavedResult(fullName, email) {
        const { first_name, last_name } = splitContactName(fullName);
        const { min, max, hasMonthly } = calcPrice();
        const typical = typicalPrice(min, max);

        await submitPreisrechnerLead({
            first_name,
            last_name,
            email,
            line_items: buildCostLineItems(),
            total_min: min,
            total_max: max,
            total_typical: typical,
            has_monthly: hasMonthly,
            summary: buildCalculatorSummary(),
        });
    }

    function setSendBtnLabel(btn, text) {
        if (!btn) return;
        const span = btn.querySelector('span');
        if (span) span.textContent = text;
    }

    function resetSaveSendButton(btn) {
        if (!btn) return;
        btn.classList.remove('is-sent');
        btn.disabled = false;
        btn.removeAttribute('aria-busy');
        btn.setAttribute('aria-label', 'Angebot absenden');
        setSendBtnLabel(btn, 'Angebot absenden');
    }

    function offerOverlayHtml(typical, hasMonthly) {
        return `
            <div class="calc-offer-overlay" id="calcOfferOverlay" hidden>
                <button type="button" class="calc-offer-backdrop" data-action="close-offer-modal" aria-label="Dialog schließen"></button>
                <div class="calc-offer-dialog" role="dialog" aria-modal="true" aria-labelledby="calcOfferTitle">
                    <div class="calc-offer-sheet-handle" aria-hidden="true"></div>
                    <button type="button" class="calc-offer-close" data-action="close-offer-modal" aria-label="Schließen">✕</button>
                    <h3 class="calc-offer-title" id="calcOfferTitle">Angebot anfordern</h3>
                    <p class="calc-offer-lead">Schätzung per E-Mail erhalten. Wir melden uns innerhalb von 24&nbsp;Stunden, unverbindlich.</p>
                    <div class="calc-offer-recap">
                        <span class="calc-offer-recap-label">Deine Schätzung</span>
                        <span class="calc-offer-recap-price">${fmt(typical)} €${hasMonthly ? '<span class="calc-price-suffix">*</span>' : ''}</span>
                    </div>
                    <form class="calc-offer-form" id="calcOfferForm" novalidate>
                        <label class="calc-save-field" for="calcSaveName">
                            <span class="calc-save-name-label">Name</span>
                            <input type="text" class="calc-save-name-input" id="calcSaveName" name="name" autocomplete="name" placeholder="Vor- und Nachname" required>
                        </label>
                        <label class="calc-save-field" for="calcSaveEmail">
                            <span class="calc-save-name-label">E-Mail</span>
                            <input type="email" class="calc-save-name-input" id="calcSaveEmail" name="email" autocomplete="email" inputmode="email" placeholder="deine@email.de" required>
                        </label>
                        <div class="calc-save-send-wrap">
                            <button type="button" class="button calc-offer-submit" data-action="save-send" aria-label="Angebot absenden">
                                <span>Angebot absenden</span>
                            </button>
                            <p class="calc-offer-alt">Lieber persönlich? <a href="/kontakt" class="calc-offer-alt-link">Erstgespräch vereinbaren</a></p>
                            <p class="calc-offer-privacy">Mit dem Absenden stimmst du zu, dass wir deine Angaben zur Bearbeitung der Anfrage speichern. Details in der <a href="/datenschutz" class="calc-offer-alt-link">Datenschutzerklärung</a>.</p>
                            <p class="calc-save-status" role="status" aria-live="polite"></p>
                        </div>
                    </form>
                </div>
            </div>`;
    }

    function ensureOfferOverlay() {
        let overlay = document.getElementById('calcOfferOverlay');
        if (overlay?.parentElement === document.body) return overlay;

        if (overlay) overlay.remove();

        const { min, max, hasMonthly } = calcPrice();
        const typical = typicalPrice(min, max);
        const tmp = document.createElement('div');
        tmp.innerHTML = offerOverlayHtml(typical, hasMonthly).trim();
        overlay = tmp.firstElementChild;
        document.body.appendChild(overlay);
        return overlay;
    }

    function updateOfferOverlayRecap() {
        const { min, max, hasMonthly } = calcPrice();
        const typical = typicalPrice(min, max);
        const priceEl = document.querySelector('#calcOfferOverlay .calc-offer-recap-price');
        if (priceEl) {
            priceEl.innerHTML = `${fmt(typical)} €${hasMonthly ? '<span class="calc-price-suffix">*</span>' : ''}`;
        }
    }

    function openOfferModal() {
        ensureOfferOverlay();
        updateOfferOverlayRecap();
        const overlay = document.getElementById('calcOfferOverlay');
        if (!overlay) return;
        overlay.hidden = false;
        document.documentElement.classList.add('calc-offer-open');
        document.body.classList.add('calc-offer-open');
        const statusEl = overlay.querySelector('.calc-save-status');
        if (statusEl) {
            statusEl.textContent = '';
            statusEl.classList.remove('is-error', 'is-success');
        }
        resetSaveSendButton(overlay.querySelector('[data-action="save-send"]'));
        setTimeout(() => document.getElementById('calcSaveName')?.focus(), 80);
    }

    function closeOfferModal() {
        const overlay = document.getElementById('calcOfferOverlay');
        if (!overlay) return;
        overlay.hidden = true;
        document.documentElement.classList.remove('calc-offer-open');
        document.body.classList.remove('calc-offer-open');
        resetSaveSendButton(overlay.querySelector('[data-action="save-send"]'));
    }

    /* Most projects land in the lower-middle of the span with a long tail
       toward expensive builds → peak (mode) sits at 30 % of the range. */
    const TYPICAL_RATIO = 0.30;
    function typicalPrice(min, max) {
        if (min === max) return min;
        return Math.round(min + TYPICAL_RATIO * (max - min));
    }

    function buildResultBreakdownRows() {
        return STEPS.map(step => {
            const ans = state.answers[step.id];
            if (!ans) return '';
            let label = '';
            if (step.multi) {
                const ids = Array.isArray(ans) ? ans : [];
                if (!ids.length) return '';
                label = ids.map(id => step.options.find(o => o.id === id)?.label).filter(Boolean).join(', ');
            } else {
                label = step.options.find(o => o.id === ans)?.label || '';
            }
            return `<div class="calc-result-row">
                <span class="calc-result-row-label">${step.question}</span>
                <span class="calc-result-row-value">${label}</span>
            </div>`;
        }).join('');
    }

    function countBreakdownItems() {
        return STEPS.filter(step => answerLabelForStep(step)).length;
    }

    /* CSS/HTML distribution — no SVG, crisp native fonts & numbers. */
    function buildDistributionBars(min, max, typical) {
        const BARS = 46;
        const span = Math.max(max - min, 1);
        const mu = (typical - min) / span;
        const sigma = 0.18;
        let html = '';
        for (let i = 0; i < BARS; i++) {
            const t = (i + 0.5) / BARS;
            const z = (t - mu) / sigma;
            const d = Math.exp(-0.5 * z * z);
            const h = Math.max(7, Math.round(d * 100));
            html += `<span class="calc-dist-bar" style="height:${h}%"></span>`;
        }
        return html;
    }

    function initResultView() {
        const dist = document.querySelector('.calc-dist');
        if (!dist) return;
        const track = dist.querySelector('.calc-dist-track');
        const cursor = dist.querySelector('.calc-dist-cursor');
        const tip = dist.querySelector('.calc-dist-tip');
        if (!track || !cursor || !tip) return;

        const min = Number(dist.dataset.min);
        const max = Number(dist.dataset.max);

        const onMove = (e) => {
            const rect = track.getBoundingClientRect();
            if (!rect.width) return;
            const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
            const y = Math.max(0, Math.min(rect.height, e.clientY - rect.top));
            const ratio = x / rect.width;
            const price = Math.round(min + ratio * Math.max(max - min, 0));
            cursor.style.left = `${x}px`;
            tip.textContent = `${fmt(price)} €`;
            tip.style.left = `${x}px`;
            tip.style.top = `${y}px`;
            cursor.classList.add('is-on');
            tip.classList.add('is-on');
        };

        const onLeave = () => {
            cursor.classList.remove('is-on');
            tip.classList.remove('is-on');
        };

        track.addEventListener('pointermove', onMove);
        track.addEventListener('pointerleave', onLeave);
        track.addEventListener('pointercancel', onLeave);
    }

    /* ── Aesthetic upward-pulse on price change ── */
    function triggerPriceChange() {
        const el = document.getElementById('calcPriceDisplay');
        if (!el) return;
        el.classList.remove('is-changing');
        void el.offsetWidth;
        el.classList.add('is-changing');
        el.addEventListener('animationend', () => el.classList.remove('is-changing'), { once: true });
    }

    /* ═══════════════════════════════════════════════
       BUILD HTML FRAGMENTS
    ═══════════════════════════════════════════════ */
    const ICON_ARROW = `<svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M3 7h8M7 3l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    const ICON_BACK  = `<svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M9 11L5 7l4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    const ICON_CHECK = `<svg width="10" height="10" viewBox="0 0 8 8" fill="none" aria-hidden="true"><path d="M1 4l2 2 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

    function buildStepperOnce() {
        stepperEl.innerHTML = STEP_LABELS.map((label, i) => {
            const n = i + 1;
            return `<li class="calc-stepper-item upcoming" data-step="${n}">
                <button type="button" class="calc-stepper-hit" aria-label="Schritt ${n}: ${label}">
                    <span class="calc-stepper-dot"></span>
                    <span class="calc-stepper-label">${label}</span>
                </button>
            </li>`;
        }).join('');
    }

    /** Class-only update: no stepper re-mount, keeps click listener cheap. */
    function syncStepper(current) {
        stepperEl.querySelectorAll('.calc-stepper-item').forEach((item) => {
            const n = Number(item.dataset.step);
            item.classList.remove('done', 'active', 'upcoming');
            if (n < current) item.classList.add('done');
            else if (n === current) item.classList.add('active');
            else item.classList.add('upcoming');
            item.querySelector('.calc-stepper-dot').innerHTML = n < current ? ICON_CHECK : '';
            item.querySelector('.calc-stepper-hit').setAttribute(
                'aria-current',
                n === current ? 'step' : 'false'
            );
        });
    }

    function goToStep(target) {
        if (target < 1 || target > TOTAL_STEPS + 1 || target === state.step) return;
        state.step = target;
        syncStepper(target);
        swapContent(target <= TOTAL_STEPS ? stepContentHtml(target) : resultContentHtml());
        if (target === TOTAL_STEPS + 1) initResultView();
    }

    function stepContentHtml(stepIdx) {
        const step = STEPS[stepIdx - 1];
        const ans = state.answers[step.id];
        const { min, max, hasMonthly } = calcPrice();

        const hasAnswer = step.multi
            ? Array.isArray(ans) && ans.length > 0
            : !!ans;

        const selectedCount = step.multi && Array.isArray(ans) ? ans.length : 0;

        const nextLabel = stepIdx === TOTAL_STEPS
            ? (hasAnswer ? 'Ergebnis anzeigen' : 'Weiter')
            : 'Weiter';

        const nextCount = step.multi && hasAnswer && selectedCount > 0
            ? `<span class="btn-count">(${selectedCount})</span>`
            : '';

        const backBtn = stepIdx > 1
            ? `<button type="button" class="calc-btn-back" data-action="back">
                   ${ICON_BACK} Zurück
               </button>`
            : '';

        const multiHint = step.multi
            ? `<span class="calc-multi-hint" aria-live="polite">
                   Mehrfachauswahl möglich
               </span>`
            : '';

        const cards = step.options.map(opt => {
            const sel = step.multi
                ? Array.isArray(ans) && ans.includes(opt.id)
                : ans === opt.id;
            const badge = opt.recommended
                ? `<span class="calc-card-badge">Empfohlen</span>`
                : '';
            const check = step.multi
                ? `<span class="calc-card-check" aria-hidden="true">${ICON_CHECK}</span>`
                : '';
            const iconSvg = ICONS[opt.id] || '';
            return `<button type="button"
                class="calc-card${sel ? ' selected' : ''}"
                data-action="card"
                data-step-id="${step.id}"
                data-option-id="${opt.id}"
                data-multi="${step.multi}"
                aria-pressed="${sel}">
                ${badge}${check}
                <span class="calc-card-icon" aria-hidden="true">${iconSvg}</span>
                <span class="calc-card-body">
                    <span class="calc-card-title">${opt.label}</span>
                    ${opt.sub ? `<span class="calc-card-sub">${opt.sub}</span>` : ''}
                </span>
            </button>`;
        }).join('');

        return `
        <div class="calc-step-content" id="calcStepContent">
            <div class="calc-price-block">
                <div class="calc-price" id="calcPriceDisplay" aria-live="polite" aria-atomic="true">
                    ${priceParts(min, max, hasMonthly)}
                </div>
            </div>

            <h2 class="calc-question">${step.question}</h2>
            ${step.sub ? `<p class="calc-sub">${step.sub}</p>` : ''}
            ${multiHint}

            <div class="calc-grid" role="group" aria-label="${step.question}">
                ${cards}
            </div>

            <div class="calc-nav">
                <div class="calc-nav-left">
                    ${backBtn}
                </div>
                <div class="calc-nav-right">
                    <button type="button" class="calc-btn-skip" data-action="skip">Überspringen</button>
                    <button type="button"
                        class="calc-btn-next${hasAnswer ? ' active' : ''}"
                        id="calcNext"
                        data-action="next"
                        ${hasAnswer ? '' : 'disabled'}
                        aria-label="${stepIdx === TOTAL_STEPS ? 'Ergebnis anzeigen' : 'Weiter zum nächsten Schritt'}">
                        <span class="btn-text">${nextLabel}</span>
                        ${nextCount}
                        ${ICON_ARROW}
                    </button>
                </div>
            </div>
        </div>`;
    }

    function resultContentHtml() {
        const { min, max, hasMonthly } = calcPrice();
        const typical = typicalPrice(min, max);
        const breakdownCount = countBreakdownItems();
        const rows = buildResultBreakdownRows();

        return `
        <div class="calc-step-content calc-step-content--result" id="calcStepContent">
            <div class="calc-result-panel">
                <p class="calc-result-typical-label">Typischer Preis</p>
                <p class="calc-result-typical-price" id="calcPriceDisplay">${fmt(typical)} €${hasMonthly ? '<span class="calc-price-suffix">*</span>' : ''}</p>

                <div class="calc-dist" data-min="${min}" data-max="${max}" data-typical="${typical}">
                    <div class="calc-dist-track">
                        <div class="calc-dist-bars" aria-hidden="true">${buildDistributionBars(min, max, typical)}</div>
                        <div class="calc-dist-cursor" aria-hidden="true"></div>
                        <div class="calc-dist-tip" role="status" aria-live="polite"></div>
                    </div>
                    <div class="calc-dist-axis">
                        <span>${fmt(min)} €</span>
                        <span>${fmt(max)} €</span>
                    </div>
                </div>
                <p class="calc-result-chart-hint">Bewege den Cursor über die Verteilung für Zwischenwerte</p>

                <details class="calc-result-breakdown">
                    <summary class="calc-result-breakdown-summary">
                        <span class="calc-result-breakdown-icon" aria-hidden="true">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h10"/></svg>
                        </span>
                        <span>Kostenaufschlüsselung (${breakdownCount} Position${breakdownCount === 1 ? '' : 'en'})</span>
                        <svg class="calc-result-breakdown-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>
                    </summary>
                    <div class="calc-result-summary">${rows}</div>
                </details>

                <button type="button" class="button calc-offer-btn" data-action="open-offer-modal">
                    <span>Angebot abschicken</span>
                </button>
                ${hasMonthly ? '<p class="calc-result-note">* Monatliche SEO-Betreuung wird zusätzlich zum Einmalpreis berechnet.</p>' : ''}
            </div>
        </div>`;
    }

    /* ═══════════════════════════════════════════════
       DOM MUTATIONS  (targeted, minimal repaints)
    ═══════════════════════════════════════════════ */

    /** Swap only the step-content div; top bar stays intact. */
    function swapContent(html) {
        const old = wrapper.querySelector('#calcStepContent');
        const tmp = document.createElement('div');
        tmp.innerHTML = html.trim();
        const next = tmp.firstElementChild;
        if (old) {
            wrapper.replaceChild(next, old);
        } else {
            wrapper.appendChild(next);
        }
    }

    /** Toggle a card's selected state without touching the rest of the DOM. */
    function applyCardSelection(stepId, isMulti) {
        const step = STEPS.find(s => s.id === stepId);
        if (!step) return;
        const ans = state.answers[stepId];

        wrapper.querySelectorAll(`.calc-card[data-step-id="${stepId}"]`).forEach(card => {
            const optId = card.dataset.optionId;
            const sel = isMulti
                ? Array.isArray(ans) && ans.includes(optId)
                : ans === optId;
            card.classList.toggle('selected', sel);
            card.setAttribute('aria-pressed', String(sel));
            // Suppress the stagger animation after first interaction
            card.classList.add('no-anim');
        });
    }

    /** Refresh Next button label/state without re-rendering. */
    function syncNextButton() {
        const btn = document.getElementById('calcNext');
        if (!btn) return;
        const step = STEPS[state.step - 1];
        const ans = state.answers[step.id];
        const hasAnswer = step.multi
            ? Array.isArray(ans) && ans.length > 0
            : !!ans;

        btn.disabled = !hasAnswer;
        btn.classList.toggle('active', hasAnswer);

        const textEl = btn.querySelector('.btn-text');
        const countEl = btn.querySelector('.btn-count');
        if (textEl) {
            textEl.textContent = state.step === TOTAL_STEPS
                ? 'Ergebnis anzeigen'
                : 'Weiter';
        }
        if (countEl) {
            if (step.multi && hasAnswer && Array.isArray(ans) && ans.length > 0) {
                countEl.textContent = `(${ans.length})`;
                countEl.style.display = '';
            } else {
                countEl.style.display = 'none';
            }
        }
    }

    /* ═══════════════════════════════════════════════
       NAVIGATION
    ═══════════════════════════════════════════════ */

    function advance() {
        if (state.step < TOTAL_STEPS) {
            goToStep(state.step + 1);
        } else if (state.step === TOTAL_STEPS) {
            goToStep(TOTAL_STEPS + 1);
        }
    }

    function goBack() {
        if (state.step > 1) goToStep(state.step - 1);
    }

    function resetCalc() {
        state.step = 1;
        state.answers = {};
        state.priceMin = 0;
        state.priceMax = 0;
        syncStepper(1);
        swapContent(stepContentHtml(1));
    }

    /* ═══════════════════════════════════════════════
       SINGLE DELEGATED HANDLER  (one listener, zero leaks)
    ═══════════════════════════════════════════════ */

    stepperEl.addEventListener('click', (e) => {
        const item = e.target.closest('.calc-stepper-item[data-step]');
        if (!item) return;
        goToStep(Number(item.dataset.step));
    });

    function handleCalcClick(e) {
        const target = e.target.closest('[data-action]');
        if (!target) return;

        const inCalcShell = calcShell.contains(target);
        const inOfferOverlay = !!target.closest('#calcOfferOverlay');
        if (!inCalcShell && !inOfferOverlay) return;

        const action = target.dataset.action;

        if (action === 'card') {
            const stepId  = target.dataset.stepId;
            const optId   = target.dataset.optionId;
            const isMulti = target.dataset.multi === 'true';

            // Update state
            if (isMulti) {
                const cur = Array.isArray(state.answers[stepId]) ? [...state.answers[stepId]] : [];
                const idx = cur.indexOf(optId);
                if (idx === -1) cur.push(optId); else cur.splice(idx, 1);
                state.answers[stepId] = cur;
            } else {
                state.answers[stepId] = optId;
            }

            // In-place DOM update (no re-render)
            applyCardSelection(stepId, isMulti);
            syncNextButton();

            // Animate price
            const { min, max, hasMonthly } = calcPrice();
            animatePrice(state.priceMin, state.priceMax, min, max, hasMonthly);
            triggerPriceChange();
            return;
        }

        if (action === 'next') { advance(); return; }
        if (action === 'back') { goBack();  return; }
        if (action === 'skip') { advance(); return; }
        if (action === 'reset') { resetCalc(); return; }

        if (action === 'open-offer-modal') { openOfferModal(); return; }
        if (action === 'close-offer-modal') { closeOfferModal(); return; }

        if (action === 'save-send') {
            const nameInput = document.getElementById('calcSaveName');
            const emailInput = document.getElementById('calcSaveEmail');
            const statusEl = document.querySelector('#calcOfferOverlay .calc-save-status');
            const sendBtn = target.closest('[data-action="save-send"]') || target;
            const fullName = (nameInput?.value ?? '').trim();
            const email = (emailInput?.value ?? '').trim();

            if (!fullName) {
                nameInput?.focus();
                nameInput?.reportValidity?.();
                return;
            }
            if (!email) {
                emailInput?.focus();
                emailInput?.reportValidity?.();
                return;
            }
            if (emailInput && !emailInput.checkValidity()) {
                emailInput.reportValidity();
                return;
            }

            if (statusEl) {
                statusEl.textContent = '';
                statusEl.classList.remove('is-error', 'is-success');
            }
            sendBtn.disabled = true;
            sendBtn.setAttribute('aria-busy', 'true');
            sendBtn.classList.remove('is-sent');
            setSendBtnLabel(sendBtn, 'Senden …');

            sendSavedResult(fullName, email)
                .then(() => {
                    sendBtn.classList.add('is-sent');
                    sendBtn.setAttribute('aria-label', 'Angebot gesendet');
                    setSendBtnLabel(sendBtn, 'Gesendet');
                    if (statusEl) {
                        statusEl.textContent = 'Gesendet – du erhältst gleich eine Bestätigung per E-Mail. Wir melden uns innerhalb von 24 Stunden.';
                        statusEl.classList.add('is-success');
                    }
                    setTimeout(() => closeOfferModal(), 2200);
                })
                .catch((err) => {
                    console.error('Preisrechner-Speichern:', err);
                    setSendBtnLabel(sendBtn, 'Erneut senden');
                    const hint = err.message ? ' (' + err.message + ')' : '';
                    if (statusEl) {
                        statusEl.textContent =
                            'Senden fehlgeschlagen. Bitte erneut versuchen oder an info@devdesignstudio.de schreiben.' + hint;
                        statusEl.classList.add('is-error');
                    }
                    sendBtn.disabled = false;
                    sendBtn.removeAttribute('aria-busy');
                });
            return;
        }
    }

    document.addEventListener('click', handleCalcClick);

    function handleCalcKeydown(e) {
        if (e.key === 'Escape') {
            const overlay = document.getElementById('calcOfferOverlay');
            if (overlay && !overlay.hidden) {
                e.preventDefault();
                closeOfferModal();
            }
            return;
        }
        if (e.key !== 'Enter') return;
        if (e.target.id !== 'calcSaveName' && e.target.id !== 'calcSaveEmail') return;
        const sendBtn = document.querySelector('#calcOfferOverlay [data-action="save-send"]');
        if (sendBtn && !sendBtn.disabled) {
            e.preventDefault();
            sendBtn.click();
        }
    }

    document.addEventListener('keydown', handleCalcKeydown);

    /* ═══════════════════════════════════════════════
       INIT  — full render once, then deltas only
    ═══════════════════════════════════════════════ */
    buildStepperOnce();
    syncStepper(1);
    swapContent(stepContentHtml(1));
}

function initCalcCostNav() {
    const sections = document.querySelectorAll('.calc-cost-section[id]');
    const navLinks = document.querySelectorAll('.calc-cost-nav-link');
    if (!sections.length || !navLinks.length) return;


    const linkById = new Map();
    navLinks.forEach((link) => {
        const id = link.getAttribute('data-section') || (link.getAttribute('href') || '').replace('#', '');
        if (id) linkById.set(id, link);
    });

    function setActive(id) {
        navLinks.forEach((l) => l.classList.remove('is-active'));
        const active = linkById.get(id);
        if (active) active.classList.add('is-active');
    }

    navLinks.forEach((link) => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (!href || !href.startsWith('#')) return;
            const target = document.querySelector(href);
            if (!target) return;
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            history.replaceState(null, '', href);
        });
    });

    if (!('IntersectionObserver' in window)) {
        setActive(sections[0].id);
        return;
    }

    const visible = new Map();
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                visible.set(entry.target.id, entry.isIntersecting ? entry.intersectionRatio : 0);
            });
            let bestId = sections[0].id;
            let bestRatio = 0;
            visible.forEach((ratio, id) => {
                if (ratio > bestRatio) {
                    bestRatio = ratio;
                    bestId = id;
                }
            });
            if (bestRatio > 0) setActive(bestId);
        },
        { root: null, rootMargin: '-35% 0px -45% 0px', threshold: [0, 0.1, 0.25, 0.5, 0.75, 1] }
    );

    sections.forEach((section) => observer.observe(section));
    setActive(sections[0].id);
}
