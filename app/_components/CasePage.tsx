import Link from "next/link";
import type { Locale } from "../content";
import { profile } from "../content";
import { CaseGallery } from "./CaseGallery";
import { EditorialLiftCase } from "./EditorialLiftCase";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";

const caseCopy = {
  ru: {
    back: "На главную",
    eyebrow: "Кейс · автоматизация процессов",
    title: "Комплект документов — за 9 минут.",
    lead: "Веб-система для процесса технического освидетельствования лифтов в испытательной лаборатории.",
    meta: [
      ["Срок", "3 месяца"],
      ["Команда", "1 человек"],
      ["Статус", "В эксплуатации"],
    ],
    metrics: [
      ["60 → 9 мин", "время подготовки одного комплекта"],
      ["2 400", "освидетельствований и комплектов в год"],
      ["4 процесса", "переведены из ручного режима"],
    ],
    contextLabel: "Контекст",
    contextTitle: "Ручной процесс вместо единой системы.",
    contextBody:
      "Для каждого освидетельствования требовалось вручную вести журнал, контролировать средства измерений и собирать акт с протоколом. Повторный ввод одних и тех же данных занимал около часа и создавал риск опечаток и расхождений внутри одного комплекта.",
    before: "До системы",
    beforeItems: [
      "данные переносились между несколькими документами",
      "журнал и средства измерений учитывались вручную",
      "акт и протокол формировались отдельно",
      "один комплект занимал около 60 минут",
    ],
    after: "После запуска",
    afterItems: [
      "один источник данных для всего комплекта",
      "журнал и средства измерений встроены в процесс",
      "акт и протокол генерируются системой",
      "готовый комплект формируется за 9 минут",
    ],
    systemLabel: "Решение",
    systemTitle: "Один контур для всей работы.",
    systemBody:
      "Система ведёт пользователя от исходных данных и результатов проверки до готового комплекта. Связанные поля используются повторно, поэтому акт, протокол и журнал не расходятся между собой.",
    modules: [
      [
        "01",
        "Освидетельствование",
        "Структурированный ввод результатов и проверка обязательных данных.",
      ],
      [
        "02",
        "Документы",
        "Автоматическая генерация акта и протокола из единой модели.",
      ],
      [
        "03",
        "Журнал",
        "Фиксация выполненных работ без повторного ручного заполнения.",
      ],
      [
        "04",
        "Средства измерений",
        "Учёт приборов и их использование в конкретном освидетельствовании.",
      ],
    ],
    galleryLabel: "Интерфейс",
    galleryTitle: "Рабочие экраны системы.",
    galleryBody:
      "Десктопные и мобильные сценарии одного процесса. Производственные данные на изображениях заменены демонстрационными.",
    galleryPrevious: "Предыдущий экран",
    galleryNext: "Следующий экран",
    galleryOpen: "Открыть в полном размере",
    gallery: [
      {
        src: "/case/lift-diagnostics-desktop.png",
        alt: "Список диагностик лифтов в десктопной версии системы",
        caption: "Реестр диагностик и статусы документов",
        width: 1672,
        height: 941,
      },
      {
        src: "/case/lift-diagnostics-mobile.png",
        alt: "Мобильный чек-лист функциональных испытаний",
        caption: "Полевой чек-лист функциональных испытаний",
        width: 964,
        height: 1631,
      },
      {
        src: "/case/lift-insulation-mobile.png",
        alt: "Мобильная форма измерения сопротивления изоляции",
        caption: "Ввод результатов измерений на объекте",
        width: 963,
        height: 1633,
      },
      {
        src: "/case/lift-document-journal.png",
        alt: "Журнал освидетельствований и сформированных документов",
        caption: "Журнал и единый статус комплекта документов",
        width: 1672,
        height: 940,
      },
    ],
    roleLabel: "Моя работа",
    roleTitle: "Один разработчик. Полный цикл.",
    roleBody:
      "Я собрал и интерпретировал исходные документы, разобрал реальный рабочий процесс, спроектировал его модель и самостоятельно реализовал продукт. В зону ответственности вошли требования, UX/UI, архитектура, интерфейсы, серверная логика, база данных, генерация документов, тестирование, запуск и развитие системы в эксплуатации.",
    stackLabel: "Технологии",
    stack: [
      "React",
      "TypeScript",
      "Python",
      "FastAPI",
      "PostgreSQL",
      "PWA",
      "DOCX generation",
      "Automated tests",
    ],
    resultLabel: "Результат",
    resultTitle: "−85% времени на подготовку комплекта.",
    resultBody:
      "Время подготовки комплекта сократилось на 85%. Ручное ведение журнала, учёт средств измерений и отдельная сборка акта с протоколом перенесены в систему. Опечатки и различающиеся данные внутри одного комплекта устранены.",
    confidentiality:
      "Название лаборатории и производственные данные не раскрываются. Показатели опубликованы с разрешения владельца процесса.",
    contactTitle: "Нужно автоматизировать похожий процесс?",
    contactBody:
      "Обсудим исходные данные, узкие места и реалистичный первый этап продукта.",
    email: "Написать на почту",
    telegram: "Обсудить в Telegram",
  },
  en: {
    back: "Back home",
    eyebrow: "Case study · process automation",
    title: "Reducing document-set preparation from one hour to 9 minutes.",
    lead: "A web system for the lift inspection workflow in a testing laboratory.",
    meta: [
      ["Timeline", "3 months"],
      ["Team", "1 person"],
      ["Status", "In operation"],
    ],
    metrics: [
      ["60 → 9 min", "to prepare one document set"],
      ["2,400", "inspections and document sets per year"],
      ["4 processes", "moved out of manual work"],
    ],
    contextLabel: "Context",
    contextTitle:
      "The problem was not one document, but the entire connected workflow.",
    contextBody:
      "Each inspection required manual journal entries, measuring equipment records, and separate preparation of an act and protocol. Re-entering the same data took about an hour and introduced typos and inconsistencies within a document set.",
    before: "Before",
    beforeItems: [
      "data was copied across several documents",
      "journal and equipment records were maintained manually",
      "acts and protocols were prepared separately",
      "one set took about 60 minutes",
    ],
    after: "After launch",
    afterItems: [
      "one source of data for the whole set",
      "journal and equipment records are built into the flow",
      "acts and protocols are generated by the system",
      "a complete set is ready in 9 minutes",
    ],
    systemLabel: "Solution",
    systemTitle:
      "One operating environment instead of disconnected manual steps.",
    systemBody:
      "The system leads the user from source data and inspection results to a finished set. Related fields are reused, keeping the act, protocol, and journal consistent.",
    modules: [
      [
        "01",
        "Inspection",
        "Structured result entry and required-data validation.",
      ],
      [
        "02",
        "Documents",
        "Automatic act and protocol generation from one data model.",
      ],
      [
        "03",
        "Journal",
        "Completed work recorded without repeated manual entry.",
      ],
      [
        "04",
        "Equipment",
        "Measuring instrument records linked to each inspection.",
      ],
    ],
    galleryLabel: "Interface",
    galleryTitle: "The system in everyday use.",
    galleryBody:
      "Desktop and mobile scenarios within one workflow. Operational data in the images has been replaced with demonstration values.",
    galleryPrevious: "Previous screen",
    galleryNext: "Next screen",
    galleryOpen: "Open full-size image",
    gallery: [
      {
        src: "/case/lift-diagnostics-desktop.png",
        alt: "Lift diagnostics list in the desktop system",
        caption: "Diagnostics register and document statuses",
        width: 1672,
        height: 941,
      },
      {
        src: "/case/lift-diagnostics-mobile.png",
        alt: "Mobile functional inspection checklist",
        caption: "On-site functional inspection checklist",
        width: 964,
        height: 1631,
      },
      {
        src: "/case/lift-insulation-mobile.png",
        alt: "Mobile insulation resistance measurement form",
        caption: "Entering measurements on site",
        width: 963,
        height: 1633,
      },
      {
        src: "/case/lift-document-journal.png",
        alt: "Inspection and generated-document journal",
        caption: "Journal and unified document-set status",
        width: 1672,
        height: 940,
      },
    ],
    roleLabel: "My work",
    roleTitle: "Led the product through the full development cycle alone.",
    roleBody:
      "I collected and interpreted the source documents, mapped the real workflow, designed its model, and built the product independently. My scope covered requirements, UX/UI, architecture, interfaces, backend logic, the database, document generation, testing, launch, and continued development in operation.",
    stackLabel: "Technology",
    stack: [
      "React",
      "TypeScript",
      "Python",
      "FastAPI",
      "PostgreSQL",
      "PWA",
      "DOCX generation",
      "Automated tests",
    ],
    resultLabel: "Result",
    resultTitle: "Less manual work, faster output, consistent data.",
    resultBody:
      "Preparation time fell by 85%. Manual journal management, measuring equipment records, and separate act and protocol assembly moved into the system. Typos and inconsistent data within a set were eliminated.",
    confidentiality:
      "The laboratory name and operational data remain confidential. The published metrics are approved by the process owner.",
    contactTitle: "Have a similar process to automate?",
    contactBody:
      "Let’s discuss the source data, bottlenecks, and a realistic first product stage.",
    email: "Send an email",
    telegram: "Discuss on Telegram",
  },
} as const;

export type RussianCaseCopy = typeof caseCopy.ru;

export function CasePage({ locale }: { locale: Locale }) {
  const t = caseCopy[locale];
  const home = locale === "ru" ? "/" : "/en";

  if (locale === "ru") return <EditorialLiftCase copy={caseCopy.ru} />;

  return (
    <>
      <SiteHeader locale={locale} section="case" />
      <main className="case-page">
        <section className="case-hero">
          <div className="shell">
            <Link className="back-link" href={home}>
              ← {t.back}
            </Link>
            <p className="eyebrow">{t.eyebrow}</p>
            <h1>{t.title}</h1>
            <p className="case-lead">{t.lead}</p>
            <dl className="case-meta">
              {t.meta.map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
            <div className="case-metrics">
              {t.metrics.map(([value, label], index) => (
                <div
                  className={`case-metric case-metric-${index + 1}`}
                  key={label}
                >
                  <strong>{value}</strong>
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="case-section">
          <div className="shell case-two-column">
            <div>
              <p className="eyebrow">{t.contextLabel}</p>
              <h2>{t.contextTitle}</h2>
            </div>
            <p className="case-body">{t.contextBody}</p>
          </div>
          <div className="shell compare-grid">
            <article className="compare-card compare-before">
              <span className="compare-title">{t.before}</span>
              <ul>
                {t.beforeItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
            <article className="compare-card compare-after">
              <span className="compare-title">{t.after}</span>
              <ul>
                {t.afterItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          </div>
        </section>

        <section className="case-section case-system">
          <div className="shell">
            <div className="case-two-column">
              <div>
                <p className="eyebrow">{t.systemLabel}</p>
                <h2>{t.systemTitle}</h2>
              </div>
              <p className="case-body">{t.systemBody}</p>
            </div>
            <div className="module-grid">
              {t.modules.map(([number, title, body], index) => (
                <article
                  className={`module-card module-card-${index + 1}`}
                  key={number}
                >
                  <span>{number}</span>
                  <h3>{title}</h3>
                  <p>{body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="case-section case-gallery-section">
          <div className="shell">
            <div className="case-two-column">
              <div>
                <p className="eyebrow">{t.galleryLabel}</p>
                <h2>{t.galleryTitle}</h2>
              </div>
              <p className="case-body">{t.galleryBody}</p>
            </div>
            <CaseGallery
              items={t.gallery}
              label={t.galleryTitle}
              previousLabel={t.galleryPrevious}
              nextLabel={t.galleryNext}
              openLabel={t.galleryOpen}
            />
          </div>
        </section>

        <section className="case-section">
          <div className="shell role-grid">
            <div className="role-copy">
              <p className="eyebrow">{t.roleLabel}</p>
              <h2>{t.roleTitle}</h2>
              <p className="case-body">{t.roleBody}</p>
            </div>
            <aside className="stack-panel">
              <span className="micro-label">{t.stackLabel}</span>
              {t.stack.map((item, index) => (
                <div key={item}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  {item}
                </div>
              ))}
            </aside>
          </div>
        </section>

        <section className="case-result">
          <div className="shell case-two-column">
            <div>
              <p className="eyebrow">{t.resultLabel}</p>
              <h2>{t.resultTitle}</h2>
            </div>
            <div>
              <p className="case-body">{t.resultBody}</p>
              <p className="confidentiality-note">{t.confidentiality}</p>
            </div>
          </div>
        </section>

        <section className="contact-section">
          <div className="shell contact-grid">
            <h2>{t.contactTitle}</h2>
            <div className="contact-copy">
              <p>{t.contactBody}</p>
              <div className="button-row">
                <a
                  className="button button-primary"
                  href={`mailto:${profile.email}`}
                >
                  {t.email}
                  <span aria-hidden="true">↗</span>
                </a>
                <a
                  className="button button-secondary button-on-dark"
                  href={profile.telegram}
                  target="_blank"
                  rel="noreferrer"
                >
                  {t.telegram}
                  <span aria-hidden="true">↗</span>
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
