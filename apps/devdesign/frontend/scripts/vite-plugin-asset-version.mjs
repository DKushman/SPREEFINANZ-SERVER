/**
 * Production: append ?v=<build id> to /assets/*.css and /assets/*.js in emitted HTML.
 * Ensures browsers and CDNs fetch fresh assets after every deploy/rebuild.
 *
 * Set DD_BUILD_VERSION (e.g. unix time or git sha) in the environment for a stable
 * label across machines; otherwise falls back to unix seconds at config load time.
 */
export function devdesignAssetVersionPlugin() {
  let version;

  return {
    name: 'devdesign-asset-version',
    apply: 'build',
    configResolved() {
      const fromEnv = process.env.DD_BUILD_VERSION;
      version =
        fromEnv != null && String(fromEnv).trim() !== ''
          ? String(fromEnv).trim()
          : String(Math.floor(Date.now() / 1000));
    },
    transformIndexHtml: {
      order: 'post',
      handler(html) {
        const v = encodeURIComponent(version);
        return html.replace(
          /(href|src)=(["'])(\/assets\/[^'"]+)\2/gi,
          (full, attr, quote, path) => {
            if (/[?&]v=/.test(path)) return full;
            if (!/\.(css|js|mjs)$/i.test(path)) return full;
            const sep = path.includes('?') ? '&' : '?';
            return `${attr}=${quote}${path}${sep}v=${v}${quote}`;
          },
        );
      },
    },
  };
}
