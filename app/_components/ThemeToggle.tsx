"use client";

import type { Locale } from "../content";
import type { PortfolioTheme } from "./PortfolioThemeProvider";

export function ThemeToggle({
  theme,
  onToggle,
  locale = "ru",
}: {
  theme: PortfolioTheme;
  onToggle: () => void;
  locale?: Locale;
}) {
  return (
    <button
      className="portfolio-theme-toggle"
      type="button"
      aria-label={locale === "en" ? "Light theme" : "Светлая тема"}
      aria-pressed={theme === "light"}
      onClick={onToggle}
    >
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
        {theme === "light" ? (
          <>
            <circle cx="12" cy="12" r="3.5" />
            <path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.66 6.34l1.41-1.41" />
          </>
        ) : (
          <path d="M20.4 15.2A8.5 8.5 0 0 1 8.8 3.6 8.5 8.5 0 1 0 20.4 15.2Z" />
        )}
      </svg>
    </button>
  );
}
