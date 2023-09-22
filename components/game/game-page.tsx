"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Media } from "@/types"
import { Card, CardBody } from "@nextui-org/react"
import { toast } from "sonner"

import { useGameStore } from "@/lib/store"
import { getDifference } from "@/lib/utils"
import { GameButton } from "@/components/game/game-button"
import { GuessInput } from "@/components/game/guess-input"
import { HomeButton } from "@/components/game/home-button"
import { MediaCard } from "@/components/game/media-card"
import { ResetButton } from "@/components/game/reset-button"
import { Score } from "@/components/game/score"

export const GamePage = ({
  media,
  category,
}: {
  media: Media
  category: string | string[] | undefined
}) => {
  const gameStore = useGameStore()
  const router = useRouter()
  const [guessedYear, setGuessedYear] = useState(1962)
  const [fade, setFade] = useState(false)

  const handleNext = () => {
    setFade(true)

    setTimeout(() => {
      router.refresh()
      gameStore.setIsResult()
      setGuessedYear(1962)
    }, 500)
    setTimeout(() => setFade(false), 1000)
  }

  const handleGuess = () => {
    gameStore.setLives(getDifference(media.year, guessedYear))
    gameStore.setScore()
    gameStore.setIsResult()
    toast(
      <p>
        {getDifference(media.year, guessedYear) !== 0 ? (
          <>
            <span>{`You missed by `}</span>
            <span className="text-lg font-bold text-red-500">
              {getDifference(media.year, guessedYear)}
            </span>
            <span>{` years.`}</span>
          </>
        ) : (
          <>
            <span className="text-green-500">{`Perfect guess! `}</span>
            {/* <span>{`You won 1 extra point.`}</span> */}
          </>
        )}
      </p>
    )
  }

  return (
    <section className="grid grid-flow-row-dense place-items-center gap-y-5">
      <div className="absolute left-4 top-4 flex gap-x-2.5">
        <HomeButton />
        <ResetButton />
      </div>

      <Score
        score={gameStore.score}
        lives={gameStore.lives <= 0 ? 0 : gameStore.lives}
      />

      <MediaCard media={media} fade={fade} category={category} />

      <GuessInput
        isResult={gameStore.isResult}
        guessedYear={guessedYear}
        setGuessedYear={setGuessedYear}
        year={media.year}
      />

      <GameButton
        handleNext={handleNext}
        handleGuess={handleGuess}
        guessedYear={guessedYear}
      />
    </section>
  )
}
