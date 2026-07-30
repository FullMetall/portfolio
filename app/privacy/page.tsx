import type { Metadata } from "next";
import { PrivacyPage } from "../_components/PrivacyPage";

export const metadata: Metadata = {
  title: "Конфиденциальность",
  description: "Информация об обработке данных на сайте Даниила Угловского.",
  alternates: {
    canonical: "/privacy",
    languages: {
      ru: "/privacy",
      en: "/en/privacy",
    },
  },
};

export default function Privacy() {
  return <PrivacyPage locale="ru" />;
}
