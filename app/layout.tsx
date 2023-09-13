import "./globals.css"

import { Inter } from "next/font/google"

import { cn } from "@/lib/utils"
import { Hydrate } from "@/components/global/hydrate"

export const dynamic = "force-dynamic"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Cover Guessr",
  description: "Guess the release year of the album, movie, or videogame.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={cn(inter.className, "container h-screen max-h-screen")}>
        {children}
      </body>
    </html>
  )
}
