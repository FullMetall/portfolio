import Link from "next/link";
import type { Locale } from "../content";
import { copy, profile } from "../content";

export function SiteFooter({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const privacyHref = locale === "ru" ? "/privacy" : "/en/privacy";

  return (
    <footer>
      <div className="shell footer-inner">
        <span>
          © {new Date().getFullYear()} {profile.name[locale]}
        </span>
        <span>{t.footer}</span>
        <Link href={privacyHref}>{t.privacy}</Link>
      </div>
    </footer>
  );
}
