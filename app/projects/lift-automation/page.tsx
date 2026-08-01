import type { Metadata } from "next";
import { CasePage } from "../../_components/CasePage";

export const metadata: Metadata = {
  title: "Автоматизация испытательной лаборатории",
  description:
    "Кейс веб-системы: сокращение подготовки комплекта документов с 60 до 9 минут при 2400 освидетельствованиях и комплектах документов в год.",
  alternates: {
    canonical: "/projects/lift-automation",
    languages: {
      ru: "/projects/lift-automation",
      en: "/en/projects/lift-automation",
    },
  },
};

export default function LiftAutomationCase() {
  return <CasePage locale="ru" />;
}
