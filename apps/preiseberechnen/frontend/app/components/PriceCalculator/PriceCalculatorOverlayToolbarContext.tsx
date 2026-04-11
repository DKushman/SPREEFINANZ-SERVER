"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type ToolbarContextValue = {
  onReset: (() => void) | null;
  registerOnReset: (fn: (() => void) | null) => void;
};

const PriceCalculatorOverlayToolbarContext =
  createContext<ToolbarContextValue | null>(null);

export function PriceCalculatorOverlayToolbarProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [onReset, setOnReset] = useState<(() => void) | null>(null);

  const registerOnReset = useCallback((fn: (() => void) | null) => {
    setOnReset(() => fn ?? null);
  }, []);

  const value = useMemo(
    () => ({ onReset, registerOnReset }),
    [onReset, registerOnReset],
  );

  return (
    <PriceCalculatorOverlayToolbarContext.Provider value={value}>
      {children}
    </PriceCalculatorOverlayToolbarContext.Provider>
  );
}

export function usePriceCalculatorOverlayToolbarRegister() {
  return useContext(PriceCalculatorOverlayToolbarContext);
}

export function usePriceCalculatorOverlayToolbar() {
  const ctx = useContext(PriceCalculatorOverlayToolbarContext);
  if (!ctx) {
    throw new Error(
      "usePriceCalculatorOverlayToolbar must be used within PriceCalculatorOverlayToolbarProvider",
    );
  }
  return ctx;
}
