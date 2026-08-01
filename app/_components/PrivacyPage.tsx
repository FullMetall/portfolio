import Link from "next/link";
import type { Locale } from "../content";
import { profile } from "../content";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";

const privacyCopy = {
  ru: {
    back: "На главную",
    eyebrow: "Служебная страница",
    title: "Конфиденциальность",
    updated: "Обновлено 30 июля 2026 года",
    intro:
      "Этот сайт устроен так, чтобы собирать минимум данных. На нём нет регистрации, личного кабинета и контактных форм.",
    sections: [
      [
        "Какие данные обрабатываются",
        "При открытии сайта сервер может временно обрабатывать стандартные технические данные: IP-адрес, тип браузера, время запроса и запрошенную страницу. Если вы сами пишете по электронной почте или в Telegram, обрабатываются сведения, которые вы добровольно указали в сообщении.",
      ],
      [
        "Для чего это нужно",
        "Технические данные используются для безопасной и стабильной работы сайта. Данные из личной переписки нужны только для ответа, обсуждения работы и последующей коммуникации по вашему запросу.",
      ],
      [
        "Яндекс Метрика",
        "Счётчик Яндекс Метрики подключается только после вашего согласия, если аналитика активирована на сайте. Он помогает понять посещаемость и улучшить страницы. Вебвизор по умолчанию не используется. Вы можете отказаться от аналитики в уведомлении на сайте.",
      ],
      [
        "Передача и хранение",
        "Данные не продаются и не передаются третьим лицам для самостоятельной рекламы. Технические поставщики хостинга, электронной почты, Telegram и аналитики обрабатывают данные по своим правилам. Переписка хранится не дольше, чем это необходимо для ответа и рабочих договорённостей.",
      ],
      [
        "Ваши права",
        "Вы можете запросить сведения об обработке, уточнение или удаление данных, написав на адрес ниже. Если обработка основана на согласии, его можно отозвать.",
      ],
    ],
    contact: "Запросы по конфиденциальности",
  },
  en: {
    back: "Back home",
    eyebrow: "Site information",
    title: "Privacy",
    updated: "Updated July 30, 2026",
    intro:
      "This site is designed to collect as little data as possible. It has no registration, account area, or contact forms.",
    sections: [
      [
        "Data processed",
        "When you open the site, the server may temporarily process standard technical data such as IP address, browser type, request time, and requested page. If you contact me by email or Telegram, the information you voluntarily include in the message is processed.",
      ],
      [
        "Why it is needed",
        "Technical data supports secure and stable site operation. Personal correspondence is used only to answer, discuss work, and continue communication related to your request.",
      ],
      [
        "Yandex Metrica",
        "Yandex Metrica loads only after your consent if analytics is enabled. It helps understand traffic and improve the pages. Session replay is disabled by default. You can decline analytics in the site notice.",
      ],
      [
        "Sharing and retention",
        "Data is not sold or shared with third parties for their own advertising. Hosting, email, Telegram, and analytics providers process data under their own policies. Correspondence is retained only as long as needed for a response and working arrangements.",
      ],
      [
        "Your rights",
        "You may request information, correction, or deletion of your data by writing to the address below. Where processing is based on consent, you may withdraw it.",
      ],
    ],
    contact: "Privacy requests",
  },
} as const;

export function PrivacyPage({ locale }: { locale: Locale }) {
  const t = privacyCopy[locale];
  const home = locale === "ru" ? "/" : "/en";

  return (
    <>
      <SiteHeader locale={locale} section="privacy" />
      <main className="privacy-page">
        <div className="shell privacy-layout">
          <aside>
            <Link className="back-link" href={home}>
              ← {t.back}
            </Link>
            <p className="eyebrow">{t.eyebrow}</p>
            <h1>{t.title}</h1>
            <p className="privacy-updated">{t.updated}</p>
          </aside>
          <article>
            <p className="privacy-intro">{t.intro}</p>
            {t.sections.map(([title, body]) => (
              <section key={title}>
                <h2>{title}</h2>
                <p>{body}</p>
              </section>
            ))}
            <section className="privacy-contact">
              <h2>{t.contact}</h2>
              <a href={`mailto:${profile.email}`}>{profile.email}</a>
            </section>
          </article>
        </div>
      </main>
      <SiteFooter locale={locale} />
    </>
  );
}
