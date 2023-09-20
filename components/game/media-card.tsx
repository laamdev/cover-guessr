"use client"

import { Media } from "@/types"
import { Card, CardBody, Image } from "@nextui-org/react"
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
    <Card
      isBlurred
      className="w-fit border-none bg-background/60 dark:bg-default-100/50"
      shadow="sm"
    >
      <CardBody>
        <div className="flex flex-col items-center">
          {/* <p className="mb-5">{`In what year was this ${category} released?`}</p> */}
          <Image
            src={media.cover_url!}
            alt={media.title}
            width={640}
            height={640}
            className="h-52 w-auto rounded object-cover object-center md:h-64"
          />
          <div className="mt-2.5 flex max-w-prose flex-col items-center gap-y-1 text-center">
            <h1 className="text-xl font-bold leading-none tracking-tighter md:text-2xl">
              <Balancer>{media.title}</Balancer>
            </h1>
            <h2 className="text-xs md:text-sm">{media.author}</h2>
          </div>
        </div>
      </CardBody>
    </Card>
  )
}
