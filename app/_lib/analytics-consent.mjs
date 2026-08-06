export const YANDEX_METRIKA_ID = 111368970;
export const ANALYTICS_PRODUCTION_ORIGIN = "https://fullmetall.ru";
export const ANALYTICS_CONSENT_KEY = "portfolio-analytics-consent";
export const ANALYTICS_SETTINGS_EVENT = "portfolio:analytics-settings";

const decisions = new Set(["accepted", "declined"]);

export function isProductionAnalyticsOrigin(owner) {
  try {
    return owner.location.origin === ANALYTICS_PRODUCTION_ORIGIN;
  } catch {
    return false;
  }
}

export function readAnalyticsConsent(owner) {
  try {
    const value = owner.localStorage.getItem(ANALYTICS_CONSENT_KEY);
    return decisions.has(value) ? value : null;
  } catch {
    return null;
  }
}

export function persistAnalyticsConsent(owner, decision) {
  if (!decisions.has(decision)) return false;
  try {
    owner.localStorage.setItem(ANALYTICS_CONSENT_KEY, decision);
    return true;
  } catch {
    return false;
  }
}
