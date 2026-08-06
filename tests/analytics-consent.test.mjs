import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import {
  ANALYTICS_CONSENT_KEY,
  ANALYTICS_PRODUCTION_ORIGIN,
  ANALYTICS_SETTINGS_EVENT,
  YANDEX_METRIKA_ID,
  isProductionAnalyticsOrigin,
  persistAnalyticsConsent,
  readAnalyticsConsent,
} from "../app/_lib/analytics-consent.mjs";

function createStorage(entries = []) {
  const values = new Map(entries);
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    values,
  };
}

test("analytics configuration exposes the production counter and settings event", () => {
  assert.equal(YANDEX_METRIKA_ID, 111368970);
  assert.equal(ANALYTICS_PRODUCTION_ORIGIN, "https://fullmetall.ru");
  assert.equal(ANALYTICS_SETTINGS_EVENT, "portfolio:analytics-settings");
  assert.equal(
    isProductionAnalyticsOrigin({ location: { origin: "https://fullmetall.ru" } }),
    true,
  );
  assert.equal(
    isProductionAnalyticsOrigin({ location: { origin: "https://preview.fullmetall.ru" } }),
    false,
  );
  assert.equal(
    isProductionAnalyticsOrigin({ location: { origin: "http://127.0.0.1:3000" } }),
    false,
  );
});

test("analytics consent reads only supported decisions", () => {
  assert.equal(
    readAnalyticsConsent({ localStorage: createStorage([[ANALYTICS_CONSENT_KEY, "accepted"]]) }),
    "accepted",
  );
  assert.equal(
    readAnalyticsConsent({ localStorage: createStorage([[ANALYTICS_CONSENT_KEY, "declined"]]) }),
    "declined",
  );
  assert.equal(
    readAnalyticsConsent({ localStorage: createStorage([[ANALYTICS_CONSENT_KEY, "maybe"]]) }),
    null,
  );
});

test("analytics consent persists a supported decision", () => {
  const storage = createStorage();
  assert.equal(persistAnalyticsConsent({ localStorage: storage }, "accepted"), true);
  assert.equal(storage.getItem(ANALYTICS_CONSENT_KEY), "accepted");
});

test("analytics consent tolerates blocked browser storage", () => {
  const owner = Object.defineProperty({}, "localStorage", {
    get() {
      throw new Error("storage unavailable");
    },
  });

  assert.equal(readAnalyticsConsent(owner), null);
  assert.equal(persistAnalyticsConsent(owner, "declined"), false);
});

test("analytics loads the production Yandex counter only after consent and tracks SPA routes", async () => {
  const component = await readFile(
    new URL("../app/_components/AnalyticsConsent.tsx", import.meta.url),
    "utf8",
  );
  const layout = await readFile(new URL("../app/layout.tsx", import.meta.url), "utf8");
  const privacyPage = await readFile(
    new URL("../app/_components/PrivacyPage.tsx", import.meta.url),
    "utf8",
  );
  const exportedHome = await readFile(new URL("../out/index.html", import.meta.url), "utf8");

  assert.match(component, /YANDEX_METRIKA_ID/);
  assert.match(component, /if \(!isProductionAnalyticsOrigin\(window\)\) return false/);
  assert.doesNotMatch(component, /NEXT_PUBLIC_YANDEX_METRIKA_ID/);
  assert.match(component, /tag\.js\?id=\$\{YANDEX_METRIKA_ID\}/);
  assert.match(component, /ssr:\s*true/);
  assert.match(component, /referrer:\s*document\.referrer/);
  assert.match(component, /url:\s*window\.location\.href/);
  assert.match(component, /usePathname\(\)/);
  assert.match(component, /"hit"/);
  assert.match(component, /"hit",\s*currentUrl,\s*\{\s*referer,/s);
  assert.doesNotMatch(component, /"hit",\s*currentUrl,\s*\{\s*referrer,/s);
  assert.match(component, /ANALYTICS_SETTINGS_EVENT/);
  assert.match(component, /ANALYTICS_CONSENT_KEY/);
  assert.match(component, /readAnalyticsConsent/);
  assert.match(component, /persistAnalyticsConsent/);
  assert.match(component, /window\.addEventListener\("storage",\s*syncConsent\)/);
  assert.match(component, /window\.removeEventListener\("storage",\s*syncConsent\)/);
  assert.match(
    component,
    /event\.key !== ANALYTICS_CONSENT_KEY\s*&&\s*event\.key !== null/,
  );
  assert.match(component, /event\.newValue === "accepted"/);
  assert.match(component, /event\.newValue === "declined"/);
  assert.match(component, /const firstActionRef = useRef<HTMLButtonElement>\(null\)/);
  assert.match(component, /window\.requestAnimationFrame\([\s\S]*firstActionRef\.current\?\.focus\(\)/);
  assert.match(component, /ref=\{firstActionRef\}/);
  assert.match(
    component,
    /setVisibleLocale\(\(currentLocale\)\s*=>[\s\S]*localeFromPath\(pathname\)[\s\S]*\}\);[\s\S]*\},\s*\[pathname\]\);/,
  );
  assert.doesNotMatch(component, /webvisor:\s*true/);

  assert.match(layout, /<AnalyticsConsent \/>/);
  assert.doesNotMatch(layout, /<noscript/i);
  assert.doesNotMatch(exportedHome, /mc\.yandex\.ru|watch\/111368970|<noscript/i);
  assert.match(privacyPage, /Сам fullmetall\.ru отдельно сохраняет выбор аналитики и тему оформления/);
  assert.match(privacyPage, /fullmetall\.ru separately stores the analytics choice and display theme/);
  assert.match(privacyPage, /yandexPolicyHref:\s*"https:\/\/yandex\.ru\/legal\/metrica_termsofuse\/ru"/);
  assert.match(privacyPage, /yandexPolicyHref:\s*"https:\/\/yandex\.com\/legal\/metrica_termsofuse\/en\/"/);
});

test("analytics consent banner is responsive and keeps both decisions equally accessible", async () => {
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");

  assert.match(
    css,
    /\.consent-banner\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)\s+auto[^}]*width:\s*min\(620px,\s*calc\(100%\s*-\s*48px\)\)/s,
  );
  assert.match(css, /\.consent-banner-copy a\s*\{[^}]*color:\s*#9fe870/s);
  assert.match(
    css,
    /@media \(max-width:\s*680px\)[\s\S]*\.consent-banner\s*\{[^}]*grid-template-columns:\s*1fr[^}]*width:\s*calc\(100%\s*-\s*28px\)/s,
  );
  assert.match(
    css,
    /@media \(max-width:\s*680px\)[\s\S]*\.consent-banner-actions button\s*\{[^}]*flex:\s*1/s,
  );
});
