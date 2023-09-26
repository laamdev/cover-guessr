"use client"

import { useTheme } from "next-themes"
import { Toaster } from "sonner"

export const CustomToaster = () => {
  const { theme, setTheme } = useTheme()
  return (
    <Toaster
      closeButton
      duration={3000}
      position="bottom-right"
      // @ts-expect-error
      theme={theme}
      richColors
    />
  )
}
