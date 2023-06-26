import { NextResponse } from "next/server"

import getRandomAlbum from "@/lib/getRandomAlbum"

export async function GET(request: Request) {
  const album = await getRandomAlbum()

  return NextResponse.json(album)
}
