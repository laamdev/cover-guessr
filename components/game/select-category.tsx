"use client"

import Link from "next/link"
import { Button, ButtonGroup } from "@nextui-org/react"
import {
  ClapperboardIcon,
  Disc3Icon,
  Gamepad2Icon,
  ShapesIcon,
} from "lucide-react"

import { useGameStore } from "@/lib/store"

export const SelectCategory = () => {
  const gameStore = useGameStore()

  return (
    <div className="mt-2.5 flex gap-x-2.5">
      <ButtonGroup>
        <Button
          isIconOnly
          aria-label="All media"
          onClick={() => gameStore.reset()}
        >
          <Link href="/game?category=">
            <ShapesIcon />
          </Link>
        </Button>
        <Button
          isIconOnly
          aria-label="Movies"
          onClick={() => gameStore.reset()}
        >
          <Link href="/game?category=movies">
            <ClapperboardIcon />
          </Link>
        </Button>
        <Button
          isIconOnly
          aria-label="Albums"
          onClick={() => gameStore.reset()}
        >
          <Link href="/game?category=albums">
            <Disc3Icon />
          </Link>
        </Button>
        <Button
          isIconOnly
          aria-label="Videogames"
          onClick={() => gameStore.reset()}
        >
          <Link href="/game?category=videogames">
            <Gamepad2Icon />
          </Link>
        </Button>
      </ButtonGroup>
      {/* <Button isIconOnly color="danger" aria-label="Like">
        <ShapesIcon />
      </Button>
      <Button
        isIconOnly
        color="warning"
        variant="faded"
        aria-label="Take a photo"
      >
        <Disc3Icon />
      </Button>
      <Button
        isIconOnly
        color="warning"
        variant="faded"
        aria-label="Take a photo"
      >
        <ClapperboardIcon />
      </Button>
      <Button
        isIconOnly
        color="warning"
        variant="faded"
        aria-label="Take a photo"
      >
        <Gamepad2Icon />
      </Button> */}

      {/* 
      <Link href="/game?category=all" onClick={() => gameStore.reset()}>
        <ShapesIcon className="h-5 w-5" />
      </Link>

      <Link href="/game?category=albums" onClick={() => gameStore.reset()}>
        <Disc3Icon className="h-5 w-5" />
      </Link>

      <Link href="/game?category=movies" onClick={() => gameStore.reset()}>
        <ClapperboardIcon className="h-5 w-5" />
      </Link>

      <Link href="/game?category=videogames" onClick={() => gameStore.reset()}>
        <Gamepad2Icon className="h-5 w-5" />
      </Link> */}
    </div>
  )
}
