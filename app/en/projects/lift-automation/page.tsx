import type { Metadata } from "next";
import { CasePage } from "../../../_components/CasePage";

export const metadata: Metadata = {
  title: "Testing laboratory automation",
  description:
    "Web system case study: reducing document-set preparation from 60 to 9 minutes across 2,400 annual inspections and document sets.",
  alternates: {
    canonical: "/en/projects/lift-automation",
    languages: {
      ru: "/projects/lift-automation",
      en: "/en/projects/lift-automation",
    },
  },
};

export default function EnglishLiftAutomationCase() {
  return <CasePage locale="en" />;
}
