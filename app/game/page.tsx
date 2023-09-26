import { Metadata } from "next"
import { cookies } from "next/headers"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"

import { getRandomMedia } from "@/lib/get-random-media"
import { getSession } from "@/lib/queries"
import { GamePage } from "@/components/game/game-page"

type Props = {
  params: { id: string }
  searchParams: { [key: string]: string | string[] | undefined }
}

export async function generateMetadata({
  searchParams,
}: Props): Promise<Metadata> {
  const { category } = searchParams

  const title =
    category === ""
      ? "All"
      : ((category![0].toUpperCase() + category?.slice(1)) as string)

  return {
    title: title,
    icons: {
      shortcut: `/favicon/${category === "" ? "all" : category}/favicon.ico`,
    },
  }
}

export default async function GameRoute({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const session = await getSession()

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

  return (
    <GamePage
      media={randomMedia}
      category={mediaName}
      currentUserId={session?.user.id}
    />
  )
}
