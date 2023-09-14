"use client"

import Link from "next/link"
import { Button } from "@nextui-org/react"

import { useGameStore } from "@/lib/store"
import { cn } from "@/lib/utils"

export const GameButton = ({
  handleNext,
  handleGuess,
  isResult,
  lives,
}: {
  handleNext: any
  handleGuess: any
  isResult: boolean
  lives: number
}) => {
  const gameStore = useGameStore()

  return (
    <>
      {lives <= 0 ? (
        <div className="grid place-content-center">
          <Link href={`/game-over?score=${gameStore.score}`}>
            <Button>Final Score</Button>
          </Link>
        </div>
      ) : (
        <Button
          onClick={handleNext}
          className={cn(isResult ? "block" : "hidden")}
        >
          Keep Playing
        </Button>
      )}

      <Button
        onClick={handleGuess}
        className={cn(isResult ? "hidden" : "block")}
      >
        Take a guess
      </Button>
    </>
  )
}
