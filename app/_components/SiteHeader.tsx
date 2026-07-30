import Link from "next/link";
import type { Locale } from "../content";
import { copy, profile } from "../content";

export function SiteHeader({
  locale,
  section = "home",
}: {
  locale: Locale;
  section?: "home" | "case" | "privacy";
}) {
  const t = copy[locale];
  const home = locale === "ru" ? "/" : "/en";
  const languageHref =
    section === "case"
      ? locale === "ru"
        ? "/en/projects/lift-automation"
        : "/projects/lift-automation"
      : section === "privacy"
        ? locale === "ru"
          ? "/en/privacy"
          : "/privacy"
        : locale === "ru"
          ? "/en"
          : "/";

  return (
    <header className="site-header">
      <div className="shell header-inner">
        <Link
          className="wordmark"
          href={home}
          aria-label={`${profile.name[locale]} — home`}
        >
          <span className="wordmark-mark" aria-hidden="true">
            DU
          </span>
          <span>{profile.name[locale]}</span>
        </Link>
        <nav
          className="desktop-nav"
          aria-label={locale === "ru" ? "Основная навигация" : "Main navigation"}
        >
          <Link href={`${home}#project`}>{t.nav.work}</Link>
          <Link href={`${home}#expertise`}>{t.nav.expertise}</Link>
          <Link href={`${home}#experience`}>{t.nav.experience}</Link>
          <Link href={`${home}#contact`}>{t.nav.contact}</Link>
        </nav>
        <Link
          className="language-switch"
          href={languageHref}
          aria-label={t.nav.languageLabel}
        >
          {t.nav.language}
        </Link>
      </div>
    </header>
  );
}
