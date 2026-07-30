import type { Metadata } from "next";
import { CasePage } from "../../../_components/CasePage";

export const metadata: Metadata = {
  title: "Testing laboratory automation",
  description:
    "Web system case study: reducing document-set preparation from 60 to 7 minutes across an annual workflow of 2,400 inspections.",
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
