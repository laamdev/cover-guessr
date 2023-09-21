"use client"

import Link from "next/link"
import { Button } from "@nextui-org/react"

import { useGameStore } from "@/lib/store"

export const SelectButton = ({
  icon,
  category,
}: {
  icon: any
  category: string
}) => {
  const gameStore = useGameStore()

  const param = category === "all" ? "" : category

  return (
    <Link
      href={`/game?category=${param}`}
      className="flex flex-col items-center gap-y-1"
    >
      <Button
        isIconOnly
        color="primary"
        variant="solid"
        aria-label={category}
        onClick={() => gameStore.reset()}
      >
        {icon}
      </Button>
      <p className="text-xs uppercase">{category}</p>
    </Link>
  )
}
