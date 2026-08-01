import assert from "node:assert/strict";
import test from "node:test";

async function render(path = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-${path}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`http://localhost${path}`, {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
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
  assert.match(html, /daniil@fullmetall\.ru/);
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
