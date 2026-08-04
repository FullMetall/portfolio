import type { Metadata } from "next";
import "@fontsource-variable/oswald";
import "@fontsource-variable/source-serif-4";
import "@fontsource-variable/unbounded";
import "@fontsource-variable/golos-text";
import "@fontsource-variable/roboto-flex";
import "./concepts.css";

export const metadata: Metadata = {
  title: "Концепции портфолио",
  description: "Локальные прототипы редизайна портфолио Даниила Угловского.",
  robots: { index: false, follow: false },
};

export default function ConceptsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
