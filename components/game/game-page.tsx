"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Media } from "@/types"

import { useGameStore } from "@/lib/store"
import { cn, getDifference } from "@/lib/utils"
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
  // // const [isResult, setIsResult] = useState(false)
  // // const [lives, setLives] = useState(gameStore.lives)
  // // const [score, setScore] = useState(gameStore.score)

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
  }

  return (
    <section className="relative grid min-h-screen place-content-center">
      <div className="absolute left-4 top-4 flex gap-x-2.5">
        <HomeButton />
        <ResetButton />
      </div>

      <div className={cn("flex flex-col items-center justify-center py-5")}>
        <Score
          score={gameStore.score}
          lives={gameStore.lives <= 0 ? 0 : gameStore.lives}
        />

        <MediaCard media={media} fade={fade} category={category} />

        {/* <Result
          isResult={gameStore.isResult}
          gameStore={gameStore}
          media={media}
          guessedYear={guessedYear}
        /> */}

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
      </div>
    </section>
  )
}
