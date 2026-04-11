"use client";

import { PriceCalculator } from "../components/PriceCalculator/PriceCalculator";
import type { Step } from "../components/PriceCalculator/types";

const stepOneDeltaByOption: Record<string, [number, number]> = {
  "option-a": [180, 260],
  "option-b": [260, 380],
  "option-c": [420, 620],
};

const stepTwoDeltaByOption: Record<string, [number, number]> = {
  "pill-1": [120, 180],
  "pill-2": [220, 320],
  "pill-3": [320, 460],
  "pill-4": [480, 680],
  "pill-5": [560, 790],
  "pill-6": [680, 920],
};

const stepFourDeltaByOption: Record<string, [number, number]> = {
  "final-a": [140, 210],
  "final-b": [260, 380],
  "final-c": [420, 600],
};

function applyOptionDelta(
  selectedValue: string | number,
  range: [number, number],
  deltaMap: Record<string, [number, number]>,
): [number, number] {
  const delta = deltaMap[String(selectedValue)] ?? [0, 0];
  return [range[0] + delta[0], range[1] + delta[1]];
}

function applySliderDelta(
  selectedValue: string | number,
  range: [number, number],
): [number, number] {
  const sliderValue = Math.max(0, Math.min(10, Number(selectedValue)));
  const deltaMin = Math.round(sliderValue * 70);
  const deltaMax = Math.round(sliderValue * 98);
  return [range[0] + deltaMin, range[1] + deltaMax];
}

const placeholderSteps: Step[] = [
  {
    id: "step-1",
    type: "cards",
    question: "Überschrift für Schritt 1?",
    description:
      "Beschreibungstext, der den Kontext für diesen Auswahlschritt liefert.",
    options: [
      {
        id: "option-a",
        icon: "⚙",
        title: "Option A",
        subtitle: "Kurzbeschreibung A",
        badge: "Meistgewählt",
      },
      {
        id: "option-b",
        icon: "🚀",
        title: "Option B",
        subtitle: "Kurzbeschreibung B",
      },
      {
        id: "option-c",
        icon: "🧩",
        title: "Option C",
        subtitle: "Kurzbeschreibung C",
      },
    ],
    priceEffect: (value, range) =>
      applyOptionDelta(value, range, stepOneDeltaByOption),
  },
  {
    id: "step-2",
    type: "pills",
    question: "Überschrift für Schritt 2?",
    description:
      "Wähle eine der folgenden Kategorien, die am besten zu deiner Situation passt.",
    options: [
      { id: "pill-1", label: "Kategorie A" },
      { id: "pill-2", label: "Kategorie B" },
      { id: "pill-3", label: "Kategorie C" },
      { id: "pill-4", label: "Kategorie D" },
      { id: "pill-5", label: "Kategorie E" },
      { id: "pill-6", label: "Kategorie F" },
    ],
    priceEffect: (value, range) =>
      applyOptionDelta(value, range, stepTwoDeltaByOption),
  },
  {
    id: "step-3",
    type: "slider",
    question: "Überschrift für Schritt 3?",
    description:
      "Stelle den Wert mit dem Regler ein, um eine genauere Schätzung zu erhalten.",
    sliderConfig: {
      min: 0,
      max: 10,
      step: 1,
      unit: "",
      averageValue: 5,
      averageLabel: "Durchschnitt",
    },
    priceEffect: (value, range) => applySliderDelta(value, range),
  },
  {
    id: "step-4",
    type: "cards",
    question: "Überschrift für Schritt 4?",
    description: "Letzte Auswahl, die das Ergebnis beeinflusst.",
    options: [
      {
        id: "final-a",
        icon: "✅",
        title: "Variante 1",
        subtitle: "Detailinfo zu Variante 1",
      },
      {
        id: "final-b",
        icon: "📈",
        title: "Variante 2",
        subtitle: "Detailinfo zu Variante 2",
      },
      {
        id: "final-c",
        icon: "🛡",
        title: "Variante 3",
        subtitle: "Detailinfo zu Variante 3",
      },
    ],
    priceEffect: (value, range) =>
      applyOptionDelta(value, range, stepFourDeltaByOption),
  },
];

export function RechnerVorlageClient() {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PriceCalculator
        steps={placeholderSteps}
        initialRange={[0, 0]}
        currency="€"
        finalButtonLabel="Ergebnis"
      />
    </div>
  );
}
