import type { Metadata } from "next";
import "@fontsource-variable/golos-text";
import "@fontsource-variable/oswald";
import { PortfolioExperience } from "../_components/PortfolioExperience";
import "../portfolio.css";

export const metadata: Metadata = {
  title: { absolute: "Workflow architecture — Daniil Uglovskiy" },
  description:
    "Daniil Uglovskiy designs full-cycle web systems, from mapping a manual process to a working product in operation.",
  alternates: {
    canonical: "/en",
    languages: {
      ru: "/",
      en: "/en",
    },
  },
};

export default function EnglishHome() {
  return <PortfolioExperience locale="en" />;
}
