/** Production: CSS non-render-blocking (preload + onload). Startseite bleibt blocking (LCP/CLS). */
export function ddAsyncCssPlugin() {
  return {
    name: 'dd-async-css',
    apply: 'build',
    transformIndexHtml: {
      order: 'post',
      handler(html, ctx) {
        const name = ctx?.filename || ctx?.path || '';
        const isHome =
            name === 'index.html' ||
            name.endsWith('/index.html') ||
            html.includes('class="page-home"') ||
            html.includes("class='page-home'");
        if (isHome) return html;

        return html.replace(
          /<link\s+rel="stylesheet"\s+([^>]*?)href=(["'])(\/assets\/[^"']+\.css[^"']*)\2([^>]*)\/?>/gi,
          (_match, before, quote, href) => {
            const attrs = `${before}href=${quote}${href}${quote}`.trim();
            return (
              `<link rel="preload" as="style" ${attrs} onload="this.onload=null;this.rel='stylesheet'">` +
              `<noscript><link rel="stylesheet" ${attrs}></noscript>`
            );
          },
        );
      },
    },
  };
}
