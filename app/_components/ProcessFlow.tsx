"use client";

import { useEffect, useRef, useState } from "react";
import type { Locale } from "../content";
import { copy } from "../content";

export function ProcessFlow({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const [activeStep, setActiveStep] = useState(0);
  const flowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setActiveStep(t.flowSteps.length - 1);
      return;
    }

    let frame = 0;
    const tick = () => {
      const flow = flowRef.current;
      const runner = flow?.querySelector<HTMLElement>(".flow-runner");
      const nodes = flow
        ? Array.from(flow.querySelectorAll<HTMLElement>(".flow-node"))
        : [];

      if (!runner || nodes.length === 0 || runner.offsetParent === null) {
        setActiveStep(t.flowSteps.length - 1);
        frame = window.requestAnimationFrame(tick);
        return;
      }

      const runnerRect = runner.getBoundingClientRect();
      const runnerCenter = runnerRect.left + runnerRect.width / 2;
      let nextStep = 0;

      nodes.forEach((node, index) => {
        const nodeRect = node.getBoundingClientRect();
        const nodeCenter = nodeRect.left + nodeRect.width / 2;
        if (runnerCenter >= nodeCenter - 0.5) {
          nextStep = index;
        }
      });

      setActiveStep((current) => (current === nextStep ? current : nextStep));
      frame = window.requestAnimationFrame(tick);
    };

    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [t.flowSteps.length]);

  return (
    <div className="flow-card" aria-label={t.flowTitle}>
      <div className="flow-heading">
        <span className="micro-label">
          {locale === "ru" ? "Принцип работы" : "How I work"}
        </span>
        <strong>{t.flowTitle}</strong>
      </div>
      <div className="process-flow" role="list" ref={flowRef}>
        <div className="flow-rail" aria-hidden="true">
          <span className="flow-progress" />
          <span className="flow-runner" />
        </div>
        {t.flowSteps.map((step, index) => (
          <div
            className={`flow-step${index <= activeStep ? " is-lit" : ""}${index === activeStep ? " is-current" : ""}`}
            role="listitem"
            key={step}
          >
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
