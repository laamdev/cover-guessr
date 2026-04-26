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
    userId: v.optional(v.string()),
    clientId: v.optional(v.string()),
    status: v.union(v.literal("in_progress"), v.literal("completed")),
    currentRound: v.number(),
    credits: v.number(),
    perfectGuesses: v.number(),
    closeGuesses: v.number(),
    currentAlbumId: v.optional(v.id("albums")),
    albumOrder: v.array(v.id("albums")),
  })
    .index("by_user", ["userId"])
    .index("by_user_status", ["userId", "status"])
    .index("by_client", ["clientId"])
    .index("by_client_status", ["clientId", "status"]),

  gameRounds: defineTable({
    gameId: v.id("games"),
    roundNumber: v.number(),
    albumId: v.id("albums"),
    artist: v.string(),
    title: v.string(),
    guess: v.number(),
    correctYear: v.number(),
    diff: v.number(),
  }).index("by_game", ["gameId", "roundNumber"]),

  stats: defineTable({
    key: v.string(),
    value: v.number(),
  }).index("by_key", ["key"]),

  scores: defineTable({
    userId: v.string(),
    userName: v.string(),
    userImage: v.optional(v.string()),
    gameId: v.id("games"),
    streak: v.number(),
    perfectGuesses: v.number(),
    closeGuesses: v.number(),
    creditsRemaining: v.number(),
    // Denormalized tiebreaker rank: streak * 1e8 + perfectGuesses * 1e5 + creditsRemaining.
    score: v.number(),
  })
    .index("by_score", ["score"])
    .index("by_user", ["userId"])
    .index("by_user_score", ["userId", "score"]),
});
