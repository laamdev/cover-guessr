import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"

import { getSession, getUsers } from "@/lib/queries"
import { AuthInputClient } from "@/components/auth/auth-input-client"
import { SelectCategory } from "@/components/game/select-category"

export default async function HomeRoute() {
  const session = await getSession()
  const users = await getUsers()

  return (
    <div>
      <div className="text-center">
        <h1 className="text-bold mt-5 text-4xl font-bold uppercase leading-none tracking-tighter md:text-5xl">
          Cover Guessr
        </h1>
        <p className="prose md:prose-xl mt-2.5 max-w-prose text-center">
          {`How many release years of your favorite media can you guess in a row?`}
        </p>
      </div>

      <div className="mt-10 flex items-center justify-center gap-x-5">
        <AuthInputClient session={session!} />
      </div>

      <section className="mt-10 flex flex-col items-center justify-center">
        <p>Pick a category to start playing</p>

        <SelectCategory />
      </section>
    </div>
  )
}
