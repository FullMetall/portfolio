import Link from "next/link";

const concepts = [
  {
    href: "/concepts/editorial-product",
    number: "01",
    name: "Editorial Product",
    title: "Ручную работу — в систему.",
    type: "Oswald Variable + Golos Text",
    strength: "Авторская подача и плотная редакционная иерархия.",
    tradeoff: "Конструктор контрастирует с журнальной оболочкой.",
    className: "is-editorial",
  },
  {
    href: "/concepts/workflow-motif",
    number: "02",
    name: "Workflow Motif",
    title: "Сложный процесс. Понятная система.",
    type: "Unbounded Variable + Golos Text",
    strength: "Один мотив связывает историю, интерфейс и результат.",
    tradeoff: "Самый выразительный вариант требует строгого контроля анимации.",
    className: "is-workflow",
  },
  {
    href: "/concepts/product-studio",
    number: "03",
    name: "Product Studio",
    title: "Меньше рутины. Больше контроля.",
    type: "Source Serif 4 + Roboto Flex",
    strength: "Лучше всего показывает продуктовые состояния и инженерный подход.",
    tradeoff: "Исключён из дальнейшей проработки после сравнения.",
    className: "is-studio",
  },
  {
    href: "/concepts/editorial-workflow",
    number: "04",
    name: "Editorial Workflow",
    title: "Из ручного процесса — в рабочую систему.",
    type: "Oswald Variable + Golos Text",
    strength: "Редакционная иерархия, тёмная палитра и одна сквозная process rail.",
    tradeoff: "Нужно оценить, не перетягивает ли rail внимание с содержания.",
    className: "is-editorial-workflow",
  },
];

export default function ConceptsIndexPage() {
  return (
    <main className="concept-index">
      <header className="concept-index-head">
        <div>
          <span>Локальное сравнение · не для production</span>
          <h1>Четыре способа показать работу, а не обещания.</h1>
        </div>
        <p>
          Три исходные концепции и четвёртый синтез структуры Editorial Product с палитрой и процессным языком Workflow Motif.
        </p>
      </header>

      <section className="concept-index-list" aria-label="Концепции редизайна">
        {concepts.map((concept) => (
          <Link className={`concept-index-card ${concept.className}`} href={concept.href} key={concept.href}>
            <span className="concept-index-number">{concept.number}</span>
            <div>
              <span>{concept.name}</span>
              <h2>{concept.title}</h2>
            </div>
            <dl>
              <div><dt>Типографика</dt><dd>{concept.type}</dd></div>
              <div><dt>Сильная сторона</dt><dd>{concept.strength}</dd></div>
              <div><dt>Компромисс</dt><dd>{concept.tradeoff}</dd></div>
            </dl>
            <strong>Открыть прототип ↗</strong>
          </Link>
        ))}
      </section>

      <footer className="concept-index-foot">
        <span>Production-маршруты не изменены</span>
        <Link href="/">Вернуться на текущий сайт →</Link>
      </footer>
    </main>
  );
}
