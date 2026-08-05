"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type ConceptTheme = "dark" | "light";

const STORAGE_KEY = "fullmetall-concept-theme";

type ConceptThemeContextValue = {
  theme: ConceptTheme;
  toggleTheme: () => void;
};

const ConceptThemeContext = createContext<ConceptThemeContextValue | null>(null);

function readStoredTheme(): ConceptTheme | null {
  try {
    const savedTheme = window.localStorage.getItem(STORAGE_KEY);
    return savedTheme === "dark" || savedTheme === "light" ? savedTheme : null;
  } catch {
    return null;
  }
}

function persistTheme(theme: ConceptTheme) {
  try {
    window.localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // Theme switching must still work when browser storage is unavailable.
  }
}

export function ConceptThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<ConceptTheme>("dark");

  useEffect(() => {
    const savedTheme = readStoredTheme();
    if (savedTheme) setTheme(savedTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((current) => {
      const next = current === "dark" ? "light" : "dark";
      persistTheme(next);
      return next;
    });
  }, []);

  const value = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme]);

  return <ConceptThemeContext.Provider value={value}>{children}</ConceptThemeContext.Provider>;
}

export function useConceptTheme() {
  const value = useContext(ConceptThemeContext);
  if (!value) throw new Error("useConceptTheme must be used inside ConceptThemeProvider");
  return value;
}
