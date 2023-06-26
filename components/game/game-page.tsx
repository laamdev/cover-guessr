"use client"

import { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { IAlbum } from "@/db/types"
import { Balancer } from "react-wrap-balancer"

import { cn } from "@/lib/utils"
import { Slider } from "@/components/ui/slider"

export const GamePage = ({ album }: { album: IAlbum }) => {
  const router = useRouter()
  const [fade, setFade] = useState(false)
  const [year, setYear] = useState(1950)

  return (
    <section className="grid h-screen place-content-center">
      {/* <div className="mx-auto max-w-2xl grow"> */}
      <div
        className={cn(
          "flex flex-col items-center justify-center py-10 transition-opacity duration-1000 ease-in-out",
          fade ? "opacity-0" : "opacity-100"
        )}
      >
        <div className="flex flex-col items-center">
          <Image
            src={album.cover}
            alt={album.album}
            width={640}
            height={640}
            priority
            className="h-72 w-72 rounded"
          />
          <h1 className="mt-2.5 max-w-prose text-center text-3xl leading-none tracking-tighter">
            <Balancer>{album.album}</Balancer>
          </h1>
          <h2 className="text-xl">by {album.artist}</h2>

          <div className="mt-10 flex w-96 flex-col items-center justify-center">
            <Slider
              defaultValue={[1950]}
              max={2023}
              min={1900}
              step={1}
              onValueChange={(i) => setYear(i[0])}
            />
            <div className="mt-2.5 text-xl font-bold">{year}</div>
          </div>

          <div className="flex flex-col items-center justify-center">
            <button
              type="submit"
              className="mt-5 max-w-xs rounded-2xl border-2 border-solid border-black bg-slate-200 p-3 text-xl text-black hover:cursor-pointer hover:bg-white"
              onClick={() => {
                setFade(true)
                setTimeout(() => router.refresh(), 1000)
                setTimeout(() => setFade(false), 1200)
              }}
            >
              Guess Year
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
