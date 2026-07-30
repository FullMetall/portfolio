import type { Locale } from "../content";
import { copy } from "../content";

export function ProcessFlow({ locale }: { locale: Locale }) {
  const t = copy[locale];

  return (
    <div className="flow-card" aria-label={t.flowTitle}>
      <div className="flow-heading">
        <span className="micro-label">
          {locale === "ru" ? "Принцип работы" : "How I work"}
        </span>
        <strong>{t.flowTitle}</strong>
      </div>
      <div className="process-flow" role="list">
        <div className="flow-rail" aria-hidden="true">
          <span className="flow-progress" />
          <span className="flow-runner" />
        </div>
        {t.flowSteps.map((step, index) => (
          <div className="flow-step" role="listitem" key={step}>
            <span className="flow-node" aria-hidden="true">
              {index + 1}
            </span>
            <span>{step}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
