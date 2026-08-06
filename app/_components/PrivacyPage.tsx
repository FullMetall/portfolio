"use client";

import Link from "next/link";
import type { Locale } from "../content";
import { profile } from "../content";
import { AnalyticsSettingsButton } from "./AnalyticsSettingsButton";
import { ExternalArrowIcon } from "./ExternalArrowIcon";
import { usePortfolioTheme } from "./PortfolioThemeProvider";
import { ThemeToggle } from "./ThemeToggle";

const privacyCopy = {
  ru: {
    title: "Политика конфиденциальности",
    description: "Как fullmetall.ru использует Яндекс Метрику и хранит выбор посетителя.",
    updated: "Обновлено 7 августа 2026 года",
    home: "/",
    homeLabel: "Вернуться к портфолио",
    languageHref: "/en/privacy",
    language: "EN",
    languageLabel: "Open the English version",
    navigationLabel: "Навигация политики конфиденциальности",
    sections: [
      [
        "Кто отвечает за сайт",
        <>Владелец fullmetall.ru — Даниил Угловский. По вопросам конфиденциальности можно написать на <a href={`mailto:${profile.email}`}>{profile.email}</a>.</>,
      ],
      [
        "Что происходит без согласия",
        <>На сайте нет регистрации, личного кабинета и формы отправки данных. До твоего согласия код Яндекс Метрики не загружается и аналитические данные с сайта не отправляются.</>,
      ],
      [
        "Какие данные обрабатывает Метрика",
        <>После согласия Яндекс Метрика может получать URL и источник перехода, сведения о браузере, устройстве и операционной системе, примерное местоположение, IP-адрес, действия на страницах и анонимные идентификаторы в cookie и localStorage.</>,
      ],
      [
        "Зачем нужна аналитика",
        <>Статистика используется, чтобы понимать источники посещений, востребованность страниц и переходы к контактам. Идентифицирующие данные посетителей намеренно не передаются в параметры Метрики.</>,
      ],
      [
        "Где хранятся данные",
        <>Отчёты Метрики хранятся и обрабатываются Яндексом по его условиям. Метрика может хранить свои идентификаторы в браузере после согласия. Сам fullmetall.ru отдельно сохраняет выбор аналитики и тему оформления.</>,
      ],
      [
        "Как изменить выбор",
        <>Открой «Настройки аналитики» ниже или в футере любой страницы. При запрете счётчик не будет загружаться при следующих посещениях.</>,
      ],
    ],
    settings: "Настройки аналитики",
    yandexPolicy: "Документы Яндекс Метрики",
    yandexPolicyHref: "https://yandex.ru/legal/metrica_termsofuse/ru",
    footerIdentity: "Даниил Угловский · веб-системы",
    footerLabel: "Ссылки в футере",
    privacy: "Конфиденциальность",
    top: "Наверх ↑",
  },
  en: {
    title: "Privacy policy",
    description: "How fullmetall.ru uses Yandex Metrica and stores a visitor's choice.",
    updated: "Updated on August 7, 2026",
    home: "/en",
    homeLabel: "Back to portfolio",
    languageHref: "/privacy",
    language: "RU",
    languageLabel: "Открыть русскую версию",
    navigationLabel: "Privacy policy navigation",
    sections: [
      [
        "Who is responsible for the site",
        <>fullmetall.ru is operated by Daniil Uglovskiy. For privacy questions, email <a href={`mailto:${profile.email}`}>{profile.email}</a>.</>,
      ],
      [
        "What happens without consent",
        <>The site has no registration, account area, or data submission form. Until you consent, the Yandex Metrica code is not loaded and analytics data is not sent from the site.</>,
      ],
      [
        "What Metrica processes",
        <>After consent, Yandex Metrica may receive page URLs and referrers, browser, device and operating-system details, approximate location, IP address, page interactions, and anonymous identifiers stored in cookies and localStorage.</>,
      ],
      [
        "Why analytics is used",
        <>Statistics help assess traffic sources, useful pages, and contact-link transitions. Identifying visitor data is intentionally not sent through Metrica parameters.</>,
      ],
      [
        "Where data is stored",
        <>Metrica reports are stored and processed by Yandex under its terms. After consent, Metrica may store its own identifiers in the browser. fullmetall.ru separately stores the analytics choice and display theme.</>,
      ],
      [
        "How to change your choice",
        <>Open “Analytics settings” below or in the footer of any page. If analytics is declined, the counter will not load on later visits.</>,
      ],
    ],
    settings: "Analytics settings",
    yandexPolicy: "Yandex Metrica documents",
    yandexPolicyHref: "https://yandex.com/legal/metrica_termsofuse/en/",
    footerIdentity: "Daniil Uglovskiy · web systems",
    footerLabel: "Footer links",
    privacy: "Privacy",
    top: "Back to top ↑",
  },
} as const;

export function PrivacyPage({ locale }: { locale: Locale }) {
  const t = privacyCopy[locale];
  const { theme, toggleTheme } = usePortfolioTheme();

  return (
    <main className="portfolio portfolio-workflow portfolio-privacy" data-theme={theme} id="top" lang={locale}>
      <header className="portfolio-nav">
        <Link href={t.home} aria-label={t.homeLabel}>
          <span className="portfolio-mark">DU</span>
          <span>{t.homeLabel}</span>
        </Link>
        <nav aria-label={t.navigationLabel}>
          <a href="#policy">{t.privacy}</a>
          <a href="#analytics-settings">{t.settings}</a>
        </nav>
        <div className="portfolio-nav-meta">
          <Link className="portfolio-language-switch" href={t.languageHref} aria-label={t.languageLabel}>
            {t.language}
          </Link>
          <ThemeToggle theme={theme} onToggle={toggleTheme} locale={locale} />
        </div>
      </header>

      <article className="portfolio-privacy-content" id="policy">
        <header>
          <span className="portfolio-kicker">fullmetall.ru · privacy</span>
          <h1>{t.title}</h1>
          <p>{t.description}</p>
          <small>{t.updated}</small>
        </header>

        <div className="portfolio-privacy-sections">
          {t.sections.map(([title, body], index) => (
            <section key={title}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div>
                <h2>{title}</h2>
                <p>{body}</p>
              </div>
            </section>
          ))}
        </div>

        <div className="portfolio-privacy-actions" id="analytics-settings">
          <AnalyticsSettingsButton label={t.settings} />
          <a href={t.yandexPolicyHref} target="_blank" rel="noreferrer">
            {t.yandexPolicy}<ExternalArrowIcon />
          </a>
        </div>
      </article>

      <footer className="portfolio-footer">
        <div className="portfolio-footer-inner">
          <span>{t.footerIdentity}</span>
          <nav aria-label={t.footerLabel}>
            <Link href={locale === "en" ? "/en/privacy" : "/privacy"}>{t.privacy}</Link>
            <AnalyticsSettingsButton label={t.settings} />
            <a href="#top">{t.top}</a>
          </nav>
        </div>
      </footer>
    </main>
  );
}
