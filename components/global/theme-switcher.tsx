"use client"

import { useEffect, useState } from "react"
import { Switch } from "@nextui-org/switch"
import { MoonIcon, SunIcon } from "lucide-react"
import { useTheme } from "next-themes"

export const ThemeSwitcher = () => {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()
  const [isDark, setIsDark] = useState(false)

  const handleThemeSwitch = () => {
    setIsDark(!isDark)
    setTheme(isDark ? "dark" : "light")
  }

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="absolute right-4 top-4 flex gap-5">
      <Switch
        defaultSelected
        size="sm"
        color="default"
        // // color="success"
        startContent={<MoonIcon />}
        endContent={<SunIcon />}
        onChange={handleThemeSwitch}
      />
    </div>
  )
}
