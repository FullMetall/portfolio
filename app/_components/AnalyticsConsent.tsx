"use client";

import { useEffect, useState } from "react";

declare global {
  interface Window {
    ym?: (...args: unknown[]) => void;
  }
}

const counterId = process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID;
const consentKey = "portfolio-analytics-consent";

function enableMetrica(id: number) {
  if (document.querySelector('script[data-yandex-metrica="true"]')) return;

  window.ym =
    window.ym ||
    function (...args: unknown[]) {
      (window.ym as unknown as { a?: unknown[] }).a =
        (window.ym as unknown as { a?: unknown[] }).a || [];
      (window.ym as unknown as { a: unknown[] }).a.push(args);
    };

  const script = document.createElement("script");
  script.async = true;
  script.src = "https://mc.yandex.ru/metrika/tag.js";
  script.dataset.yandexMetrica = "true";
  script.referrerPolicy = "strict-origin-when-cross-origin";
  document.head.appendChild(script);

  window.ym(id, "init", {
    clickmap: true,
    trackLinks: true,
    accurateTrackBounce: true,
    webvisor: false,
  });
}

export function AnalyticsConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!counterId) return;
    const saved = window.localStorage.getItem(consentKey);
    if (saved === "accepted") {
      enableMetrica(Number(counterId));
    } else if (saved !== "declined") {
      const timer = window.setTimeout(() => setVisible(true), 0);
      return () => window.clearTimeout(timer);
    }
  }, []);

  if (!visible || !counterId) return null;

  return (
    <aside className="consent-banner" aria-label="Analytics consent">
      <p>
        <span className="consent-ru">
          Использовать Яндекс Метрику для улучшения сайта?
        </span>
        <span className="consent-en">
          Allow Yandex Metrica to help improve this site?
        </span>
      </p>
      <div>
        <button
          type="button"
          onClick={() => {
            window.localStorage.setItem(consentKey, "declined");
            setVisible(false);
          }}
        >
          Нет / No
        </button>
        <button
          className="consent-accept"
          type="button"
          onClick={() => {
            window.localStorage.setItem(consentKey, "accepted");
            enableMetrica(Number(counterId));
            setVisible(false);
          }}
        >
          Да / Yes
        </button>
      </div>
    </aside>
  );
}
