import type { Metadata } from "next";
import { PortfolioPage } from "../_components/PortfolioPage";

export const metadata: Metadata = {
  title: "Web systems developer",
  description:
    "Daniil Uglovskiy's portfolio: web systems development, process automation, and an applied product for a testing laboratory.",
  alternates: {
    canonical: "/en",
    languages: {
      ru: "/",
      en: "/en",
    },
  },
};

export default function EnglishHome() {
  return <PortfolioPage locale="en" />;
}
