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

test("publishes the process builder without exposing the concepts namespace", async () => {
  const russianHome = await render("/");
  const englishHome = await render("/en");
  const russianBuilder = await render("/process-builder");
  const englishBuilder = await render("/en/process-builder");

  assert.equal(russianBuilder.status, 200);
  assert.equal(englishBuilder.status, 200);

  const russianHomeHtml = await russianHome.text();
  const englishHomeHtml = await englishHome.text();
  const russianBuilderHtml = await russianBuilder.text();
  const englishBuilderHtml = await englishBuilder.text();

  assert.match(russianHomeHtml, /href="\/process-builder"/);
  assert.match(englishHomeHtml, /href="\/en\/process-builder"/);
  assert.match(russianBuilderHtml, /<a[^>]*aria-label="Вернуться к портфолио"[^>]*href="\/"/);
  assert.match(russianBuilderHtml, /href="\/en\/process-builder"[^>]*>EN<\/a>/);
  assert.match(englishBuilderHtml, /<a[^>]*aria-label="Back to portfolio"[^>]*href="\/en"/);
  assert.match(englishBuilderHtml, /href="\/process-builder"[^>]*>RU<\/a>/);

  for (const html of [russianHomeHtml, englishHomeHtml, russianBuilderHtml, englishBuilderHtml]) {
    assert.doesNotMatch(html, /href="\/(?:en\/)?concepts(?:\/|"|#)/);
  }

  for (const route of [
    "/concepts",
    "/concepts/editorial-product",
    "/concepts/workflow-motif",
    "/concepts/product-studio",
    "/concepts/editorial-workflow",
    "/concepts/process-builder",
    "/en/concepts/editorial-workflow",
    "/en/concepts/process-builder",
  ]) {
    const response = await render(route);
    assert.equal(response.status, 404, `Concept route is still publicly exported: ${route}`);
  }
});

test("publishes editorial workflow as the Russian production homepage", async () => {
  const response = await render("/");
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /Даниил Угловский/);
  assert.match(html, /class="portfolio portfolio-workflow"/);
  assert.match(html, /Из ручного процесса — в рабочую систему\./);
  assert.match(html, /Один процесс\. Два состояния\./);
  assert.match(html, /href="\/en"[^>]*>EN<\/a>/);
  assert.match(html, /60 → 9 минут/);
  assert.match(html, /−85%/);
  assert.doesNotMatch(html, /60 → 7 мин|−88%/);
  assert.match(html, /Создаю веб-продукты с 2014 года/);
  assert.match(html, /Анализ обращений/);
  assert.match(html, /Подсчёт печатных знаков/);
  assert.match(html, /abc-xyz9@yandex\.ru/);
  assert.doesNotMatch(html, /daniil@fullmetall\.ru/);
  assert.match(html, /\/projects\/lift-automation/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape/i);
  assert.doesNotMatch(html, /Вертикаль ИЛ|Руководитель проектов\.pdf/i);
  assert.doesNotMatch(html, /\+7[\s()-]*\d{3}/);
});

test("publishes editorial workflow in English and keeps case routes paired", async () => {
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

  assert.match(englishHtml, /<title>Workflow architecture — Daniil Uglovskiy<\/title>/);
  assert.match(englishHtml, /class="portfolio portfolio-workflow"/);
  assert.match(englishHtml, /From a manual process to a working system\./);
  assert.match(englishHtml, /One process\. Two states\./);
  assert.match(englishHtml, /href="\/"[^>]*>RU<\/a>/);
  assert.match(englishHtml, /60 → 9 minutes/);
  assert.match(englishHtml, /−85%/);
  assert.match(englishHtml, /Building web products since 2014/);
  assert.match(englishHtml, /Appeals analysis/);
  assert.doesNotMatch(englishHtml, /60 → 7 min|−88%/);
  assert.doesNotMatch(caseStudyHtml, /с часа до 9 минут/);
  assert.match(caseStudyHtml, /Комплект документов — за 9 минут\./);
  assert.match(caseStudyHtml, /Ручной процесс вместо единой системы\./);
  assert.match(caseStudyHtml, /Один контур для всей работы\./);
  assert.match(caseStudyHtml, /Один разработчик\. Полный цикл\./);
  assert.match(caseStudyHtml, /−85% времени на подготовку комплекта\./);
  assert.doesNotMatch(caseStudyHtml, /Проблема была не в одном документе/);
  assert.doesNotMatch(caseStudyHtml, /Самостоятельно провёл проект через полный цикл разработки/);
  assert.match(caseStudyHtml, /60 → 9 мин/);
  assert.match(caseStudyHtml, /сократилось на 85%/);
  assert.match(caseStudyHtml, /3 месяца/);
  assert.match(caseStudyHtml, /В эксплуатации/);
  assert.match(caseStudyHtml, /2 400/);
  assert.match(caseStudyHtml, /освидетельствований и комплектов в год/);
  assert.match(caseStudyHtml, /\/case\/lift-diagnostics-desktop\.png/);
  assert.match(caseStudyHtml, /\/case\/lift-document-journal\.png/);
  assert.doesNotMatch(caseStudyHtml, /с часа до 7 минут|60 → 7 мин|88%/);
  assert.match(caseStudyHtml, /class="portfolio portfolio-workflow portfolio-lift-case"/);
  assert.match(caseStudyHtml, /aria-label="Светлая тема"/);
  assert.match(caseStudyHtml, /class="lift-case-process-grid"/);
  assert.match(caseStudyHtml, /class="[^"]*lift-case-gallery[^"]*"/);
  assert.match(caseStudyHtml, /<footer class="portfolio-footer"/);
  assert.match(caseStudyHtml, /href="\/en\/projects\/lift-automation"[^>]*>EN<\/a>/);
  assert.match(caseStudyHtml, /<a[^>]*aria-label="Вернуться к портфолио"[^>]*href="\/"/);
  assert.doesNotMatch(caseStudyHtml, /class="site-header"/);
  assert.match(englishCaseStudyHtml, /4 processes/);
  assert.match(englishCaseStudyHtml, /Reducing document-set preparation from one hour to 9 minutes\./);
  assert.match(englishCaseStudyHtml, /moved out of manual work/);
  assert.match(englishCaseStudyHtml, /Previous screen/);
  assert.match(englishCaseStudyHtml, /Open full-size image/);
  assert.doesNotMatch(englishCaseStudyHtml, /2 roles/);
  assert.match(englishCaseStudyHtml, /class="portfolio portfolio-workflow portfolio-lift-case"/);
  assert.match(englishCaseStudyHtml, /href="\/projects\/lift-automation"[^>]*>RU<\/a>/);
  assert.match(englishCaseStudyHtml, /<a[^>]*aria-label="Back to portfolio"[^>]*href="\/en"/);

  assert.match(privacyHtml, /Политика конфиденциальности/);
  assert.match(privacyHtml, /Яндекс Метрик/);
  assert.match(privacyHtml, /Настройки аналитики/);
  assert.match(englishPrivacyHtml, /Privacy policy/);
  assert.match(englishPrivacyHtml, /Yandex Metrica/);
  assert.match(englishPrivacyHtml, /Analytics settings/);

  for (const html of [englishHtml, caseStudyHtml, englishCaseStudyHtml]) {
    assert.match(html, /<footer/);
    assert.match(html, /href="\/(?:en\/)?privacy"/);
    assert.match(html, /data-analytics-settings="true"/);
  }
});

test("uses vector arrows instead of emoji-prone Unicode in editorial workflow", async () => {
  const routes = [
    "/",
    "/en",
    "/process-builder",
    "/en/process-builder",
    "/projects/lift-automation",
    "/en/projects/lift-automation",
  ];

  for (const route of routes) {
    const response = await render(route);
    assert.equal(response.status, 200, `Missing Editorial Workflow route: ${route}`);
    const html = await response.text();
    assert.doesNotMatch(html, /↗/, `Unicode arrow can render as emoji on iOS Safari: ${route}`);
    assert.match(html, /class="portfolio-external-arrow"[^>]*aria-hidden="true"/, `Missing vector arrow: ${route}`);
  }
});

test("editorial workflow is contact-first, concise, and keeps product metrics in the case", async () => {
  const response = await render("/");
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /Сквозной маршрут процесса/);
  assert.match(html, /portfolio-process-rail/);
  assert.match(html, /class="portfolio-hero-copy"><div class="portfolio-rail-marker"/);
  assert.match(html, /01[^<]*Позиционирование/);
  assert.match(html, /02[^<]*Демонстрация/);
  assert.match(html, /03[^<]*Работающий кейс/);
  assert.match(html, /Написать мне/);
  assert.match(html, /href="#contact"/);
  const telegramContactIndex = html.indexOf(">Написать в Telegram<svg");
  const emailContactIndex = html.indexOf("abc-xyz9@yandex.ru<svg");
  assert.notEqual(telegramContactIndex, -1);
  assert.ok(emailContactIndex > telegramContactIndex);
  assert.doesNotMatch(html, />Telegram(?:<svg| ↗)<\/a>/);
  assert.match(html, /Короткая демонстрация/);
  assert.match(html, /Открыть полный конструктор/);
  assert.match(html, /href="\/process-builder"/);
  assert.doesNotMatch(html, /Собрать свой процесс/);
  assert.doesNotMatch(html, /Технический разбор/);
  assert.doesNotMatch(html, /portfolio-hero-proof/);
  assert.doesNotMatch(html, />2014</);

  const proofStart = html.indexOf('id="proof"');
  assert.notEqual(proofStart, -1);
  const beforeProof = html.slice(0, proofStart);
  const proofHtml = html.slice(proofStart);
  assert.doesNotMatch(beforeProof, /60 → 9 минут|−85%/);
  assert.match(proofHtml, /60 → 9 минут/);
  assert.match(proofHtml, /−85%/);

  assert.match(html, /Начальник отдела веб-разработки/);
  assert.match(html, /10 человек в отделе/);
  assert.match(html, /Создаю веб-продукты с 2014 года/);
  assert.match(html, /Анализ обращений/);
  assert.match(html, /Подсчёт печатных знаков/);
  assert.match(html, /class="portfolio-step-description"/);
  assert.match(html, /class="portfolio-step-role"/);
  assert.match(html, /<footer class="portfolio-footer"/);
  assert.match(html, /class="portfolio-footer-inner"/);
  assert.doesNotMatch(html, /04 \/ Editorial workflow/);
  assert.match(html, /href="\/en"[^>]*>EN<\/a>/);
});

test("exports the current editorial workflow and process builder in English", async () => {
  const workflow = await render("/en");
  const builder = await render("/en/process-builder");

  assert.equal(workflow.status, 200);
  assert.equal(builder.status, 200);

  const workflowHtml = await workflow.text();
  const builderHtml = await builder.text();
  const workflowMain = workflowHtml.match(/<main[\s\S]*?<\/main>/)?.[0] ?? "";
  const builderMain = builderHtml.match(/<main[\s\S]*?<\/main>/)?.[0] ?? "";

  assert.match(workflowHtml, /From a manual process to a working system\./);
  assert.match(workflowHtml, /One process\. Two states\./);
  assert.match(workflowHtml, /Head of web development/);
  assert.match(workflowHtml, /Appeals analysis/);
  assert.match(workflowHtml, /href="\/"[^>]*>RU<\/a>/);
  assert.match(workflowHtml, /href="\/en\/process-builder"/);
  assert.doesNotMatch(workflowHtml, /04 \/ Editorial workflow/);
  assert.doesNotMatch(workflowMain, /[А-Яа-яЁё]/);

  assert.match(builderHtml, /<h1 id="process-builder-title">Process builder<\/h1>/);
  assert.match(builderHtml, /Document processing/);
  assert.match(builderHtml, /Technical breakdown/);
  assert.match(builderHtml, /href="\/process-builder"[^>]*>RU<\/a>/);
  assert.doesNotMatch(builderMain, /[А-Яа-яЁё]/);
});

test("exports the full process builder as a production product", async () => {
  const response = await render("/process-builder");
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /<h1 id="process-builder-title">Конструктор процессов<\/h1>/);
  assert.match(html, /<section class="portfolio-builder" id="constructor" aria-labelledby="process-builder-title">/);
  assert.doesNotMatch(html, /Покажи процесс\. Найдём потери\./);
  assert.doesNotMatch(html, /Интерактивный экспонат/);
  assert.match(html, /Собрать свой процесс/);
  assert.match(html, /Технический разбор/);
  assert.match(html, /Обработка документов/);
  assert.match(html, /Работа с обращениями/);
  assert.match(html, /Согласование заявки/);
  assert.match(html, /Вернуться к портфолио/);
  assert.match(html, /class="portfolio-step-copy"/);
  assert.match(html, /class="portfolio-step-description"/);
  assert.match(html, /class="portfolio-step-role"/);
  assert.doesNotMatch(html, /<div class="portfolio-step-copy"|<p class="portfolio-step-description"/);
  assert.match(html, /<footer class="portfolio-footer"/);
  assert.match(html, /class="portfolio-footer-inner"/);
  assert.doesNotMatch(html, /noindex/);
});

test("serves every local asset referenced by the exported pages", async () => {
  const pages = [
    "/",
    "/en",
    "/privacy",
    "/en/privacy",
    "/projects/lift-automation",
    "/en/projects/lift-automation",
    "/process-builder",
    "/en/process-builder",
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
