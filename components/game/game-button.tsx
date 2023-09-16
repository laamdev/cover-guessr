"use client"

import Link from "next/link"
import { Button } from "@nextui-org/react"

import { useGameStore } from "@/lib/store"
import { cn, getCurrentYear } from "@/lib/utils"

export const GameButton = ({
  handleNext,
  handleGuess,
  guessedYear,
}: {
  handleNext: any
  handleGuess: any
  guessedYear: number
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

      <div className="relative flex flex-col items-center justify-center">
        <Button
          isDisabled={guessedYear > getCurrentYear() || guessedYear < 1900}
          onClick={handleGuess}
          className={cn(gameStore.isResult ? "hidden" : "block")}
        >
          Take a guess
        </Button>
      </div>
    </>
  )
}
