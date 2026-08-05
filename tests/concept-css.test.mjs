import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

const css = await readFile(new URL("../app/concepts/concepts.css", import.meta.url), "utf8");
const prototype = await readFile(new URL("../app/concepts/_components/ConceptPrototype.tsx", import.meta.url), "utf8");
const mobile800Start = css.indexOf("@media (max-width: 800px)");
const mobile430Start = css.indexOf("@media (max-width: 430px)");
assert(mobile800Start >= 0 && mobile430Start > mobile800Start, "Missing mobile CSS ranges");
const mobile800 = css.slice(mobile800Start, mobile430Start);

function rule(selector) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const matches = [...css.matchAll(new RegExp(`${escaped}\\s*\\{([^}]+)\\}`, "g"))];
  assert(matches.length > 0, `Missing CSS rule: ${selector}`);
  return matches.at(-1)[1];
}

test("editorial workflow keeps the opening screen compact and aligns rail markers across breakpoints", () => {
  assert.match(
    css,
    /\.concept-editorial-workflow \.concept-hero h1\s*\{[^}]*font-size:\s*clamp\([^,]+,[^,]+,\s*96px\)/s,
  );
  assert.match(
    css,
    /\.concept-editorial-workflow \.concept-hero-copy > \.concept-rail-marker\s*\{[^}]*top:\s*-12px/s,
  );
  assert.match(
    mobile800,
    /\.concept-editorial-workflow \.concept-hero h1\s*\{[^}]*font-size:\s*clamp\(48px,\s*10vw,\s*58px\)/s,
  );
  assert.match(
    mobile800,
    /\.concept-editorial-workflow \.concept-hero-copy > \.concept-rail-marker\s*\{[^}]*top:\s*-10px/s,
  );
  assert.match(
    mobile800,
    /\.concept-editorial-workflow \.concept-hero-copy > \.concept-rail-marker strong\s*\{[^}]*display:\s*none/s,
  );
});

test("editorial workflow segmented control has readable active text", () => {
  const active = rule(".concept-editorial-workflow .concept-segmented button.is-active");
  assert.match(active, /color:\s*#101b22/);
  assert.match(active, /background:\s*var\(--concept-accent-2\)/);
});

test("editorial workflow process cards use stable equal-height content rows", () => {
  const fullCard = rule(".concept-editorial-workflow .concept-step");
  const fullMain = rule(".concept-editorial-workflow .concept-step-main");
  const compactCard = rule(".concept-editorial-workflow .concept-compact-flow > li");
  const fullCopy = rule(".concept-editorial-workflow .concept-step-copy");
  const compactCopy = rule(".concept-editorial-workflow .concept-compact-copy");

  assert.match(fullCard, /height:\s*280px/);
  assert.match(fullCard, /grid-template-rows:\s*30px\s+1fr/);
  assert.match(fullMain, /grid-template-rows:\s*1fr\s+45px/);
  assert.match(compactCard, /height:\s*260px/);
  assert.match(compactCard, /grid-template-rows:\s*auto\s+1fr\s+auto/);
  assert.match(fullCopy, /grid-template-rows:/);
  assert.match(compactCopy, /grid-template-rows:/);
  assert.match(
    css,
    /\.concept-editorial-workflow \.concept-step-copy strong,[^}]*overflow:\s*hidden[^}]*-webkit-line-clamp:\s*3/s,
  );
});

test("editorial workflow restores the vertical card hierarchy on mobile", () => {
  const mobileCard = rule(".concept-editorial-workflow .concept-builder .concept-step");
  const mobileMain = rule(".concept-editorial-workflow .concept-builder .concept-step-main");

  assert.match(mobileCard, /grid-template-columns:\s*1fr\s+auto/);
  assert.match(mobileCard, /grid-template-rows:\s*30px\s+1fr/);
  assert.match(mobileMain, /grid-column:\s*1\s*\/\s*-1/);
  assert.match(mobileMain, /grid-row:\s*2/);
  assert.match(mobileMain, /grid-template-rows:\s*1fr\s+45px/);
});

test("editorial workflow shows the complete case screenshot without cropping", () => {
  const screen = rule(".concept-editorial-workflow .concept-proof-screen");
  const image = rule(".concept-editorial-workflow .concept-proof-screen img");

  assert.match(screen, /display:\s*grid/);
  assert.match(screen, /place-items:\s*center/);
  assert.match(image, /width:\s*100%/);
  assert.match(image, /max-width:\s*100%/);
  assert.match(image, /object-fit:\s*contain/);
});

test("editorial workflow footer uses a full-width shell with a constrained responsive inner container", () => {
  const footer = rule(".concept-footer");

  assert.match(footer, /width:\s*100%/);
  assert.match(footer, /border-top:\s*1px solid var\(--concept-line\)/);
  assert.match(
    css,
    /\.concept-footer-inner\s*\{[^}]*width:\s*min\(1280px,\s*calc\(100%\s*-\s*96px\)\)[^}]*display:\s*flex/s,
  );
  assert.match(
    mobile800,
    /\.concept-footer-inner\s*\{[^}]*width:\s*calc\(100%\s*-\s*28px\)/s,
  );
  assert.match(
    mobile800,
    /\.concept-footer-inner\s*\{[^}]*flex-direction:\s*column/s,
  );
});

test("standalone process builder uses the compact hero scale and starts controls without a duplicate heading", () => {
  const builder = rule(".concept-builder-product .concept-builder");

  assert.match(
    css,
    /\.concept-builder-product-hero h1\s*\{[^}]*font-size:\s*clamp\(58px,\s*6\.2vw,\s*96px\)/s,
  );
  assert.match(builder, /padding-top:\s*0/);
  assert.match(
    mobile800,
    /\.concept-builder-product-hero h1\s*\{[^}]*font-size:\s*clamp\(48px,\s*10vw,\s*58px\)/s,
  );
});

test("editorial workflow pages expose an accessible dark and light theme switch", () => {
  assert.match(prototype, /type ConceptTheme = "dark" \| "light"/);
  assert.match(prototype, /data-theme=\{theme\}/);
  assert.match(prototype, /aria-label="Светлая тема"/);
  assert.match(prototype, /aria-pressed=\{theme === "light"\}/);
  assert.match(prototype, /<ThemeToggle theme=\{theme\} onToggle=/);
});

test("editorial workflow light theme changes palette properties only", () => {
  const rules = [...css.matchAll(/\.concept-editorial-workflow\[data-theme="light"\][^{]*\{([^}]+)\}/g)];
  assert(rules.length >= 2, "Missing light palette rules");

  const paletteProperties = /^(--concept-[\w-]+|color|background|border-color|box-shadow|outline-color|fill|stroke)$/;
  for (const [, body] of rules) {
    const properties = body
      .split(";")
      .map((declaration) => declaration.trim().split(":", 1)[0])
      .filter(Boolean);
    assert(properties.every((property) => paletteProperties.test(property)), `Non-palette light theme property: ${properties.join(", ")}`);
  }
});

test("editorial workflow light palette keeps small text at WCAG AA contrast", () => {
  const lightRoot = rule('.concept-editorial-workflow[data-theme="light"]');
  assert.match(lightRoot, /--concept-muted:\s*#586b6f/);
  assert.match(lightRoot, /--concept-accent:\s*#b63c20/);
  assert.match(lightRoot, /--concept-accent-2:\s*#3f7429/);

  const technicalPre = rule('.concept-editorial-workflow[data-theme="light"] .concept-technical pre');
  assert.match(technicalPre, /color:\s*var\(--concept-ink\)/);
  assert.match(technicalPre, /background:\s*var\(--concept-surface\)/);

  const mutedOverrides = rule('.concept-editorial-workflow[data-theme="light"] .concept-findings > header span');
  assert.match(mutedOverrides, /color:\s*var\(--concept-muted\)/);
});
