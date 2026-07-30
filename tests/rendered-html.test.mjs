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
  assert.match(html, /60 → 7 мин/);
  assert.match(html, /2 400/);
  assert.match(html, /daniil@fullmetall\.ru/);
  assert.match(html, /\/projects\/lift-automation/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape/i);
  assert.doesNotMatch(html, /Вертикаль ИЛ|Руководитель проектов\.pdf/i);
  assert.doesNotMatch(html, /\+7[\s()-]*\d{3}/);
});

test("renders English, case, and privacy routes", async () => {
  const english = await render("/en");
  const caseStudy = await render("/projects/lift-automation");
  const privacy = await render("/privacy");

  assert.equal(english.status, 200);
  assert.equal(caseStudy.status, 200);
  assert.equal(privacy.status, 200);

  assert.match(await english.text(), /I turn complex processes/);
  assert.match(await caseStudy.text(), /с часа до 7 минут/);
  assert.match(await privacy.text(), /собирать минимум данных/);
});
