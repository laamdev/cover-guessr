import { SelectCategory } from "@/components/game/select-category"

export default async function GameOverRoute({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const { score } = searchParams

  return (
    <div className="grid h-screen place-content-center place-items-center">
      <h1 className="text-bold mt-5 text-4xl font-bold uppercase leading-none tracking-tighter md:text-5xl">
        Game Over
      </h1>
      <div className="relative mt-10 flex h-24 w-24 flex-col items-center justify-center rounded border-2 border-primary px-2.5">
        <h2 className="font-medium">Score</h2>
        <p className="mt-2.5 w-full rounded bg-neutral-100 text-center text-4xl font-bold">
          {score}
        </p>
      </div>

      <div className="mt-10 flex flex-col items-center justify-center">
        <p>Play a new game</p>
        <SelectCategory />
      </div>
    </div>
  )
}
