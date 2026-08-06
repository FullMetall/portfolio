"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Locale } from "../../content";
import { ExternalArrowIcon } from "../../_components/ExternalArrowIcon";
import { useConceptTheme } from "../../_components/ConceptThemeProvider";
import { conceptCopy } from "./concept-i18n";
import { ThemeToggle } from "./ThemeToggle";
import {
  analyzeProcess,
  createProposedProcess,
  getProcessPresets,
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
type PresetKey = "documents" | "appeals" | "approval" | "custom";
type ProcessPreset = {
  label: string;
  description: string;
  steps: ProcessStep[];
};

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
    index: "",
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

function LanguageSwitch({ locale, href }: { locale: Locale; href: string }) {
  const t = conceptCopy[locale];
  return (
    <Link className="concept-language-switch" href={href} aria-label={t.languageLabel}>
      {t.language}
    </Link>
  );
}

function ProcessRail({ locale }: { locale: Locale }) {
  const t = conceptCopy[locale];
  return (
    <aside className="concept-process-rail" aria-label={t.rail.route}>
      <ol>
        <li aria-label={`01 ${t.rail.positioning}`}><span>01</span><strong>{t.rail.positioning}</strong></li>
        <li aria-label={`02 ${t.rail.demonstration}`}><span>02</span><strong>{t.rail.demonstration}</strong></li>
        <li aria-label={`03 ${t.rail.case}`}><span>03</span><strong>{t.rail.case}</strong></li>
      </ol>
    </aside>
  );
}

function cloneSteps(steps: ProcessStep[]) {
  return steps.map((step) => ({ ...step, flags: [...step.flags] }));
}

function makeStep(position: number, locale: Locale): ProcessStep {
  const t = conceptCopy[locale].builder;
  return {
    id: `custom-${Date.now()}-${position}`,
    title: t.newStage(position),
    role: t.executor,
    kind: "work",
    flags: [],
  };
}

function getStepDescription(step: ProcessStep, bottlenecks: Bottleneck[], locale: Locale) {
  const remediation = step.remediations?.[0]?.action;
  if (remediation) return remediation;

  const issue = bottlenecks.find((item) => item.stepId === step.id);
  return issue?.detail ?? conceptCopy[locale].builder.fallbackDescription;
}

function StepCard({
  step,
  index,
  total,
  editable,
  detailed,
  bottlenecks,
  locale,
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
  locale: Locale;
  onEdit: () => void;
  onMove: (direction: -1 | 1) => void;
  onDragStart: () => void;
  onDrop: () => void;
}) {
  const t = conceptCopy[locale];
  const issues = bottlenecks.filter((item) => item.stepId === step.id);
  const description = getStepDescription(step, bottlenecks, locale);
  const stepContent = detailed ? (
    <>
      <span className="concept-step-copy">
        <span className="concept-step-kind">{t.kindLabels[step.kind]}</span>
        <strong>{step.title}</strong>
        <span className="concept-step-description">{description}</span>
      </span>
      <span className="concept-step-role">{step.role || t.builder.unassigned}</span>
    </>
  ) : (
    <>
      <span className="concept-step-kind">{t.kindLabels[step.kind]}</span>
      <strong>{step.title}</strong>
      <span>{step.role || t.builder.unassigned}</span>
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
          title={t.builder.dragHint}
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
            aria-label={t.builder.moveUp(step.title)}
          >
            ↑
          </button>
          <button
            type="button"
            onClick={() => onMove(1)}
            disabled={index === total - 1}
            aria-label={t.builder.moveDown(step.title)}
          >
            ↓
          </button>
        </div>
      )}
      {issues.length > 0 && (
        <span className="concept-step-alert" aria-label={t.builder.issues(issues.length)}>
          {issues.length}
        </span>
      )}
    </article>
  );
}

function StepEditor({
  step,
  locale,
  onChange,
  onClose,
  onDelete,
}: {
  step: ProcessStep;
  locale: Locale;
  onChange: (next: ProcessStep) => void;
  onClose: () => void;
  onDelete: () => void;
}) {
  const t = conceptCopy[locale];
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
            <span>{t.builder.editor.eyebrow}</span>
            <h2 id="step-editor-title">{t.builder.editor.title}</h2>
          </div>
          <button type="button" onClick={onClose} aria-label={t.builder.editor.close}>
            ×
          </button>
        </header>
        <label>
          {t.builder.editor.name}
          <input
            ref={titleInputRef}
            value={step.title}
            onChange={(event) => onChange({ ...step, title: event.target.value })}
          />
        </label>
        <label>
          {t.builder.editor.owner}
          <input
            value={step.role}
            onChange={(event) => onChange({ ...step, role: event.target.value })}
            placeholder={t.builder.editor.ownerPlaceholder}
          />
        </label>
        <label>
          {t.builder.editor.type}
          <select
            value={step.kind}
            onChange={(event) =>
              onChange({ ...step, kind: event.target.value as StepKind })
            }
          >
            {Object.entries(t.kindLabels).map(([value, label]) => (
              <option value={value} key={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <fieldset>
          <legend>{t.builder.editor.issue}</legend>
          <div className="concept-flag-grid">
            {(Object.keys(t.flagLabels) as ProcessFlag[]).map((flag) => (
              <label key={flag}>
                <input
                  type="checkbox"
                  checked={step.flags.includes(flag)}
                  onChange={() => toggleFlag(flag)}
                />
                <span>{t.flagLabels[flag]}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <footer>
          <button className="concept-button concept-button-danger" type="button" onClick={onDelete}>
            {t.builder.editor.delete}
          </button>
          <button className="concept-button concept-button-primary" type="button" onClick={onClose}>
            {t.builder.editor.done}
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
  locale,
}: {
  stepCount: number;
  bottleneckCount: number;
  remediationCount: number;
  remainingCount: number;
  locale: Locale;
}) {
  const t = conceptCopy[locale].builder.technical;
  return (
    <section className="concept-technical" aria-label={t.label}>
      <header>
        <span>{t.title}</span>
        <strong>Local state → rules → transformation → UI</strong>
      </header>
      <div className="concept-api-grid">
        <ol className="concept-api-flow">
          <li><span>01</span><strong>React state</strong><em>{t.browserSteps(stepCount)}</em></li>
          <li><span>02</span><strong>analyzeProcess()</strong><em>{t.flags(bottleneckCount)}</em></li>
          <li><span>03</span><strong>createProposedProcess()</strong><em>{t.proposals(remediationCount)}</em></li>
          <li><span>04</span><strong>{t.verification}</strong><em>{t.unverified(remainingCount)}</em></li>
        </ol>
        <pre aria-label={t.stateLabel}><code>{`{
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
        {t.note} <code>POST /api/process/analyze</code>
      </p>
    </section>
  );
}

function CompactProcessDemo({ locale }: { locale: Locale }) {
  const t = conceptCopy[locale];
  const [view, setView] = useState<"before" | "after">("before");
  const steps = getProcessPresets(locale).documents.steps as ProcessStep[];
  const bottlenecks = useMemo(() => analyzeProcess(steps, locale), [steps, locale]);
  const proposedSteps = useMemo(() => createProposedProcess(steps, locale), [steps, locale]);
  const visibleSteps = view === "before" ? steps : proposedSteps;
  const summary = view === "before" ? t.compact.beforeSummary : t.compact.afterSummary;

  return (
    <section className="concept-builder concept-compact-demo" id="demonstration">
      <RailMarker number="02" label={t.rail.demonstration} />
      <header className="concept-builder-head">
        <div>
          <span className="concept-kicker">{t.compact.kicker}</span>
          <h2>{t.compact.title}</h2>
        </div>
        <p>{t.compact.lead}</p>
      </header>

      <div className="concept-compact-workspace">
        <div className="concept-compact-toolbar">
          <div className="concept-segmented" aria-label={t.compact.comparisonLabel}>
            <button
              type="button"
              className={view === "before" ? "is-active" : ""}
              aria-pressed={view === "before"}
              onClick={() => setView("before")}
            >
              {t.compact.current} <span>{bottlenecks.length}</span>
            </button>
            <button
              type="button"
              className={view === "after" ? "is-active" : ""}
              aria-pressed={view === "after"}
              onClick={() => setView("after")}
            >
              {t.compact.after} <span>{proposedSteps.flatMap((step) => step.remediations ?? []).length}</span>
            </button>
          </div>
          <span>{view === "before" ? t.compact.currentProcess : t.compact.proposedProcess}</span>
        </div>

        <div className="concept-compact-grid">
          <ol className="concept-compact-flow" aria-label={view === "before" ? t.compact.currentProcess : t.compact.proposedProcess}>
            {visibleSteps.map((step, index) => (
              <li key={step.id}>
                <span className="concept-compact-number">{String(index + 1).padStart(2, "0")}</span>
                <div className="concept-compact-copy">
                  <small>{t.kindLabels[step.kind]}</small>
                  <strong>{step.title}</strong>
                  <p className="concept-step-description">{getStepDescription(step, bottlenecks, locale)}</p>
                </div>
                <em className="concept-step-role">{step.role || t.builder.unassigned}</em>
              </li>
            ))}
          </ol>
          <aside className="concept-compact-summary" aria-live="polite">
            <span>{view === "before" ? t.compact.beforeSummaryLabel : t.compact.afterSummaryLabel}</span>
            <ul>
              {summary.map((item) => <li key={item}>{item}</li>)}
            </ul>
            <p>{t.compact.disclaimer}</p>
          </aside>
        </div>
      </div>

      <div className="concept-compact-actions">
        <Link className="concept-button concept-button-primary" href={locale === "en" ? "/en/process-builder" : "/process-builder"}>
          {t.compact.openBuilder}
          <ExternalArrowIcon />
        </Link>
        <a href="#contact">{t.compact.discuss}</a>
      </div>
    </section>
  );
}

function ProcessBuilder({
  variant,
  standalone = false,
  locale = "ru",
}: {
  variant: ConceptVariant;
  standalone?: boolean;
  locale?: Locale;
}) {
  const t = conceptCopy[locale];
  const presets = getProcessPresets(locale) as Record<PresetKey, ProcessPreset>;
  const hasProcessRail = variant === "editorial-workflow" && !standalone;
  const [activePreset, setActivePreset] = useState<PresetKey>("documents");
  const [steps, setSteps] = useState<ProcessStep[]>(() =>
    cloneSteps(presets.documents.steps),
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [view, setView] = useState<"before" | "after">("before");
  const [technical, setTechnical] = useState(false);

  const bottlenecks = useMemo(() => analyzeProcess(steps, locale), [steps, locale]);
  const proposedSteps = useMemo(() => createProposedProcess(steps, locale), [steps, locale]);
  const afterBottlenecks = useMemo(
    () => analyzeProcess(proposedSteps, locale),
    [proposedSteps, locale],
  );
  const remediations = proposedSteps.flatMap((step) =>
    (step.remediations ?? []).map((item) => ({ ...item, stepTitle: step.title })),
  );
  const visibleSteps = view === "before" ? steps : proposedSteps;
  const selectedStep = steps.find((step) => step.id === selectedId) ?? null;

  const choosePreset = (key: PresetKey) => {
    setActivePreset(key);
    const presetSteps = cloneSteps(presets[key].steps);
    setSteps(presetSteps.length > 0 ? presetSteps : [makeStep(1, locale)]);
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
      {hasProcessRail && <RailMarker number="02" label={t.rail.constructor} />}
      {!standalone && (
        <header className="concept-builder-head">
          <div>
            <span className="concept-kicker">{t.builder.kicker}</span>
            <h2>{t.builder.title}</h2>
          </div>
          <p>{t.builder.lead}</p>
        </header>
      )}

      <nav className="concept-presets" aria-label={t.builder.presetsLabel}>
        {(Object.keys(presets) as PresetKey[]).map((key) => (
          <button
            type="button"
            className={key === activePreset ? "is-active" : ""}
            aria-pressed={key === activePreset}
            onClick={() => choosePreset(key)}
            key={key}
          >
            <strong>{presets[key].label}</strong>
            <span>{presets[key].description}</span>
          </button>
        ))}
      </nav>

      <div className="concept-workspace">
        <div className="concept-workspace-toolbar">
          <div className="concept-segmented" aria-label={t.builder.comparisonLabel}>
            <button
              type="button"
              className={view === "before" ? "is-active" : ""}
              aria-pressed={view === "before"}
              onClick={() => setView("before")}
            >
              {t.builder.current} <span>{bottlenecks.length}</span>
            </button>
            <button
              type="button"
              className={view === "after" ? "is-active" : ""}
              aria-pressed={view === "after"}
              onClick={() => setView("after")}
            >
              {t.builder.after} <span>{remediations.length}</span>
            </button>
          </div>
          <button
            className="concept-tech-toggle"
            type="button"
            aria-expanded={technical}
            onClick={() => setTechnical((current) => !current)}
          >
            {technical ? t.builder.hideTechnical : t.builder.showTechnical}
          </button>
        </div>

        <div className="concept-workspace-grid">
          <div className="concept-canvas" data-view={view}>
            <div className="concept-canvas-label">
              <span>{view === "before" ? t.builder.currentProcess : t.builder.proposedProcess}</span>
              <em>{t.builder.stages(visibleSteps.length)}</em>
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
                  locale={locale}
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
                  const next = makeStep(steps.length + 1, locale);
                  setSteps((current) => [...current, next]);
                  setSelectedId(next.id);
                }}
              >
                <span>＋</span> {t.builder.addStage}
              </button>
            )}
          </div>

          <aside className="concept-findings" aria-live="polite">
            <header>
              <span>{view === "before" ? t.builder.found : t.builder.hypotheses}</span>
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
                <strong>{t.builder.hypothesisTitle}</strong>
                <p>{t.builder.hypothesisBody(afterBottlenecks.length)}</p>
              </div>
            ) : (
              <div className="concept-clean-state">
                <span aria-hidden="true">✓</span>
                <strong>{t.builder.cleanTitle}</strong>
                <p>{t.builder.cleanBody}</p>
              </div>
            )}
            {view === "after" && remediations.length > 0 && (
              <ul>
                {remediations.slice(0, 5).map((item, index) => (
                  <li key={`${item.stepTitle}-${item.type}-${index}`}>
                    <span>{item.stepTitle}</span>
                    <strong>{t.builder.proposedRule}</strong>
                    <p>{item.action}</p>
                  </li>
                ))}
              </ul>
            )}
            <div className="concept-consultation">
              <p>{t.builder.consultation}</p>
              <a href="https://t.me/FullMetall_EGGS" target="_blank" rel="noreferrer">
                {variant === "editorial-workflow" ? (
                  <>
                    {t.builder.discussAutomation}
                    <ExternalArrowIcon />
                  </>
                ) : `${t.builder.discussAutomation} ↗`}
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
            locale={locale}
          />
        )}
      </div>

      {selectedStep && (
        <StepEditor
          step={selectedStep}
          locale={locale}
          onChange={updateSelected}
          onClose={() => setSelectedId(null)}
          onDelete={deleteSelected}
        />
      )}
    </section>
  );
}

function ExperienceSection({ locale }: { locale: Locale }) {
  const t = conceptCopy[locale].experience;
  return (
    <section className="concept-experience" id="experience">
      <header>
        <span className="concept-kicker">{t.kicker}</span>
        <h2>{t.title}</h2>
        <p>{t.lead}</p>
      </header>
      <div className="concept-experience-grid">
        {t.cards.map(([period, title, highlight, body]) => (
          <article key={title}>
            <span>{period}</span>
            <h3>{title}</h3>
            {highlight && <strong>{highlight}</strong>}
            <p>{body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function SelectedWorkSection({ locale }: { locale: Locale }) {
  const t = conceptCopy[locale].work;
  return (
    <section className="concept-selected-work" id="selected-work">
      <header>
        <span className="concept-kicker">{t.kicker}</span>
        <h2>{t.title}</h2>
        <p>{t.lead}</p>
      </header>
      <div className="concept-selected-work-grid">
        {t.items.map((work) => (
          <article key={work.number}>
            <span>{work.number}</span>
            <small>{work.kicker}</small>
            <h3>{work.title}</h3>
            <p>{work.body}</p>
            <ul aria-label={t.technologiesLabel(work.title)}>
              {work.tags.map((tag) => <li key={tag}>{tag}</li>)}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}

function ConceptFooter({ locale }: { locale: Locale }) {
  const t = conceptCopy[locale];
  return (
    <footer className="concept-footer">
      <div className="concept-footer-inner">
        <span>{t.footer.identity}</span>
        <nav aria-label={t.footerNavigationLabel}>
          <a href="https://t.me/FullMetall_EGGS" target="_blank" rel="noreferrer">{t.footer.telegram}<ExternalArrowIcon /></a>
          <a href="mailto:abc-xyz9@yandex.ru">Email<ExternalArrowIcon /></a>
          <a href="#top">{t.footer.top}</a>
        </nav>
      </div>
    </footer>
  );
}

export function ProcessBuilderProduct({ locale = "ru" }: { locale?: Locale }) {
  const t = conceptCopy[locale];
  const { theme, toggleTheme } = useConceptTheme();
  const portfolioHref = locale === "en" ? "/en" : "/";
  const languageHref = locale === "en" ? "/process-builder" : "/en/process-builder";

  return (
    <main className="concept concept-editorial-workflow concept-builder-product" data-theme={theme} id="top">
      <header className="concept-nav">
        <Link href={portfolioHref} aria-label={t.returnToPortfolio}>
          <span className="concept-mark">DU</span>
          <span>{t.returnToPortfolio}</span>
        </Link>
        <nav aria-label={t.builderNavigationLabel}>
          <a href="#constructor">{t.nav.builder}</a>
          <a href="#contact">{t.nav.contact}</a>
        </nav>
        <div className="concept-nav-meta">
          <LanguageSwitch locale={locale} href={languageHref} />
          <ThemeToggle theme={theme} onToggle={toggleTheme} locale={locale} />
          <span>{t.builderProduct.meta}</span>
        </div>
      </header>
      <section className="concept-builder-product-hero">
        <span className="concept-kicker">{t.builderProduct.kicker}</span>
        <h1 id="process-builder-title">{t.builderProduct.title}</h1>
        <p>{t.builderProduct.lead}</p>
      </section>
      <ProcessBuilder variant="editorial-workflow" standalone locale={locale} />
      <section className="concept-contact" id="contact">
        <span className="concept-kicker">{t.builderProduct.contactKicker}</span>
        <div className="concept-contact-copy"><h2>{t.builderProduct.contactTitle}</h2></div>
        <div className="concept-contact-links">
          <a href="mailto:abc-xyz9@yandex.ru">abc-xyz9@yandex.ru<ExternalArrowIcon /></a>
          <a href="https://t.me/FullMetall_EGGS" target="_blank" rel="noreferrer">Telegram<ExternalArrowIcon /></a>
        </div>
      </section>
      <ConceptFooter locale={locale} />
    </main>
  );
}

export function ConceptPrototype({
  variant,
  locale = "ru",
}: {
  variant: ConceptVariant;
  locale?: Locale;
}) {
  const hasProcessRail = variant === "editorial-workflow";
  const t = conceptCopy[locale];
  const copy = hasProcessRail
    ? {
        index: "",
        label: t.hero.label,
        title: t.hero.title,
        lead: t.hero.lead,
        action: "",
        proofTitle: t.proof.title,
      }
    : variantCopy[variant];
  const { theme, toggleTheme } = useConceptTheme();
  const workflowHref = locale === "en" ? "/en" : "/";
  const languageHref = locale === "en" ? "/" : "/en";

  const hero = (
    <section className="concept-hero" id="positioning">
      <div className="concept-hero-copy">
        {hasProcessRail && <RailMarker number="01" label={t.rail.positioning} />}
        <span className="concept-kicker">{copy.label}</span>
        <h1>{copy.title}</h1>
        <p>{copy.lead}</p>
        {hasProcessRail ? (
          <div className="concept-hero-actions">
            <a className="concept-button concept-button-primary" href="#contact">
              {t.hero.contact}
              <ExternalArrowIcon />
            </a>
            <a href="#demonstration">{t.hero.demo}</a>
          </div>
        ) : (
          <a className="concept-button concept-button-primary" href="#constructor">
            {copy.action} ↓
          </a>
        )}
      </div>
      {hasProcessRail ? (
        <aside className="concept-hero-brief" aria-label={t.hero.briefLabel}>
          <span>{t.hero.briefTitle}</span>
          <ol>
            {t.hero.brief.map(([title, body]) => (
              <li key={title}><strong>{title}</strong><p>{body}</p></li>
            ))}
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
          <span>{t.hero.transitionBefore}</span>
          <i />
          <span>{t.hero.transitionAfter}</span>
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
      {hasProcessRail && <RailMarker number="03" label={t.rail.case} />}
      <header>
        <span className="concept-kicker">{hasProcessRail ? t.proof.kicker : "Проект в эксплуатации"}</span>
        <h2>{copy.proofTitle}</h2>
      </header>
      <div className="concept-proof-grid">
        <div className="concept-proof-screen">
          <img
            src="/case/lift-diagnostics-desktop.png"
            alt={hasProcessRail ? t.proof.imageAlt : "Интерфейс реестра диагностик лифтов"}
          />
        </div>
        <div className="concept-proof-copy">
          <strong>{hasProcessRail ? t.proof.projectTitle : "Автоматизация испытательной лаборатории"}</strong>
          <p>{hasProcessRail ? t.proof.body : "Требования, UX/UI, архитектура, frontend, backend, база данных, документы, тестирование и запуск — один завершённый цикл."}</p>
          {hasProcessRail ? (
            <dl aria-label={t.proof.metricsLabel}>
              <div><dt>{t.proof.preparation}</dt><dd>{t.proof.preparationValue}</dd></div>
              <div><dt>{t.proof.manualWork}</dt><dd>−85%</dd></div>
              <div><dt>{t.proof.volume}</dt><dd>{t.proof.volumeValue}</dd></div>
              <div><dt>{t.proof.status}</dt><dd>{t.proof.statusValue}</dd></div>
            </dl>
          ) : (
            <dl>
              <div><dt>Срок</dt><dd>3 месяца</dd></div>
              <div><dt>Статус</dt><dd>В эксплуатации</dd></div>
              <div><dt>Объём</dt><dd>2 400 комплектов в год</dd></div>
            </dl>
          )}
          <Link href={locale === "en" ? "/en/projects/lift-automation" : "/projects/lift-automation"}>
            {hasProcessRail ? <>{t.proof.action}<ExternalArrowIcon /></> : "Разобрать кейс ↗"}
          </Link>
        </div>
      </div>
    </section>
  );

  return (
    <main className={`concept concept-${variant}`} data-theme={hasProcessRail ? theme : undefined} id={hasProcessRail ? "top" : undefined}>
      <header className="concept-nav">
        <Link href={workflowHref} aria-label={hasProcessRail ? t.returnToPortfolio : "Вернуться к портфолио"}>
          <span className="concept-mark">DU</span>
          <span>{hasProcessRail ? t.name : "Даниил Угловский"}</span>
        </Link>
        <nav aria-label={hasProcessRail ? t.navigationLabel : "Навигация концепта"}>
          {hasProcessRail ? (
            <>
              <a href="#demonstration">{t.nav.demonstration}</a>
              <a href="#proof">{t.nav.case}</a>
              <a href="#experience">{t.nav.experience}</a>
              <a href="#selected-work">{t.nav.work}</a>
              <a href="#contact">{t.nav.contact}</a>
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
            <LanguageSwitch locale={locale} href={languageHref} />
            <ThemeToggle theme={theme} onToggle={toggleTheme} locale={locale} />
          </div>
        ) : (
          <span>{copy.index}</span>
        )}
      </header>

      {hasProcessRail ? (
        <div className="concept-process-story">
          <ProcessRail locale={locale} />
          {hero}
          <CompactProcessDemo locale={locale} />
          {proof}
        </div>
      ) : (
        <>
          {hero}
          <ProcessBuilder variant={variant} locale="ru" />
          {proof}
        </>
      )}

      {hasProcessRail && <ExperienceSection locale={locale} />}
      {hasProcessRail && <SelectedWorkSection locale={locale} />}

      <section className="concept-contact" id="contact">
        <span className="concept-kicker">{hasProcessRail ? t.contact.kicker : "Контакт"}</span>
        <div className="concept-contact-copy">
          <h2>{hasProcessRail ? t.contact.title : <>Есть ручной процесс?<br />Разберём его.</>}</h2>
          {hasProcessRail && (
            <p>{t.contact.lead}</p>
          )}
        </div>
        <div className="concept-contact-links">
          {hasProcessRail ? (
            <>
              <a href="https://t.me/FullMetall_EGGS" target="_blank" rel="noreferrer">{t.contact.telegram}<ExternalArrowIcon /></a>
              <a href="mailto:abc-xyz9@yandex.ru">abc-xyz9@yandex.ru<ExternalArrowIcon /></a>
            </>
          ) : (
            <>
              <a href="mailto:abc-xyz9@yandex.ru">abc-xyz9@yandex.ru ↗</a>
              <a href="https://t.me/FullMetall_EGGS" target="_blank" rel="noreferrer">Telegram ↗</a>
            </>
          )}
        </div>
      </section>
      {hasProcessRail && <ConceptFooter locale={locale} />}
    </main>
  );
}
