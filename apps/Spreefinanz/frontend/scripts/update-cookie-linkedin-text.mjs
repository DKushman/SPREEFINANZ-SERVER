#!/usr/bin/env node
/**
 * Updates cookie banner copy (HTML + main.js) to mention Google Analytics and LinkedIn.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

const replacements = [
  // DE — standard banner (HTML)
  [
    "Andere Cookies sind optional und erweitern den Funktionsumfang. Sie können Ihre Einwilligung jederzeit widerrufen.",
    "Andere Cookies sind optional und erweitern den Funktionsumfang (u. a. Google Analytics und LinkedIn Insight Tag für Statistik und Marketing). Sie können Ihre Einwilligung jederzeit widerrufen.",
  ],
  // EN — standard banner (HTML)
  [
    "Other cookies are optional and extend functionality. You can revoke your consent at any time.",
    "Other cookies are optional and extend functionality (including Google Analytics and the LinkedIn Insight Tag for statistics and marketing). You can revoke your consent at any time.",
  ],
  // EN — alternate wording on some pages
  [
    "Other cookies are optional and extend the functionality. You can revoke your consent at any time.",
    "Other cookies are optional and extend the functionality (including Google Analytics and the LinkedIn Insight Tag for statistics and marketing). You can revoke your consent at any time.",
  ],
  // main.js i18n DE
  [
    "Andere Cookies sind optional und erweitern den Funktionsumfang. Sie können Ihre Einwilligung jederzeit widerrufen. Nähere Informationen finden Sie in der [Datenschutzerklärung](URL).",
    "Andere Cookies sind optional und erweitern den Funktionsumfang (u. a. Google Analytics und LinkedIn Insight Tag für Statistik und Marketing). Sie können Ihre Einwilligung jederzeit widerrufen. Nähere Informationen finden Sie in der [Datenschutzerklärung](URL).",
  ],
  // main.js i18n EN
  [
    "Other cookies are optional and expand the range of functions. You can withdraw your consent at any time. More information can be found in the [privacy statement](URL).",
    "Other cookies are optional and expand the range of functions (including Google Analytics and the LinkedIn Insight Tag for statistics and marketing). You can withdraw your consent at any time. More information can be found in the [privacy statement](URL).",
  ],
  // Cookie overlay — tracking category
  [
    "Anonyme Statistiken zum Nutzungsverhalten sowie websiteübergreifendes Tracking für personalisierte Werbung",
    "Google Analytics, LinkedIn Insight Tag sowie websiteübergreifendes Tracking für Statistik und Marketing (z. B. LinkedIn-Anzeigen)",
  ],
  [
    "Anonymous statistics on user behavior and cross-website tracking for personalized advertising",
    "Google Analytics, LinkedIn Insight Tag, and cross-website tracking for statistics and marketing (e.g. LinkedIn ads)",
  ],
];

function walkHtml(dir, files = []) {
  for (const name of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, name.name);
    if (name.isDirectory()) {
      if (name.name === "_assets" || name.name === "node_modules") continue;
      walkHtml(full, files);
    } else if (name.name.endsWith(".html")) {
      files.push(full);
    }
  }
  return files;
}

function applyReplacements(content) {
  let next = content;
  let changed = false;
  for (const [from, to] of replacements) {
    if (next.includes(from)) {
      next = next.split(from).join(to);
      changed = true;
    }
  }
  return { next, changed };
}

let updated = 0;

for (const file of walkHtml(root)) {
  const rel = path.relative(root, file);
  if (rel.startsWith("_assets")) continue;
  const raw = fs.readFileSync(file, "utf8");
  const { next, changed } = applyReplacements(raw);
  if (changed) {
    fs.writeFileSync(file, next);
    updated += 1;
    console.log("updated", rel);
  }
}

for (const jsName of ["main.js", "main.7a280948f1e2.js"]) {
  const jsPath = path.join(root, jsName);
  if (!fs.existsSync(jsPath)) continue;
  const raw = fs.readFileSync(jsPath, "utf8");
  const { next, changed } = applyReplacements(raw);
  if (changed) {
    fs.writeFileSync(jsPath, next);
    updated += 1;
    console.log("updated", jsName);
  }
}

console.log(`Done. ${updated} file(s) changed.`);
