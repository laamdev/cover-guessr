import Link from "next/link"
import { Button } from "@nextui-org/react"
import { HomeIcon } from "lucide-react"

import { useGameStore } from "@/lib/store"

export const HomeButton = () => {
  const gameStore = useGameStore()

  const handleReset = () => {
    gameStore.reset()
  }

  return (
    <Link href="/">
      <Button className="absolute left-4 top-4" onClick={handleReset}>
        <HomeIcon className="h-4 w-4" />
      </Button>
    </Link>
  )
}
