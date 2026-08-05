import type { Locale } from "../content";
import { copy, profile } from "../content";

export function SiteFooter({ locale }: { locale: Locale }) {
  const t = copy[locale];

  return (
    <footer>
      <div className="shell footer-inner">
        <span>
          © {new Date().getFullYear()} {profile.name[locale]}
        </span>
        <span>{t.footer}</span>
      </div>
    </footer>
  );
}
