"use client"

import Link from "next/link"
import { Button } from "@nextui-org/react"

import { useGameStore } from "@/lib/store"
import { cn } from "@/lib/utils"

export const GameButton = ({
  handleNext,
  handleGuess,
}: {
  handleNext: any
  handleGuess: any
}) => {
  const gameStore = useGameStore()

  return (
    <>
      {gameStore.lives <= 0 ? (
        <div className="grid place-content-center">
          <Link href={`/game-over?score=${gameStore.score}`}>
            <Button>Final Score</Button>
          </Link>
        </div>
      ) : (
        <Button
          onClick={handleNext}
          className={cn(gameStore.isResult ? "block" : "hidden")}
        >
          Keep Playing
        </Button>
      )}

      <Button
        onClick={handleGuess}
        className={cn(gameStore.isResult ? "hidden" : "block")}
      >
        Take a guess
      </Button>
    </>
  )
}
