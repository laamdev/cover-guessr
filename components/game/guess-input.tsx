"use client"

import { Input } from "@nextui-org/react"
import { AnimatePresence, motion } from "framer-motion"

import { useGameStore } from "@/lib/store"
import { cn, getCurrentYear, getDifference } from "@/lib/utils"

// // import { Slider } from "@/components/ui/slider"

export const GuessInput = ({
  guessedYear,
  setGuessedYear,
  isResult,
  year,
}: {
  guessedYear: number
  setGuessedYear: any
  isResult: boolean
  year: number
}) => {
  const minYear = 1900
  const maxYear = getCurrentYear()
  const gameStore = useGameStore()

  return (
    <div className="grid h-36 place-content-center">
      <AnimatePresence>
        {!isResult ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={cn("w-72 flex-col items-center justify-center md:w-96")}
          >
            {/* <Slider
              className="mt-1"
              defaultValue={[1962]}
              max={maxYear}
              min={minYear}
              step={1}
              onValueChange={(i) => setGuessedYear(i[0])}
            /> */}
            <div className="grid place-content-center">
              <Input
                type="number"
                label="Guess a year"
                labelPlacement="outside"
                min={minYear}
                max={maxYear}
                defaultValue="1968"
                onChange={(e) => setGuessedYear(+e.target.value)}

                // // placeholder="Enter your email"
                // // description={placement}
              />
              {/* <Input
                id="guessed-year-input"
                className="mt-5 text-base font-bold md:text-xl"
                type="number"
                max={getCurrentYear()}
                min={1900}
                value={guessedYear}
                onChange={(e) => setGuessedYear(+e.target.value)}
              /> */}
            </div>
          </motion.div>
        ) : (
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className={cn(
                "w-screen grid-cols-2 gap-x-5 px-5 md:max-w-md",
                isResult ? "grid" : "hidden"
              )}
            >
              <div className="col-span-1 flex flex-col items-center rounded-lg border-2 border-neutral-900 px-1 py-2">
                <p className="text-xs md:text-sm">Release Year</p>
                <h3 className="text-base font-bold md:text-lg">{year}</h3>
              </div>
              <div className="col-span-1 flex flex-col items-center rounded-lg border-2 border-neutral-900 px-1 py-2">
                <p className="text-xs md:text-sm">Your Guess</p>
                <h3 className="text-base font-bold md:text-lg">
                  {guessedYear}
                </h3>
              </div>
            </div>

            <div className="mt-2.5 text-center text-sm">
              <p>
                <span>{`You missed by `}</span>
                <span className="font-bold text-red-500">
                  {getDifference(year, guessedYear)}
                </span>
                <span>{` years`}</span>
              </p>

              <p>
                <span>{`You have `}</span>
                <span className="font-bold text-red-500">
                  {gameStore.lives}
                </span>
                <span>{` lives left`}</span>
              </p>
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  )
}
