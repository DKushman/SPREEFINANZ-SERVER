/**
 * Present before main.js on static exports; core behaviour lives in minified.js + main.js.
 * Avoids 404 and keeps optional local overrides in one place.
 */
(function () {
  if (typeof window === 'undefined') return;
  window.digidor = window.digidor || {};
})();
