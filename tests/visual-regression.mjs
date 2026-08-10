import { chromium } from "playwright";
import { createReadStream } from "node:fs";
import { mkdir, stat, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

let baseURL = process.env.VISUAL_BASE_URL;
let staticServer;
const outputDir = new URL("../.artifacts/visual-regression/", import.meta.url);
await mkdir(outputDir, { recursive: true });

const exportRoot = path.resolve(fileURLToPath(new URL("../out/", import.meta.url)));
const contentTypes = new Map([
  [".css", "text/css"],
  [".html", "text/html; charset=utf-8"],
  [".js", "application/javascript"],
  [".png", "image/png"],
  [".svg", "image/svg+xml"],
  [".woff", "font/woff"],
  [".woff2", "font/woff2"],
]);

async function resolveExportedFile(urlPath) {
  const decodedPath = decodeURIComponent(urlPath.split("?")[0]);
  const relativePath = decodedPath.replace(/^\/+/, "");
  const fileName = path.posix.basename(relativePath);
  const payloadParts = fileName.endsWith(".txt")
    ? fileName.slice(0, -4).split(".")
    : [];
  const payloadPath = payloadParts[0] === "__next" && payloadParts.length > 2
    ? `${path.posix.join(
        path.posix.dirname(relativePath),
        `${payloadParts[0]}.${payloadParts[1]}`,
        ...payloadParts.slice(2),
      )}.txt`
    : null;
  const candidates = path.extname(relativePath)
    ? [relativePath]
    : [relativePath, `${relativePath}.html`, path.join(relativePath, "index.html")];
  if (payloadPath) candidates.unshift(payloadPath);
  if (decodedPath === "/") candidates.unshift("index.html");

  for (const candidate of candidates) {
    const filePath = path.resolve(exportRoot, candidate);
    if (!filePath.startsWith(`${exportRoot}${path.sep}`)) continue;
    try {
      if ((await stat(filePath)).isFile()) return filePath;
    } catch {
      // Try the next static-export filename convention.
    }
  }
  return null;
}

let browser;

try {
if (!baseURL) {
  staticServer = createServer((request, response) => {
    void resolveExportedFile(request.url ?? "/")
      .then((filePath) => {
        if (!filePath) {
          response.writeHead(404).end("Not found");
          return;
        }
        response.setHeader(
          "content-type",
          contentTypes.get(path.extname(filePath)) ?? "application/octet-stream",
        );
        createReadStream(filePath).pipe(response);
      })
      .catch(() => response.writeHead(500).end("Static server error"));
  });
  await new Promise((resolve, reject) => {
    staticServer.once("error", reject);
    staticServer.listen(0, "127.0.0.1", resolve);
  });
  const address = staticServer.address();
  if (!address || typeof address === "string") throw new Error("Static server did not expose a TCP port");
  baseURL = `http://127.0.0.1:${address.port}`;
}

const viewports = {
  "390": { width: 390, height: 844 },
  "799": { width: 799, height: 900 },
  "800": { width: 800, height: 900 },
  "801": { width: 801, height: 900 },
  "1280": { width: 1280, height: 900 },
  "1440": { width: 1440, height: 900 },
};
const themes = ["dark", "light"];
const routes = [
  "/",
  "/en",
  "/process-builder",
  "/en/process-builder",
  "/projects/lift-automation",
  "/en/projects/lift-automation",
  "/privacy",
  "/en/privacy",
];
const screenshotRoutes = new Set(["/", "/process-builder", "/projects/lift-automation"]);
const report = { matrix: [], builder: {}, interactions: {}, failures: [] };

const rects = async (page, selector) => page.locator(selector).evaluateAll((nodes) =>
  nodes.map((node) => {
    const rect = node.getBoundingClientRect();
    return {
      x: rect.x + scrollX,
      y: rect.y + scrollY,
      width: rect.width,
      height: rect.height,
      scrollHeight: node.scrollHeight,
    };
  }),
);

const sizeDelta = (before, after) => Math.max(0, ...before.flatMap((rect, index) => {
  const next = after[index] ?? {};
  return ["width", "height"].map((key) => Math.abs((rect[key] ?? 0) - (next[key] ?? 0)));
}));

async function dismissConsent(page) {
  const deny = page.getByRole("button", { name: /Не разрешать|Decline|Do not allow/i });
  if (await deny.count()) await deny.first().click();
}

async function collectState(page) {
  await page.evaluate(() => document.fonts.ready);
  return page.evaluate(() => {
    const root = document.documentElement;
    const main = document.querySelector("main.portfolio");
    const number = (value) => Number.parseFloat(value || "0");
    const box = (node) => {
      if (!node) return null;
      const rect = node.getBoundingClientRect();
      return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
    };
    const rgb = (value) => (value.match(/[\d.]+/g) ?? []).slice(0, 3).map(Number);
    const luminance = (value) => {
      const channels = rgb(value).map((channel) => {
        const normalized = channel / 255;
        return normalized <= 0.04045 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
      });
      return 0.2126 * (channels[0] ?? 0) + 0.7152 * (channels[1] ?? 0) + 0.0722 * (channels[2] ?? 0);
    };
    const contrast = (foreground, background) => {
      const lighter = Math.max(luminance(foreground), luminance(background));
      const darker = Math.min(luminance(foreground), luminance(background));
      return (lighter + 0.05) / (darker + 0.05);
    };
    const outOfBounds = [...document.querySelectorAll("body *")].filter((node) => {
      const style = getComputedStyle(node);
      if (
        style.position === "fixed" ||
        style.display === "none" ||
        style.visibility === "hidden" ||
        node.closest(".portfolio-presets") ||
        node.closest(".portfolio-editor-backdrop")
      ) return false;
      const rect = node.getBoundingClientRect();
      return rect.width > 0 && (rect.right > innerWidth + 1 || rect.left < -1);
    }).slice(0, 12).map((node) => ({
      tag: node.tagName,
      className: String(node.className),
      rect: box(node),
    }));

    const headings = [...document.querySelectorAll("h1, h2, h3")].map((node) => {
      const style = getComputedStyle(node);
      const rect = node.getBoundingClientRect();
      const fontSize = number(style.fontSize);
      const lineHeight = number(style.lineHeight);
      return {
        tag: node.tagName,
        text: node.textContent?.trim().slice(0, 90),
        fontSize,
        lineHeight,
        ratio: fontSize ? lineHeight / fontSize : 1,
        height: rect.height,
      };
    });

    const contacts = [...document.querySelectorAll(".portfolio-contact")].map((node) => {
      const copy = node.querySelector(".portfolio-contact-copy");
      const links = node.querySelector(".portfolio-contact-links");
      const heading = node.querySelector("h2");
      return {
        rect: box(node),
        directChildren: node.children.length,
        copy: box(copy),
        heading: box(heading),
        links: box(links),
      };
    });

    const experience = [...document.querySelectorAll(".portfolio-experience-grid article")].map((node) => {
      const rect = node.getBoundingClientRect();
      const body = node.querySelector("p")?.getBoundingClientRect();
      return {
        height: rect.height,
        bodyTop: body ? body.top - rect.top : null,
      };
    });

    const smallWork = [...document.querySelectorAll(".portfolio-selected-work-grid article")].map((node) => {
      const marker = node.querySelector(":scope > span");
      const title = node.querySelector("h3");
      const style = marker ? getComputedStyle(marker) : null;
      const markerRect = marker?.getBoundingClientRect();
      const titleRect = title?.getBoundingClientRect();
      return {
        rect: box(node),
        marker: box(marker),
        title: box(title),
        strokeWidth: style ? number(style.webkitTextStrokeWidth) : 0,
        color: style?.color ?? null,
        markerTitleOverlap: Boolean(
          markerRect && titleRect &&
          markerRect.left < titleRect.right && markerRect.right > titleRect.left &&
          markerRect.top < titleRect.bottom && markerRect.bottom > titleRect.top
        ),
      };
    });

    const railMarkers = [...document.querySelectorAll(".portfolio-rail-marker span")].map((node) => {
      const style = getComputedStyle(node);
      const markerRect = node.getBoundingClientRect();
      const markerLabel = node.closest(".portfolio-rail-marker")?.querySelector("strong");
      const markerLabelRect = markerLabel?.getBoundingClientRect();
      const section = node.closest("section");
      const kickerRect = section?.querySelector(".portfolio-kicker")?.getBoundingClientRect();
      return {
        text: node.textContent?.trim() ?? "",
        color: style.color,
        background: style.backgroundColor,
        contrast: contrast(style.color, style.backgroundColor),
        section: section?.id ?? null,
        kickerCenterDelta: kickerRect
          ? markerRect.top + markerRect.height / 2 - (kickerRect.top + kickerRect.height / 2)
          : null,
        labelKickerOverlap: Boolean(
          markerLabelRect && kickerRect && markerLabelRect.width > 0 && markerLabelRect.height > 0 &&
          markerLabelRect.left < kickerRect.right && markerLabelRect.right > kickerRect.left &&
          markerLabelRect.top < kickerRect.bottom && markerLabelRect.bottom > kickerRect.top
        ),
      };
    });

    const processStory = document.querySelector(".portfolio-process-story");
    const proof = document.querySelector(".portfolio-proof");
    const proofMarker = proof?.querySelector(".portfolio-rail-marker");
    const railStyle = processStory ? getComputedStyle(processStory, "::before") : null;
    const stopMaskStyle = proof ? getComputedStyle(proof, "::after") : null;
    const storyRect = processStory?.getBoundingClientRect();
    const proofRect = proof?.getBoundingClientRect();
    const proofMarkerRect = proofMarker?.getBoundingClientRect();
    const endpointCount = document.querySelectorAll(".portfolio-rail-endpoint").length;
    const railGeometry = storyRect && proofRect && proofMarkerRect && railStyle && stopMaskStyle
      ? {
          endpointCount,
          hasStopMask: stopMaskStyle.content !== "none",
          lineStopDelta: Math.abs(proofRect.top + number(stopMaskStyle.top) - proofMarkerRect.bottom),
          maskCoversRail: (() => {
            const railX = storyRect.left + number(railStyle.left) + number(railStyle.width) / 2;
            const maskLeft = proofRect.left + number(stopMaskStyle.left);
            return maskLeft <= railX && maskLeft + number(stopMaskStyle.width) >= railX;
          })(),
        }
      : null;

    const segmentedCounts = [...document.querySelectorAll(".portfolio-segmented button span")].map((node) => {
      const style = getComputedStyle(node);
      const text = node.textContent?.trim() ?? "";
      return {
        text,
        active: node.closest("button")?.classList.contains("is-active") ?? false,
        color: style.color,
        background: style.backgroundColor,
        contrast: contrast(style.color, style.backgroundColor),
        hasSemanticLabel: /^\d+\s+\p{L}/u.test(text),
      };
    });

    const fonts = [];
    document.fonts.forEach((font) => fonts.push({
      family: font.family,
      status: font.status,
      weight: font.weight,
      style: font.style,
    }));

    return {
      theme: main?.getAttribute("data-theme"),
      geometry: {
        innerWidth,
        clientWidth: root.clientWidth,
        scrollWidth: root.scrollWidth,
        overflow: root.scrollWidth > root.clientWidth,
        outOfBounds,
      },
      headings,
      compressedHeadings: headings.filter((item) => item.ratio < 0.94),
      displayHeadingPeriods: headings.filter((item) => item.tag !== "H3" && /\./.test(item.text ?? "")),
      contacts,
      experience,
      smallWork,
      railMarkers,
      railGeometry,
      segmentedCounts,
      fonts: fonts.filter((font) => /Oswald|Golos/.test(font.family)),
      fontChecks: {
        oswaldRu: document.fonts.check('570 64px "Oswald Variable"', "КОМПЛЕКТ ДОКУМЕНТОВ ЙЦЩДУ"),
        golosRu: document.fonts.check('400 16px "Golos Text Variable"', "Испытательная лаборатория ЙЦЩДУ"),
      },
    };
  });
}

browser = await chromium.launch({ headless: true });

for (const [viewportName, viewport] of Object.entries(viewports)) {
  for (const theme of themes) {
    const context = await browser.newContext({ viewport, colorScheme: theme });
    for (const route of routes) {
      const page = await context.newPage();
      const errors = [];
      const failedResponses = [];
      page.on("console", (message) => {
        if (message.type() === "error") errors.push(`console: ${message.text()}`);
      });
      page.on("pageerror", (error) => errors.push(`page: ${error.message}`));
      page.on("response", (response) => {
        if (response.status() >= 400) failedResponses.push({ status: response.status(), url: response.url() });
      });

      await page.goto(`${baseURL}${route}`, { waitUntil: "domcontentloaded" });
      await dismissConsent(page);
      await page.waitForFunction(
        (expectedTheme) => document.querySelector("main.portfolio")?.getAttribute("data-theme") === expectedTheme,
        theme,
      );
      const state = await collectState(page);
      const entry = { viewportName, theme, route, state, errors, failedResponses };
      report.matrix.push(entry);

      const failures = [];
      if (state.theme !== theme) failures.push(`theme=${state.theme}`);
      if (state.geometry.overflow) failures.push("horizontal overflow");
      if (state.geometry.outOfBounds.length) failures.push(`out-of-bounds=${state.geometry.outOfBounds.length}`);
      if (state.compressedHeadings.length) failures.push(`compressed headings=${state.compressedHeadings.length}`);
      if (state.displayHeadingPeriods.length) failures.push(`display heading periods=${state.displayHeadingPeriods.length}`);
      if (!route.startsWith("/en") && (!state.fontChecks.oswaldRu || !state.fontChecks.golosRu)) {
        failures.push("Cyrillic font check");
      }
      if (state.contacts.some((item) => item.directChildren !== 2 || !item.copy || !item.links || !item.heading)) {
        failures.push("shared contact contract");
      }
      if (state.contacts.some((item) => item.heading && item.copy && Math.abs(item.heading.x - item.copy.x) > 1)) {
        failures.push("contact heading geometry");
      }
      if (Number(viewportName) >= 801 && state.experience.length > 1) {
        const heights = state.experience.map((item) => item.height);
        const bodyTops = state.experience.map((item) => item.bodyTop).filter((item) => item !== null);
        if (Math.max(...heights) - Math.min(...heights) > 2) failures.push("experience card heights");
        if (Math.max(...bodyTops) - Math.min(...bodyTops) > 2) failures.push("experience body zones");
      }
      if (theme === "light" && state.smallWork.some((item) => item.strokeWidth < 1)) {
        failures.push("light small-work counters");
      }
      if (theme === "light" && state.railMarkers.some((item) => item.contrast < 4.5)) {
        failures.push("light rail marker contrast");
      }
      if (state.railMarkers.some((item) => ["demonstration", "proof"].includes(item.section) && Math.abs(item.kickerCenterDelta) > 1)) {
        failures.push("rail marker/kicker alignment");
      }
      if (state.railMarkers.some((item) => item.labelKickerOverlap)) {
        failures.push("rail label/kicker overlap");
      }
      const hasProcessRail = route === "/" || route === "/en";
      if (hasProcessRail && (!state.railGeometry || state.railGeometry.endpointCount !== 0)) {
        failures.push("rail endpoint removal");
      }
      if (hasProcessRail && (!state.railGeometry?.hasStopMask || !state.railGeometry.maskCoversRail)) {
        failures.push("rail stop mask");
      }
      if (hasProcessRail && (!Number.isFinite(state.railGeometry?.lineStopDelta) || state.railGeometry.lineStopDelta > 1)) {
        failures.push("rail stop/marker alignment");
      }
      if (state.segmentedCounts.some((item) => item.contrast < 4.5)) {
        failures.push("segmented count contrast");
      }
      if (state.segmentedCounts.some((item) => !item.hasSemanticLabel)) {
        failures.push("segmented count label");
      }
      if (Number(viewportName) <= 800 && state.smallWork.some((item) => item.markerTitleOverlap)) {
        failures.push("small-work counter/title overlap");
      }
      if (errors.length) failures.push(`runtime errors=${errors.length}`);
      if (failedResponses.length) failures.push(`failed responses=${failedResponses.length}`);
      if (failures.length) report.failures.push({ viewportName, theme, route, failures });

      if (
        screenshotRoutes.has(route) &&
        (viewportName === "390" || viewportName === "1440")
      ) {
        const slug = `${viewportName}-${theme}-${route === "/" ? "ru-home" : route.slice(1).replaceAll("/", "-")}`;
        await page.screenshot({ path: fileURLToPath(new URL(`${slug}.png`, outputDir)), fullPage: true });
      }
      await page.close();
    }
    await context.close();
  }
}

{
  const context = await browser.newContext({ viewport: viewports["1280"], colorScheme: "dark" });
  const page = await context.newPage();
  const errors = [];
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(`${baseURL}/process-builder`, { waitUntil: "domcontentloaded" });
  await dismissConsent(page);

  const presetButtons = page.locator(".portfolio-presets button");
  const presetStates = [];
  for (let index = 0; index < await presetButtons.count(); index += 1) {
    await presetButtons.nth(index).click();
    presetStates.push({
      label: (await presetButtons.nth(index).locator("strong").textContent())?.trim(),
      pressed: await presetButtons.nth(index).getAttribute("aria-pressed"),
      cards: await page.locator(".portfolio-step").count(),
      cleanNotices: await page.locator(".portfolio-builder-notice.is-clean").count(),
      overflow: await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth),
    });
  }

  const customBeforeDelete = {
    cards: await page.locator(".portfolio-step").count(),
    cleanNotices: await page.locator(".portfolio-builder-notice.is-clean").count(),
  };
  await page.locator(".portfolio-step-main").first().click();
  await page.locator(".portfolio-editor .portfolio-button-danger").click();
  const customAfterDelete = {
    cards: await page.locator(".portfolio-step").count(),
    cleanNotices: await page.locator(".portfolio-builder-notice.is-clean").count(),
    stagesText: await page.locator(".portfolio-canvas-label em").textContent(),
  };
  await page.locator(".portfolio-add-step").click();
  await page.keyboard.press("Escape");
  const customAfterAdd = { cards: await page.locator(".portfolio-step").count() };

  await presetButtons.first().click();
  const technicalToggle = page.locator(".portfolio-tech-toggle");
  await technicalToggle.click();
  const technicalOpen = {
    expanded: await technicalToggle.getAttribute("aria-expanded"),
    panels: await page.locator(".portfolio-technical").count(),
  };
  await technicalToggle.click();
  const technicalClosed = {
    expanded: await technicalToggle.getAttribute("aria-expanded"),
    panels: await page.locator(".portfolio-technical").count(),
  };

  const actionGroups = page.locator(".portfolio-step-actions");
  const disabledState = {
    firstPrevious: await actionGroups.first().locator("button").first().isDisabled(),
    lastNext: await actionGroups.last().locator("button").last().isDisabled(),
  };

  const cardsBefore = await rects(page, ".portfolio-step");
  const alert = page.locator(".portfolio-step-alert").first();
  await alert.click();
  const pointerOpen = await page.evaluate(() => {
    const button = document.querySelector(".portfolio-step-alert");
    const popover = document.querySelector(".portfolio-step-issues");
    return {
      expanded: button?.getAttribute("aria-expanded"),
      describedBy: button?.getAttribute("aria-describedby"),
      popoverId: popover?.id ?? null,
      role: popover?.getAttribute("role"),
    };
  });
  await page.keyboard.press("Escape");
  const escapeState = await page.evaluate(() => ({
    expanded: document.querySelector(".portfolio-step-alert")?.getAttribute("aria-expanded"),
    popoverCount: document.querySelectorAll(".portfolio-step-issues").length,
    focusRestored: document.activeElement === document.querySelector(".portfolio-step-alert"),
  }));

  const secondTitle = (await page.locator(".portfolio-step-main strong").nth(1).textContent())?.trim();
  await page.getByRole("button", { name: new RegExp(`Переместить «${secondTitle}» назад`) }).click();
  const reorderedFirstTitle = (await page.locator(".portfolio-step-main strong").first().textContent())?.trim();

  await page.getByRole("button", { name: /^После/ }).click();
  await page.locator(".portfolio-step-alert").last().click();
  const proposalActions = await page.locator(".portfolio-step-issues li").allTextContents();
  const cardsAfter = await rects(page, ".portfolio-step");
  const afterState = {
    cardSizeDelta: sizeDelta(cardsBefore, cardsAfter),
    proposalLabels: await page.locator(".portfolio-step-proposal").allTextContents(),
    findingsCount: await page.locator(".portfolio-findings").count(),
    consultationCount: await page.locator(".portfolio-builder-consultation").count(),
    proposalActions,
  };

  const interactionFailures = [];
  if (presetStates.length !== 4 || presetStates.some((item) => item.pressed !== "true" || item.overflow)) interactionFailures.push("preset matrix");
  if (customBeforeDelete.cards !== 1 || customBeforeDelete.cleanNotices !== 1) interactionFailures.push("custom clean state");
  if (customAfterDelete.cards !== 0 || customAfterDelete.cleanNotices !== 1 || !/^0\s/.test(customAfterDelete.stagesText?.trim() ?? "")) interactionFailures.push("delete-last zero state");
  if (customAfterAdd.cards !== 1) interactionFailures.push("add after zero state");
  if (technicalOpen.expanded !== "true" || technicalOpen.panels !== 1 || technicalClosed.expanded !== "false" || technicalClosed.panels !== 0) interactionFailures.push("technical panel toggle");
  if (!disabledState.firstPrevious || !disabledState.lastNext) interactionFailures.push("edge reorder disabled state");
  if (pointerOpen.expanded !== "true" || pointerOpen.describedBy !== pointerOpen.popoverId || pointerOpen.role !== "region") interactionFailures.push("pointer disclosure semantics");
  if (escapeState.expanded !== "false" || escapeState.popoverCount !== 0 || !escapeState.focusRestored) interactionFailures.push("Escape close/focus restoration");
  if (reorderedFirstTitle !== secondTitle) interactionFailures.push("reorder result");
  if (afterState.cardSizeDelta > 1) interactionFailures.push(`before/after card size delta=${afterState.cardSizeDelta}`);
  if (afterState.findingsCount !== 0 || afterState.consultationCount !== 1) interactionFailures.push("builder guidance composition");
  if (!afterState.proposalActions.includes("Хранить статус внутри общего процесса")) interactionFailures.push("complete remediation actions");
  if (errors.length) interactionFailures.push(`runtime errors=${errors.length}`);

  report.builder = {
    presetStates,
    customBeforeDelete,
    customAfterDelete,
    customAfterAdd,
    technicalOpen,
    technicalClosed,
    disabledState,
    pointerOpen,
    escapeState,
    secondTitle,
    reorderedFirstTitle,
    afterState,
    errors,
  };
  if (interactionFailures.length) report.failures.push({ builderInteractions: interactionFailures });
  await context.close();
}

{
  const context = await browser.newContext({ viewport: viewports["1280"], colorScheme: "light" });
  const page = await context.newPage();
  await page.goto(baseURL, { waitUntil: "domcontentloaded" });
  await dismissConsent(page);

  const stableDimensions = async (selector) => {
    const locator = page.locator(selector).first();
    const before = await locator.boundingBox();
    await locator.hover();
    const hover = await locator.boundingBox();
    await locator.focus();
    const focus = await locator.boundingBox();
    return {
      before,
      hover,
      focus,
      delta: Math.max(
        Math.abs((before?.width ?? 0) - (hover?.width ?? 0)),
        Math.abs((before?.height ?? 0) - (hover?.height ?? 0)),
        Math.abs((before?.width ?? 0) - (focus?.width ?? 0)),
        Math.abs((before?.height ?? 0) - (focus?.height ?? 0)),
      ),
    };
  };

  const experience = await stableDimensions(".portfolio-experience-grid article");
  const smallWork = await stableDimensions(".portfolio-selected-work-grid article");
  const contact = await stableDimensions(".portfolio-contact a");
  const compactOverlayCount = await page.locator(".portfolio-compact-endpoint").count();
  report.interactions = { experience, smallWork, contact, compactOverlayCount };
  const failures = [];
  if (experience.delta > 0.5) failures.push("experience hover/focus dimensions");
  if (smallWork.delta > 0.5) failures.push("small-work hover/focus dimensions");
  if (contact.delta > 0.5) failures.push("contact hover/focus dimensions");
  if (compactOverlayCount !== 0) failures.push("compact overlay artifact");
  if (failures.length) report.failures.push({ mainInteractions: failures });
  await context.close();
}

{
  const context = await browser.newContext({ viewport: viewports["1280"], colorScheme: "light" });
  const page = await context.newPage();
  await page.goto(`${baseURL}/projects/lift-automation`, { waitUntil: "domcontentloaded" });
  await dismissConsent(page);
  await page.locator(".case-carousel-dots button").nth(1).click();
  await page.locator(".case-carousel-portrait-copy strong").waitFor();

  const mobileSlide = await page.evaluate(() => {
    const parseRgb = (value) => {
      const channels = (value.match(/[\d.]+/g) ?? []).slice(0, 3).map(Number);
      return value.startsWith("color(srgb") ? channels.map((channel) => channel * 255) : channels;
    };
    const luminance = (value) => {
      const [r, g, b] = parseRgb(value).map((channel) => {
        const normalized = channel / 255;
        return normalized <= 0.04045 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
      });
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };
    const contrast = (foreground, background) => {
      const [lighter, darker] = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
      return (lighter + 0.05) / (darker + 0.05);
    };
    const media = document.querySelector(".case-carousel-media-portrait");
    const label = document.querySelector(".case-carousel-portrait-copy span");
    const heading = document.querySelector(".case-carousel-portrait-copy strong");
    const background = media ? getComputedStyle(media).backgroundColor : "";
    const labelColor = label ? getComputedStyle(label).color : "";
    const headingColor = heading ? getComputedStyle(heading).color : "";
    return {
      background,
      labelColor,
      headingColor,
      labelContrast: contrast(labelColor, background),
      headingContrast: contrast(headingColor, background),
      heading: heading?.textContent?.trim() ?? "",
    };
  });

  await page.screenshot({
    path: fileURLToPath(new URL("1280-light-case-mobile-slide.png", outputDir)),
    fullPage: true,
  });
  report.interactions.mobileCaseSlide = mobileSlide;
  if (mobileSlide.labelContrast < 4.5 || mobileSlide.headingContrast < 4.5) {
    report.failures.push({ mobileCaseSlide: [`label contrast=${mobileSlide.labelContrast}`, `heading contrast=${mobileSlide.headingContrast}`] });
  }
  await context.close();
}

await writeFile(new URL("report.json", outputDir), JSON.stringify(report, null, 2));
console.log(JSON.stringify({
  matrixEntries: report.matrix.length,
  failures: report.failures,
  builder: report.builder,
  interactions: report.interactions,
  report: fileURLToPath(new URL("report.json", outputDir)),
}, null, 2));
if (report.failures.length) process.exitCode = 1;
} finally {
  await browser?.close();
  if (staticServer?.listening) {
    await new Promise((resolve) => staticServer.close(resolve));
  }
}
