"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { HomeIcon, RotateCcwIcon } from "lucide-react"
import { Balancer } from "react-wrap-balancer"

import { useGameStore } from "@/lib/store"
import { cn, getCurrentYear, getDifference } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"

export const GamePage = ({ media }: { media: any }) => {
  const gameStore = useGameStore()
  const router = useRouter()
  const [fade, setFade] = useState(false)
  const [guessedYear, setGuessedYear] = useState(1950)

  const handleGuess = () => {
    gameStore.setLives(getDifference(media.year, guessedYear))
    gameStore.setIsResult()
    gameStore.setScore()
  }

  const handleNext = () => {
    setFade(true)
    setTimeout(() => {
      router.refresh()
      gameStore.setIsResult()
      // // setGuessedYear(1950)
    }, 500)
    setTimeout(() => setFade(false), 1000)
  }

  return (
    <section className="relative grid h-screen place-content-center">
      <Link
        href="/"
        className={cn(
          buttonVariants({
            variant: "outline",
            size: "icon",
            className: "absolute left-2 top-2",
          })
        )}
        onClick={() => gameStore.reset()}
      >
        <HomeIcon className="h-4 w-4" />
      </Link>
      <Button
        variant="outline"
        size="icon"
        className="absolute right-2 top-2"
        onClick={() => gameStore.reset()}
      >
        <RotateCcwIcon className="h-4 w-4" />
      </Button>

      <div
        className={cn(
          "flex flex-col items-center justify-center py-10 transition-opacity duration-1000 ease-in-out",
          fade ? "opacity-0" : "opacity-100"
        )}
      >
        <div className="flex items-center justify-center gap-x-2.5">
          <Badge variant="outline" className="flex gap-x-2.5">
            <span className="text-neutral-700">Score</span>
            <span className="font-bold tabular-nums">{gameStore.score}</span>
          </Badge>
          <Badge variant="outline" className="flex gap-x-2.5">
            <span className="text-neutral-700">Lives</span>
            <span className="font-bold tabular-nums">
              {gameStore.lives <= 0 ? 0 : gameStore.lives}
            </span>
          </Badge>
        </div>

        <div className="flex flex-col items-center">
          <Image
            priority
            src={media.cover_url!}
            alt={media.title}
            width={640}
            height={640}
            className="mt-5 h-48 w-auto rounded bg-neutral-100 object-contain object-center shadow md:h-64"
          />
          <h1 className="mt-2.5 max-w-prose text-center text-xl font-bold leading-none tracking-tighter md:text-3xl">
            <Balancer>{media.title}</Balancer>
          </h1>
          <h2 className="text-sm text-neutral-700 md:text-xl">
            {media.author}
          </h2>

          <section
            className={cn(
              "mt-5 w-screen grid-cols-2 gap-x-5 px-5 md:max-w-xl",
              gameStore.isResult ? "grid" : "hidden"
            )}
          >
            <div className="col-span-1 flex flex-col items-center rounded-lg border-2 border-neutral-900 px-1 py-2 md:px-2 md:py-3">
              <p className="text-xs md:text-sm">Release Year</p>
              <h3 className="text-base font-bold md:text-lg">{media.year}</h3>
            </div>
            <div className="col-span-1 flex flex-col items-center rounded-lg border-2 border-neutral-900 px-1 py-2 md:px-2 md:py-3">
              <p className="text-xs md:text-sm">Your Guess</p>
              <h3 className="text-base font-bold md:text-lg">{guessedYear}</h3>
            </div>
          </section>

          <section
            className={cn("mt-5", gameStore.isResult ? "grid" : "hidden")}
          >
            <div className="flex items-center gap-x-2.5">
              <p className="text-sm">You missed by:</p>
              <h3 className="text-lg font-bold">
                {getDifference(media.year, guessedYear)}
              </h3>
            </div>
            <div className="flex items-center gap-x-2.5">
              <p className="text-sm">Lives remaning:</p>
              <h3 className="text-lg font-bold">
                {gameStore.lives <= 0 ? 0 : gameStore.lives}
              </h3>
            </div>
          </section>

          {gameStore.lives <= 0 ? (
            <div className="grid place-content-center">
              <Link
                href={`/game-over?score=${gameStore.score}`}
                className="mt-7 md:mt-10"
                onClick={() => gameStore.reset()}
              >
                See Score
              </Link>
            </div>
          ) : (
            <Button
              onClick={() => handleNext()}
              className={cn("mt-5", gameStore.isResult ? "grid" : "hidden")}
            >
              Keep Playing
            </Button>
          )}

          <section className={cn(gameStore.isResult ? "hidden" : "block")}>
            <div
              className={cn(
                "mt-7 w-72 flex-col items-center justify-center md:mt-10 md:w-96"
              )}
            >
              <Slider
                defaultValue={[1950]}
                max={getCurrentYear()}
                min={1900}
                step={1}
                onValueChange={(i) => setGuessedYear(i[0])}
              />
              <div className="grid place-content-center">
                <Input
                  id="guessed-year-input"
                  className="mt-5 text-base font-bold md:text-xl"
                  type="number"
                  max={getCurrentYear()}
                  min={1900}
                  value={guessedYear}
                  onChange={(e) => setGuessedYear(+e.target.value)}
                />
              </div>
            </div>

            <div className="grid place-content-center">
              <Button onClick={() => handleGuess()} className="mt-7 md:mt-10">
                Guess Year
              </Button>
            </div>
          </section>
        </div>
      </div>
    </section>
  )
}
