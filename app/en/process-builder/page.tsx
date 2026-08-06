import type { Metadata } from "next";
import "@fontsource-variable/golos-text";
import "@fontsource-variable/oswald";
import { ProcessBuilderProduct } from "../../_components/PortfolioExperience";
import "../../portfolio.css";

export const metadata: Metadata = {
  title: { absolute: "Process builder — Daniil Uglovskiy" },
  description:
    "An interactive builder for mapping a manual workflow, finding bottlenecks, and designing a managed system.",
  alternates: {
    canonical: "/en/process-builder",
    languages: {
      ru: "/process-builder",
      en: "/en/process-builder",
    },
  },
};

export default function EnglishProcessBuilderPage() {
  return <ProcessBuilderProduct locale="en" />;
}
