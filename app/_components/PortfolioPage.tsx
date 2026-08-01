import Link from "next/link";
import type { Locale } from "../content";
import { copy, profile } from "../content";
import { ProcessFlow } from "./ProcessFlow";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";

function Arrow() {
  return (
    <span className="arrow" aria-hidden="true">
      ↗
    </span>
  );
}

export function PortfolioPage({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const caseHref =
    locale === "ru"
      ? "/projects/lift-automation"
      : "/en/projects/lift-automation";

  return (
    <>
      <SiteHeader locale={locale} />
      <main>
        <section className="hero">
          <div className="shell hero-grid">
            <div className="hero-copy">
              <div className="availability">
                <span aria-hidden="true" />
                {t.availability}
              </div>
              <p className="eyebrow">{t.eyebrow}</p>
              <h1>{t.heroTitle}</h1>
              <p className="hero-lead">{t.heroBody}</p>
              <div className="button-row">
                <Link className="button button-primary" href="#project">
                  {t.primaryAction}
                  <Arrow />
                </Link>
                <a
                  className="button button-secondary"
                  href={profile.telegram}
                  target="_blank"
                  rel="noreferrer"
                >
                  {t.secondaryAction}
                  <Arrow />
                </a>
              </div>
            </div>
            <div className="hero-side">
              <div className="identity-card" aria-hidden="true">
                <span className="identity-index">01 / Portfolio</span>
                <span className="identity-monogram">DU</span>
                <span className="identity-line" />
                <span className="identity-caption">
                  WEB SYSTEMS
                  <br />
                  PROCESS AUTOMATION
                </span>
              </div>
            </div>
          </div>
          <div className="shell">
            <ProcessFlow locale={locale} />
          </div>
        </section>

        <section
          className="facts-band"
          aria-label={locale === "ru" ? "Ключевые факты" : "Key facts"}
        >
          <div className="shell facts-grid">
            {t.facts.map(([value, label], index) => (
              <div className={`fact fact-${index + 1}`} key={label}>
                <strong>{value}</strong>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="section project-section" id="project">
          <div className="shell">
            <div className="section-heading split-heading">
              <div>
                <p className="eyebrow">{t.projectEyebrow}</p>
                <h2>{t.projectTitle}</h2>
              </div>
              <p>{t.projectLead}</p>
            </div>

            <Link
              className="project-card"
              href={caseHref}
              aria-label={`${t.caseAction}: ${t.projectTitle}`}
            >
              <div className="project-visual project-visual-product" aria-hidden="true">
                <div className="project-screen-desktop">
                  <img src="/case/lift-diagnostics-desktop.png" alt="" />
                </div>
                <div className="project-screen-mobile">
                  <img src="/case/lift-diagnostics-mobile.png" alt="" />
                </div>
                <span className="visual-caption">WORKING PRODUCT · IN OPERATION</span>
              </div>
              <div className="project-content">
                <div className="project-metrics">
                  {t.projectMetrics.map(([value, label]) => (
                    <div key={label}>
                      <strong>{value}</strong>
                      <span>{label}</span>
                    </div>
                  ))}
                </div>
                <ul className="feature-list">
                  {t.projectFeatures.map((feature) => (
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>
                <span className="text-link">
                  {t.caseAction}
                  <Arrow />
                </span>
              </div>
            </Link>
          </div>
        </section>

        <section className="section tools-section" id="tools">
          <div className="shell">
            <div className="section-heading split-heading">
              <div>
                <p className="eyebrow">{t.otherWorkEyebrow}</p>
                <h2>{t.otherWorkTitle}</h2>
              </div>
              <p>{t.otherWorkLead}</p>
            </div>
            <div className="tools-grid">
              {t.tools.map((tool) => (
                <article className="tool-card" key={tool.number}>
                  <div className="tool-card-top">
                    <span>{tool.number}</span>
                    <span>{tool.kicker}</span>
                  </div>
                  <h3>{tool.title}</h3>
                  <p>{tool.body}</p>
                  <strong className="tool-result">{tool.result}</strong>
                  <div className="tool-tags" aria-label={t.stackLabel}>
                    {tool.tags.map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section expertise-section" id="expertise">
          <div className="shell">
            <div className="section-heading">
              <p className="eyebrow">{t.expertiseEyebrow}</p>
              <h2>{t.expertiseTitle}</h2>
            </div>
            <div className="expertise-grid">
              {t.expertise.map((item, index) => (
                <article
                  className={`expertise-card expertise-card-${index + 1}`}
                  key={item.number}
                >
                  <span className="card-number">{item.number}</span>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </article>
              ))}
            </div>
            <div className="stack-row">
              <span>{t.stackLabel}</span>
              <div>
                {t.stack.map((item) => (
                  <span className="stack-pill" key={item}>
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="section experience-section" id="experience">
          <div className="shell experience-layout">
            <div className="experience-intro">
              <p className="eyebrow">{t.experienceEyebrow}</p>
              <h2>{t.experienceTitle}</h2>
              <p>{t.experienceIntro}</p>
              <a
                className="text-link"
                href={profile.resume}
                target="_blank"
                rel="noreferrer"
              >
                {t.resumeAction}
                <Arrow />
              </a>
            </div>
            <div className="timeline">
              {t.timeline.map((item, index) => (
                <article className="timeline-item" key={item.period}>
                  <span
                    className={`timeline-dot timeline-dot-${index + 1}`}
                    aria-hidden="true"
                  />
                  <div className="timeline-period">{item.period}</div>
                  <div>
                    <h3>{item.role}</h3>
                    <p>{item.body}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="contact-section" id="contact">
          <div className="shell contact-grid">
            <div>
              <p className="eyebrow">{t.contactEyebrow}</p>
              <h2>{t.contactTitle}</h2>
            </div>
            <div className="contact-copy">
              <p>{t.contactBody}</p>
              <div className="contact-links">
                <a href={`mailto:${profile.email}`}>
                  {t.emailAction}
                  <span>{profile.email}</span>
                </a>
                <a
                  href={profile.telegram}
                  target="_blank"
                  rel="noreferrer"
                >
                  {t.telegramAction}
                  <span>@FullMetall_EGGS</span>
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter locale={locale} />
    </>
  );
}
