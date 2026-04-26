import type { Metadata } from "next";
import { getSiteUrl, SITE_NAME } from "@/lib/seo";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  title: "Leaderboard",
  description:
    "See the top Cover Guessr players — highest scores, longest streaks, and the sharpest album-cover memories.",
  alternates: { canonical: "/leaderboard" },
  openGraph: {
    title: `Leaderboard · ${SITE_NAME}`,
    description:
      "See the top Cover Guessr players — highest scores, longest streaks, and the sharpest album-cover memories.",
    url: `${siteUrl}/leaderboard`,
  },
};

export default function LeaderboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
