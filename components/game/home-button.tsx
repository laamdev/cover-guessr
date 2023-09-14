import Link from "next/link"
import { HomeIcon } from "lucide-react"

import { useGameStore } from "@/lib/store"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export const HomeButton = () => {
  const gameStore = useGameStore()

  const handleReset = () => {
    gameStore.reset()
  }

  return (
    <Link
      href="/"
      className={cn(
        buttonVariants({
          variant: "outline",
          size: "icon",
          className: "absolute left-2 top-2",
        })
      )}
      onClick={handleReset}
    >
      <HomeIcon className="h-4 w-4" />
    </Link>
  )
}
