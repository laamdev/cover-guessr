"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

import { useGameStore } from "@/lib/store"
import { cn, getDifference } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"
import { GameButton } from "@/components/game/game-button"
import { GuessInput } from "@/components/game/guess-input"
import { HomeButton } from "@/components/game/home-button"
import { MediaCard } from "@/components/game/media-card"
import { ResetButton } from "@/components/game/reset-button"
import { Score } from "@/components/game/score"

export const GamePage = ({ media }: { media: any }) => {
  const { toast } = useToast()
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

  const handleGuess = async () => {
    gameStore.setLives(getDifference(media.year, guessedYear))
    gameStore.setIsResult()
    gameStore.setScore()
  }

  return (
    <section className="relative grid h-screen place-content-center">
      <HomeButton />
      <ResetButton />

      <div className={cn("flex flex-col items-center justify-center py-10")}>
        <Score score={gameStore.score} lives={gameStore.lives} />

        <MediaCard media={media} fade={fade} />

        <GuessInput
          isResult={gameStore.isResult}
          guessedYear={guessedYear}
          setGuessedYear={setGuessedYear}
          year={media.year}
        />

        {/* <Result
          isResult={gameStore.isResult}
          gameStore={gameStore}
          media={media}
          guessedYear={guessedYear}
        /> */}

        <GameButton handleNext={handleNext} handleGuess={handleGuess} />
      </div>
    </section>
  )
}
