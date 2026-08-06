import type { Metadata } from "next";
import "@fontsource-variable/golos-text";
import "@fontsource-variable/oswald";
import { PrivacyPage } from "../../_components/PrivacyPage";
import "../../portfolio.css";

export const metadata: Metadata = {
  title: { absolute: "Privacy policy — Daniil Uglovskiy" },
  description: "How fullmetall.ru uses Yandex Metrica and stores a visitor's choice.",
  alternates: {
    canonical: "/en/privacy",
    languages: { ru: "/privacy", en: "/en/privacy" },
  },
};

export default function EnglishPrivacyPage() {
  return <PrivacyPage locale="en" />;
}
