import { useRouter } from "next/navigation"
import { Button } from "@nextui-org/react"
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
    <Button className="absolute right-4 top-4" onClick={handleReset}>
      <RotateCcwIcon className="h-4 w-4" />
    </Button>
  )
}
