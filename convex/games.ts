import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const STARTING_CREDITS = 100;
const PERFECT_BONUS = 10;
const CLOSE_THRESHOLD = 10;

export const startGame = mutation({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const allAlbums = await ctx.db.query("albums").collect();
    if (allAlbums.length === 0) {
      throw new Error("No albums available.");
    }

    const firstAlbum = allAlbums[Math.floor(Math.random() * allAlbums.length)];

    return await ctx.db.insert("games", {
      userId: args.userId,
      status: "in_progress",
      currentRound: 0,
      credits: STARTING_CREDITS,
      perfectGuesses: 0,
      closeGuesses: 0,
      currentAlbumId: firstAlbum._id,
      rounds: [],
    });
  },
});

export const submitGuess = mutation({
  args: {
    gameId: v.id("games"),
    guess: v.number(),
  },
  handler: async (ctx, args) => {
    const game = await ctx.db.get(args.gameId);
    if (!game) throw new Error("Game not found");
    if (game.status === "completed") throw new Error("Game already completed");
    if (!game.currentAlbumId) throw new Error("No current album");

    const album = await ctx.db.get(game.currentAlbumId);
    if (!album) throw new Error("Album not found");

    const diff = Math.abs(args.guess - album.releaseYear);
    const isPerfect = diff === 0;
    const isClose = diff <= CLOSE_THRESHOLD && diff > 0;

    let newCredits = game.credits - diff;
    if (isPerfect) newCredits += PERFECT_BONUS;
    newCredits = Math.max(0, newCredits);

    const newRound = {
      albumId: game.currentAlbumId,
      artist: album.artist,
      title: album.title,
      guess: args.guess,
      correctYear: album.releaseYear,
      diff,
    };

    const updatedRounds = [...game.rounds, newRound];
    const newPerfect = game.perfectGuesses + (isPerfect ? 1 : 0);
    const newClose = game.closeGuesses + (isClose ? 1 : 0);
    // Pick next album (no repeats)
    let nextAlbumId = undefined;
    let outOfAlbums = false;
    if (newCredits > 0) {
      const usedIds = new Set(updatedRounds.map((r) => r.albumId));
      const allAlbums = await ctx.db.query("albums").collect();
      const available = allAlbums.filter((a) => !usedIds.has(a._id));
      if (available.length > 0) {
        nextAlbumId =
          available[Math.floor(Math.random() * available.length)]._id;
      } else {
        outOfAlbums = true;
      }
    }

    const isGameOver = newCredits <= 0 || outOfAlbums;

    await ctx.db.patch(args.gameId, {
      rounds: updatedRounds,
      credits: newCredits,
      currentRound: updatedRounds.length,
      perfectGuesses: newPerfect,
      closeGuesses: newClose,
      currentAlbumId: nextAlbumId,
      status: isGameOver ? "completed" : "in_progress",
    });

    return {
      diff,
      isPerfect,
      isClose,
      correctYear: album.releaseYear,
      credits: newCredits,
      isGameOver,
      streak: updatedRounds.length,
      perfectGuesses: newPerfect,
      closeGuesses: newClose,
    };
  },
});

export const getGame = query({
  args: { gameId: v.id("games") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.gameId);
  },
});

export const getActiveGame = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("games")
      .withIndex("by_user_status", (q) =>
        q.eq("userId", args.userId).eq("status", "in_progress")
      )
      .first();
  },
});
