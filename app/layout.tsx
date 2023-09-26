import "@/app/globals.css"

import type { Metadata } from "next"
import { Inter } from "next/font/google"

import { cn } from "@/lib/utils"
import { HomeButton } from "@/components/game/home-button"
import { LeaderboardButton } from "@/components/game/leaderboard-button"
import { Hydrate } from "@/components/global/hydrate"
import { ThemeSwitcher } from "@/components/global/theme-switcher"
import { Providers } from "@/app/providers"

export const dynamic = "force-dynamic"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  metadataBase: new URL("https://cover-guessr.vercel.app"),
  title: {
    default: "Cover Guessr",
    template: "%s | Cover Guessr",
  },
  description:
    "How many release years of your favorite media can you guess in a row?",
  openGraph: {
    title: "Cover Guessr",
    description:
      "How many release years of your favorite media can you guess in a row?",
    url: "https://cover-guessr.vercel.app",
    siteName: "Cover Guessr",
    images: [
      {
        url: "https://cover-guessr.vercel.app/og.png",
        width: 1200,
        height: 630,
      },
    ],
    locale: "en-US",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  twitter: {
    title: "Cover Guessr",
    card: "summary_large_image",
    description:
      "How many release years of your favorite media can you guess in a row?",
    images: [
      {
        url: "https://cover-guessr.vercel.app/og.png",
        width: 1200,
        height: 630,
      },
    ],
  },
  icons: {
    shortcut: "/favicon/all/favicon.ico",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={cn(inter.className, "container relative max-w-4xl")}>
        <Providers>
          <Hydrate>
            <main>{children}</main>
            <ThemeSwitcher />
            <div className="absolute left-4 top-4 flex gap-x-2.5">
              <HomeButton />
              <LeaderboardButton />
            </div>
          </Hydrate>
        </Providers>
      </body>
    </html>
  )
}
