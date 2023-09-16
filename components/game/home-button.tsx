import Link from "next/link"
import { Button } from "@nextui-org/react"
import { Tooltip } from "@nextui-org/tooltip"
import { HomeIcon } from "lucide-react"

import { useGameStore } from "@/lib/store"

export const HomeButton = () => {
  const gameStore = useGameStore()

  const handleReset = () => {
    gameStore.reset()
  }

  return (
    <Link href="/">
      <Tooltip content="Home">
        <Button isIconOnly onClick={handleReset}>
          <HomeIcon className="h-4 w-4" />
        </Button>
      </Tooltip>
    </Link>
  )
}
