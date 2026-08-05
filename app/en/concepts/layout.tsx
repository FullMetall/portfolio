import type { Metadata } from "next";
import "@fontsource-variable/oswald";
import "@fontsource-variable/source-serif-4";
import "@fontsource-variable/unbounded";
import "@fontsource-variable/golos-text";
import "@fontsource-variable/roboto-flex";
import "../../concepts/concepts.css";

export const metadata: Metadata = {
  title: "Workflow architecture",
  description: "Web systems, process automation, and a working product case study.",
  robots: { index: false, follow: false },
};

export default function EnglishConceptsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
