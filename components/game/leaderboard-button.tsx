"use client"

import Link from "next/link"
import { Button } from "@nextui-org/button"
import { Tooltip } from "@nextui-org/tooltip"
import { TrophyIcon } from "lucide-react"

import { useGameStore } from "@/lib/store"

export const LeaderboardButton = () => {
  const gameStore = useGameStore()

  const handleReset = () => {
    gameStore.reset()
  }

  return (
    <Link href="/leaderboard">
      <Tooltip content="Leaderboard">
        <Button
          isIconOnly
          size="sm"
          onClick={handleReset}
          variant="solid"
          color="primary"
        >
          <TrophyIcon className="h-4 w-4" />
        </Button>
      </Tooltip>
    </Link>
  )
}
