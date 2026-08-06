import type { Metadata } from "next";
import "@fontsource-variable/golos-text";
import "@fontsource-variable/oswald";
import { PortfolioExperience } from "./_components/PortfolioExperience";
import "./portfolio.css";

export const metadata: Metadata = {
  title: "Архитектура рабочих процессов",
  description:
    "Даниил Угловский проектирует веб-системы полного цикла: от разбора ручного процесса до рабочего продукта в эксплуатации.",
  alternates: {
    canonical: "/",
    languages: {
      ru: "/",
      en: "/en",
    },
  },
};

export default function Home() {
  return <PortfolioExperience />;
}
