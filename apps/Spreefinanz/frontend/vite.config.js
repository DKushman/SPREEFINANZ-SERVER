// Minifies custom scripts (not CMS main.js). Run: npm run build:custom
import { defineConfig } from "vite";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const dir = fileURLToPath(new URL(".", import.meta.url));
const entry = process.env.VITE_ENTRY || "elfsight-lazy";

export default defineConfig({
  build: {
    outDir: "assets/local-head",
    emptyOutDir: false,
    lib: {
      entry: resolve(dir, `assets/local-head/${entry}.js`),
      formats: ["iife"],
      name: "SpreefinanzCustom",
      fileName: () => `${entry}.js`,
    },
    minify: "esbuild",
    target: "es2018",
  },
});
