"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { persistTheme, readStoredTheme } from "../_lib/theme-storage.mjs";

export type PortfolioTheme = "dark" | "light";


type PortfolioThemeContextValue = {
  theme: PortfolioTheme;
  toggleTheme: () => void;
};

const PortfolioThemeContext = createContext<PortfolioThemeContextValue | null>(null);

function readSystemTheme(): PortfolioTheme {
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}


export function PortfolioThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<PortfolioTheme>("dark");

  useEffect(() => {
    setTheme(readStoredTheme(window) ?? readSystemTheme());
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((current) => {
      const next = current === "dark" ? "light" : "dark";
      persistTheme(window, next);
      return next;
    });
  }, []);

  const value = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme]);

  return <PortfolioThemeContext.Provider value={value}>{children}</PortfolioThemeContext.Provider>;
}

export function usePortfolioTheme() {
  const value = useContext(PortfolioThemeContext);
  if (!value) throw new Error("usePortfolioTheme must be used inside PortfolioThemeProvider");
  return value;
}
