import { InferModel, sql } from "drizzle-orm"
import {
  AnyMySqlColumn,
  index,
  int,
  mysqlSchema,
  mysqlTable,
  text,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core"

export const albums = mysqlTable(
  "albums",
  {
    id: int("id").autoincrement().primaryKey().notNull(),
    album: varchar("album", { length: 255 }).notNull(),
    cover: text("cover").notNull(),
    year: int("year").notNull(),
    artistId: int("artist_id").notNull(),
    genreId: int("genre_id").notNull(),
  },
  (table) => {
    return {
      album: uniqueIndex("album").on(table.album),
      artistIdIdx: index("artist_id_idx").on(table.artistId),
      categoryIdIdx: index("category_id_idx").on(table.genreId),
    }
  }
)

export const artists = mysqlTable(
  "artists",
  {
    id: int("id").autoincrement().primaryKey().notNull(),
    artist: varchar("artist", { length: 255 }).notNull(),
  },
  (table) => {
    return {
      artist: uniqueIndex("artist").on(table.artist),
    }
  }
)

export const genres = mysqlTable(
  "genres",
  {
    id: int("id").autoincrement().primaryKey().notNull(),
    genre: varchar("genre", { length: 255 }).notNull(),
  },
  (table) => {
    return {
      genre: uniqueIndex("genre").on(table.genre),
    }
  }
)

export type Album = InferModel<typeof albums>
