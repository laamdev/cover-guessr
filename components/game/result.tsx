"use client"

import { AnimatePresence, motion } from "framer-motion"

import { cn } from "@/lib/utils"

export const Result = ({ gameStore, media, guessedYear, isResult }: any) => {
  return (
    <AnimatePresence>
      {isResult && (
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
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
          </div>
        </motion.section>
      )}
    </AnimatePresence>
  )
}
