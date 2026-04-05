import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const saveScore = mutation({
  args: {
    userId: v.string(),
    userName: v.string(),
    userImage: v.optional(v.string()),
    gameId: v.id("games"),
    streak: v.number(),
    perfectGuesses: v.number(),
    closeGuesses: v.number(),
    creditsRemaining: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("scores", args);
  },
});

export const getLeaderboard = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const scores = await ctx.db
      .query("scores")
      .withIndex("by_streak")
      .order("desc")
      .take(args.limit ?? 20);
    return scores;
  },
});

export const getUserBestScore = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const scores = await ctx.db
      .query("scores")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(1);
    return scores[0] ?? null;
  },
});
