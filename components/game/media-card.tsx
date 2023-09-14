"use client"

import Image from "next/image"
import { Media } from "@/types"
import { AnimatePresence, motion } from "framer-motion"
import Balancer from "react-wrap-balancer"

export const MediaCard = ({
  media,
  fade,
  category,
}: {
  media: Media
  fade: boolean
  category: string | string[] | undefined
}) => {
  return (
    <div className="mt-5 grid h-96 w-96 place-content-center">
      <AnimatePresence>
        {!fade && (
          <motion.div
            className="flex flex-col items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <p>{`In what year was this ${category} published?`}</p>
            <Image
              priority
              src={media.cover_url!}
              alt={media.title}
              width={640}
              height={640}
              className="mt-5 h-72 w-auto rounded bg-neutral-100 object-contain object-center shadow md:h-64"
            />
            <h1 className="mt-2.5 max-w-prose text-center text-xl font-bold leading-none tracking-tighter md:text-3xl">
              <Balancer>{media.title}</Balancer>
            </h1>
            <h2 className="text-sm text-neutral-700 md:text-lg">
              {media.author}
            </h2>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
