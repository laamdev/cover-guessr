import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

const STARTING_CREDITS = 100;
const PERFECT_BONUS = 10;
const CLOSE_THRESHOLD = 10;
const MAX_GAME_LENGTH = 200;

export const startGame = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    // Full table scan: acceptable while the catalog is admin-curated.
    // If the album count grows past a few thousand, switch to a numeric `seq`
    // index + sampled random ids to avoid loading every doc on game start.
    const allAlbums = await ctx.db.query("albums").collect();
    if (allAlbums.length === 0) {
      throw new Error("No albums available.");
    }

    // Partial Fisher-Yates: produces an unbiased uniform sample of the first
    // `pickCount` ids without sorting the entire array.
    const ids = allAlbums.map((a) => a._id);
    const pickCount = Math.min(ids.length, MAX_GAME_LENGTH);
    for (let i = 0; i < pickCount; i++) {
      const j = i + Math.floor(Math.random() * (ids.length - i));
      [ids[i], ids[j]] = [ids[j], ids[i]];
    }
    const albumOrder = ids.slice(0, pickCount);

    return await ctx.db.insert("games", {
      userId: identity.subject,
      status: "in_progress",
      currentRound: 0,
      credits: STARTING_CREDITS,
      perfectGuesses: 0,
      closeGuesses: 0,
      currentAlbumId: albumOrder[0],
      albumOrder,
    });
  },
});

export const submitGuess = mutation({
  args: {
    gameId: v.id("games"),
    guess: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const game = await ctx.db.get(args.gameId);
    if (!game) throw new Error("Game not found");
    if (game.userId !== identity.subject) throw new Error("Not authorized");
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

    const newCurrentRound = game.currentRound + 1;
    await ctx.db.insert("gameRounds", {
      gameId: args.gameId,
      roundNumber: newCurrentRound,
      albumId: game.currentAlbumId,
      artist: album.artist,
      title: album.title,
      guess: args.guess,
      correctYear: album.releaseYear,
      diff,
    });

    const newPerfect = game.perfectGuesses + (isPerfect ? 1 : 0);
    const newClose = game.closeGuesses + (isClose ? 1 : 0);

    let nextAlbumId: Id<"albums"> | undefined = undefined;
    let outOfAlbums = false;
    if (newCredits > 0) {
      if (newCurrentRound < game.albumOrder.length) {
        nextAlbumId = game.albumOrder[newCurrentRound];
      } else {
        outOfAlbums = true;
      }
    }

    const isGameOver = newCredits <= 0 || outOfAlbums;

    await ctx.db.patch(args.gameId, {
      credits: newCredits,
      currentRound: newCurrentRound,
      perfectGuesses: newPerfect,
      closeGuesses: newClose,
      currentAlbumId: nextAlbumId,
      status: isGameOver ? "completed" : "in_progress",
    });

    return {
      diff,
      isPerfect,
      isClose,
      guess: args.guess,
      correctYear: album.releaseYear,
      credits: newCredits,
      isGameOver,
      streak: newCurrentRound,
      perfectGuesses: newPerfect,
      closeGuesses: newClose,
    };
  },
});

export const getGame = query({
  args: { gameId: v.id("games") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const game = await ctx.db.get(args.gameId);
    if (!game || game.userId !== identity.subject) return null;
    return game;
  },
});

export const getActiveGame = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    return await ctx.db
      .query("games")
      .withIndex("by_user_status", (q) =>
        q.eq("userId", identity.subject).eq("status", "in_progress")
      )
      .first();
  },
});

export const getGameRounds = query({
  args: { gameId: v.id("games") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const game = await ctx.db.get(args.gameId);
    if (!game || game.userId !== identity.subject) return [];
    return await ctx.db
      .query("gameRounds")
      .withIndex("by_game", (q) => q.eq("gameId", args.gameId))
      .collect();
  },
});

