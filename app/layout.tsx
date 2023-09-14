import "@/app/globals.css"

import { Inter } from "next/font/google"

import { cn } from "@/lib/utils"
import { Toaster } from "@/components/ui/toaster"

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
        <main>{children}</main>
        <Toaster />
      </body>
    </html>
  )
}
