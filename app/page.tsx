import { AuthButtonServer } from "@/components/auth/auth-button-server"
import { SelectCategory } from "@/components/game/select-category"

export default async function HomeRoute() {
  return (
    <div className="grid h-screen place-content-center place-items-center">
      <h1 className="text-bold mt-5 text-4xl font-bold uppercase leading-none tracking-tighter md:text-5xl">
        Cover Guessr
      </h1>
      <p className="prose md:prose-xl mt-2.5 max-w-prose text-center">
        Guess the release year of an album, movie, or videogame. If you want to
        save your score history, log in first. Otherwise, you can play as a
        guest.
      </p>
      <div className="mt-2.5 flex items-center justify-center gap-x-5">
        <AuthButtonServer />
      </div>

      <section className="mt-10 flex flex-col items-center justify-center">
        <p>Start a game:</p>

        <SelectCategory />
      </section>
    </div>
  )
}
