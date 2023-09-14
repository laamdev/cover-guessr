import { RotateCcwIcon } from "lucide-react"

import { useGameStore } from "@/lib/store"
import { Button } from "@/components/ui/button"

export const ResetButton = () => {
  const gameStore = useGameStore()

  const handleReset = () => {
    gameStore.reset()
  }

  return (
    <Button
      variant="outline"
      size="icon"
      className="absolute right-2 top-2"
      onClick={handleReset}
    >
      <RotateCcwIcon className="h-4 w-4" />
    </Button>
  )
}
