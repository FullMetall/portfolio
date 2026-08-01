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
  const [visibleLocale, setVisibleLocale] = useState<"ru" | "en" | null>(null);

  useEffect(() => {
    if (!counterId) return;
    const saved = window.localStorage.getItem(consentKey);
    if (saved === "accepted") {
      enableMetrica(Number(counterId));
    } else if (saved !== "declined") {
      const locale = window.location.pathname.startsWith("/en") ? "en" : "ru";
      const timer = window.setTimeout(() => setVisibleLocale(locale), 0);
      return () => window.clearTimeout(timer);
    }
  }, []);

  if (!visibleLocale || !counterId) return null;

  const isEnglish = visibleLocale === "en";

  return (
    <aside
      className="consent-banner"
      aria-label={isEnglish ? "Analytics consent" : "Согласие на аналитику"}
    >
      <p>
        {isEnglish
          ? "Allow Yandex Metrica to help improve this site?"
          : "Использовать Яндекс Метрику для улучшения сайта?"}
      </p>
      <div>
        <button
          type="button"
          onClick={() => {
            window.localStorage.setItem(consentKey, "declined");
            setVisibleLocale(null);
          }}
        >
          {isEnglish ? "No" : "Нет"}
        </button>
        <button
          className="consent-accept"
          type="button"
          onClick={() => {
            window.localStorage.setItem(consentKey, "accepted");
            enableMetrica(Number(counterId));
            setVisibleLocale(null);
          }}
        >
          {isEnglish ? "Yes" : "Да"}
        </button>
      </div>
    </aside>
  );
}
