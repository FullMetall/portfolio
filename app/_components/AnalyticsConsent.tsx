"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  ANALYTICS_CONSENT_KEY,
  ANALYTICS_SETTINGS_EVENT,
  YANDEX_METRIKA_ID,
  isProductionAnalyticsOrigin,
  persistAnalyticsConsent,
  readAnalyticsConsent,
} from "../_lib/analytics-consent.mjs";

type Locale = "ru" | "en";
type YmFunction = ((...args: unknown[]) => void) & {
  a?: unknown[][];
  l?: number;
};

declare global {
  interface Window {
    ym?: YmFunction;
  }
}

function localeFromPath(pathname: string): Locale {
  return pathname.startsWith("/en") ? "en" : "ru";
}

function enableMetrica() {
  if (!isProductionAnalyticsOrigin(window)) return false;
  if (document.querySelector('script[data-yandex-metrica="true"]')) return true;

  const queuedYm: YmFunction =
    window.ym ||
    function (...args: unknown[]) {
      queuedYm.a = queuedYm.a || [];
      queuedYm.a.push(args);
    };
  queuedYm.l = Date.now();
  window.ym = queuedYm;

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://mc.yandex.ru/metrika/tag.js?id=${YANDEX_METRIKA_ID}`;
  script.dataset.yandexMetrica = "true";
  script.referrerPolicy = "strict-origin-when-cross-origin";
  document.head.appendChild(script);

  window.ym(YANDEX_METRIKA_ID, "init", {
    ssr: true,
    clickmap: true,
    referrer: document.referrer,
    url: window.location.href,
    accurateTrackBounce: true,
    trackLinks: true,
  });
  return true;
}

function disableMetrica() {
  window.ym?.(YANDEX_METRIKA_ID, "destruct");
  document.querySelector('script[data-yandex-metrica="true"]')?.remove();
}

export function AnalyticsConsent() {
  const pathname = usePathname();
  const previousUrl = useRef<string | null>(null);
  const firstActionRef = useRef<HTMLButtonElement>(null);
  const [visibleLocale, setVisibleLocale] = useState<Locale | null>(null);
  const [trackingEnabled, setTrackingEnabled] = useState(false);

  useEffect(() => {
    previousUrl.current = window.location.href;
    const saved = readAnalyticsConsent(window);

    if (saved === "accepted") {
      setTrackingEnabled(enableMetrica());
    } else if (saved === null) {
      const timer = window.setTimeout(
        () => setVisibleLocale(localeFromPath(window.location.pathname)),
        0,
      );
      return () => window.clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    setVisibleLocale((currentLocale) => {
      if (currentLocale === null) return null;
      return localeFromPath(pathname);
    });
  }, [pathname]);

  useEffect(() => {
    let focusFrame = 0;
    const showSettings = () => {
      setVisibleLocale(localeFromPath(window.location.pathname));
      focusFrame = window.requestAnimationFrame(() => firstActionRef.current?.focus());
    };
    window.addEventListener(ANALYTICS_SETTINGS_EVENT, showSettings);
    return () => {
      window.removeEventListener(ANALYTICS_SETTINGS_EVENT, showSettings);
      window.cancelAnimationFrame(focusFrame);
    };
  }, []);

  useEffect(() => {
    const syncConsent = (event: StorageEvent) => {
      if (event.key !== ANALYTICS_CONSENT_KEY && event.key !== null) return;

      if (event.newValue === "accepted") {
        setTrackingEnabled(enableMetrica());
        setVisibleLocale(null);
        return;
      }

      disableMetrica();
      setTrackingEnabled(false);

      if (event.newValue === "declined") {
        setVisibleLocale(null);
      } else {
        setVisibleLocale(localeFromPath(window.location.pathname));
      }
    };

    window.addEventListener("storage", syncConsent);
    return () => window.removeEventListener("storage", syncConsent);
  }, []);

  useEffect(() => {
    const currentUrl = window.location.href;
    const referer = previousUrl.current;

    if (trackingEnabled && referer && referer !== currentUrl) {
      window.ym?.(YANDEX_METRIKA_ID, "hit", currentUrl, {
        referer,
        title: document.title,
      });
    }
    previousUrl.current = currentUrl;
  }, [pathname, trackingEnabled]);

  if (!visibleLocale) return null;

  const isEnglish = visibleLocale === "en";
  const privacyHref = isEnglish ? "/en/privacy" : "/privacy";

  return (
    <aside
      className="consent-banner"
      aria-label={isEnglish ? "Analytics consent" : "Согласие на аналитику"}
      aria-live="polite"
    >
      <div className="consent-banner-copy">
        <strong>{isEnglish ? "Analytics" : "Аналитика"}</strong>
        <p>
          {isEnglish
            ? "Yandex Metrica will load only with your permission. You can change this choice later."
            : "Яндекс Метрика загрузится только с твоего разрешения. Позже выбор можно изменить."}{" "}
          <Link href={privacyHref}>{isEnglish ? "Privacy policy" : "Подробнее"}</Link>
        </p>
      </div>
      <div className="consent-banner-actions">
        <button
          ref={firstActionRef}
          type="button"
          onClick={() => {
            persistAnalyticsConsent(window, "declined");
            if (trackingEnabled) disableMetrica();
            setTrackingEnabled(false);
            setVisibleLocale(null);
          }}
        >
          {isEnglish ? "Decline" : "Не разрешать"}
        </button>
        <button
          className="consent-accept"
          type="button"
          onClick={() => {
            persistAnalyticsConsent(window, "accepted");
            if (!trackingEnabled) setTrackingEnabled(enableMetrica());
            setVisibleLocale(null);
          }}
        >
          {isEnglish ? "Allow" : "Разрешить"}
        </button>
      </div>
    </aside>
  );
}
