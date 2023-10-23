"use client"

import { Button, Input } from "@nextui-org/react"
import { AnimatePresence, motion } from "framer-motion"
import { MinusIcon, PlusIcon } from "lucide-react"

import { cn, getCurrentYear } from "@/lib/utils"
import { ResultCard } from "@/components/game/result-card"

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
                  value={guessedYear ? guessedYear.toString() : ""}
                  onChange={(e) => setGuessedYear(+e.target.value)}
                  className="w-36"
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
                <p className="absolute -bottom-6 w-full text-center text-xs opacity-50">
                  Enter a year between {minYear} and {maxYear}
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
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  )
}
