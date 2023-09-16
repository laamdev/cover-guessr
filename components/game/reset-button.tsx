import { useRouter } from "next/navigation"
import { Button } from "@nextui-org/button"
import { Tooltip } from "@nextui-org/tooltip"
import { RotateCcwIcon } from "lucide-react"

import { useGameStore } from "@/lib/store"

export const ResetButton = () => {
  const gameStore = useGameStore()
  const router = useRouter()

  const handleReset = () => {
    gameStore.reset()
    router.refresh()
  }

  return (
    <Tooltip content="Restart">
      <Button isIconOnly onClick={handleReset}>
        <RotateCcwIcon className="h-4 w-4" />
      </Button>
    </Tooltip>
  )
}
