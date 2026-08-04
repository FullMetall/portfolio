import assert from "node:assert/strict";
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";
import { after, before, test } from "node:test";

let baseUrl;
let staticServer;
const exportRoot = path.resolve("out");
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
  const candidates = path.extname(relativePath)
    ? [relativePath]
    : [
        relativePath,
        `${relativePath}.html`,
        path.join(relativePath, "index.html"),
      ];

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

before(async () => {
  staticServer = createServer(async (request, response) => {
    const filePath = await resolveExportedFile(request.url ?? "/");
    if (!filePath) {
      response.writeHead(404).end("Not found");
      return;
    }
    response.setHeader(
      "content-type",
      contentTypes.get(path.extname(filePath)) ?? "application/octet-stream",
    );
    createReadStream(filePath).pipe(response);
  });

  await new Promise((resolve, reject) => {
    staticServer.once("error", reject);
    staticServer.listen(0, "127.0.0.1", resolve);
  });
  const address = staticServer.address();
  assert(address && typeof address === "object");
  baseUrl = `http://127.0.0.1:${address.port}`;
});

after(async () => {
  await new Promise((resolve, reject) => {
    staticServer.close((error) => (error ? reject(error) : resolve()));
  });
});

async function render(pathname = "/") {
  return fetch(`${baseUrl}${pathname}`, {
    headers: { accept: "text/html" },
  });
}

test("renders the Russian portfolio without starter or private content", async () => {
  const response = await render("/");
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /Даниил Угловский/);
  assert.match(html, /Превращаю сложные процессы/);
  assert.match(html, /9 минут/);
  assert.match(html, /−85%/);
  assert.doesNotMatch(html, /60 → 7 мин|−88%/);
  assert.match(html, /Полный цикл/);
  assert.match(html, /Анализ обращений/);
  assert.match(html, /Подсчёт печатных знаков/);
  assert.match(html, /XLSX → СВОДКА/);
  assert.doesNotMatch(html, /UTILITY/);
  assert.match(html, /abc-xyz9@yandex\.ru/);
  assert.doesNotMatch(html, /daniil@fullmetall\.ru/);
  assert.match(html, /\/projects\/lift-automation/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape/i);
  assert.doesNotMatch(html, /Вертикаль ИЛ|Руководитель проектов\.pdf/i);
  assert.doesNotMatch(html, /\+7[\s()-]*\d{3}/);
});

test("renders English, case, and privacy routes", async () => {
  const english = await render("/en");
  const caseStudy = await render("/projects/lift-automation");
  const englishCaseStudy = await render("/en/projects/lift-automation");
  const privacy = await render("/privacy");
  const englishPrivacy = await render("/en/privacy");

  assert.equal(english.status, 200);
  assert.equal(caseStudy.status, 200);
  assert.equal(englishCaseStudy.status, 200);
  assert.equal(privacy.status, 200);
  assert.equal(englishPrivacy.status, 200);

  const englishHtml = await english.text();
  const caseStudyHtml = await caseStudy.text();
  const englishCaseStudyHtml = await englishCaseStudy.text();
  const privacyHtml = await privacy.text();
  const englishPrivacyHtml = await englishPrivacy.text();

  assert.match(englishHtml, /I turn complex processes/);
  assert.match(englishHtml, /9 minutes/);
  assert.match(englishHtml, /−85%/);
  assert.match(englishHtml, /Full cycle/);
  assert.match(englishHtml, /Appeals analysis/);
  assert.match(englishHtml, /XLSX → REPORT/);
  assert.doesNotMatch(englishHtml, /UTILITY/);
  assert.doesNotMatch(englishHtml, /60 → 7 min|−88%/);
  assert.match(caseStudyHtml, /с часа до 9 минут/);
  assert.match(caseStudyHtml, /60 → 9 мин/);
  assert.match(caseStudyHtml, /сократилось на 85%/);
  assert.match(caseStudyHtml, /3 месяца/);
  assert.match(caseStudyHtml, /В эксплуатации/);
  assert.match(caseStudyHtml, /2 400/);
  assert.match(caseStudyHtml, /освидетельствований и комплектов в год/);
  assert.match(caseStudyHtml, /\/case\/lift-diagnostics-desktop\.png/);
  assert.match(caseStudyHtml, /\/case\/lift-document-journal\.png/);
  assert.doesNotMatch(caseStudyHtml, /с часа до 7 минут|60 → 7 мин|88%/);
  assert.match(englishCaseStudyHtml, /4 processes/);
  assert.match(englishCaseStudyHtml, /moved out of manual work/);
  assert.match(englishCaseStudyHtml, /Previous screen/);
  assert.match(englishCaseStudyHtml, /Open full-size image/);
  assert.doesNotMatch(englishCaseStudyHtml, /2 roles/);
  assert.match(privacyHtml, /собирать минимум данных/);

  for (const html of [caseStudyHtml, privacyHtml]) {
    assert.match(html, /<footer/);
    assert.match(html, /href="\/privacy"/);
  }

  for (const html of [englishHtml, englishCaseStudyHtml, englishPrivacyHtml]) {
    assert.match(html, /<footer/);
    assert.match(html, /href="\/en\/privacy"/);
  }
});

test("serves every local asset referenced by the exported pages", async () => {
  const pages = [
    "/",
    "/en",
    "/projects/lift-automation",
    "/en/projects/lift-automation",
  ];
  const assetPaths = new Set();

  for (const page of pages) {
    const response = await render(page);
    assert.equal(response.status, 200);
    const html = await response.text();
    for (const match of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
      const assetPath = match[1].split("#")[0];
      if (
        assetPath.startsWith("/") &&
        /\.(?:css|js|png|svg|woff2?)(?:\?|$)/i.test(assetPath)
      ) {
        assetPaths.add(assetPath);
      }
    }
  }

  assert(assetPaths.has("/case/lift-diagnostics-desktop.png"));
  assert([...assetPaths].some((assetPath) => assetPath.endsWith(".css")));
  assert([...assetPaths].some((assetPath) => assetPath.endsWith(".js")));

  for (const assetPath of assetPaths) {
    const response = await fetch(`${baseUrl}${assetPath}`);
    assert.equal(response.status, 200, `Missing exported asset: ${assetPath}`);
    assert(
      Number(response.headers.get("content-length") ?? 1) !== 0,
      `Empty exported asset: ${assetPath}`,
    );
  }
});
