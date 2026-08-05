"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useConceptTheme } from "../../_components/ConceptThemeProvider";
import { ThemeToggle } from "./ThemeToggle";
import {
  analyzeProcess,
  createProposedProcess,
  processPresets,
} from "../_lib/process-engine.mjs";

type ProcessFlag =
  | "duplicate-input"
  | "manual-transfer"
  | "approval-wait"
  | "multi-source-document"
  | "external-status"
  | "journal-copy"
  | "missing-owner";
type StepKind = "input" | "work" | "approval" | "document" | "registry" | "result";
type ProcessStep = {
  id: string;
  title: string;
  role: string;
  kind: StepKind;
  flags: ProcessFlag[];
  proposed?: boolean;
  remediations?: { type: ProcessFlag; action: string; status: "proposed" }[];
};
type Bottleneck = {
  type: ProcessFlag;
  stepId: string;
  stepTitle: string;
  title: string;
  detail: string;
};

type ConceptVariant = "editorial" | "workflow" | "studio" | "editorial-workflow";
type PresetKey = keyof typeof processPresets;

const variantCopy: Record<
  ConceptVariant,
  {
    index: string;
    label: string;
    title: string;
    lead: string;
    action: string;
    proofTitle: string;
  }
> = {
  editorial: {
    index: "01 / Editorial product",
    label: "Разработка веб-систем",
    title: "Ручную работу — в систему.",
    lead:
      "Разбираю процессы и создаю веб-продукты, которые заменяют таблицы, пересылки и повторный ввод данных.",
    action: "Разобрать процесс",
    proofTitle: "Не обещание. Работающий сценарий.",
  },
  workflow: {
    index: "02 / Workflow motif",
    label: "Процесс → данные → результат",
    title: "Сложный процесс. Понятная система.",
    lead:
      "Показываю, где теряется время, и превращаю разрозненные действия в один управляемый контур.",
    action: "Провести процесс",
    proofTitle: "Каждый переход должен что-то объяснять.",
  },
  studio: {
    index: "03 / Product studio",
    label: "Системы полного цикла",
    title: "Меньше рутины. Больше контроля.",
    lead:
      "Проектирую интерфейс, серверную логику и данные как одну рабочую систему — от первого действия до результата.",
    action: "Открыть конструктор",
    proofTitle: "Интерфейс показывает, как я думаю.",
  },
  "editorial-workflow": {
    index: "04 / Editorial workflow",
    label: "Архитектура рабочих процессов",
    title: "Из ручного процесса — в рабочую систему.",
    lead:
      "Сначала разбираю путь данных, ролей и решений. Затем собираю интерфейс, логику и документы в один управляемый контур.",
    action: "Пройти по процессу",
    proofTitle: "От гипотезы — к системе в эксплуатации.",
  },
};

function RailMarker({ number, label }: { number: string; label: string }) {
  return (
    <div className="concept-rail-marker" aria-hidden="true">
      <span>{number}</span>
      <strong>{label}</strong>
    </div>
  );
}

function ProcessRail() {
  return (
    <aside className="concept-process-rail" aria-label="Сквозной маршрут процесса">
      <ol>
        <li aria-label="01 Позиционирование"><span>01</span><strong>Позиционирование</strong></li>
        <li aria-label="02 Демонстрация"><span>02</span><strong>Демонстрация</strong></li>
        <li aria-label="03 Работающий кейс"><span>03</span><strong>Работающий кейс</strong></li>
      </ol>
    </aside>
  );
}

const flagLabels: Record<ProcessFlag, string> = {
  "duplicate-input": "Повторный ввод данных",
  "manual-transfer": "Ручная передача между ролями",
  "approval-wait": "Ожидание подтверждения",
  "multi-source-document": "Сборка из нескольких источников",
  "external-status": "Статус хранится отдельно",
  "journal-copy": "Повторный перенос в журнал",
  "missing-owner": "Не определён ответственный",
};

const kindLabels: Record<StepKind, string> = {
  input: "Вход",
  work: "Работа",
  approval: "Согласование",
  document: "Документ",
  registry: "Реестр",
  result: "Результат",
};

function cloneSteps(steps: ProcessStep[]) {
  return steps.map((step) => ({ ...step, flags: [...step.flags] }));
}

function makeStep(position: number): ProcessStep {
  return {
    id: `custom-${Date.now()}-${position}`,
    title: `Новый этап ${position}`,
    role: "Исполнитель",
    kind: "work",
    flags: [],
  };
}

function getStepDescription(step: ProcessStep, bottlenecks: Bottleneck[]) {
  const remediation = step.remediations?.[0]?.action;
  if (remediation) return remediation;

  const issue = bottlenecks.find((item) => item.stepId === step.id);
  return issue?.detail ?? "Отдельный этап процесса без отмеченных проблем.";
}

function StepCard({
  step,
  index,
  total,
  editable,
  detailed,
  bottlenecks,
  onEdit,
  onMove,
  onDragStart,
  onDrop,
}: {
  step: ProcessStep;
  index: number;
  total: number;
  editable: boolean;
  detailed: boolean;
  bottlenecks: Bottleneck[];
  onEdit: () => void;
  onMove: (direction: -1 | 1) => void;
  onDragStart: () => void;
  onDrop: () => void;
}) {
  const issues = bottlenecks.filter((item) => item.stepId === step.id);
  const description = getStepDescription(step, bottlenecks);
  const stepContent = detailed ? (
    <>
      <span className="concept-step-copy">
        <span className="concept-step-kind">{kindLabels[step.kind]}</span>
        <strong>{step.title}</strong>
        <span className="concept-step-description">{description}</span>
      </span>
      <span className="concept-step-role">{step.role || "Ответственный не назначен"}</span>
    </>
  ) : (
    <>
      <span className="concept-step-kind">{kindLabels[step.kind]}</span>
      <strong>{step.title}</strong>
      <span>{step.role || "Ответственный не назначен"}</span>
    </>
  );

  return (
    <article
      className="concept-step"
      draggable={editable}
      onDragStart={onDragStart}
      onDragOver={(event) => event.preventDefault()}
      onDrop={onDrop}
    >
      <div className="concept-step-number" aria-hidden="true">
        {String(index + 1).padStart(2, "0")}
      </div>
      {editable && (
        <span
          className="concept-drag-handle"
          aria-hidden="true"
          title="Перетащите карточку или используйте кнопки ниже"
        >
          ⠿
        </span>
      )}
      {editable ? (
        <button className="concept-step-main" type="button" onClick={onEdit}>
          {stepContent}
        </button>
      ) : (
        <div className="concept-step-main">{stepContent}</div>
      )}
      {editable && (
        <div className="concept-step-actions">
          <button
            type="button"
            onClick={() => onMove(-1)}
            disabled={index === 0}
            aria-label={`Переместить «${step.title}» выше`}
          >
            ↑
          </button>
          <button
            type="button"
            onClick={() => onMove(1)}
            disabled={index === total - 1}
            aria-label={`Переместить «${step.title}» ниже`}
          >
            ↓
          </button>
        </div>
      )}
      {issues.length > 0 && (
        <span className="concept-step-alert" aria-label={`${issues.length} проблем`}>
          {issues.length}
        </span>
      )}
    </article>
  );
}

function StepEditor({
  step,
  onChange,
  onClose,
  onDelete,
}: {
  step: ProcessStep;
  onChange: (next: ProcessStep) => void;
  onClose: () => void;
  onDelete: () => void;
}) {
  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    titleInputRef.current?.focus();
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      window.removeEventListener("keydown", closeOnEscape);
      previouslyFocused?.focus();
    };
  }, []);

  const toggleFlag = (flag: ProcessFlag) => {
    const flags = step.flags.includes(flag)
      ? step.flags.filter((item) => item !== flag)
      : [...step.flags, flag];
    onChange({ ...step, flags });
  };

  return (
    <div className="concept-editor-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="concept-editor"
        role="dialog"
        aria-modal="true"
        aria-labelledby="step-editor-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header>
          <div>
            <span>Редактирование этапа</span>
            <h2 id="step-editor-title">Что происходит здесь?</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Закрыть редактор">
            ×
          </button>
        </header>
        <label>
          Название
          <input
            ref={titleInputRef}
            value={step.title}
            onChange={(event) => onChange({ ...step, title: event.target.value })}
          />
        </label>
        <label>
          Ответственный
          <input
            value={step.role}
            onChange={(event) => onChange({ ...step, role: event.target.value })}
            placeholder="Например, менеджер"
          />
        </label>
        <label>
          Тип этапа
          <select
            value={step.kind}
            onChange={(event) =>
              onChange({ ...step, kind: event.target.value as StepKind })
            }
          >
            {Object.entries(kindLabels).map(([value, label]) => (
              <option value={value} key={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <fieldset>
          <legend>Что создаёт проблему?</legend>
          <div className="concept-flag-grid">
            {(Object.keys(flagLabels) as ProcessFlag[]).map((flag) => (
              <label key={flag}>
                <input
                  type="checkbox"
                  checked={step.flags.includes(flag)}
                  onChange={() => toggleFlag(flag)}
                />
                <span>{flagLabels[flag]}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <footer>
          <button className="concept-button concept-button-danger" type="button" onClick={onDelete}>
            Удалить этап
          </button>
          <button className="concept-button concept-button-primary" type="button" onClick={onClose}>
            Готово
          </button>
        </footer>
      </section>
    </div>
  );
}

function TechnicalPanel({
  stepCount,
  bottleneckCount,
  remediationCount,
  remainingCount,
}: {
  stepCount: number;
  bottleneckCount: number;
  remediationCount: number;
  remainingCount: number;
}) {
  return (
    <section className="concept-technical" aria-label="Технический разбор прототипа">
      <header>
        <span>Технический разбор</span>
        <strong>Local state → rules → transformation → UI</strong>
      </header>
      <div className="concept-api-grid">
        <ol className="concept-api-flow">
          <li><span>01</span><strong>React state</strong><em>{stepCount} этапов в браузере</em></li>
          <li><span>02</span><strong>analyzeProcess()</strong><em>{bottleneckCount} явных флагов</em></li>
          <li><span>03</span><strong>createProposedProcess()</strong><em>{remediationCount} гипотез предложено</em></li>
          <li><span>04</span><strong>Проверка реализации</strong><em>{remainingCount} флагов не подтверждено</em></li>
        </ol>
        <pre aria-label="Фактическое состояние локального прототипа"><code>{`{
  "mode": "local-prototype",
  "inputSteps": ${stepCount},
  "detected": ${bottleneckCount},
  "proposedRemediations": ${remediationCount},
  "unverifiedFlags": ${remainingCount},
  "validationStatus": "not-run",
  "networkRequests": 0
}`}</code></pre>
      </div>
      <p>
        Сейчас сетевых запросов нет: обе функции выполняются в браузере. Проектируемый, но не подключённый контракт production-версии: <code>POST /api/process/analyze</code> без аккаунтов и постоянного хранения данных.
      </p>
    </section>
  );
}

function CompactProcessDemo() {
  const [view, setView] = useState<"before" | "after">("before");
  const steps = processPresets.documents.steps as ProcessStep[];
  const bottlenecks = useMemo(() => analyzeProcess(steps), [steps]);
  const proposedSteps = useMemo(() => createProposedProcess(steps), [steps]);
  const visibleSteps = view === "before" ? steps : proposedSteps;
  const summary = view === "before"
    ? ["Ручная передача между ролями", "Повторный ввод данных", "Сборка документов из нескольких источников"]
    : ["Единый вход данных", "Автоматическая сборка комплекта", "Статусы и журнал в одном контуре"];

  return (
    <section className="concept-builder concept-compact-demo" id="demonstration">
      <RailMarker number="02" label="Демонстрация" />
      <header className="concept-builder-head">
        <div>
          <span className="concept-kicker">Короткая демонстрация</span>
          <h2>Один процесс. Два состояния.</h2>
        </div>
        <p>
          Переключи режим: сначала виден ручной сценарий, затем — предлагаемая схема. Расчёт выполняется локальными правилами в браузере.
        </p>
      </header>

      <div className="concept-compact-workspace">
        <div className="concept-compact-toolbar">
          <div className="concept-segmented" aria-label="Сравнение короткого сценария">
            <button
              type="button"
              className={view === "before" ? "is-active" : ""}
              aria-pressed={view === "before"}
              onClick={() => setView("before")}
            >
              Сейчас <span>{bottlenecks.length}</span>
            </button>
            <button
              type="button"
              className={view === "after" ? "is-active" : ""}
              aria-pressed={view === "after"}
              onClick={() => setView("after")}
            >
              После <span>{proposedSteps.flatMap((step) => step.remediations ?? []).length}</span>
            </button>
          </div>
          <span>{view === "before" ? "Ручной сценарий" : "Предлагаемая схема"}</span>
        </div>

        <div className="concept-compact-grid">
          <ol className="concept-compact-flow" aria-label={view === "before" ? "Текущий процесс" : "Предлагаемая схема"}>
            {visibleSteps.map((step, index) => (
              <li key={step.id}>
                <span className="concept-compact-number">{String(index + 1).padStart(2, "0")}</span>
                <div className="concept-compact-copy">
                  <small>{kindLabels[step.kind]}</small>
                  <strong>{step.title}</strong>
                  <p className="concept-step-description">{getStepDescription(step, bottlenecks)}</p>
                </div>
                <em className="concept-step-role">{step.role || "Ответственный не назначен"}</em>
              </li>
            ))}
          </ol>
          <aside className="concept-compact-summary" aria-live="polite">
            <span>{view === "before" ? "Что мешает" : "Что меняется"}</span>
            <ul>
              {summary.map((item) => <li key={item}>{item}</li>)}
            </ul>
            <p>Это демонстрация подхода, а не обещание эффекта без обследования процесса.</p>
          </aside>
        </div>
      </div>

      <div className="concept-compact-actions">
        <Link className="concept-button concept-button-primary" href="/concepts/process-builder">
          Открыть полный конструктор ↗
        </Link>
        <a href="#contact">Обсудить свой процесс →</a>
      </div>
    </section>
  );
}

function ProcessBuilder({ variant, standalone = false }: { variant: ConceptVariant; standalone?: boolean }) {
  const hasProcessRail = variant === "editorial-workflow" && !standalone;
  const [activePreset, setActivePreset] = useState<PresetKey>("documents");
  const [steps, setSteps] = useState<ProcessStep[]>(() =>
    cloneSteps(processPresets.documents.steps),
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [view, setView] = useState<"before" | "after">("before");
  const [technical, setTechnical] = useState(false);

  const bottlenecks = useMemo(() => analyzeProcess(steps), [steps]);
  const proposedSteps = useMemo(() => createProposedProcess(steps), [steps]);
  const afterBottlenecks = useMemo(
    () => analyzeProcess(proposedSteps),
    [proposedSteps],
  );
  const remediations = proposedSteps.flatMap((step) =>
    (step.remediations ?? []).map((item) => ({ ...item, stepTitle: step.title })),
  );
  const visibleSteps = view === "before" ? steps : proposedSteps;
  const selectedStep = steps.find((step) => step.id === selectedId) ?? null;

  const choosePreset = (key: PresetKey) => {
    setActivePreset(key);
    const presetSteps = cloneSteps(processPresets[key].steps);
    setSteps(presetSteps.length > 0 ? presetSteps : [makeStep(1)]);
    setView("before");
  };

  const moveStep = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= steps.length) return;
    setSteps((current) => {
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const dropStep = (targetIndex: number) => {
    if (draggedIndex === null || draggedIndex === targetIndex) return;
    setSteps((current) => {
      const next = [...current];
      const [moved] = next.splice(draggedIndex, 1);
      next.splice(targetIndex, 0, moved);
      return next;
    });
    setDraggedIndex(null);
  };

  const updateSelected = (next: ProcessStep) => {
    setSteps((current) => current.map((step) => (step.id === next.id ? next : step)));
  };

  const deleteSelected = () => {
    if (!selectedStep) return;
    setSteps((current) => current.filter((step) => step.id !== selectedStep.id));
    setSelectedId(null);
  };

  return (
    <section
      className="concept-builder"
      id="constructor"
      aria-labelledby={standalone ? "process-builder-title" : undefined}
    >
      {hasProcessRail && <RailMarker number="02" label="Конструктор" />}
      {!standalone && (
        <header className="concept-builder-head">
          <div>
            <span className="concept-kicker">Интерактивный экспонат</span>
            <h2>Покажи процесс. Найдём потери.</h2>
          </div>
          <p>
            Выбери пример, измени этапы и сравни ручной сценарий с предлагаемой схемой автоматизации. Без ИИ и случайных ответов.
          </p>
        </header>
      )}

      <nav className="concept-presets" aria-label="Примеры процессов">
        {(Object.keys(processPresets) as PresetKey[]).map((key) => (
          <button
            type="button"
            className={key === activePreset ? "is-active" : ""}
            aria-pressed={key === activePreset}
            onClick={() => choosePreset(key)}
            key={key}
          >
            <strong>{processPresets[key].label}</strong>
            <span>{processPresets[key].description}</span>
          </button>
        ))}
      </nav>

      <div className="concept-workspace">
        <div className="concept-workspace-toolbar">
          <div className="concept-segmented" aria-label="Сравнение процесса">
            <button
              type="button"
              className={view === "before" ? "is-active" : ""}
              aria-pressed={view === "before"}
              onClick={() => setView("before")}
            >
              Сейчас <span>{bottlenecks.length}</span>
            </button>
            <button
              type="button"
              className={view === "after" ? "is-active" : ""}
              aria-pressed={view === "after"}
              onClick={() => setView("after")}
            >
              После <span>{remediations.length}</span>
            </button>
          </div>
          <button
            className="concept-tech-toggle"
            type="button"
            aria-expanded={technical}
            onClick={() => setTechnical((current) => !current)}
          >
            {technical ? "Скрыть техразбор" : "Технический разбор"}
          </button>
        </div>

        <div className="concept-workspace-grid">
          <div className="concept-canvas" data-view={view}>
            <div className="concept-canvas-label">
              <span>{view === "before" ? "Текущий процесс" : "Предлагаемая схема"}</span>
              <em>{visibleSteps.length} этапов</em>
            </div>
            <div className="concept-step-list">
              {visibleSteps.map((step, index) => (
                <StepCard
                  key={step.id}
                  step={step}
                  index={index}
                  total={visibleSteps.length}
                  editable={view === "before"}
                  detailed={variant === "editorial-workflow"}
                  bottlenecks={view === "before" ? bottlenecks : afterBottlenecks}
                  onEdit={() => view === "before" && setSelectedId(step.id)}
                  onMove={(direction) => view === "before" && moveStep(index, direction)}
                  onDragStart={() => view === "before" && setDraggedIndex(index)}
                  onDrop={() => view === "before" && dropStep(index)}
                />
              ))}
            </div>
            {view === "before" && (
              <button
                className="concept-add-step"
                type="button"
                onClick={() => {
                  const next = makeStep(steps.length + 1);
                  setSteps((current) => [...current, next]);
                  setSelectedId(next.id);
                }}
              >
                <span>＋</span> Добавить этап
              </button>
            )}
          </div>

          <aside className="concept-findings" aria-live="polite">
            <header>
              <span>{view === "before" ? "Найдено" : "Гипотезы"}</span>
              <strong>{view === "before" ? bottlenecks.length : remediations.length}</strong>
            </header>
            {view === "before" && bottlenecks.length > 0 ? (
              <ul>
                {bottlenecks.slice(0, 5).map((item) => (
                  <li key={`${item.stepId}-${item.type}`}>
                    <span>{item.stepTitle}</span>
                    <strong>{item.title}</strong>
                    <p>{item.detail}</p>
                  </li>
                ))}
              </ul>
            ) : view === "after" && remediations.length > 0 ? (
              <div className="concept-clean-state">
                <span aria-hidden="true">?</span>
                <strong>Это гипотезы, а не выполненная автоматизация</strong>
                <p>{afterBottlenecks.length} исходных признаков останутся неподтверждёнными, пока схема не проверена на ролях, исключениях и данных.</p>
              </div>
            ) : (
              <div className="concept-clean-state">
                <span aria-hidden="true">✓</span>
                <strong>Явных разрывов не найдено</strong>
                <p>Добавь проблемные признаки в этапы, чтобы проверить сценарий.</p>
              </div>
            )}
            {view === "after" && remediations.length > 0 && (
              <ul>
                {remediations.slice(0, 5).map((item, index) => (
                  <li key={`${item.stepTitle}-${item.type}-${index}`}>
                    <span>{item.stepTitle}</span>
                    <strong>Предлагаемое правило</strong>
                    <p>{item.action}</p>
                  </li>
                ))}
              </ul>
            )}
            <div className="concept-consultation">
              <p>
                Для такого процесса может подойти единый реестр и контроль статусов. Точный состав решения зависит от ролей и исключений.
              </p>
              <a href="https://t.me/FullMetall_EGGS" target="_blank" rel="noreferrer">
                Обсудить автоматизацию ↗
              </a>
            </div>
          </aside>
        </div>

        {technical && (
          <TechnicalPanel
            stepCount={steps.length}
            bottleneckCount={bottlenecks.length}
            remediationCount={remediations.length}
            remainingCount={afterBottlenecks.length}
          />
        )}
      </div>

      {selectedStep && (
        <StepEditor
          step={selectedStep}
          onChange={updateSelected}
          onClose={() => setSelectedId(null)}
          onDelete={deleteSelected}
        />
      )}
    </section>
  );
}

function ExperienceSection() {
  return (
    <section className="concept-experience" id="experience">
      <header>
        <span className="concept-kicker">Опыт и ответственность</span>
        <h2>Создаю веб-продукты с 2014 года.</h2>
        <p>
          Начинал с frontend-разработки и вырос до проектирования прикладных систем и руководства разработкой.
        </p>
      </header>
      <div className="concept-experience-grid">
        <article>
          <span>2021 — сейчас</span>
          <h3>Начальник отдела веб-разработки</h3>
          <strong>10 человек в отделе</strong>
          <p>Планирование, распределение задач, технические решения, контроль качества и ответственность за результат команды.</p>
        </article>
        <article>
          <span>Инженерная роль</span>
          <h3>Разработчик систем полного цикла</h3>
          <p>Связываю исследование процесса, UX/UI, frontend, backend, данные, документы, тестирование и запуск.</p>
        </article>
        <article>
          <span>Подход</span>
          <h3>Сначала работа, затем интерфейс</h3>
          <p>Разбираю роли, исключения и движение данных до выбора технологий и визуального решения.</p>
        </article>
      </div>
    </section>
  );
}

function SelectedWorkSection() {
  const works = [
    {
      number: "01",
      kicker: "XLSX → сводка",
      title: "Анализ обращений",
      body: "Обрабатывает входящий XLSX, рассчитывает рабочее время и SLA, группирует обращения и формирует отчёт из четырёх связанных листов.",
      tags: ["Python", "XLSX", "Аналитика"],
    },
    {
      number: "02",
      kicker: "PDF → XLSX",
      title: "Подсчёт печатных знаков",
      body: "Пакетно обрабатывает PDF, считает печатные знаки и авторские листы, хранит историю и выгружает проверяемую таблицу.",
      tags: ["Python", "PDF", "Desktop"],
    },
  ];

  return (
    <section className="concept-selected-work" id="selected-work">
      <header>
        <span className="concept-kicker">Небольшие прикладные инструменты</span>
        <h2>Точечная автоматизация без лишней сложности.</h2>
        <p>Два компактных решения для обработки файлов и подготовки проверяемого результата.</p>
      </header>
      <div className="concept-selected-work-grid">
        {works.map((work) => (
          <article key={work.number}>
            <span>{work.number}</span>
            <small>{work.kicker}</small>
            <h3>{work.title}</h3>
            <p>{work.body}</p>
            <ul aria-label={`Технологии проекта «${work.title}»`}>
              {work.tags.map((tag) => <li key={tag}>{tag}</li>)}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}

function ConceptFooter() {
  return (
    <footer className="concept-footer">
      <div className="concept-footer-inner">
        <span>Даниил Угловский · веб-системы</span>
        <nav aria-label="Ссылки в футере">
          <a href="https://t.me/FullMetall_EGGS" target="_blank" rel="noreferrer">Написать в Telegram ↗</a>
          <a href="mailto:abc-xyz9@yandex.ru">Email ↗</a>
          <a href="#top">Наверх ↑</a>
        </nav>
      </div>
    </footer>
  );
}

export function ProcessBuilderProduct() {
  const { theme, toggleTheme } = useConceptTheme();

  return (
    <main className="concept concept-editorial-workflow concept-builder-product" data-theme={theme} id="top">
      <header className="concept-nav">
        <Link href="/concepts/editorial-workflow" aria-label="Вернуться к портфолио">
          <span className="concept-mark">DU</span>
          <span>Вернуться к портфолио</span>
        </Link>
        <nav aria-label="Навигация конструктора">
          <a href="#constructor">Конструктор</a>
          <a href="#contact">Контакт</a>
        </nav>
        <div className="concept-nav-meta">
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
          <span>Демонстрационный продукт</span>
        </div>
      </header>
      <section className="concept-builder-product-hero">
        <span className="concept-kicker">Демонстрационный продукт</span>
        <h1 id="process-builder-title">Конструктор процессов</h1>
        <p>
          Опиши ручной сценарий, отметь проблемные места и сравни его с предлагаемой схемой. Всё работает локально, без аккаунта, внешнего ИИ и сохранения данных.
        </p>
      </section>
      <ProcessBuilder variant="editorial-workflow" standalone />
      <section className="concept-contact" id="contact">
        <span className="concept-kicker">Нужен разбор реального процесса?</span>
        <div className="concept-contact-copy"><h2>Напиши мне.</h2></div>
        <div className="concept-contact-links">
          <a href="mailto:abc-xyz9@yandex.ru">abc-xyz9@yandex.ru ↗</a>
          <a href="https://t.me/FullMetall_EGGS" target="_blank" rel="noreferrer">Telegram ↗</a>
        </div>
      </section>
      <ConceptFooter />
    </main>
  );
}

export function ConceptPrototype({ variant }: { variant: ConceptVariant }) {
  const copy = variantCopy[variant];
  const hasProcessRail = variant === "editorial-workflow";
  const { theme, toggleTheme } = useConceptTheme();

  const hero = (
    <section className="concept-hero" id="positioning">
      <div className="concept-hero-copy">
        {hasProcessRail && <RailMarker number="01" label="Позиционирование" />}
        <span className="concept-kicker">{copy.label}</span>
        <h1>{copy.title}</h1>
        <p>{copy.lead}</p>
        {hasProcessRail ? (
          <div className="concept-hero-actions">
            <a className="concept-button concept-button-primary" href="#contact">
              Написать мне ↗
            </a>
            <a href="#demonstration">Смотреть демонстрацию ↓</a>
          </div>
        ) : (
          <a className="concept-button concept-button-primary" href="#constructor">
            {copy.action} ↓
          </a>
        )}
      </div>
      {hasProcessRail ? (
        <aside className="concept-hero-brief" aria-label="Подход к проектированию">
          <span>Что связывает решение</span>
          <ol>
            <li><strong>Процесс</strong><p>Роли, действия, ожидания и исключения.</p></li>
            <li><strong>Система</strong><p>Интерфейс, данные, логика и документы.</p></li>
            <li><strong>Результат</strong><p>Рабочий сценарий, проверенный в эксплуатации.</p></li>
          </ol>
        </aside>
      ) : (
        <div className="concept-hero-proof" aria-label="Ключевые результаты">
          <div><strong>60 → 9</strong><span>минут на комплект</span></div>
          <div><strong>−85%</strong><span>ручной подготовки</span></div>
          <div><strong>2014</strong><span>в веб-разработке</span></div>
        </div>
      )}
      {hasProcessRail ? (
        <div className="concept-hero-transition" aria-hidden="true">
          <span>Ручной сценарий</span>
          <i />
          <span>Управляемая система</span>
        </div>
      ) : (
        <div className="concept-hero-visual" aria-hidden="true">
          <span>Входные данные</span>
          <i />
          <span>Рабочий процесс</span>
          <i />
          <span>Готовый результат</span>
        </div>
      )}
    </section>
  );

  const proof = (
    <section className="concept-proof" id="proof">
      {hasProcessRail && <RailMarker number="03" label="Работающий кейс" />}
      <header>
        <span className="concept-kicker">Проект в эксплуатации</span>
        <h2>{copy.proofTitle}</h2>
      </header>
      <div className="concept-proof-grid">
        <div className="concept-proof-screen">
          <img
            src="/case/lift-diagnostics-desktop.png"
            alt="Интерфейс реестра диагностик лифтов"
          />
        </div>
        <div className="concept-proof-copy">
          <strong>Автоматизация испытательной лаборатории</strong>
          <p>
            Требования, UX/UI, архитектура, frontend, backend, база данных, документы, тестирование и запуск — один завершённый цикл.
          </p>
          {hasProcessRail ? (
            <dl aria-label="Метрики проекта автоматизации">
              <div><dt>Подготовка</dt><dd>60 → 9 минут</dd></div>
              <div><dt>Ручная работа</dt><dd>−85%</dd></div>
              <div><dt>Объём</dt><dd>2 400 комплектов в год</dd></div>
              <div><dt>Статус</dt><dd>В эксплуатации</dd></div>
            </dl>
          ) : (
            <dl>
              <div><dt>Срок</dt><dd>3 месяца</dd></div>
              <div><dt>Статус</dt><dd>В эксплуатации</dd></div>
              <div><dt>Объём</dt><dd>2 400 комплектов в год</dd></div>
            </dl>
          )}
          <Link href="/projects/lift-automation">Разобрать кейс ↗</Link>
        </div>
      </div>
    </section>
  );

  return (
    <main className={`concept concept-${variant}`} data-theme={hasProcessRail ? theme : undefined} id={hasProcessRail ? "top" : undefined}>
      <header className="concept-nav">
        <Link href="/concepts" aria-label="Вернуться к сравнению концепций">
          <span className="concept-mark">DU</span>
          <span>Даниил Угловский</span>
        </Link>
        <nav aria-label="Навигация концепта">
          {hasProcessRail ? (
            <>
              <a href="#demonstration">Демонстрация</a>
              <a href="#proof">Кейс</a>
              <a href="#experience">Опыт</a>
              <a href="#selected-work">Работы</a>
              <a href="#contact">Контакт</a>
            </>
          ) : (
            <>
              <a href="#constructor">Конструктор</a>
              <a href="#proof">Кейс</a>
              <a href="#contact">Контакт</a>
            </>
          )}
        </nav>
        {hasProcessRail ? (
          <div className="concept-nav-meta">
            <ThemeToggle theme={theme} onToggle={toggleTheme} />
            <span>{copy.index}</span>
          </div>
        ) : (
          <span>{copy.index}</span>
        )}
      </header>

      {hasProcessRail ? (
        <div className="concept-process-story">
          <ProcessRail />
          {hero}
          <CompactProcessDemo />
          {proof}
        </div>
      ) : (
        <>
          {hero}
          <ProcessBuilder variant={variant} />
          {proof}
        </>
      )}

      {hasProcessRail && <ExperienceSection />}
      {hasProcessRail && <SelectedWorkSection />}

      <section className="concept-contact" id="contact">
        <span className="concept-kicker">Контакт</span>
        <div className="concept-contact-copy">
          <h2>{hasProcessRail ? "Есть задача? Напиши мне." : <>Есть ручной процесс?<br />Разберём его.</>}</h2>
          {hasProcessRail && (
            <p>Расскажи о процессе, продукте или роли. Отвечаю в Telegram и по электронной почте.</p>
          )}
        </div>
        <div className="concept-contact-links">
          {hasProcessRail ? (
            <>
              <a href="https://t.me/FullMetall_EGGS" target="_blank" rel="noreferrer">Написать в Telegram ↗</a>
              <a href="mailto:abc-xyz9@yandex.ru">abc-xyz9@yandex.ru ↗</a>
            </>
          ) : (
            <>
              <a href="mailto:abc-xyz9@yandex.ru">abc-xyz9@yandex.ru ↗</a>
              <a href="https://t.me/FullMetall_EGGS" target="_blank" rel="noreferrer">Telegram ↗</a>
            </>
          )}
        </div>
      </section>
      {hasProcessRail && <ConceptFooter />}
    </main>
  );
}
