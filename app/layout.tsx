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
  description:
    "How many release years of your favorite media can you guess in a row?",
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
          </Hydrate>
        </Providers>
      </body>
    </html>
  )
}
