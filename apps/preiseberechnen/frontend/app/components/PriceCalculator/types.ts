import type { ReactNode } from "react";

export type StepType = "cards" | "pills" | "slider";

export type CardOption = {
  id: string;
  icon?: ReactNode;
  title: string;
  subtitle?: string;
  badge?: string;
};

export type PillOption = {
  id: string;
  label: string;
};

export type SliderConfig = {
  min: number;
  max: number;
  step: number;
  unit?: string;
  averageValue?: number;
  averageLabel?: string;
};

export type Step = {
  id: string;
  type: StepType;
  question: string;
  description?: string;
  options?: CardOption[] | PillOption[];
  sliderConfig?: SliderConfig;
  priceEffect: (
    value: string | number,
    currentRange: [number, number],
  ) => [number, number];
};

export type PriceCalculatorProps = {
  steps: Step[];
  initialRange: [number, number];
  currency?: string;
  finalButtonLabel?: string;
  onComplete?: (selections: Record<string, string | number | string[]>) => void;
  /** Im Overlay: Schließen-Button in einer Zeile mit Reset und Schritt-Indikator. */
  onOverlayClose?: () => void;
};
