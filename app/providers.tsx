"use client"

import { ReactNode } from "react"
import { NextUIProvider } from "@nextui-org/react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

import { CustomToaster } from "@/components/global/custom-toaster"

export const Providers = ({ children }: { children: ReactNode }) => {
  return (
    <NextUIProvider>
      <NextThemesProvider
        attribute="class"
        defaultTheme="dark"
        themes={["light", "dark"]}
      >
        <CustomToaster />
        {children}
      </NextThemesProvider>
    </NextUIProvider>
  )
}
