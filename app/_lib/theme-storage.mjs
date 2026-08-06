export const THEME_STORAGE_KEY = "fullmetall-portfolio-theme";
export const LEGACY_THEME_STORAGE_KEY = "fullmetall-concept-theme";

function isTheme(value) {
  return value === "dark" || value === "light";
}

export function readStoredTheme(owner) {
  try {
    const storage = owner.localStorage;
    const currentTheme = storage.getItem(THEME_STORAGE_KEY);
    if (isTheme(currentTheme)) return currentTheme;

    const legacyTheme = storage.getItem(LEGACY_THEME_STORAGE_KEY);
    if (!isTheme(legacyTheme)) return null;

    try {
      storage.setItem(THEME_STORAGE_KEY, legacyTheme);
      storage.removeItem(LEGACY_THEME_STORAGE_KEY);
    } catch {
      // A readable preference is still valid when storage is read-only.
    }
    return legacyTheme;
  } catch {
    return null;
  }
}

export function persistTheme(owner, theme) {
  try {
    const storage = owner.localStorage;
    storage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Theme switching must still work when browser storage is unavailable.
  }
}