import type { Metadata } from "next";
import { AnalyticsConsent } from "./_components/AnalyticsConsent";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://fullmetall.ru"),
  title: {
    default: "Даниил Угловский — разработчик веб-систем",
    template: "%s — Даниил Угловский",
  },
  description:
    "Разработка веб-систем и автоматизация сложных рабочих процессов: интерфейсы, серверная логика, документы и запуск.",
  applicationName: "Портфолио Даниила Угловского",
  authors: [{ name: "Даниил Угловский" }],
  creator: "Даниил Угловский",
  openGraph: {
    type: "website",
    locale: "ru_RU",
    alternateLocale: "en_US",
    siteName: "Daniil Uglovskiy",
    title: "Даниил Угловский — разработчик веб-систем",
    description:
      "Создаю прикладные веб-системы для автоматизации сложных рабочих процессов.",
    images: [
      {
        url: "/og.png",
        width: 1734,
        height: 909,
        alt: "Даниил Угловский — разработчик веб-систем",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Даниил Угловский — разработчик веб-систем",
    description:
      "Создаю прикладные веб-системы для автоматизации сложных рабочих процессов.",
    images: ["/og.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  referrer: "strict-origin-when-cross-origin",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body>
        {children}
        <AnalyticsConsent />
      </body>
    </html>
  );
}
