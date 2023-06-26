import { config } from "@/db/config"
import { albums, artists, genres } from "@/db/schema"
import { IAlbum } from "@/db/types"
import { connect } from "@planetscale/database"
import { eq } from "drizzle-orm"
import { drizzle } from "drizzle-orm/planetscale-serverless"

export default async function getAllAlbums(): Promise<Album[]> {
  const conn = connect(config)
  const db = drizzle(conn)
  const results: IAlbum[] = await db
    .select({
      album: albums.album,
      year: albums.year,
      cover: albums.cover,
      artist: artists.artist,
      genre: genres.genre,
    })
    .from(albums)
    .innerJoin(artists, eq(albums.artistId, artists.id))
    .innerJoin(genres, eq(albums.genreId, genres.id))

  return results
}
