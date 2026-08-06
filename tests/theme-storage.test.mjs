import assert from "node:assert/strict";
import { test } from "node:test";
import {
  LEGACY_THEME_STORAGE_KEY,
  THEME_STORAGE_KEY,
  persistTheme,
  readStoredTheme,
} from "../app/_lib/theme-storage.mjs";

const productionLegacyThemeStorageKey = "fullmetall-concept-theme";

function createStorage(entries = []) {
  const values = new Map(entries);
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
    values,
  };
}

function createOwner(entries = []) {
  const storage = createStorage(entries);
  return { owner: { localStorage: storage }, storage };
}

test("theme storage migrates the production legacy preference", () => {
  assert.equal(LEGACY_THEME_STORAGE_KEY, productionLegacyThemeStorageKey);
  const { owner, storage } = createOwner([[productionLegacyThemeStorageKey, "light"]]);

  assert.equal(readStoredTheme(owner), "light");
  assert.equal(storage.getItem(THEME_STORAGE_KEY), "light");
  assert.equal(storage.getItem(productionLegacyThemeStorageKey), null);
});

test("theme storage prefers the current key and ignores invalid values", () => {
  const current = createOwner([
    [THEME_STORAGE_KEY, "dark"],
    [LEGACY_THEME_STORAGE_KEY, "light"],
  ]).owner;
  const invalid = createOwner([[LEGACY_THEME_STORAGE_KEY, "sepia"]]).owner;

  assert.equal(readStoredTheme(current), "dark");
  assert.equal(readStoredTheme(invalid), null);
});

test("theme storage persists a valid preference", () => {
  const { owner, storage } = createOwner();
  persistTheme(owner, "light");
  assert.equal(storage.getItem(THEME_STORAGE_KEY), "light");
});

test("theme storage keeps a readable legacy preference when migration writes fail", () => {
  const storage = createStorage([[productionLegacyThemeStorageKey, "light"]]);
  storage.setItem = () => {
    throw new Error("storage is read-only");
  };

  assert.equal(readStoredTheme({ localStorage: storage }), "light");
});

test("theme storage tolerates an unavailable localStorage getter", () => {
  const owner = Object.defineProperty({}, "localStorage", {
    get() {
      throw new Error("storage unavailable");
    },
  });

  assert.equal(readStoredTheme(owner), null);
  assert.doesNotThrow(() => persistTheme(owner, "light"));
});