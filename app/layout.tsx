import "@/app/globals.css"

import { Inter } from "next/font/google"

import { cn } from "@/lib/utils"
import { Hydrate } from "@/components/global/hydrate"
import { ThemeSwitcher } from "@/components/global/theme-switcher"
import { Providers } from "@/app/providers"

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
      <body className={cn(inter.className, "container relative max-w-4xl")}>
        <Providers>
          <Hydrate>
            <main className="grid min-h-screen place-content-center place-items-center">
              {children}
            </main>
            <ThemeSwitcher />
          </Hydrate>
        </Providers>
      </body>
    </html>
  )
}
