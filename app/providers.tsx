"use client"

import { ReactNode } from "react"
import { NextUIProvider } from "@nextui-org/react"

export const Providers = ({ children }: { children: ReactNode }) => {
  return <NextUIProvider>{children}</NextUIProvider>
}
