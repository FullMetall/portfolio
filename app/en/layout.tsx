import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Daniil Uglovskiy — web systems developer",
    template: "%s — Daniil Uglovskiy",
  },
  description:
    "Web systems and automation for complex workflows: interfaces, server logic, documents, and launch.",
  applicationName: "Daniil Uglovskiy's portfolio",
  authors: [{ name: "Daniil Uglovskiy" }],
  creator: "Daniil Uglovskiy",
  openGraph: {
    type: "website",
    locale: "en_US",
    alternateLocale: "ru_RU",
    siteName: "Daniil Uglovskiy",
    title: "Daniil Uglovskiy — web systems developer",
    description: "Applied web systems for automating complex workflows.",
    images: [
      {
        url: "/og.png",
        width: 1734,
        height: 909,
        alt: "Daniil Uglovskiy — web systems developer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Daniil Uglovskiy — web systems developer",
    description: "Applied web systems for automating complex workflows.",
    images: ["/og.png"],
  },
};

export default function EnglishLayout({ children }: { children: React.ReactNode }) {
  return <div lang="en">{children}</div>;
}
