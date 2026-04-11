import type { Step } from "@/app/components/PriceCalculator/types";

/** Untergrenze für sinnvolle HU/AU-Richtwerte (keine negativen oder unrealistischen Minima). */
const PRICE_FLOOR = 48;

function clampRange(range: [number, number]): [number, number] {
  const lo = Math.min(range[0], range[1]);
  const hi = Math.max(range[0], range[1]);
  const min = Math.max(PRICE_FLOOR, lo);
  const max = Math.max(min, hi);
  return [min, max];
}

function addToRange(
  range: [number, number],
  delta: [number, number],
): [number, number] {
  return clampRange([range[0] + delta[0], range[1] + delta[1]]);
}

/**
 * Schritt 1: Absolute Richtwert-Spannen (2026, inkl. üblicher MwSt.-Einordnung).
 * Ersetzt die laufende Spanne — verhindert negative Werte durch „Pkw-Basis + große Abzüge“.
 */
const fahrzeugPruefungBase: Record<string, [number, number]> = {
  pkw_hu_au: [143, 170],
  pkw_hybrid_hu_au: [148, 178],
  pkw_elektro_nur_hu: [56, 74],
  motorrad_hu_au: [70, 100],
  motorrad_elektro: [56, 74],
  wohn_leicht_hu_au: [165, 205],
  wohn_schwer_hu_au: [185, 240],
  anh_gebremst: [85, 100],
  anh_ungebremst: [55, 72],
};

/** Karenz / Überziehung: Bußgeld + ggf. erweiterte Prüfung (grobe Stufen). */
function effectUeberfaelligkeit(
  value: string | number,
  range: [number, number],
): [number, number] {
  const t = Math.max(0, Math.min(10, Number(value)));
  const dLo = Math.round(t * 3.2);
  const dHi = Math.round(t * 8.5);
  return addToRange(range, [dLo, dHi]);
}

const risikoPillDelta: Record<string, [number, number]> = {
  risiko_keine: [0, 0],
  risiko_km: [6, 14],
  risiko_tuning: [10, 24],
  risiko_vorschaden: [5, 16],
};

function effectRisikoPill(
  value: string | number,
  range: [number, number],
): [number, number] {
  const d = risikoPillDelta[String(value)] ?? [0, 0];
  return addToRange(range, d);
}

const regionDelta: Record<string, [number, number]> = {
  region_nord_west: [-4, 6],
  region_mitte: [0, 10],
  region_sued_ost: [5, 22],
  region_unbekannt: [0, 12],
};

function effectRegion(
  value: string | number,
  range: [number, number],
): [number, number] {
  const d = regionDelta[String(value)] ?? [0, 0];
  return addToRange(range, d);
}

/** Zusätzlicher Prüfaufwand / schwieriges Fahrzeug (geschätzt). */
function effectAufwaendigkeit(
  value: string | number,
  range: [number, number],
): [number, number] {
  const t = Math.max(0, Math.min(10, Number(value)));
  return addToRange(range, [Math.round(t * 2.8), Math.round(t * 7.5)]);
}

const prueferDelta: Record<string, [number, number]> = {
  pruef_tuev_dekra: [5, 18],
  pruef_gtue_kues: [-6, 4],
  pruef_egal: [0, 10],
};

function effectPruefer(
  value: string | number,
  range: [number, number],
): [number, number] {
  const d = prueferDelta[String(value)] ?? [0, 0];
  return addToRange(range, d);
}

/**
 * Platzhalter bis zur ersten Auswahl (nur Anzeige); Schritt 1 ersetzt durch echte Basis.
 */
export const tuevPreisrechnerInitialRange: [number, number] = [130, 168];

export const tuevPreisrechnerSteps: Step[] = [
  {
    id: "tuev-step-fahrzeug-pruefung",
    type: "cards",
    question: "Was passt zu deinem Fahrzeug?",
    description:
      "Eine Auswahl = passende Richtwert-Spanne (HU, ggf. AU). So vermeiden wir widersprüchliche Kombinationen.",
    options: [
      {
        id: "pkw_hu_au",
        icon: "🚗",
        title: "Pkw Benzin / Diesel",
        subtitle: "HU inkl. Abgasuntersuchung",
        badge: "Typisch",
      },
      {
        id: "pkw_hybrid_hu_au",
        icon: "🔋",
        title: "Pkw Hybrid",
        subtitle: "HU inkl. AU",
      },
      {
        id: "pkw_elektro_nur_hu",
        icon: "⚡",
        title: "Pkw Elektro",
        subtitle: "nur HU (keine AU)",
      },
      {
        id: "motorrad_hu_au",
        icon: "🏍",
        title: "Motorrad Verbrenner",
        subtitle: "HU inkl. AU",
      },
      {
        id: "motorrad_elektro",
        icon: "⚡",
        title: "Motorrad Elektro",
        subtitle: "nur HU",
      },
      {
        id: "wohn_leicht_hu_au",
        icon: "🚐",
        title: "Wohnmobil bis 7,5 t",
        subtitle: "HU inkl. AU",
      },
      {
        id: "wohn_schwer_hu_au",
        icon: "🚛",
        title: "Wohnmobil über 7,5 t",
        subtitle: "HU inkl. AU, oft jährlich",
      },
      {
        id: "anh_gebremst",
        icon: "⛓",
        title: "Anhänger gebremst",
        subtitle: "bis ca. 12 t",
      },
      {
        id: "anh_ungebremst",
        icon: "🔗",
        title: "Anhänger ungebremst",
        subtitle: "leichte Anhänger",
      },
    ],
    priceEffect: (value, _range) => {
      const base = fahrzeugPruefungBase[String(value)];
      if (base) return clampRange(base);
      return clampRange(_range);
    },
  },
  {
    id: "tuev-step-ueberfaelligkeit",
    type: "slider",
    question: "Wie steht es mit der HU-Frist?",
    description:
      "0 = noch gültig oder Karenz, weiter rechts = länger überzogen (Bußgeld + ggf. teurere Nachprüfung). Grobe Schätzung reicht.",
    sliderConfig: {
      min: 0,
      max: 10,
      step: 1,
      unit: "",
      averageValue: 1,
      averageLabel: "pünktlich / Karenz",
    },
    priceEffect: (value, range) => effectUeberfaelligkeit(value, range),
  },
  {
    id: "tuev-step-risiko",
    type: "pills",
    question: "Zusätzliche Risiken am Fahrzeug?",
    description:
      "Mehrfachauswahl möglich. „Trifft nicht zu“ wählen, wenn nichts passt.",
    options: [
      { id: "risiko_keine", label: "Trifft nicht zu" },
      { id: "risiko_km", label: "Sehr hohe Laufleistung" },
      { id: "risiko_tuning", label: "Tuning / Umbauten" },
      { id: "risiko_vorschaden", label: "Vorschäden unklar" },
    ],
    priceEffect: (value, range) => effectRisikoPill(value, range),
  },
  {
    id: "tuev-step-region",
    type: "cards",
    question: "Regionale Gebührenlage?",
    description:
      "Die Prüfgebühr variiert je nach Standort und Prüfstelle – hier eine grobe Tendenz.",
    options: [
      {
        id: "region_nord_west",
        icon: "🧭",
        title: "Nord / West",
        subtitle: "oft etwas günstiger",
      },
      {
        id: "region_mitte",
        icon: "📍",
        title: "Mitte",
        subtitle: "mittleres Niveau",
      },
      {
        id: "region_sued_ost",
        icon: "🌤",
        title: "Süd / Ost",
        subtitle: "eher höhere Gebühren",
      },
      {
        id: "region_unbekannt",
        icon: "❔",
        title: "Weiß ich nicht",
        subtitle: "mittlerer Puffer",
      },
    ],
    priceEffect: (value, range) => effectRegion(value, range),
  },
  {
    id: "tuev-step-aufwaendigkeit",
    type: "slider",
    question: "Erwarteter Prüfaufwand?",
    description:
      "Alter Fahrzeugzustand, viele Mängel in der Vergangenheit oder unübersichtliche Umbauten können die Prüfzeit erhöhen.",
    sliderConfig: {
      min: 0,
      max: 10,
      step: 1,
      unit: "",
      averageValue: 3,
      averageLabel: "eher Standard",
    },
    priceEffect: (value, range) => effectAufwaendigkeit(value, range),
  },
  {
    id: "tuev-step-pruefer",
    type: "cards",
    question: "Prüforganisation?",
    description:
      "Alle prüfen nach derselben Norm – die Preise unterscheiden sich trotzdem oft um ein paar Euro.",
    options: [
      {
        id: "pruef_tuev_dekra",
        icon: "🏷",
        title: "TÜV / DEKRA",
        subtitle: "häufig etwas höher",
      },
      {
        id: "pruef_gtue_kues",
        icon: "💶",
        title: "GTÜ / KÜS",
        subtitle: "oft günstiger",
      },
      {
        id: "pruef_egal",
        icon: "🤷",
        title: "Weiß ich noch nicht",
        subtitle: "mittlerer Zuschlag",
      },
    ],
    priceEffect: (value, range) => effectPruefer(value, range),
  },
];
