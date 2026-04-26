import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign up",
  description:
    "Create a Cover Guessr account to play, save your scores, and climb the leaderboard.",
  robots: { index: false, follow: true },
};

export default function SignUpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
