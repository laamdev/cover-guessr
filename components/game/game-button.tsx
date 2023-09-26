"use client"

import { useTransition } from "react"
import Link from "next/link"
import { Button } from "@nextui-org/react"

import { useGameStore } from "@/lib/store"
import { cn, getCurrentYear } from "@/lib/utils"
import { addScoreAction } from "@/app/_actions"

export const GameButton = ({
  handleNext,
  handleGuess,
  guessedYear,
  currentUserId,
  category,
}: {
  handleNext: any
  handleGuess: any
  guessedYear: number
  currentUserId?: string
  category: string | string[] | undefined
}) => {
  const gameStore = useGameStore()
  const [pending, startTransition] = useTransition()
  return (
    <section>
      <div className="relative flex flex-col items-center justify-center">
        {gameStore.lives <= 0 ? (
          <Link href={`/game-over?score=${gameStore.score}`}>
            <Button
              variant="solid"
              color="primary"
              size="sm"
              onClick={() =>
                currentUserId
                  ? startTransition(() =>
                      addScoreAction({
                        currentUserId: currentUserId,
                        points: gameStore.score,
                        category:
                          category === ""
                            ? "All"
                            : ((category![0].toUpperCase() +
                                category?.slice(1)) as string),
                      })
                    )
                  : console.log("Not added to leaderboard.")
              }
            >
              Final Score
            </Button>
          </Link>
        ) : (
          <Button
            variant="solid"
            size="sm"
            color="primary"
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
          color="primary"
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
