import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

const css = await readFile(new URL("../app/concepts/concepts.css", import.meta.url), "utf8");
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
  const compactCard = rule(".concept-editorial-workflow .concept-compact-flow > li");
  const fullCopy = rule(".concept-editorial-workflow .concept-step-copy");
  const compactCopy = rule(".concept-editorial-workflow .concept-compact-copy");

  assert.match(fullCard, /height:\s*280px/);
  assert.match(fullCard, /grid-template-rows:\s*auto\s+1fr/);
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
  assert.match(mobileCard, /grid-template-rows:\s*auto\s+1fr/);
  assert.match(mobileMain, /grid-column:\s*1\s*\/\s*-1/);
  assert.match(mobileMain, /grid-row:\s*2/);
  assert.match(mobileMain, /grid-template-rows:\s*1fr\s+auto/);
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
