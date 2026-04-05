import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  albums: defineTable({
    title: v.string(),
    artist: v.string(),
    releaseYear: v.number(),
    coverKey: v.string(),
    addedBy: v.string(),
  })
    .index("by_year", ["releaseYear"])
    .index("by_artist_and_title", ["artist", "title"]),

  games: defineTable({
    userId: v.string(),
    status: v.union(v.literal("in_progress"), v.literal("completed")),
    currentRound: v.number(),
    credits: v.number(),
    perfectGuesses: v.number(),
    closeGuesses: v.number(),
    currentAlbumId: v.optional(v.id("albums")),
    rounds: v.array(
      v.object({
        albumId: v.id("albums"),
        artist: v.optional(v.string()),
        title: v.optional(v.string()),
        guess: v.number(),
        correctYear: v.number(),
        diff: v.number(),
      })
    ),
  })
    .index("by_user", ["userId"])
    .index("by_user_status", ["userId", "status"]),

  scores: defineTable({
    userId: v.string(),
    userName: v.string(),
    userImage: v.optional(v.string()),
    gameId: v.id("games"),
    streak: v.number(),
    perfectGuesses: v.number(),
    closeGuesses: v.number(),
    creditsRemaining: v.number(),
  })
    .index("by_streak", ["streak"])
    .index("by_user", ["userId"]),
});
