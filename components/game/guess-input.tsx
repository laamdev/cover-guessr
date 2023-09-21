"use client"

import { Button, Card, Input } from "@nextui-org/react"
import { AnimatePresence, motion } from "framer-motion"
import { MinusIcon, PlusIcon } from "lucide-react"

import { useGameStore } from "@/lib/store"
import { cn, getCurrentYear, getDifference } from "@/lib/utils"

import { ResultCard } from "./result-card"

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
    <div className="grid h-24 place-content-center">
      <AnimatePresence>
        {!isResult ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={cn(
              "mt-5 w-72 flex-col items-center justify-center md:w-96"
            )}
          >
            <div className="relative grid place-content-center">
              <div className="flex items-center gap-2.5">
                <Button
                  isIconOnly
                  size="sm"
                  color="primary"
                  variant="solid"
                  onClick={() => setGuessedYear(+guessedYear - 1)}
                >
                  <MinusIcon className="h-4 w-4" />
                </Button>
                <Input
                  type="number"
                  size="sm"
                  color="primary"
                  label="Guess a year"
                  variant="faded"
                  labelPlacement="outside"
                  min={minYear}
                  max={maxYear}
                  value={guessedYear.toString()}
                  onChange={(e) => setGuessedYear(+e.target.value)}
                  className="w-36"
                  // // placeholder="Enter your email"
                  // // description={placement}
                />
                <Button
                  isIconOnly
                  size="sm"
                  color="primary"
                  variant="solid"
                  onClick={() => setGuessedYear(+guessedYear + 1)}
                >
                  <PlusIcon className="h-4 w-4" />
                </Button>
              </div>

              {guessedYear > maxYear || guessedYear < minYear ? (
                <p className="absolute -bottom-4 w-full text-center text-[8px] text-red-500">
                  The year must be between {minYear} and {maxYear}
                </p>
              ) : (
                <></>
              )}
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
                "w-full grid-cols-2 gap-x-5 px-5 md:max-w-md",
                isResult ? "grid" : "hidden"
              )}
            >
              <ResultCard label="Release Year" content={year} />
              <ResultCard label="Your Guess" content={guessedYear} />
              {/* <ResultCard
                label="Missed by"
                content={getDifference(year, guessedYear)}
                destructive={true}
              /> */}
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  )
}
