"use client";

import Link from "next/link";
import { profile } from "../content";
import { useConceptTheme } from "./ConceptThemeProvider";
import { CaseGallery } from "./CaseGallery";
import { ThemeToggle } from "../concepts/_components/ThemeToggle";
import type { RussianCaseCopy } from "./CasePage";

export function EditorialLiftCase({ copy: t }: { copy: RussianCaseCopy }) {
  const { theme, toggleTheme } = useConceptTheme();

  return (
    <main className="concept concept-editorial-workflow concept-lift-case" data-theme={theme} id="top">
      <header className="concept-nav">
        <Link href="/concepts/editorial-workflow" aria-label="Вернуться к портфолио">
          <span className="concept-mark">DU</span>
          <span>Даниил Угловский</span>
        </Link>
        <nav aria-label="Навигация кейса">
          <a href="#context">Контекст</a>
          <a href="#solution">Решение</a>
          <a href="#interface">Интерфейс</a>
          <a href="#result">Результат</a>
          <a href="#contact">Контакт</a>
        </nav>
        <div className="concept-nav-meta">
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
          <span>Кейс · автоматизация</span>
        </div>
      </header>

      <section className="lift-case-hero">
        <Link className="lift-case-back" href="/concepts/editorial-workflow">← Вернуться к портфолио</Link>
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
        <span className="concept-kicker">Контакт</span>
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
          <span>Даниил Угловский · веб-системы</span>
          <nav aria-label="Ссылки в футере">
            <a href={profile.telegram} target="_blank" rel="noreferrer">Написать в Telegram ↗</a>
            <a href={`mailto:${profile.email}`}>Email ↗</a>
            <Link href="/privacy">Конфиденциальность</Link>
            <a href="#top">Наверх ↑</a>
          </nav>
        </div>
      </footer>
    </main>
  );
}
