import { NextResponse } from "next/server"

import getAllAlbums from "@/lib/getAllAlbums"

export async function GET(request: Request) {
  const albums = await getAllAlbums()

  return NextResponse.json(albums)
}
