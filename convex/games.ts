import { v } from "convex/values";
import {
  mutation,
  query,
  type MutationCtx,
  type QueryCtx,
} from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";

const STARTING_CREDITS = 100;
const PERFECT_BONUS = 10;
const CLOSE_THRESHOLD = 10;
const MAX_GAME_LENGTH = 200;

type Caller = {
  userId: string | null;
  clientId: string | null;
};

async function getCaller(
  ctx: MutationCtx | QueryCtx,
  args: { clientId?: string },
): Promise<Caller> {
  const identity = await ctx.auth.getUserIdentity();
  return {
    userId: identity?.subject ?? null,
    clientId: args.clientId ?? null,
  };
}

// Returns true if the caller is allowed to act on this game, via either
// matching userId (signed in, claimed) or matching clientId (guest, or
// signed-in user mid-claim).
function callerOwnsGame(game: Doc<"games">, caller: Caller): boolean {
  if (caller.userId && game.userId === caller.userId) return true;
  if (caller.clientId && game.clientId === caller.clientId) return true;
  return false;
}

export const startGame = mutation({
  args: {
    clientId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const caller = await getCaller(ctx, args);
    if (!caller.userId && !caller.clientId) {
      throw new Error("Not authenticated and no clientId provided");
    }

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

    // Prefer the signed-in identity. Guests get tagged with their clientId.
    return await ctx.db.insert("games", {
      userId: caller.userId ?? undefined,
      clientId: caller.userId ? undefined : caller.clientId ?? undefined,
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
    clientId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const caller = await getCaller(ctx, args);
    const game = await ctx.db.get(args.gameId);
    if (!game) throw new Error("Game not found");
    if (!callerOwnsGame(game, caller)) throw new Error("Not authorized");
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

// Claim a guest game for the now-signed-in user. Idempotent.
export const claimGame = mutation({
  args: { gameId: v.id("games"), clientId: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Must be signed in to claim a game");

    const game = await ctx.db.get(args.gameId);
    if (!game) return null;
    if (game.userId === identity.subject) return game._id;
    if (game.clientId !== args.clientId) {
      throw new Error("Not authorized to claim this game");
    }

    await ctx.db.patch(args.gameId, {
      userId: identity.subject,
      clientId: undefined,
    });
    return args.gameId;
  },
});

export const getGame = query({
  args: { gameId: v.id("games"), clientId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const caller = await getCaller(ctx, args);
    const game = await ctx.db.get(args.gameId);
    if (!game || !callerOwnsGame(game, caller)) return null;
    return game;
  },
});

export const getActiveGame = query({
  args: { clientId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const caller = await getCaller(ctx, args);
    if (caller.userId) {
      const userGame = await ctx.db
        .query("games")
        .withIndex("by_user_status", (q) =>
          q.eq("userId", caller.userId!).eq("status", "in_progress"),
        )
        .first();
      if (userGame) return userGame;
    }
    if (caller.clientId) {
      return await ctx.db
        .query("games")
        .withIndex("by_client_status", (q) =>
          q.eq("clientId", caller.clientId!).eq("status", "in_progress"),
        )
        .first();
    }
    return null;
  },
});

export const getGameRounds = query({
  args: { gameId: v.id("games"), clientId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const caller = await getCaller(ctx, args);
    const game = await ctx.db.get(args.gameId);
    if (!game || !callerOwnsGame(game, caller)) return [];
    return await ctx.db
      .query("gameRounds")
      .withIndex("by_game", (q) => q.eq("gameId", args.gameId))
      .collect();
  },
});
