import { defineConfig } from 'vite';
import { readdirSync, statSync } from 'fs';
import { join, resolve, relative } from 'path';
import { fileURLToPath } from 'url';
import { devdesignAssetVersionPlugin } from './scripts/vite-plugin-asset-version.mjs';
import { ddAsyncCssPlugin } from './scripts/vite-plugin-async-css.mjs';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

const skipDirs = new Set(['node_modules', 'dist', 'MEDIA CDN']);

function collectHtmlInputs(rootDir) {
  const input = {};

  function walk(dir) {
    for (const name of readdirSync(dir)) {
      const full = join(dir, name);
      let st;
      try {
        st = statSync(full);
      } catch {
        continue;
      }
      if (st.isDirectory()) {
        if (skipDirs.has(name)) continue;
        walk(full);
      } else if (name.endsWith('.html')) {
        if (name === 'index backup.html') continue;
        const rel = relative(rootDir, full).replace(/\\/g, '/');
        const key = rel.replace(/\.html$/, '');
        input[key] = resolve(full);
      }
    }
  }

  walk(rootDir);
  return input;
}

/** Production HTML only: GA4 measurement ID + Consent Mode defaults (no request to Google). */
function ddGaConsentBootstrapPlugin() {
  return {
    name: 'dd-ga-consent-bootstrap',
    apply: 'build',
    transformIndexHtml(html) {
      if (!html.includes('<head')) return;
      if (html.includes('id="dd-consent-bootstrap"')) return;
      const snippet = `    <script id="dd-consent-bootstrap">
(function(){
var h=location.hostname;
if(h!=="devdesignstudio.de"&&h!=="www.devdesignstudio.de")return;
window.__DD_GA_MEASUREMENT_ID__="G-RS2GHXLL6K";
window.dataLayer=window.dataLayer||[];
function gtag(){dataLayer.push(arguments);}
window.gtag=gtag;
gtag("consent","default",{ad_storage:"denied",analytics_storage:"denied",ad_user_data:"denied",ad_personalization:"denied",wait_for_update:500});
})();
</script>`;
      return html.replace(/<head([^>]*)>/i, `<head$1>\n${snippet}`);
    },
  };
}

export default defineConfig({
  appType: 'mpa',
  plugins: [ddGaConsentBootstrapPlugin(), devdesignAssetVersionPlugin(), ddAsyncCssPlugin()],
  server: {
    port: 3000,
    open: true,
    host: true,
    proxy: {
      '/leads': { target: 'http://127.0.0.1:8000', changeOrigin: true },
      '/health': { target: 'http://127.0.0.1:8000', changeOrigin: true },
      '/tracking': { target: 'http://127.0.0.1:8000', changeOrigin: true }
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    rollupOptions: {
      input: collectHtmlInputs(__dirname)
    }
  },
  publicDir: 'public'
});
