import { cookies } from "next/headers"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"

import { getRandomMedia } from "@/lib/get-random-media"
import { GamePage } from "@/components/game/game-page"

export default async function GameRoute({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const { category } = searchParams
  const supabase = createServerComponentClient({ cookies })

  let query = supabase
    .from("media")
    .select("title, year, author, cover_url, category!inner ( name )")

  if (category === "") {
    query = query
  } else {
    query = query.eq("category.name", category)
  }

  const { data, error } = await query

  const randomMedia = await getRandomMedia(data)

  const mediaName =
    category === ""
      ? randomMedia.category.name.slice(0, -1)
      : category!.slice(0, -1)

  return <GamePage media={randomMedia} category={mediaName} />
}
