"use client";

import type { ConceptTheme } from "../../_components/ConceptThemeProvider";

export function ThemeToggle({ theme, onToggle }: { theme: ConceptTheme; onToggle: () => void }) {
  return (
    <button
      className="concept-theme-toggle"
      type="button"
      aria-label="Светлая тема"
      aria-pressed={theme === "light"}
      onClick={onToggle}
    >
      <span aria-hidden="true">{theme === "light" ? "☀" : "☾"}</span>
      <span className="concept-theme-label">{theme === "light" ? "Светлая" : "Тёмная"}</span>
    </button>
  );
}
