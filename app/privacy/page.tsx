import type { Metadata } from "next";
import "@fontsource-variable/golos-text";
import "@fontsource-variable/oswald";
import { PrivacyPage } from "../_components/PrivacyPage";
import "../portfolio.css";

export const metadata: Metadata = {
  title: "Политика конфиденциальности",
  description: "Как fullmetall.ru использует Яндекс Метрику и хранит выбор посетителя.",
  alternates: {
    canonical: "/privacy",
    languages: { ru: "/privacy", en: "/en/privacy" },
  },
};

export default function RussianPrivacyPage() {
  return <PrivacyPage locale="ru" />;
}
