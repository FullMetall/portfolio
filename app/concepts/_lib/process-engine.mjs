/**
 * @typedef {"duplicate-input" | "manual-transfer" | "approval-wait" | "multi-source-document" | "external-status" | "journal-copy" | "missing-owner"} ProcessFlag
 * @typedef {"input" | "work" | "approval" | "document" | "registry" | "result"} StepKind
 * @typedef {{ type: ProcessFlag, action: string, status: "proposed" }} ProcessRemediation
 * @typedef {{ id: string, title: string, role: string, kind: StepKind, flags: ProcessFlag[], proposed?: boolean, remediations?: ProcessRemediation[] }} ProcessStep
 */

const bottleneckCopy = {
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

/**
 * @param {ProcessStep[]} steps
 */
export function analyzeProcess(steps) {
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
 * @returns {ProcessStep[]}
 */
export function createProposedProcess(steps) {
  return steps.map((step, index) => {
    const remediations = step.flags.map((type) => ({
      type,
      action: remediationByFlag[type].action,
      status: /** @type {const} */ ("proposed"),
    }));

    return {
      ...step,
      title:
        step.flags.includes("journal-copy")
          ? "Предложение: обновлять единый реестр автоматически"
          : step.flags.includes("multi-source-document")
            ? "Предложение: собирать документ по шаблону"
            : step.flags.includes("approval-wait")
              ? `Предложение: ${step.title.toLowerCase()} по уведомлению`
              : index === 0 && step.flags.includes("manual-transfer")
                ? `Предложение: ${step.title.toLowerCase()} автоматически`
                : step.title,
      role: step.flags.includes("missing-owner")
        ? "Владелец процесса (предложение)"
        : step.role,
      flags: [...step.flags],
      remediations,
      proposed: true,
    };
  });
}
