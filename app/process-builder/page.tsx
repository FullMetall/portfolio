import type { Metadata } from "next";
import "@fontsource-variable/golos-text";
import "@fontsource-variable/oswald";
import { ProcessBuilderProduct } from "../_components/PortfolioExperience";
import "../portfolio.css";

export const metadata: Metadata = {
  title: "Конструктор процессов",
  description:
    "Интерактивный конструктор для разбора ручного процесса, поиска узких мест и проектирования управляемой системы.",
  alternates: {
    canonical: "/process-builder",
    languages: {
      ru: "/process-builder",
      en: "/en/process-builder",
    },
  },
};

export default function ProcessBuilderPage() {
  return <ProcessBuilderProduct />;
}
