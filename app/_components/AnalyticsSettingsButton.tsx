"use client";

import { ANALYTICS_SETTINGS_EVENT } from "../_lib/analytics-consent.mjs";

export function AnalyticsSettingsButton({ label }: { label: string }) {
  return (
    <button
      className="portfolio-footer-action"
      type="button"
      data-analytics-settings="true"
      onClick={() => window.dispatchEvent(new Event(ANALYTICS_SETTINGS_EVENT))}
    >
      {label}
    </button>
  );
}
