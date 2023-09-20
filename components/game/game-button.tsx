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
    <section>
      <div className="relative flex flex-col items-center justify-center">
        {gameStore.lives <= 0 ? (
          <Link href={`/game-over?score=${gameStore.score}`}>
            <Button variant="ghost" size="sm">
              Final Score
            </Button>
          </Link>
        ) : (
          <Button
            variant="solid"
            size="sm"
            onClick={handleNext}
            className={cn(gameStore.isResult ? "block" : "hidden")}
          >
            Keep Playing
          </Button>
        )}
      </div>

      <div className="relative flex flex-col items-center justify-center">
        <Button
          variant="solid"
          size="sm"
          isDisabled={guessedYear > getCurrentYear() || guessedYear < 1900}
          onClick={handleGuess}
          className={cn(gameStore.isResult ? "hidden" : "block")}
        >
          Take a guess
        </Button>
      </div>
    </section>
  )
}
