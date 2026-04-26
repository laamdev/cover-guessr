import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

function computeScore(
  streak: number,
  perfectGuesses: number,
  creditsRemaining: number,
) {
  return streak * 1e8 + perfectGuesses * 1e5 + creditsRemaining;
}

export const saveScore = mutation({
  args: {
    gameId: v.id("games"),
    userName: v.string(),
    userImage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const game = await ctx.db.get(args.gameId);
    if (!game) throw new Error("Game not found");
    if (game.userId !== identity.subject) {
      // Either the game belongs to a different user, or it's still
      // owned by a guest clientId and hasn't been claimed yet.
      throw new Error("Game must be claimed before saving a score");
    }
    if (game.status !== "completed") throw new Error("Game not completed");

    const existing = await ctx.db
      .query("scores")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .take(50);
    const dup = existing.find((s) => s.gameId === args.gameId);
    if (dup) return dup._id;

    return await ctx.db.insert("scores", {
      userId: identity.subject,
      userName: args.userName,
      userImage: args.userImage,
      gameId: args.gameId,
      streak: game.currentRound,
      perfectGuesses: game.perfectGuesses,
      closeGuesses: game.closeGuesses,
      creditsRemaining: game.credits,
      score: computeScore(
        game.currentRound,
        game.perfectGuesses,
        game.credits,
      ),
    });
  },
});

export const getLeaderboard = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("scores")
      .withIndex("by_score")
      .order("desc")
      .take(args.limit ?? 20);
  },
});

export const getUserBestScore = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const scores = await ctx.db
      .query("scores")
      .withIndex("by_user_score", (q) => q.eq("userId", identity.subject))
      .order("desc")
      .take(1);
    return scores[0] ?? null;
  },
});
