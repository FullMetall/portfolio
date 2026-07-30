import type { Metadata } from "next";
import { PrivacyPage } from "../../_components/PrivacyPage";

export const metadata: Metadata = {
  title: "Privacy",
  description: "Information about data processing on Daniil Uglovskiy's website.",
  alternates: {
    canonical: "/en/privacy",
    languages: {
      ru: "/privacy",
      en: "/en/privacy",
    },
  },
};

export default function EnglishPrivacy() {
  return <PrivacyPage locale="en" />;
}
