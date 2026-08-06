"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Locale } from "../content";
import { AnalyticsSettingsButton } from "./AnalyticsSettingsButton";
import { ExternalArrowIcon } from "./ExternalArrowIcon";
import { usePortfolioTheme } from "./PortfolioThemeProvider";
import { portfolioCopy } from "./portfolio-copy";
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
type PresetKey = "documents" | "appeals" | "approval" | "custom";
type ProcessPreset = {
  label: string;
  description: string;
  steps: ProcessStep[];
};

function RailMarker({ number, label }: { number: string; label: string }) {
  return (
    <div className="portfolio-rail-marker" aria-hidden="true">
      <span>{number}</span>
      <strong>{label}</strong>
    </div>
  );
}

function LanguageSwitch({ locale, href }: { locale: Locale; href: string }) {
  const t = portfolioCopy[locale];
  return (
    <Link className="portfolio-language-switch" href={href} aria-label={t.languageLabel}>
      {t.language}
    </Link>
  );
}

function ProcessRail({ locale }: { locale: Locale }) {
  const t = portfolioCopy[locale];
  return (
    <aside className="portfolio-process-rail" aria-label={t.rail.route}>
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
  const t = portfolioCopy[locale].builder;
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
  return issue?.detail ?? portfolioCopy[locale].builder.fallbackDescription;
}

function StepCard({
  step,
  index,
  total,
  editable,
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
  bottlenecks: Bottleneck[];
  locale: Locale;
  onEdit: () => void;
  onMove: (direction: -1 | 1) => void;
  onDragStart: () => void;
  onDrop: () => void;
}) {
  const t = portfolioCopy[locale];
  const issues = bottlenecks.filter((item) => item.stepId === step.id);
  const description = getStepDescription(step, bottlenecks, locale);
  const stepContent = (
    <>
      <span className="portfolio-step-copy">
        <span className="portfolio-step-kind">{t.kindLabels[step.kind]}</span>
        <strong>{step.title}</strong>
        <span className="portfolio-step-description">{description}</span>
      </span>
      <span className="portfolio-step-role">{step.role || t.builder.unassigned}</span>
    </>
  );

  return (
    <article
      className="portfolio-step"
      draggable={editable}
      onDragStart={onDragStart}
      onDragOver={(event) => event.preventDefault()}
      onDrop={onDrop}
    >
      <div className="portfolio-step-number" aria-hidden="true">
        {String(index + 1).padStart(2, "0")}
      </div>
      {editable && (
        <span
          className="portfolio-drag-handle"
          aria-hidden="true"
          title={t.builder.dragHint}
        >
          ⠿
        </span>
      )}
      {editable ? (
        <button className="portfolio-step-main" type="button" onClick={onEdit}>
          {stepContent}
        </button>
      ) : (
        <div className="portfolio-step-main">{stepContent}</div>
      )}
      {editable && (
        <div className="portfolio-step-actions">
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
        <span className="portfolio-step-alert" aria-label={t.builder.issues(issues.length)}>
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
  const t = portfolioCopy[locale];
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
    <div className="portfolio-editor-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="portfolio-editor"
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
          <div className="portfolio-flag-grid">
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
          <button className="portfolio-button portfolio-button-danger" type="button" onClick={onDelete}>
            {t.builder.editor.delete}
          </button>
          <button className="portfolio-button portfolio-button-primary" type="button" onClick={onClose}>
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
  const t = portfolioCopy[locale].builder.technical;
  return (
    <section className="portfolio-technical" aria-label={t.label}>
      <header>
        <span>{t.title}</span>
        <strong>Local state → rules → transformation → UI</strong>
      </header>
      <div className="portfolio-api-grid">
        <ol className="portfolio-api-flow">
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
  const t = portfolioCopy[locale];
  const [view, setView] = useState<"before" | "after">("before");
  const steps = getProcessPresets(locale).documents.steps as ProcessStep[];
  const bottlenecks = useMemo(() => analyzeProcess(steps, locale), [steps, locale]);
  const proposedSteps = useMemo(() => createProposedProcess(steps, locale), [steps, locale]);
  const visibleSteps = view === "before" ? steps : proposedSteps;
  const summary = view === "before" ? t.compact.beforeSummary : t.compact.afterSummary;

  return (
    <section className="portfolio-builder portfolio-compact-demo" id="demonstration">
      <RailMarker number="02" label={t.rail.demonstration} />
      <header className="portfolio-builder-head">
        <div>
          <span className="portfolio-kicker">{t.compact.kicker}</span>
          <h2>{t.compact.title}</h2>
        </div>
        <p>{t.compact.lead}</p>
      </header>

      <div className="portfolio-compact-workspace">
        <div className="portfolio-compact-toolbar">
          <div className="portfolio-segmented" aria-label={t.compact.comparisonLabel}>
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

        <div className="portfolio-compact-grid">
          <ol className="portfolio-compact-flow" aria-label={view === "before" ? t.compact.currentProcess : t.compact.proposedProcess}>
            {visibleSteps.map((step, index) => (
              <li key={step.id}>
                <span className="portfolio-compact-number">{String(index + 1).padStart(2, "0")}</span>
                <div className="portfolio-compact-copy">
                  <small>{t.kindLabels[step.kind]}</small>
                  <strong>{step.title}</strong>
                  <p className="portfolio-step-description">{getStepDescription(step, bottlenecks, locale)}</p>
                </div>
                <em className="portfolio-step-role">{step.role || t.builder.unassigned}</em>
              </li>
            ))}
          </ol>
          <aside className="portfolio-compact-summary" aria-live="polite">
            <span>{view === "before" ? t.compact.beforeSummaryLabel : t.compact.afterSummaryLabel}</span>
            <ul>
              {summary.map((item) => <li key={item}>{item}</li>)}
            </ul>
            <p>{t.compact.disclaimer}</p>
          </aside>
        </div>
      </div>

      <div className="portfolio-compact-actions">
        <Link className="portfolio-button portfolio-button-primary" href={locale === "en" ? "/en/process-builder" : "/process-builder"}>
          {t.compact.openBuilder}
          <ExternalArrowIcon />
        </Link>
        <a href="#contact">{t.compact.discuss}</a>
      </div>
    </section>
  );
}

function ProcessBuilder({ locale = "ru" }: { locale?: Locale }) {
  const t = portfolioCopy[locale];
  const presets = getProcessPresets(locale) as Record<PresetKey, ProcessPreset>;
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
      className="portfolio-builder"
      id="constructor"
      aria-labelledby="process-builder-title"
    >
      <nav className="portfolio-presets" aria-label={t.builder.presetsLabel}>
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

      <div className="portfolio-workspace">
        <div className="portfolio-workspace-toolbar">
          <div className="portfolio-segmented" aria-label={t.builder.comparisonLabel}>
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
            className="portfolio-tech-toggle"
            type="button"
            aria-expanded={technical}
            onClick={() => setTechnical((current) => !current)}
          >
            {technical ? t.builder.hideTechnical : t.builder.showTechnical}
          </button>
        </div>

        <div className="portfolio-workspace-grid">
          <div className="portfolio-canvas" data-view={view}>
            <div className="portfolio-canvas-label">
              <span>{view === "before" ? t.builder.currentProcess : t.builder.proposedProcess}</span>
              <em>{t.builder.stages(visibleSteps.length)}</em>
            </div>
            <div className="portfolio-step-list">
              {visibleSteps.map((step, index) => (
                <StepCard
                  key={step.id}
                  step={step}
                  index={index}
                  total={visibleSteps.length}
                  editable={view === "before"}
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
                className="portfolio-add-step"
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

          <aside className="portfolio-findings" aria-live="polite">
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
              <div className="portfolio-clean-state">
                <span aria-hidden="true">?</span>
                <strong>{t.builder.hypothesisTitle}</strong>
                <p>{t.builder.hypothesisBody(afterBottlenecks.length)}</p>
              </div>
            ) : (
              <div className="portfolio-clean-state">
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
            <div className="portfolio-consultation">
              <p>{t.builder.consultation}</p>
              <a href="https://t.me/FullMetall_EGGS" target="_blank" rel="noreferrer">
                {t.builder.discussAutomation}
                <ExternalArrowIcon />
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
  const t = portfolioCopy[locale].experience;
  return (
    <section className="portfolio-experience" id="experience">
      <header>
        <span className="portfolio-kicker">{t.kicker}</span>
        <h2>{t.title}</h2>
        <p>{t.lead}</p>
      </header>
      <div className="portfolio-experience-grid">
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
  const t = portfolioCopy[locale].work;
  return (
    <section className="portfolio-selected-work" id="selected-work">
      <header>
        <span className="portfolio-kicker">{t.kicker}</span>
        <h2>{t.title}</h2>
        <p>{t.lead}</p>
      </header>
      <div className="portfolio-selected-work-grid">
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

function PortfolioFooter({ locale }: { locale: Locale }) {
  const t = portfolioCopy[locale];
  return (
    <footer className="portfolio-footer">
      <div className="portfolio-footer-inner">
        <span>{t.footer.identity}</span>
        <nav aria-label={t.footerNavigationLabel}>
          <a href="https://t.me/FullMetall_EGGS" target="_blank" rel="noreferrer">{t.footer.telegram}<ExternalArrowIcon /></a>
          <a href="mailto:abc-xyz9@yandex.ru">Email<ExternalArrowIcon /></a>
          <Link href={locale === "en" ? "/en/privacy" : "/privacy"}>
            {locale === "en" ? "Privacy" : "Конфиденциальность"}
          </Link>
          <AnalyticsSettingsButton label={locale === "en" ? "Analytics settings" : "Настройки аналитики"} />
          <a href="#top">{t.footer.top}</a>
        </nav>
      </div>
    </footer>
  );
}

export function ProcessBuilderProduct({ locale = "ru" }: { locale?: Locale }) {
  const t = portfolioCopy[locale];
  const { theme, toggleTheme } = usePortfolioTheme();
  const portfolioHref = locale === "en" ? "/en" : "/";
  const languageHref = locale === "en" ? "/process-builder" : "/en/process-builder";

  return (
    <main className="portfolio portfolio-workflow portfolio-builder-product" data-theme={theme} id="top">
      <header className="portfolio-nav">
        <Link href={portfolioHref} aria-label={t.returnToPortfolio}>
          <span className="portfolio-mark">DU</span>
          <span>{t.returnToPortfolio}</span>
        </Link>
        <nav aria-label={t.builderNavigationLabel}>
          <a href="#constructor">{t.nav.builder}</a>
          <a href="#contact">{t.nav.contact}</a>
        </nav>
        <div className="portfolio-nav-meta">
          <LanguageSwitch locale={locale} href={languageHref} />
          <ThemeToggle theme={theme} onToggle={toggleTheme} locale={locale} />
          <span>{t.builderProduct.meta}</span>
        </div>
      </header>
      <section className="portfolio-builder-product-hero">
        <span className="portfolio-kicker">{t.builderProduct.kicker}</span>
        <h1 id="process-builder-title">{t.builderProduct.title}</h1>
        <p>{t.builderProduct.lead}</p>
      </section>
      <ProcessBuilder locale={locale} />
      <section className="portfolio-contact" id="contact">
        <span className="portfolio-kicker">{t.builderProduct.contactKicker}</span>
        <div className="portfolio-contact-copy"><h2>{t.builderProduct.contactTitle}</h2></div>
        <div className="portfolio-contact-links">
          <a href="mailto:abc-xyz9@yandex.ru">abc-xyz9@yandex.ru<ExternalArrowIcon /></a>
          <a href="https://t.me/FullMetall_EGGS" target="_blank" rel="noreferrer">Telegram<ExternalArrowIcon /></a>
        </div>
      </section>
      <PortfolioFooter locale={locale} />
    </main>
  );
}

export function PortfolioExperience({ locale = "ru" }: { locale?: Locale }) {
  const t = portfolioCopy[locale];
  const { theme, toggleTheme } = usePortfolioTheme();
  const portfolioHref = locale === "en" ? "/en" : "/";
  const languageHref = locale === "en" ? "/" : "/en";

  return (
    <main className="portfolio portfolio-workflow" data-theme={theme} id="top">
      <header className="portfolio-nav">
        <Link href={portfolioHref} aria-label={t.returnToPortfolio}>
          <span className="portfolio-mark">DU</span>
          <span>{t.name}</span>
        </Link>
        <nav aria-label={t.navigationLabel}>
          <a href="#demonstration">{t.nav.demonstration}</a>
          <a href="#proof">{t.nav.case}</a>
          <a href="#experience">{t.nav.experience}</a>
          <a href="#selected-work">{t.nav.work}</a>
          <a href="#contact">{t.nav.contact}</a>
        </nav>
        <div className="portfolio-nav-meta">
          <LanguageSwitch locale={locale} href={languageHref} />
          <ThemeToggle theme={theme} onToggle={toggleTheme} locale={locale} />
        </div>
      </header>

      <div className="portfolio-process-story">
        <ProcessRail locale={locale} />
        <section className="portfolio-hero" id="positioning">
          <div className="portfolio-hero-copy">
            <RailMarker number="01" label={t.rail.positioning} />
            <span className="portfolio-kicker">{t.hero.label}</span>
            <h1>{t.hero.title}</h1>
            <p>{t.hero.lead}</p>
            <div className="portfolio-hero-actions">
              <a className="portfolio-button portfolio-button-primary" href="#contact">
                {t.hero.contact}
                <ExternalArrowIcon />
              </a>
              <a href="#demonstration">{t.hero.demo}</a>
            </div>
          </div>
          <aside className="portfolio-hero-brief" aria-label={t.hero.briefLabel}>
            <span>{t.hero.briefTitle}</span>
            <ol>
              {t.hero.brief.map(([title, body]) => (
                <li key={title}><strong>{title}</strong><p>{body}</p></li>
              ))}
            </ol>
          </aside>
          <div className="portfolio-hero-transition" aria-hidden="true">
            <span>{t.hero.transitionBefore}</span>
            <i />
            <span>{t.hero.transitionAfter}</span>
          </div>
        </section>

        <CompactProcessDemo locale={locale} />

        <section className="portfolio-proof" id="proof">
          <RailMarker number="03" label={t.rail.case} />
          <header>
            <span className="portfolio-kicker">{t.proof.kicker}</span>
            <h2>{t.proof.title}</h2>
          </header>
          <div className="portfolio-proof-grid">
            <div className="portfolio-proof-screen">
              <img src="/case/lift-diagnostics-desktop.png" alt={t.proof.imageAlt} />
            </div>
            <div className="portfolio-proof-copy">
              <strong>{t.proof.projectTitle}</strong>
              <p>{t.proof.body}</p>
              <dl aria-label={t.proof.metricsLabel}>
                <div><dt>{t.proof.preparation}</dt><dd>{t.proof.preparationValue}</dd></div>
                <div><dt>{t.proof.manualWork}</dt><dd>−85%</dd></div>
                <div><dt>{t.proof.volume}</dt><dd>{t.proof.volumeValue}</dd></div>
                <div><dt>{t.proof.status}</dt><dd>{t.proof.statusValue}</dd></div>
              </dl>
              <Link href={locale === "en" ? "/en/projects/lift-automation" : "/projects/lift-automation"}>
                {t.proof.action}<ExternalArrowIcon />
              </Link>
            </div>
          </div>
        </section>
      </div>

      <ExperienceSection locale={locale} />
      <SelectedWorkSection locale={locale} />

      <section className="portfolio-contact" id="contact">
        <span className="portfolio-kicker">{t.contact.kicker}</span>
        <div className="portfolio-contact-copy">
          <h2>{t.contact.title}</h2>
          <p>{t.contact.lead}</p>
        </div>
        <div className="portfolio-contact-links">
          <a href="https://t.me/FullMetall_EGGS" target="_blank" rel="noreferrer">{t.contact.telegram}<ExternalArrowIcon /></a>
          <a href="mailto:abc-xyz9@yandex.ru">abc-xyz9@yandex.ru<ExternalArrowIcon /></a>
        </div>
      </section>
      <PortfolioFooter locale={locale} />
    </main>
  );
}
