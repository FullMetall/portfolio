import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

const css = await readFile(new URL("../app/portfolio.css", import.meta.url), "utf8");
const portfolio = await readFile(new URL("../app/_components/PortfolioExperience.tsx", import.meta.url), "utf8");
const portfolioCopy = await readFile(new URL("../app/_components/portfolio-copy.ts", import.meta.url), "utf8");
const casePageCopy = await readFile(new URL("../app/_components/CasePage.tsx", import.meta.url), "utf8");
const liftCase = await readFile(new URL("../app/_components/LiftAutomationCase.tsx", import.meta.url), "utf8");
const portfolioContact = await readFile(new URL("../app/_components/PortfolioContact.tsx", import.meta.url), "utf8");
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
    /\.portfolio-workflow \.portfolio-hero h1\s*\{[^}]*font-size:\s*var\(--portfolio-heading-hero\)[^}]*line-height:\s*0\.98/s,
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
    /\.portfolio-workflow \.portfolio-rail-marker strong\s*\{[^}]*display:\s*none/s,
  );
});

test("portfolio story ends the process rail after marker 03 without overlay artifacts", () => {
  assert.equal([...portfolio.matchAll(/<RailMarker/g)].length, 3);
  assert.doesNotMatch(portfolio, /portfolio-hero-transition/);
  assert.doesNotMatch(portfolio, /portfolio-rail-endpoint/);
  assert.match(portfolio, /className="portfolio-compact-flow-shell"/);
  assert.doesNotMatch(portfolio, /portfolio-compact-endpoint/);
  assert.match(css, /\.portfolio-rail-marker span\s*\{[^}]*border-radius:\s*0/s);
  assert.doesNotMatch(css, /\.portfolio-rail-endpoint\s*\{/);
  assert.match(css, /\.portfolio-workflow \.portfolio-proof::after\s*\{[^}]*top:\s*calc\(var\(--rail-section-start\) \+ var\(--rail-stop-offset\)\)[^}]*bottom:\s*0/s);
  assert.doesNotMatch(css, /\.portfolio-compact-endpoint\s*\{/);
});

test("compact comparison uses controlled heading lines and descriptive counts", () => {
  assert.match(portfolio, /portfolio-heading-line/);
  assert.match(portfolio, /t\.compact\.problems\(bottlenecks\.length\)/);
  assert.match(portfolio, /t\.compact\.hypotheses\(/);
  assert.match(portfolioCopy, /problems:\s*\(count: number\) => formatRuCount\(count, \["проблема", "проблемы", "проблем"\]\)/);
  assert.match(portfolioCopy, /hypotheses:\s*\(count: number\) => formatRuCount\(count, \["гипотеза", "гипотезы", "гипотез"\]\)/);
});

test("builder comparison counts retain semantic labels", () => {
  assert.match(portfolio, /t\.builder\.problems\(bottlenecks\.length\)/);
  assert.match(portfolio, /t\.builder\.proposals\(remediations\.length\)/);
  assert.match(portfolioCopy, /problems:\s*\(count: number\) => formatRuCount/);
  assert.match(portfolioCopy, /proposals:\s*\(count: number\) => formatRuCount/);
});

test("proof card uses a paired primary and secondary action group", () => {
  assert.match(portfolio, /className="portfolio-proof-actions"/);
  assert.match(portfolio, /t\.proof\.discuss/);
  assert.match(portfolioCopy, /proof:[\s\S]*?discuss:\s*"Обсудить похожий процесс →"/);
  assert.match(css, /\.portfolio-proof-actions\s*\{[^}]*display:\s*flex/);
});

test("all editorial routes use the balanced density spacing contract", () => {
  assert.match(css, /--portfolio-space-section:\s*clamp\(56px,\s*6\.5vw,\s*96px\)/);
  assert.match(css, /--portfolio-space-section-compact:\s*clamp\(42px,\s*5vw,\s*72px\)/);
  assert.match(css, /--portfolio-space-section-large:\s*clamp\(50px,\s*7\.5vw,\s*108px\)/);
  assert.match(css, /\.portfolio-builder\s*\{[^}]*padding:\s*var\(--portfolio-space-section-compact\) 0/);
  assert.match(css, /\.portfolio-proof\s*\{[^}]*padding:\s*var\(--portfolio-space-section-compact\) 0/);
  assert.match(css, /\.portfolio-selected-work\s*\{[^}]*padding:\s*var\(--portfolio-space-section\) 0/);
  assert.match(css, /\.portfolio-contact\s*\{[^}]*padding:\s*var\(--portfolio-space-section-large\) 0/);
  assert.match(css, /\.lift-case-section\s*\{[^}]*padding:\s*var\(--portfolio-space-section\) 0/);
  assert.match(css, /\.lift-case-result\s*\{[^}]*padding:\s*var\(--portfolio-space-section\) 0/);
  assert.match(css, /\.portfolio-privacy-content\s*\{[^}]*padding:\s*var\(--portfolio-space-section\) 0 72px/);
  assert.match(css, /\.portfolio-builder-product-hero\s*\{[^}]*padding:\s*var\(--portfolio-space-section\) 0 44px/);
});

test("balanced density reduces major internal section gaps without shrinking controls", () => {
  assert.match(css, /\.portfolio-selected-work > header\s*\{[^}]*margin-bottom:\s*36px/);
  assert.match(css, /\.portfolio-experience-grid article\s*\{[^}]*padding:\s*clamp\(22px,\s*2\.7vw,\s*36px\)/);
  assert.match(css, /\.portfolio-selected-work-grid article\s*\{[^}]*padding:\s*clamp\(25px,\s*3vw,\s*39px\)/);
  assert.match(css, /\.lift-case-section-head\s*\{[^}]*margin-bottom:\s*38px/);
  assert.match(css, /\.portfolio-proof-copy\s*\{[^}]*padding:\s*clamp\(25px,\s*3\.5vw,\s*50px\)/);
});

test("display headings do not contain full stops", () => {
  assert.doesNotMatch(
    casePageCopy,
    /(?:title|contextTitle|systemTitle|galleryTitle|roleTitle|resultTitle):\s*"[^"]*\.[^"]*"/,
  );
  assert.doesNotMatch(portfolioCopy, /title:\s*\[[^\]]*\.[^\]]*\]/);
});

test("portfolio content text is readable and repeated cards use compact semantic zones", () => {
  assert.match(rule(".portfolio-workflow .portfolio-step-description"), /font-size:\s*13px/);
  assert.match(css, /\.portfolio-experience-grid\s*\{[^}]*grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\)/s);
  assert.match(css, /\.portfolio-experience-grid article\s*\{[^}]*grid-template-rows:\s*auto\s+auto\s+24px\s+auto[^}]*align-content:\s*start/s);
  assert.doesNotMatch(rule(".portfolio-experience-grid p"), /margin:\s*auto/);
  assert.match(rule(".portfolio-experience-grid p"), /font-size:\s*14px/);
  assert.match(css, /\.portfolio-selected-work-grid article\s*\{[^}]*grid-template-rows:\s*auto\s+auto\s+auto\s+auto[^}]*align-content:\s*start/s);
  assert.match(rule(".portfolio-selected-work-grid p"), /font-size:\s*14px/);
});

test("portfolio and lift case share one contact component and geometry contract", () => {
  assert.match(portfolio, /import \{ PortfolioContact \} from "\.\/PortfolioContact"/);
  assert.match(liftCase, /import \{ PortfolioContact \} from "\.\/PortfolioContact"/);
  assert.equal([...portfolio.matchAll(/<PortfolioContact/g)].length, 2);
  assert.equal([...liftCase.matchAll(/<PortfolioContact/g)].length, 1);
  assert.doesNotMatch(portfolio, /<section className="portfolio-contact/);
  assert.doesNotMatch(liftCase, /<section className="portfolio-contact/);
  assert.match(css, /\.portfolio-contact\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1\.15fr\)\s+minmax\(280px,\s*0\.85fr\)[^}]*align-items:\s*end/s);
});

test("editorial headings use a restrained shared scale without compressed line boxes", () => {
  const workflow = rule(".portfolio-workflow");
  assert.match(workflow, /--portfolio-heading-hero:\s*clamp\(56px,\s*5\.7vw,\s*88px\)/);
  assert.match(workflow, /--portfolio-heading-section:\s*clamp\(44px,\s*4\.6vw,\s*68px\)/);
  assert.match(workflow, /--portfolio-heading-card:\s*clamp\(28px,\s*2\.5vw,\s*42px\)/);
  assert.match(css, /\.portfolio-workflow \.portfolio-hero h1\s*\{[^}]*font-size:\s*var\(--portfolio-heading-hero\)[^}]*line-height:\s*0\.98/s);
  assert.match(css, /\.portfolio-experience h2,[^{]*\.portfolio-selected-work h2\s*\{[^}]*font-size:\s*var\(--portfolio-heading-section\)[^}]*line-height:\s*1\.02/s);
  assert.match(css, /\.lift-case-section h2,[^{]*\.lift-case-role h2,[^{]*\.lift-case-result h2\s*\{[^}]*font-size:\s*var\(--portfolio-heading-section\)[^}]*line-height:\s*1\.02/s);
});

test("small-work counters use a theme-safe outline instead of disappearing in light mode", () => {
  assert.match(
    css,
    /\.portfolio-selected-work-grid article > span\s*\{[^}]*color:\s*transparent[^}]*-webkit-text-stroke:\s*1px\s+color-mix\(in srgb,\s*var\(--portfolio-ink\)\s*22%,\s*transparent\)/s,
  );
  assert.match(
    mobile800,
    /\.portfolio-selected-work-grid article > span\s*\{[^}]*font-size:\s*76px/s,
  );
  assert.match(
    mobile800,
    /\.portfolio-selected-work-grid h3\s*\{[^}]*margin-top:\s*32px/s,
  );
});

test("full builder removes duplicated findings and keeps the unique guidance", () => {
  assert.doesNotMatch(portfolio, /portfolio-findings/);
  assert.match(portfolio, /portfolio-builder-notice/);
  assert.match(portfolio, /portfolio-builder-consultation/);
  assert.match(css, /\.portfolio-workspace-grid\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)/s);
  assert.match(css, /\.portfolio-builder-guidance\s*\{[^}]*background:\s*#071014[^}]*color:\s*#fff/s);
  assert.match(portfolio, /portfolio-builder-guidance is-single/);
  assert.match(css, /\.portfolio-builder-guidance\.is-single\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)/s);
});

test("process issue indicators expose an accessible square popover", () => {
  assert.match(portfolio, /portfolio-step-issues/);
  assert.match(portfolio, /openIssuePopover/);
  assert.doesNotMatch(portfolio, /const \[issuesOpen, setIssuesOpen\]/);
  assert.match(portfolio, /aria-expanded=\{issuesOpen\}/);
  assert.match(portfolio, /aria-controls=\{issuesId\}/);
  assert.match(portfolio, /aria-describedby=\{issuesOpen \? issuesId : undefined\}/);
  assert.match(portfolio, /role="region"/);
  assert.doesNotMatch(portfolio, /role="tooltip"/);
  assert.match(portfolio, /event\.key === "Escape"/);
  assert.match(css, /\.portfolio-step-alert\s*\{[^}]*border-radius:\s*0/s);
});

test("builder proposal labels and move controls match the horizontal flow", () => {
  assert.match(portfolio, /portfolio-step-proposal/);
  assert.match(portfolio, /portfolio-move-arrow/);
  assert.match(portfolio, /data-direction=/);
  assert.doesNotMatch(portfolio, />\s*[↑↓←→]\s*</);
  assert.match(mobile800, /\.portfolio-move-arrow\s*\{[^}]*transform:\s*rotate\(90deg\)/s);
});

test("builder presets keep title and description close together", () => {
  assert.match(css, /\.portfolio-presets button\s*\{[^}]*min-height:\s*92px[^}]*align-content:\s*start[^}]*gap:\s*6px/s);
});

test("editorial workflow segmented control has readable active text", () => {
  const active = rule(".portfolio-workflow .portfolio-segmented button.is-active");
  assert.match(active, /color:\s*#101b22/);
  assert.match(active, /background:\s*var\(--portfolio-accent-2\)/);
});

test("light workflow keeps rail numbers and inactive segmented counts readable", () => {
  assert.match(
    css,
    /\.portfolio-workflow\[data-theme="light"\] \.portfolio-rail-marker span\s*\{[^}]*color:\s*var\(--portfolio-accent-2\)/s,
  );
  assert.match(
    css,
    /\.portfolio-workflow\[data-theme="light"\] \.portfolio-segmented button:not\(\.is-active\) span\s*\{[^}]*color:\s*var\(--portfolio-ink\)/s,
  );
});

test("editorial workflow process cards use stable equal-height content rows", () => {
  const fullCard = rule(".portfolio-workflow .portfolio-step");
  const fullMain = rule(".portfolio-workflow .portfolio-step-main");
  const compactCard = rule(".portfolio-workflow .portfolio-compact-flow > li");
  const fullCopy = rule(".portfolio-workflow .portfolio-step-copy");
  const compactCopy = rule(".portfolio-workflow .portfolio-compact-copy");

  assert.match(fullCard, /height:\s*300px/);
  assert.match(fullCard, /grid-template-rows:\s*30px\s+1fr/);
  assert.match(fullMain, /grid-template-rows:\s*1fr\s+45px/);
  assert.match(compactCard, /height:\s*260px/);
  assert.match(compactCard, /grid-template-rows:\s*auto\s+1fr\s+auto/);
  assert.match(fullCopy, /grid-template-rows:\s*20px\s+54px\s+80px/);
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
  assert.match(portfolioContact, /<section className=\{\["portfolio-contact", className\]/);
  assert.match(portfolioContact, /portfolio-contact-links/);

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
    /\.portfolio-builder-product-hero h1\s*\{[^}]*font-size:\s*var\(--portfolio-heading-hero\)[^}]*line-height:\s*0\.98/s,
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
    /\.lift-case-section h2,[^{]*\.lift-case-role h2,[^{]*\.lift-case-result h2\s*\{[^}]*font-size:\s*var\(--portfolio-heading-section\)[^}]*line-height:\s*1\.02/s,
  );
  assert.match(
    mobile800,
    /\.lift-case-section h2,[^{]*\.lift-case-role h2,[^{]*\.lift-case-result h2\s*\{[^}]*font-size:\s*clamp\(38px,\s*8vw,\s*52px\)/s,
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

test("privacy page uses one heading scale across the title and sections", () => {
  assert.match(
    css,
    /\.portfolio-privacy\s*\{[^}]*--portfolio-privacy-heading-size:\s*clamp\(28px,\s*3vw,\s*42px\)/s,
  );
  assert.match(
    css,
    /\.portfolio-privacy-content h1\s*\{[^}]*font-size:\s*var\(--portfolio-privacy-heading-size\)[^}]*line-height:\s*1\.02/s,
  );
  assert.match(
    css,
    /\.portfolio-privacy-sections h2\s*\{[^}]*font-size:\s*var\(--portfolio-privacy-heading-size\)/s,
  );
  assert.match(
    mobile800,
    /\.portfolio-privacy-content h1\s*\{[^}]*overflow-wrap:\s*anywhere/s,
  );
  assert.doesNotMatch(
    mobile800,
    /\.portfolio-privacy-content h1\s*\{[^}]*font-size:/s,
  );
});

test("privacy actions expose matching pointer and keyboard feedback", () => {
  assert.match(
    css,
    /\.portfolio-privacy-actions \.portfolio-footer-action,[^{]*\.portfolio-privacy-actions a\s*\{[^}]*transition:[^}]*transform/s,
  );
  assert.match(
    css,
    /\.portfolio-privacy-actions \.portfolio-footer-action:hover,[^{]*\.portfolio-privacy-actions \.portfolio-footer-action:focus-visible\s*\{[^}]*filter:\s*brightness\(0\.88\)[^}]*transform:\s*translateY\(-2px\)/s,
  );
  assert.match(
    css,
    /\.portfolio-privacy-actions a:hover,[^{]*\.portfolio-privacy-actions a:focus-visible\s*\{[^}]*border-color:\s*var\(--portfolio-ink\)[^}]*color:\s*var\(--portfolio-bg\)[^}]*background:\s*var\(--portfolio-ink\)[^}]*transform:\s*translateY\(-2px\)/s,
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

  assert.match(
    css,
    /\.portfolio-workflow\[data-theme="light"\] \.portfolio-builder-notice p,[^}]*color:\s*var\(--portfolio-muted\)/s,
  );

  assert.match(
    css,
    /\.portfolio-workflow\[data-theme="light"\] \.portfolio-privacy-actions \.portfolio-footer-action\s*\{[^}]*color:\s*#f9f7ef/s,
  );
});
