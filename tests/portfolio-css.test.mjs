import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

const css = await readFile(new URL("../app/portfolio.css", import.meta.url), "utf8");
const portfolio = await readFile(new URL("../app/_components/PortfolioExperience.tsx", import.meta.url), "utf8");
const liftCase = await readFile(new URL("../app/_components/LiftAutomationCase.tsx", import.meta.url), "utf8");
const rootLayout = await readFile(new URL("../app/layout.tsx", import.meta.url), "utf8");
const themeToggle = await readFile(new URL("../app/_components/ThemeToggle.tsx", import.meta.url), "utf8");
const themeProvider = await readFile(new URL("../app/_components/PortfolioThemeProvider.tsx", import.meta.url), "utf8");
const themeStorage = await readFile(new URL("../app/_lib/theme-storage.mjs", import.meta.url), "utf8");
const liftCaseLayout = await readFile(new URL("../app/projects/lift-automation/layout.tsx", import.meta.url), "utf8");
const englishLiftCaseLayout = await readFile(new URL("../app/en/projects/lift-automation/layout.tsx", import.meta.url), "utf8");
const mobile800Start = css.indexOf("@media (max-width: 800px)");
const mobile430Start = css.indexOf("@media (max-width: 430px)");
assert(mobile800Start >= 0 && mobile430Start > mobile800Start, "Missing mobile CSS ranges");
const mobile800 = css.slice(mobile800Start, mobile430Start);
const mobile430 = css.slice(mobile430Start);

function rule(selector) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const matches = [...css.matchAll(new RegExp(`${escaped}\\s*\\{([^}]+)\\}`, "g"))];
  assert(matches.length > 0, `Missing CSS rule: ${selector}`);
  return matches.at(-1)[1];
}

function lightThemeViolations(source) {
  const allowedProperties = new Set([
    "--portfolio-bg",
    "--portfolio-surface",
    "--portfolio-ink",
    "--portfolio-muted",
    "--portfolio-line",
    "--portfolio-accent",
    "--portfolio-accent-2",
    "--portfolio-positive",
    "color",
    "background",
    "border-color",
    "box-shadow",
    "outline-color",
    "fill",
    "stroke",
  ]);
  const lightSelector = /\[\s*data-theme\s*=\s*(?:["']light["']|light)\s*\]/;
  const rules = [...source.matchAll(/([^{}]+)\{([^{}]*)\}/g)]
    .filter(([, selector]) => lightSelector.test(selector));
  const violations = rules.flatMap(([, , body]) => body
    .split(";")
    .map((declaration) => declaration.trim().split(":", 1)[0])
    .filter(Boolean)
    .filter((property) => !allowedProperties.has(property)));
  return { ruleCount: rules.length, violations };
}

test("editorial workflow keeps the opening screen compact and aligns rail markers across breakpoints", () => {
  assert.match(
    css,
    /\.portfolio-workflow \.portfolio-hero h1\s*\{[^}]*font-size:\s*clamp\([^,]+,[^,]+,\s*96px\)/s,
  );
  assert.match(
    css,
    /\.portfolio-workflow \.portfolio-hero-copy > \.portfolio-rail-marker\s*\{[^}]*top:\s*-12px/s,
  );
  assert.match(
    mobile800,
    /\.portfolio-workflow \.portfolio-hero h1\s*\{[^}]*font-size:\s*clamp\(48px,\s*10vw,\s*58px\)/s,
  );
  assert.match(
    mobile800,
    /\.portfolio-workflow \.portfolio-hero-copy > \.portfolio-rail-marker\s*\{[^}]*top:\s*-10px/s,
  );
  assert.match(
    mobile800,
    /\.portfolio-workflow \.portfolio-hero-copy > \.portfolio-rail-marker strong\s*\{[^}]*display:\s*none/s,
  );
});

test("editorial workflow segmented control has readable active text", () => {
  const active = rule(".portfolio-workflow .portfolio-segmented button.is-active");
  assert.match(active, /color:\s*#101b22/);
  assert.match(active, /background:\s*var\(--portfolio-accent-2\)/);
});

test("editorial workflow process cards use stable equal-height content rows", () => {
  const fullCard = rule(".portfolio-workflow .portfolio-step");
  const fullMain = rule(".portfolio-workflow .portfolio-step-main");
  const compactCard = rule(".portfolio-workflow .portfolio-compact-flow > li");
  const fullCopy = rule(".portfolio-workflow .portfolio-step-copy");
  const compactCopy = rule(".portfolio-workflow .portfolio-compact-copy");

  assert.match(fullCard, /height:\s*280px/);
  assert.match(fullCard, /grid-template-rows:\s*30px\s+1fr/);
  assert.match(fullMain, /grid-template-rows:\s*1fr\s+45px/);
  assert.match(compactCard, /height:\s*260px/);
  assert.match(compactCard, /grid-template-rows:\s*auto\s+1fr\s+auto/);
  assert.match(fullCopy, /grid-template-rows:/);
  assert.match(compactCopy, /grid-template-rows:/);
  assert.match(
    css,
    /\.portfolio-workflow \.portfolio-step-copy strong,[^}]*overflow:\s*hidden[^}]*-webkit-line-clamp:\s*3/s,
  );
});

test("editorial workflow compacts short-demo cards to content height on mobile", () => {
  assert.match(
    mobile800,
    /\.portfolio-workflow \.portfolio-compact-demo \.portfolio-compact-flow > li\s*\{[^}]*height:\s*auto[^}]*min-height:\s*0[^}]*grid-template-rows:\s*auto\s+auto\s+auto[^}]*row-gap:\s*10px/s,
  );
  assert.match(
    mobile800,
    /\.portfolio-workflow \.portfolio-compact-demo \.portfolio-compact-copy\s*\{[^}]*align-self:\s*start[^}]*grid-template-rows:\s*auto/s,
  );
});

test("editorial workflow restores the vertical card hierarchy on mobile", () => {
  const mobileCard = rule(".portfolio-workflow .portfolio-builder .portfolio-step");
  const mobileMain = rule(".portfolio-workflow .portfolio-builder .portfolio-step-main");

  assert.match(mobileCard, /grid-template-columns:\s*1fr\s+auto/);
  assert.match(mobileCard, /grid-template-rows:\s*30px\s+1fr/);
  assert.match(mobileMain, /grid-column:\s*1\s*\/\s*-1/);
  assert.match(mobileMain, /grid-row:\s*2/);
  assert.match(mobileMain, /grid-template-rows:\s*1fr\s+45px/);
});

test("editorial workflow shows the complete case screenshot without cropping", () => {
  const screen = rule(".portfolio-workflow .portfolio-proof-screen");
  const image = rule(".portfolio-workflow .portfolio-proof-screen img");

  assert.match(screen, /display:\s*grid/);
  assert.match(screen, /place-items:\s*center/);
  assert.match(image, /width:\s*100%/);
  assert.match(image, /max-width:\s*100%/);
  assert.match(image, /object-fit:\s*contain/);
});

test("editorial workflow footer uses a full-width shell with a constrained responsive inner container", () => {
  const footer = rule(".portfolio-footer");

  assert.match(footer, /width:\s*100%/);
  assert.match(footer, /border-top:\s*1px solid var\(--portfolio-line\)/);
  assert.match(
    css,
    /\.portfolio-footer-inner\s*\{[^}]*width:\s*min\(1280px,\s*calc\(100%\s*-\s*96px\)\)[^}]*display:\s*flex/s,
  );
  assert.match(
    mobile800,
    /\.portfolio-footer-inner\s*\{[^}]*width:\s*calc\(100%\s*-\s*28px\)/s,
  );
  assert.match(
    mobile800,
    /\.portfolio-footer-inner\s*\{[^}]*flex-direction:\s*column/s,
  );
});

test("shared contact links highlight on pointer hover and keyboard focus", () => {
  assert.equal([...portfolio.matchAll(/<section className="portfolio-contact/g)].length, 2);
  assert.equal([...liftCase.matchAll(/<section className="portfolio-contact/g)].length, 1);

  const links = rule(".portfolio-contact a");
  assert.match(links, /transition:\s*color 180ms ease/);
  assert.match(
    css,
    /\.portfolio-contact a:hover,[^{]*\.portfolio-contact a:focus-visible\s*\{[^}]*color:\s*var\(--portfolio-accent-2\)/s,
  );
});

test("standalone process builder uses the compact hero scale and starts controls without a duplicate heading", () => {
  const builder = rule(".portfolio-builder-product .portfolio-builder");

  assert.match(
    css,
    /\.portfolio-builder-product-hero h1\s*\{[^}]*font-size:\s*clamp\(58px,\s*6\.2vw,\s*96px\)/s,
  );
  assert.match(builder, /padding-top:\s*0/);
  assert.match(
    mobile800,
    /\.portfolio-builder-product-hero h1\s*\{[^}]*font-size:\s*clamp\(48px,\s*10vw,\s*58px\)/s,
  );
});

test("editorial workflow pages expose an accessible dark and light theme switch", () => {
  assert.match(themeProvider, /type PortfolioTheme = "dark" \| "light"/);
  assert.match(portfolio, /data-theme=\{theme\}/);
  assert.match(themeToggle, /aria-label=\{locale === "en" \? "Light theme" : "Светлая тема"\}/);
  assert.match(themeToggle, /aria-pressed=\{theme === "light"\}/);
  assert.doesNotMatch(themeToggle, /portfolio-theme-label/);
  assert.match(portfolio, /<ThemeToggle theme=\{theme\} onToggle=/);
});

test("editorial workflow shares one persistent theme across routes", () => {
  assert.match(rootLayout, /PortfolioThemeProvider/);
  assert.match(rootLayout, /<PortfolioThemeProvider>\s*\{children\}\s*<\/PortfolioThemeProvider>/s);
  assert.match(portfolio, /usePortfolioTheme\(\)/);
  assert.doesNotMatch(portfolio, /useState<PortfolioTheme>/);
  assert.match(themeProvider, /persistTheme\(window, next\)/);
  assert.match(themeProvider, /readStoredTheme\(window\)/);
  assert.doesNotMatch(themeProvider, /window\.localStorage/);
  assert.match(themeStorage, /const storage = owner\.localStorage/);
  assert.match(themeStorage, /storage\.setItem\(THEME_STORAGE_KEY, theme\)/);
  assert.match(themeStorage, /storage\.getItem\(THEME_STORAGE_KEY\)/);
  assert.match(themeStorage, /storage\.getItem\(LEGACY_THEME_STORAGE_KEY\)/);
  assert.match(themeStorage, /storage\.removeItem\(LEGACY_THEME_STORAGE_KEY\)/);
});

test("editorial workflow defaults to the system theme without a saved preference", () => {
  assert.match(themeProvider, /matchMedia\("\(prefers-color-scheme: light\)"\)\.matches/);
  assert.match(themeProvider, /readStoredTheme\(window\) \?\? readSystemTheme\(\)/);
});

test("lift case loads the same display and body fonts on a direct request", () => {
  assert.match(liftCaseLayout, /@fontsource-variable\/oswald/);
  assert.match(liftCaseLayout, /@fontsource-variable\/golos-text/);
  assert.match(englishLiftCaseLayout, /@fontsource-variable\/oswald/);
  assert.match(englishLiftCaseLayout, /@fontsource-variable\/golos-text/);
  assert.match(englishLiftCaseLayout, /portfolio\.css/);
});

test("theme switch and light preset states inherit the site type and remain readable", () => {
  assert.match(css, /\.portfolio-theme-toggle,[^{]*\.portfolio-language-switch\s*\{[^}]*width:\s*34px[^}]*height:\s*34px/s);
  assert.match(css, /\.portfolio-theme-toggle svg\s*\{[^}]*width:\s*16px[^}]*height:\s*16px/s);
  assert.match(themeToggle, /<svg/);
  assert.doesNotMatch(themeToggle, /☀|☾/);
  assert.match(
    css,
    /\.portfolio-workflow\[data-theme="light"\] \.portfolio-presets button:hover span,[^{]*\{[^}]*color:\s*#f9f7ef/s,
  );
});

test("process cards and primary calls to action ease hover movement smoothly", () => {
  const easing = /transition:[^;}]*transform 280ms cubic-bezier\(0\.22,\s*1,\s*0\.36,\s*1\)/;

  assert.match(css, new RegExp(`\\.portfolio-step\\s*\\{[^}]*${easing.source}`, "s"));
  assert.match(css, new RegExp(`\\.portfolio-button\\s*\\{[^}]*${easing.source}`, "s"));
});

test("lift case section headings use the same display scale as the portfolio sections", () => {
  assert.match(
    css,
    /\.lift-case-section h2,[^{]*\.lift-case-role h2,[^{]*\.lift-case-result h2\s*\{[^}]*font-size:\s*clamp\(48px,\s*6vw,\s*88px\)[^}]*line-height:\s*0\.95/s,
  );
  assert.match(
    mobile800,
    /\.lift-case-section h2,[^{]*\.lift-case-role h2,[^{]*\.lift-case-result h2\s*\{[^}]*font-size:\s*clamp\(40px,\s*12vw,\s*62px\)/s,
  );
});

test("lift case mobile hero stays inside the viewport", () => {
  assert.match(css, /\.lift-case-hero-grid > \*\s*\{[^}]*min-width:\s*0/s);
  assert.match(css, /\.lift-case-module-grid article\s*\{[^}]*min-width:\s*0/s);
  assert.match(css, /\.lift-case-module-grid h3\s*\{[^}]*overflow-wrap:\s*anywhere/s);
  assert.match(
    mobile800,
    /\.lift-case-hero-grid,[^{]*\.lift-case-result > div\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)/s,
  );
  assert.match(
    mobile430,
    /\.lift-case-hero h1\s*\{[^}]*font-size:\s*clamp\(38px,\s*10\.2vw,\s*46px\)[^}]*overflow-wrap:\s*anywhere/s,
  );
});

test("editorial workflow light theme changes palette properties only", () => {
  const result = lightThemeViolations(css);
  assert(result.ruleCount >= 2, "Missing light palette rules");
  assert.deepEqual(result.violations, []);
});

test("light-theme palette guard detects geometry variables and selector formatting variants", () => {
  const quoted = '.portfolio-workflow[ data-theme = "light" ] { --portfolio-gap: 0px; color: #fff; }';
  const unquoted = ".portfolio-workflow[data-theme=light] { --portfolio-gap: 0px; }";
  assert.deepEqual(lightThemeViolations(quoted), { ruleCount: 1, violations: ["--portfolio-gap"] });
  assert.deepEqual(lightThemeViolations(unquoted), { ruleCount: 1, violations: ["--portfolio-gap"] });
});

test("editorial workflow light palette keeps small text at WCAG AA contrast", () => {
  const lightRoot = rule('.portfolio-workflow[data-theme="light"]');
  assert.match(lightRoot, /--portfolio-muted:\s*#586b6f/);
  assert.match(lightRoot, /--portfolio-accent:\s*#b63c20/);
  assert.match(lightRoot, /--portfolio-accent-2:\s*#3f7429/);

  const technicalPre = rule('.portfolio-workflow[data-theme="light"] .portfolio-technical pre');
  assert.match(technicalPre, /color:\s*var\(--portfolio-ink\)/);
  assert.match(technicalPre, /background:\s*var\(--portfolio-surface\)/);

  const mutedOverrides = rule('.portfolio-workflow[data-theme="light"] .portfolio-findings > header span');
  assert.match(mutedOverrides, /color:\s*var\(--portfolio-muted\)/);
});
