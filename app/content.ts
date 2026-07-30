export type Locale = "ru" | "en";

export const profile = {
  name: {
    ru: "Даниил Угловский",
    en: "Daniil Uglovskiy",
  },
  email: "daniil@fullmetall.ru",
  telegram: "https://t.me/FullMetall_EGGS",
  resume:
    "https://syktyvkar.hh.ru/resume/ac74a2a5ff0bd171c30039ed1f5a5838647357",
};

export const copy = {
  ru: {
    nav: {
      work: "Проект",
      expertise: "Компетенции",
      experience: "Опыт",
      contact: "Контакты",
      language: "EN",
      languageLabel: "Открыть английскую версию",
    },
    availability: "Открыт к постоянной и проектной работе",
    eyebrow: "Разработчик веб-систем",
    heroTitle: "Превращаю сложные процессы в понятные цифровые продукты.",
    heroBody:
      "Проектирую и создаю прикладные веб-системы — от модели процесса и интерфейса до серверной логики, документов и запуска.",
    primaryAction: "Смотреть проект",
    secondaryAction: "Написать в Telegram",
    facts: [
      ["12 лет", "в веб-разработке"],
      ["60 → 7 мин", "подготовка комплекта документов"],
      ["2 400", "комплектов в рабочем процессе за год"],
    ],
    flowTitle: "От процесса к работающей системе",
    flowSteps: ["Процесс", "Модель", "Интерфейс", "Логика", "Документы", "Продукт"],
    projectEyebrow: "Ключевой проект · автоматизация",
    projectTitle: "Веб-система для испытательной лаборатории",
    projectLead:
      "Продукт объединяет данные освидетельствования, учёт средств измерений и выпуск документов в одном рабочем контуре.",
    projectMetrics: [
      ["7 минут", "вместо часа на комплект"],
      ["−88%", "времени на подготовку"],
      ["4 процесса", "переведены из ручного режима"],
    ],
    projectFeatures: [
      "единые данные для акта и протокола",
      "автоматическое ведение журнала",
      "учёт средств измерений",
      "устранение расхождений внутри комплекта",
    ],
    caseAction: "Разобрать кейс",
    expertiseEyebrow: "Что я делаю",
    expertiseTitle: "Разработка, которая начинается с понимания работы.",
    expertise: [
      {
        number: "01",
        title: "Проектирую систему",
        body: "Разбираю реальный процесс, роли, исключения и данные. Перевожу их в понятную модель продукта.",
      },
      {
        number: "02",
        title: "Разрабатываю веб-продукт",
        body: "Собираю интерфейс, серверную логику, хранение данных, генерацию документов и интеграции.",
      },
      {
        number: "03",
        title: "Довожу до эксплуатации",
        body: "Проверяю критические сценарии, организую запуск и улучшаю систему по обратной связи пользователей.",
      },
    ],
    stackLabel: "Рабочий стек",
    stack: ["React", "TypeScript", "Python", "FastAPI", "PostgreSQL", "PWA", "Git"],
    experienceEyebrow: "Профессиональный путь",
    experienceTitle: "В веб-разработке с 2014 года.",
    experienceIntro:
      "Начал с разработки и поддержки сайтов, вырос до создания прикладных систем и технического руководства.",
    timeline: [
      {
        period: "2021 — сейчас",
        role: "Руководитель отдела веб-разработки",
        body: "Планирование и распределение работы, технические задания, развитие веб-продуктов. Команда — до 10 специалистов.",
      },
      {
        period: "2016 — 2021",
        role: "Frontend-разработчик",
        body: "Интерфейсы сайтов, порталов и цифровых сервисов для организаций государственного сектора.",
      },
      {
        period: "2014 — 2016",
        role: "Веб-программист",
        body: "Разработка, поддержка и наполнение сайтов, работа с 1С-Битрикс.",
      },
    ],
    resumeAction: "Резюме на hh.ru",
    contactEyebrow: "Контакты",
    contactTitle: "Обсудим систему, которая снимет ручную работу?",
    contactBody:
      "Рассматриваю постоянную работу и отдельные проекты. Быстрее всего отвечаю в Telegram, для подробного разговора можно написать на почту.",
    emailAction: "Написать на почту",
    telegramAction: "Открыть Telegram",
    footer: "Разработка веб-систем · автоматизация процессов",
    privacy: "Конфиденциальность",
  },
  en: {
    nav: {
      work: "Project",
      expertise: "Expertise",
      experience: "Experience",
      contact: "Contact",
      language: "RU",
      languageLabel: "Open Russian version",
    },
    availability: "Open to full-time and project work",
    eyebrow: "Web systems developer",
    heroTitle: "I turn complex processes into clear digital products.",
    heroBody:
      "I design and build applied web systems — from process modelling and interfaces to backend logic, documents, and launch.",
    primaryAction: "View project",
    secondaryAction: "Message on Telegram",
    facts: [
      ["12 years", "in web development"],
      ["60 → 7 min", "to prepare a document set"],
      ["2,400", "document sets in the annual workflow"],
    ],
    flowTitle: "From a process to a working system",
    flowSteps: ["Process", "Model", "Interface", "Logic", "Documents", "Product"],
    projectEyebrow: "Flagship project · automation",
    projectTitle: "Web system for a testing laboratory",
    projectLead:
      "The product brings inspection data, measuring equipment records, and document generation into one workflow.",
    projectMetrics: [
      ["7 minutes", "instead of one hour per set"],
      ["−88%", "preparation time"],
      ["4 processes", "moved out of manual work"],
    ],
    projectFeatures: [
      "one source of data for acts and protocols",
      "automatic journal management",
      "measuring equipment records",
      "no discrepancies within a document set",
    ],
    caseAction: "Explore the case",
    expertiseEyebrow: "What I do",
    expertiseTitle: "Development that starts with understanding the work.",
    expertise: [
      {
        number: "01",
        title: "Design the system",
        body: "I map the real process, roles, exceptions, and data, then turn them into a clear product model.",
      },
      {
        number: "02",
        title: "Build the web product",
        body: "I connect the interface, backend logic, data storage, document generation, and integrations.",
      },
      {
        number: "03",
        title: "Bring it into operation",
        body: "I verify critical scenarios, organize launch, and improve the system with user feedback.",
      },
    ],
    stackLabel: "Working stack",
    stack: ["React", "TypeScript", "Python", "FastAPI", "PostgreSQL", "PWA", "Git"],
    experienceEyebrow: "Career",
    experienceTitle: "In web development since 2014.",
    experienceIntro:
      "I started with website development and support, then moved into applied systems and technical leadership.",
    timeline: [
      {
        period: "2021 — present",
        role: "Head of web development",
        body: "Planning and work distribution, technical requirements, and web product development. Team of up to 10 specialists.",
      },
      {
        period: "2016 — 2021",
        role: "Frontend developer",
        body: "Interfaces for websites, portals, and digital services in the public sector.",
      },
      {
        period: "2014 — 2016",
        role: "Web developer",
        body: "Website development, support, content, and 1C-Bitrix.",
      },
    ],
    resumeAction: "Resume on hh.ru",
    contactEyebrow: "Contact",
    contactTitle: "Shall we discuss a system that removes manual work?",
    contactBody:
      "I am open to full-time roles and individual projects. Telegram is the fastest way to reach me; email works best for a detailed brief.",
    emailAction: "Send an email",
    telegramAction: "Open Telegram",
    footer: "Web systems development · process automation",
    privacy: "Privacy",
  },
} as const;
