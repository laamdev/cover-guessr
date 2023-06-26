import Link from "next/link"

import { Button } from "@/components/ui/button"

export default async function HomeRoute() {
  return (
    <div className="grid h-screen place-content-center place-items-center">
      <h1 className="text-bold text-5xl font-bold uppercase leading-none tracking-tighter">
        Cover Guessr
      </h1>
      <p className="prose-xl mt-2.5 max-w-prose text-center">
        Showcase your music knowledge and guess the year on which these albums
        where released.
      </p>

      <Button asChild className="mt-5">
        <Link href="/game">Play the Game</Link>
      </Button>
    </div>
  )
}
