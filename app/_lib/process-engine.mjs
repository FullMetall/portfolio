/**
 * @typedef {"duplicate-input" | "manual-transfer" | "approval-wait" | "multi-source-document" | "external-status" | "journal-copy" | "missing-owner"} ProcessFlag
 * @typedef {"input" | "work" | "approval" | "document" | "registry" | "result"} StepKind
 * @typedef {{ type: ProcessFlag, action: string, status: "proposed" }} ProcessRemediation
 * @typedef {{ id: string, title: string, role: string, kind: StepKind, flags: ProcessFlag[], proposed?: boolean, remediations?: ProcessRemediation[] }} ProcessStep
 */

const bottleneckCopyByLocale = {
  ru: {
    "duplicate-input": {
      title: "Повторный ввод",
      detail: "Одни и те же данные приходится вводить на нескольких этапах.",
    },
    "manual-transfer": {
      title: "Ручная передача",
      detail: "Данные передаются между ролями вручную и могут потеряться или разойтись.",
    },
    "approval-wait": {
      title: "Ожидание подтверждения",
      detail: "Процесс останавливается, пока ответственный не подтвердит действие вручную.",
    },
    "multi-source-document": {
      title: "Несколько источников",
      detail: "Итоговый документ собирается вручную из разных источников.",
    },
    "external-status": {
      title: "Статус вне процесса",
      detail: "Текущий статус хранится отдельно и не даёт общей картины.",
    },
    "journal-copy": {
      title: "Дублирование в журнал",
      detail: "Результат повторно переносится в журнал или реестр.",
    },
    "missing-owner": {
      title: "Нет ответственного",
      detail: "У этапа не определена роль, отвечающая за результат.",
    },
  },
  en: {
    "duplicate-input": {
      title: "Duplicate input",
      detail: "The same data has to be entered at several stages.",
    },
    "manual-transfer": {
      title: "Manual transfer",
      detail: "Data is passed between roles manually and can be lost or become inconsistent.",
    },
    "approval-wait": {
      title: "Approval wait",
      detail: "The process stops until the responsible person confirms the action manually.",
    },
    "multi-source-document": {
      title: "Multiple sources",
      detail: "The final document is assembled manually from several sources.",
    },
    "external-status": {
      title: "External status",
      detail: "The current status is stored separately and provides no shared view.",
    },
    "journal-copy": {
      title: "Journal duplication",
      detail: "The result is copied into a journal or registry again.",
    },
    "missing-owner": {
      title: "Missing owner",
      detail: "No role is responsible for the outcome of this stage.",
    },
  },
};

/** @type {Record<ProcessFlag, { action: string }>} */
export const remediationByFlag = {
  "duplicate-input": { action: "Оставить один источник данных и переиспользовать его дальше" },
  "manual-transfer": { action: "Передавать данные между этапами внутри системы" },
  "approval-wait": { action: "Создать очередь согласования с уведомлением ответственного" },
  "multi-source-document": { action: "Собирать документ по шаблону из единой модели данных" },
  "external-status": { action: "Хранить статус внутри общего процесса" },
  "journal-copy": { action: "Обновлять реестр автоматически из результата процесса" },
  "missing-owner": { action: "Назначить владельца этапа" },
};

const remediationByFlagEn = {
  "duplicate-input": { action: "Keep one data source and reuse it in later stages" },
  "manual-transfer": { action: "Pass data between stages inside the system" },
  "approval-wait": { action: "Create an approval queue and notify the responsible person" },
  "multi-source-document": { action: "Generate the document from one data model and a template" },
  "external-status": { action: "Keep status inside the shared process" },
  "journal-copy": { action: "Update the registry automatically from the process result" },
  "missing-owner": { action: "Assign an owner to the stage" },
};

/** @type {Record<string, { label: string, description: string, steps: ProcessStep[] }>} */
export const processPresets = {
  documents: {
    label: "Обработка документов",
    description: "От входящего файла до согласованного комплекта.",
    steps: [
      { id: "doc-receive", title: "Получить документы", role: "Менеджер", kind: "input", flags: ["manual-transfer"] },
      { id: "doc-check", title: "Проверить данные", role: "Специалист", kind: "work", flags: ["duplicate-input"] },
      { id: "doc-compose", title: "Собрать комплект", role: "Специалист", kind: "document", flags: ["multi-source-document"] },
      { id: "doc-approve", title: "Согласовать", role: "Руководитель", kind: "approval", flags: ["approval-wait"] },
      { id: "doc-register", title: "Записать в журнал", role: "Менеджер", kind: "registry", flags: ["journal-copy", "external-status"] },
    ],
  },
  appeals: {
    label: "Работа с обращениями",
    description: "От регистрации запроса до ответа заявителю.",
    steps: [
      { id: "appeal-receive", title: "Принять обращение", role: "Приёмная", kind: "input", flags: ["manual-transfer"] },
      { id: "appeal-register", title: "Зарегистрировать", role: "Оператор", kind: "registry", flags: ["duplicate-input"] },
      { id: "appeal-assign", title: "Назначить исполнителя", role: "", kind: "work", flags: ["missing-owner", "external-status"] },
      { id: "appeal-answer", title: "Подготовить ответ", role: "Исполнитель", kind: "document", flags: ["multi-source-document"] },
      { id: "appeal-approve", title: "Согласовать ответ", role: "Руководитель", kind: "approval", flags: ["approval-wait"] },
    ],
  },
  approval: {
    label: "Согласование заявки",
    description: "От инициативы сотрудника до утверждённого решения.",
    steps: [
      { id: "approval-create", title: "Создать заявку", role: "Инициатор", kind: "input", flags: ["duplicate-input"] },
      { id: "approval-check", title: "Проверить комплектность", role: "Координатор", kind: "work", flags: ["manual-transfer"] },
      { id: "approval-review", title: "Рассмотреть", role: "Эксперт", kind: "approval", flags: ["approval-wait", "external-status"] },
      { id: "approval-sign", title: "Утвердить", role: "Руководитель", kind: "approval", flags: ["approval-wait"] },
      { id: "approval-notify", title: "Сообщить результат", role: "Координатор", kind: "result", flags: ["manual-transfer"] },
    ],
  },
  custom: {
    label: "Собрать свой процесс",
    description: "Начать с пустой цепочки и добавить собственные этапы.",
    steps: [],
  },
};

const processPresetsEn = {
  documents: {
    label: "Document processing",
    description: "From an incoming file to an approved document set.",
    steps: [
      { id: "doc-receive", title: "Receive documents", role: "Manager", kind: "input", flags: ["manual-transfer"] },
      { id: "doc-check", title: "Verify data", role: "Specialist", kind: "work", flags: ["duplicate-input"] },
      { id: "doc-compose", title: "Assemble the set", role: "Specialist", kind: "document", flags: ["multi-source-document"] },
      { id: "doc-approve", title: "Approve", role: "Supervisor", kind: "approval", flags: ["approval-wait"] },
      { id: "doc-register", title: "Update the journal", role: "Manager", kind: "registry", flags: ["journal-copy", "external-status"] },
    ],
  },
  appeals: {
    label: "Request handling",
    description: "From registering a request to sending the response.",
    steps: [
      { id: "appeal-receive", title: "Receive the request", role: "Front desk", kind: "input", flags: ["manual-transfer"] },
      { id: "appeal-register", title: "Register", role: "Operator", kind: "registry", flags: ["duplicate-input"] },
      { id: "appeal-assign", title: "Assign an owner", role: "", kind: "work", flags: ["missing-owner", "external-status"] },
      { id: "appeal-answer", title: "Prepare the response", role: "Assignee", kind: "document", flags: ["multi-source-document"] },
      { id: "appeal-approve", title: "Approve the response", role: "Supervisor", kind: "approval", flags: ["approval-wait"] },
    ],
  },
  approval: {
    label: "Request approval",
    description: "From an employee initiative to an approved decision.",
    steps: [
      { id: "approval-create", title: "Create a request", role: "Initiator", kind: "input", flags: ["duplicate-input"] },
      { id: "approval-check", title: "Check completeness", role: "Coordinator", kind: "work", flags: ["manual-transfer"] },
      { id: "approval-review", title: "Review", role: "Expert", kind: "approval", flags: ["approval-wait", "external-status"] },
      { id: "approval-sign", title: "Approve", role: "Supervisor", kind: "approval", flags: ["approval-wait"] },
      { id: "approval-notify", title: "Report the result", role: "Coordinator", kind: "result", flags: ["manual-transfer"] },
    ],
  },
  custom: {
    label: "Build your own process",
    description: "Start with an empty flow and add your own stages.",
    steps: [],
  },
};

export function getProcessPresets(locale = "ru") {
  return locale === "en" ? processPresetsEn : processPresets;
}

/**
 * @param {ProcessStep[]} steps
 * @param {"ru" | "en"} [locale]
 */
export function analyzeProcess(steps, locale = "ru") {
  const bottleneckCopy = bottleneckCopyByLocale[locale];
  return steps.flatMap((step) =>
    step.flags.map((type) => ({
      type,
      stepId: step.id,
      stepTitle: step.title,
      ...bottleneckCopy[type],
    })),
  );
}

/**
 * @param {ProcessStep[]} steps
 * @param {"ru" | "en"} [locale]
 * @returns {ProcessStep[]}
 */
export function createProposedProcess(steps, locale = "ru") {
  const remediationCopy = locale === "en" ? remediationByFlagEn : remediationByFlag;
  return steps.map((step, index) => {
    const remediations = step.flags.map((type) => ({
      type,
      action: remediationCopy[type].action,
      status: /** @type {const} */ ("proposed"),
    }));

    const title = locale === "en"
      ? step.flags.includes("journal-copy")
        ? "Proposal: update one registry automatically"
        : step.flags.includes("multi-source-document")
          ? "Proposal: generate the document from a template"
          : step.flags.includes("approval-wait")
            ? `Proposal: notify the owner to ${step.title.toLowerCase()}`
            : index === 0 && step.flags.includes("manual-transfer")
              ? `Proposal: ${step.title.toLowerCase()} automatically`
              : step.title
      : step.flags.includes("journal-copy")
        ? "Предложение: обновлять единый реестр автоматически"
        : step.flags.includes("multi-source-document")
          ? "Предложение: собирать документ по шаблону"
          : step.flags.includes("approval-wait")
            ? `Предложение: ${step.title.toLowerCase()} по уведомлению`
            : index === 0 && step.flags.includes("manual-transfer")
              ? `Предложение: ${step.title.toLowerCase()} автоматически`
              : step.title;

    return {
      ...step,
      title,
      role: step.flags.includes("missing-owner")
        ? locale === "en"
          ? "Process owner (proposal)"
          : "Владелец процесса (предложение)"
        : step.role,
      flags: [...step.flags],
      remediations,
      proposed: true,
    };
  });
}
