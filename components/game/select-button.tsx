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
    <div className="flex flex-col items-center gap-y-1">
      <Button
        isIconOnly
        size="sm"
        aria-label={category}
        onClick={() => gameStore.reset()}
      >
        <Link href={`/game?category=${param}`}>{icon}</Link>
      </Button>
      <p className="text-xs uppercase">{category}</p>
    </div>
  )
}
