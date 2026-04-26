import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Play",
  description:
    "Play Cover Guessr — guess the release year of each album from its cover art and rack up points.",
  alternates: { canonical: "/play" },
  robots: { index: false, follow: false },
};

export default function PlayLayout({ children }: { children: React.ReactNode }) {
  return children;
}
