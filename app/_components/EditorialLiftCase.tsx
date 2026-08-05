"use client";

import Link from "next/link";
import type { Locale } from "../content";
import { profile } from "../content";
import { useConceptTheme } from "./ConceptThemeProvider";
import { CaseGallery } from "./CaseGallery";
import { ThemeToggle } from "../concepts/_components/ThemeToggle";
import type { EditorialCaseCopy } from "./CasePage";

const caseUi = {
  ru: {
    name: "Даниил Угловский",
    home: "/concepts/editorial-workflow",
    languageHref: "/en/projects/lift-automation",
    language: "EN",
    languageLabel: "Открыть английскую версию",
    homeLabel: "Вернуться к портфолио",
    navigationLabel: "Навигация кейса",
    nav: ["Контекст", "Решение", "Интерфейс", "Результат", "Контакт"],
    meta: "Кейс · автоматизация",
    contact: "Контакт",
    footerIdentity: "Даниил Угловский · веб-системы",
    footerLabel: "Ссылки в футере",
    telegram: "Написать в Telegram ↗",
    top: "Наверх ↑",
  },
  en: {
    name: "Daniil Uglovskiy",
    home: "/en/concepts/editorial-workflow",
    languageHref: "/projects/lift-automation",
    language: "RU",
    languageLabel: "Open the Russian version",
    homeLabel: "Back to portfolio",
    navigationLabel: "Case study navigation",
    nav: ["Context", "Solution", "Interface", "Result", "Contact"],
    meta: "Case · automation",
    contact: "Contact",
    footerIdentity: "Daniil Uglovskiy · web systems",
    footerLabel: "Footer links",
    telegram: "Message on Telegram ↗",
    top: "Back to top ↑",
  },
} as const;

export function EditorialLiftCase({ copy: t, locale }: { copy: EditorialCaseCopy; locale: Locale }) {
  const ui = caseUi[locale];
  const { theme, toggleTheme } = useConceptTheme();

  return (
    <main className="concept concept-editorial-workflow concept-lift-case" data-theme={theme} id="top">
      <header className="concept-nav">
        <Link href={ui.home} aria-label={ui.homeLabel}>
          <span className="concept-mark">DU</span>
          <span>{ui.name}</span>
        </Link>
        <nav aria-label={ui.navigationLabel}>
          <a href="#context">{ui.nav[0]}</a>
          <a href="#solution">{ui.nav[1]}</a>
          <a href="#interface">{ui.nav[2]}</a>
          <a href="#result">{ui.nav[3]}</a>
          <a href="#contact">{ui.nav[4]}</a>
        </nav>
        <div className="concept-nav-meta">
          <Link className="concept-language-switch" href={ui.languageHref} aria-label={ui.languageLabel}>{ui.language}</Link>
          <ThemeToggle theme={theme} onToggle={toggleTheme} locale={locale} />
          <span>{ui.meta}</span>
        </div>
      </header>

      <section className="lift-case-hero">
        <Link className="lift-case-back" href={ui.home}>← {ui.homeLabel}</Link>
        <span className="concept-kicker">{t.eyebrow}</span>
        <div className="lift-case-hero-grid">
          <div>
            <h1>{t.title}</h1>
            <p>{t.lead}</p>
          </div>
          <dl className="lift-case-meta">
            {t.meta.map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="lift-case-metrics">
          {t.metrics.map(([value, label], index) => (
            <article key={label}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{value}</strong>
              <p>{label}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="lift-case-section" id="context">
        <header className="lift-case-section-head">
          <div>
            <span className="concept-kicker">{t.contextLabel}</span>
            <h2>{t.contextTitle}</h2>
          </div>
          <p>{t.contextBody}</p>
        </header>
        <div className="lift-case-process-grid">
          {[
            [t.before, t.beforeItems, "before"],
            [t.after, t.afterItems, "after"],
          ].map(([title, items, state]) => (
            <article className={`lift-case-process-card is-${state}`} key={String(title)}>
              <span>{state === "before" ? "01" : "02"}</span>
              <h3>{title}</h3>
              <ul>
                {(items as readonly string[]).map((item) => <li key={item}>{item}</li>)}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="lift-case-section" id="solution">
        <header className="lift-case-section-head">
          <div>
            <span className="concept-kicker">{t.systemLabel}</span>
            <h2>{t.systemTitle}</h2>
          </div>
          <p>{t.systemBody}</p>
        </header>
        <div className="lift-case-module-grid">
          {t.modules.map(([number, title, body]) => (
            <article key={number}>
              <span>{number}</span>
              <h3>{title}</h3>
              <p>{body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="lift-case-section lift-case-gallery" id="interface">
        <header className="lift-case-section-head">
          <div>
            <span className="concept-kicker">{t.galleryLabel}</span>
            <h2>{t.galleryTitle}</h2>
          </div>
          <p>{t.galleryBody}</p>
        </header>
        <CaseGallery
          items={t.gallery}
          label={t.galleryTitle}
          previousLabel={t.galleryPrevious}
          nextLabel={t.galleryNext}
          openLabel={t.galleryOpen}
        />
      </section>

      <section className="lift-case-section lift-case-role">
        <div>
          <span className="concept-kicker">{t.roleLabel}</span>
          <h2>{t.roleTitle}</h2>
          <p>{t.roleBody}</p>
        </div>
        <aside>
          <span>{t.stackLabel}</span>
          {t.stack.map((item, index) => (
            <div key={item}><span>{String(index + 1).padStart(2, "0")}</span>{item}</div>
          ))}
        </aside>
      </section>

      <section className="lift-case-result" id="result">
        <span className="concept-kicker">{t.resultLabel}</span>
        <div>
          <h2>{t.resultTitle}</h2>
          <div>
            <p>{t.resultBody}</p>
            <small>{t.confidentiality}</small>
          </div>
        </div>
      </section>

      <section className="concept-contact lift-case-contact" id="contact">
        <span className="concept-kicker">{ui.contact}</span>
        <div className="concept-contact-copy">
          <h2>{t.contactTitle}</h2>
          <p>{t.contactBody}</p>
        </div>
        <div className="concept-contact-links">
          <a href={profile.telegram} target="_blank" rel="noreferrer">{t.telegram} ↗</a>
          <a href={`mailto:${profile.email}`}>{t.email} ↗</a>
        </div>
      </section>

      <footer className="concept-footer">
        <div className="concept-footer-inner">
          <span>{ui.footerIdentity}</span>
          <nav aria-label={ui.footerLabel}>
            <a href={profile.telegram} target="_blank" rel="noreferrer">{ui.telegram}</a>
            <a href={`mailto:${profile.email}`}>Email ↗</a>
            <a href="#top">{ui.top}</a>
          </nav>
        </div>
      </footer>
    </main>
  );
}
