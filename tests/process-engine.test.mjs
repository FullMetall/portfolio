import assert from "node:assert/strict";
import { test } from "node:test";
import {
  analyzeProcess,
  createProposedProcess,
  getProcessPresets,
  processPresets,
  remediationByFlag,
} from "../app/concepts/_lib/process-engine.mjs";

test("detects bottlenecks from explicit process flags", () => {
  const steps = [
    {
      id: "receive",
      title: "Получить заявку",
      role: "Менеджер",
      kind: "input",
      flags: ["manual-transfer", "missing-owner"],
    },
    {
      id: "register",
      title: "Перенести в журнал",
      role: "Оператор",
      kind: "registry",
      flags: ["duplicate-input", "external-status"],
    },
  ];

  const result = analyzeProcess(steps);

  assert.equal(result.length, 4);
  assert.deepEqual(
    result.map((item) => item.type),
    ["manual-transfer", "missing-owner", "duplicate-input", "external-status"],
  );
  assert(result.every((item) => item.stepId));
});

test("creates a proposed flow without claiming implementation", () => {
  const source = processPresets.documents.steps;
  const snapshot = structuredClone(source);

  const proposed = createProposedProcess(source);

  assert.deepEqual(source, snapshot);
  assert.equal(proposed.length, source.length);
  assert(proposed.every((step) => step.proposed));
  assert.deepEqual(
    proposed.map((step) => step.flags),
    source.map((step) => step.flags),
  );
  assert(proposed.every((step) => Array.isArray(step.remediations)));
  assert(proposed.every((step) => step.remediations.every((item) => item.status === "proposed")));
  assert(proposed.some((step) => step.title.includes("автоматически")));
});

test("applies an explicit remediation for every supported bottleneck", () => {
  const flags = Object.keys(remediationByFlag);
  const source = [{
    id: "all-risks",
    title: "Ручной этап",
    role: "",
    kind: "registry",
    flags,
  }];

  const [proposed] = createProposedProcess(source);

  assert.equal(proposed.remediations.length, flags.length);
  assert.deepEqual(
    proposed.remediations.map((item) => item.type),
    flags,
  );
  assert.equal(proposed.role, "Владелец процесса (предложение)");
  assert.equal(analyzeProcess([proposed]).length, flags.length);
});

test("ships three realistic presets and an empty custom process", () => {
  assert.deepEqual(Object.keys(processPresets), [
    "documents",
    "appeals",
    "approval",
    "custom",
  ]);
  assert(processPresets.documents.steps.length >= 4);
  assert(processPresets.appeals.steps.length >= 4);
  assert(processPresets.approval.steps.length >= 4);
  assert.equal(processPresets.custom.steps.length, 0);
});

test("localizes presets, findings, and proposed steps for English UI", () => {
  const presets = getProcessPresets("en");
  const source = presets.documents.steps;
  const findings = analyzeProcess(source, "en");
  const proposed = createProposedProcess(source, "en");
  const visibleCopy = JSON.stringify({ presets, findings, proposed });

  assert.equal(presets.documents.label, "Document processing");
  assert.match(findings[0].title, /Manual transfer/);
  assert(proposed.some((step) => step.title.includes("Proposal:")));
  assert.doesNotMatch(visibleCopy, /[А-Яа-яЁё]/);
});
