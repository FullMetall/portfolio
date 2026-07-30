import type { Metadata } from "next";
import { PortfolioPage } from "./_components/PortfolioPage";

export const metadata: Metadata = {
  title: "Разработчик веб-систем",
  description:
    "Портфолио Даниила Угловского: разработка веб-систем, автоматизация процессов и прикладной продукт для испытательной лаборатории.",
  alternates: {
    canonical: "/",
    languages: {
      ru: "/",
      en: "/en",
    },
  },
};

export default function Home() {
  return <PortfolioPage locale="ru" />;
}
