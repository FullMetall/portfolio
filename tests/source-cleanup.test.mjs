import assert from "node:assert/strict";
import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { test } from "node:test";

const root = path.resolve("app");
const productionExtensions = new Set([".css", ".js", ".mjs", ".ts", ".tsx"]);
const legacyThemeStorageKey = "fullmetall-concept-theme";

function hasClassToken(source, className) {
  const escaped = className.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(?:^|[^\\w-])${escaped}(?=$|[^\\w-])`).test(source);
}

async function collectProductionFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...await collectProductionFiles(entryPath));
    } else if (productionExtensions.has(path.extname(entry.name))) {
      files.push(entryPath);
    }
  }

  return files;
}

test("production source has no concept implementation or visual variants", async () => {
  await assert.rejects(stat(path.join(root, "concepts")), { code: "ENOENT" });

  const files = await collectProductionFiles(root);
  const forbidden = /\bConcept[A-Z]\w*|\bconcept(?:s)?(?:[-_/]|\b)|editorial-product|workflow-motif|product-studio|\bVariant\s+4\b|preview portfolio|EditorialCaseCopy/;
  const violations = [];
  let legacyKeyOccurrences = 0;

  for (const file of files) {
    const source = await readFile(file, "utf8");
    const relativePath = path.relative(process.cwd(), file).replaceAll("\\", "/");
    const fileLegacyKeyOccurrences = source.split(legacyThemeStorageKey).length - 1;
    legacyKeyOccurrences += fileLegacyKeyOccurrences;
    if (fileLegacyKeyOccurrences > 0 && (relativePath !== "app/_lib/theme-storage.mjs" || fileLegacyKeyOccurrences !== 1)) {
      violations.push(relativePath);
      continue;
    }
    if (forbidden.test(source.replaceAll(legacyThemeStorageKey, ""))) {
      violations.push(path.relative(process.cwd(), file));
    }
  }

  if (legacyKeyOccurrences !== 1) violations.push(`legacy-theme-key-count:${legacyKeyOccurrences}`);

  assert.deepEqual(violations, [], `Concept remnants found in production source: ${violations.join(", ")}`);
});

test("portfolio stylesheet has no visual selectors without production call sites", async () => {
  const files = await collectProductionFiles(root);
  const sourceFiles = files.filter((file) => path.extname(file) !== ".css");
  const productionSource = (await Promise.all(sourceFiles.map((file) => readFile(file, "utf8")))).join("\n");
  const stylesheet = await readFile(path.join(root, "portfolio.css"), "utf8");
  const classNames = [...stylesheet.matchAll(/\.([A-Za-z_][\w-]*)/g)].map((match) => match[1]);
  const unused = [...new Set(classNames)]
    .filter((className) => className === "portfolio" || className.startsWith("portfolio-") || className.startsWith("lift-"))
    .filter((className) => !hasClassToken(productionSource, className))
    .sort();

  assert.deepEqual(unused, [], `Unused production visual selectors: ${unused.join(", ")}`);
});

test("visual selector call-site matching rejects prefix collisions", () => {
  assert.equal(hasClassToken('className="portfolio-step-copy"', "portfolio-step"), false);
  assert.equal(hasClassToken('className="portfolio-step"', "portfolio-step"), true);
});

test("production StepCard has no removed alternate rendering path", async () => {
  const source = await readFile(path.join(root, "_components", "PortfolioExperience.tsx"), "utf8");

  assert.doesNotMatch(source, /\bdetailed\b/, "StepCard still exposes the removed detailed variant switch");
});

test("production copy has no fields left from the removed full-builder heading", async () => {
  const source = await readFile(path.join(root, "_components", "portfolio-copy.ts"), "utf8");
  const removedFields = [
    ["rail.constructor", /\brail\s*:\s*\{[^}]*\bconstructor\s*:/g],
    ["builder.kicker", /\bbuilder\s*:\s*\{\s*kicker\s*:/g],
    ["builder.title", /\bbuilder\s*:\s*\{\s*(?:kicker\s*:[^,]+,\s*)?title\s*:/g],
    ["builder.lead", /\bbuilder\s*:\s*\{\s*(?:(?:kicker|title)\s*:[^,]+,\s*)*lead\s*:/g],
  ];
  const remnants = removedFields.filter(([, pattern]) => pattern.test(source)).map(([field]) => field);

  assert.deepEqual(remnants, [], `Unused production copy remains: ${remnants.join(", ")}`);
});

test("portfolio stylesheet has no keyframes without animation call sites", async () => {
  const stylesheet = await readFile(path.join(root, "portfolio.css"), "utf8");
  const keyframes = [...stylesheet.matchAll(/@keyframes\s+([\w-]+)/g)].map((match) => match[1]);
  const animationValues = [...stylesheet.matchAll(/animation(?:-name)?\s*:\s*([^;]+)/g)].map((match) => match[1]);
  const unused = keyframes.filter((name) => !animationValues.some((value) => new RegExp(`\\b${name}\\b`).test(value)));

  assert.deepEqual(unused, [], `Unused keyframes: ${unused.join(", ")}`);
});
