"use client"

import Link from "next/link"

import { useGameStore } from "@/lib/store"
import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "@/components/ui/button"

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
          <Link
            href={`/game-over?score=${gameStore.score}`}
            className={cn(
              buttonVariants({
                variant: "default",
              })
            )}
          >
            Final Score
          </Link>
        </div>
      ) : (
        <Button
          onClick={() => handleNext()}
          className={cn(gameStore.isResult ? "block" : "hidden")}
        >
          Keep Playing
        </Button>
      )}

      <Button
        onClick={() => handleGuess()}
        className={cn(gameStore.isResult ? "hidden" : "block")}
      >
        Guess Year
      </Button>
    </>
  )
}
