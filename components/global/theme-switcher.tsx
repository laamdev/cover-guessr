"use client"

import { useEffect, useState } from "react"
import { Switch } from "@nextui-org/switch"
import { MoonIcon, SunIcon } from "lucide-react"
import { useTheme } from "next-themes"

export const ThemeSwitcher = () => {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="absolute right-4 top-5 flex gap-5">
      <Switch
        color="primary"
        defaultSelected={theme === "dark" ? true : false}
        startContent={<MoonIcon />}
        endContent={<SunIcon />}
        onChange={() => setTheme(theme === "dark" ? "light" : "dark")}
      />
    </div>
  )
}
