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

  // One puzzle per UTC day. Created lazily on the first start of the day, then
  // its `albumIds` are frozen so mid-day catalog edits don't shift the puzzle.
  dailyChallenges: defineTable({
    date: v.string(), // "YYYY-MM-DD" in UTC
    albumIds: v.array(v.id("albums")),
  }).index("by_date", ["date"]),

  // One entry per (player × date). Players are either userId (signed in)
  // or clientId (guest). One attempt per day — re-opening returns the entry.
  //
  // `leaderboardDate` is a sparse-index pattern: it's set to `date` only when
  // the entry is leaderboard-eligible (completed + userId + userName). Rows
  // that don't qualify leave it undefined, so the leaderboard index never
  // sees them. No overfetch, no client-side filter.
  dailyEntries: defineTable({
    date: v.string(),
    userId: v.optional(v.string()),
    clientId: v.optional(v.string()),
    userName: v.optional(v.string()),
    userImage: v.optional(v.string()),
    challengeId: v.id("dailyChallenges"),
    albumOrder: v.array(v.id("albums")),
    currentRound: v.number(),
    currentAlbumId: v.optional(v.id("albums")),
    status: v.union(v.literal("in_progress"), v.literal("completed")),
    score: v.number(),
    bullseyes: v.number(),
    pinpoints: v.number(),
    closes: v.number(),
    eras: v.number(),
    misses: v.number(),
    grid: v.string(), // emoji string, builds up as rounds finish
    completedAt: v.optional(v.number()),
    leaderboardDate: v.optional(v.string()),
  })
    .index("by_user_and_date", ["userId", "date"])
    .index("by_client_and_date", ["clientId", "date"])
    .index("by_leaderboard", ["leaderboardDate", "score"]),

  dailyRounds: defineTable({
    entryId: v.id("dailyEntries"),
    roundNumber: v.number(),
    albumId: v.id("albums"),
    artist: v.string(),
    title: v.string(),
    guess: v.number(),
    correctYear: v.number(),
    diff: v.number(),
    tier: v.union(
      v.literal("bullseye"),
      v.literal("pinpoint"),
      v.literal("close"),
      v.literal("era"),
      v.literal("miss"),
    ),
    points: v.number(),
  }).index("by_entry", ["entryId", "roundNumber"]),

  // Account-level streak. Signed-in only — guests get no streak. Updated when
  // an entry is completed; resets if the player skips a day.
  dailyStreaks: defineTable({
    userId: v.string(),
    currentStreak: v.number(),
    longestStreak: v.number(),
    lastPlayedDate: v.string(), // "YYYY-MM-DD"
    totalCompleted: v.number(),
  }).index("by_user", ["userId"]),
});
