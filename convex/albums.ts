import { v } from "convex/values";
import { mutation, query, action, MutationCtx } from "./_generated/server";
import { r2 } from "./r2";

async function requireAdmin(ctx: MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Not authenticated");
  if ((identity as Record<string, unknown>).role !== "admin") {
    throw new Error("Not authorized: admin role required");
  }
  return identity;
}

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("albums").collect();
  },
});

export const getById = query({
  args: { id: v.id("albums") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getRandomAlbums = query({
  args: { count: v.number() },
  handler: async (ctx, args) => {
    const allAlbums = await ctx.db.query("albums").collect();
    const shuffled = allAlbums.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(args.count, shuffled.length));
  },
});

export const add = mutation({
  args: {
    title: v.string(),
    artist: v.string(),
    releaseYear: v.number(),
    coverKey: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await requireAdmin(ctx);

    const existing = await ctx.db
      .query("albums")
      .withIndex("by_artist_and_title", (q) =>
        q.eq("artist", args.artist).eq("title", args.title),
      )
      .unique();
    if (existing) {
      throw new Error(
        `Album "${args.title}" by ${args.artist} already exists`,
      );
    }

    return await ctx.db.insert("albums", {
      ...args,
      addedBy: identity.subject,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("albums"),
    title: v.string(),
    artist: v.string(),
    releaseYear: v.number(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const { id, ...fields } = args;
    await ctx.db.patch(id, fields);
  },
});

export const remove = mutation({
  args: { id: v.id("albums") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.delete(args.id);
  },
});

export const getCoverUrl = action({
  args: { key: v.string() },
  handler: async (_ctx, args) => {
    return await r2.getUrl(args.key);
  },
});

export const count = query({
  args: {},
  handler: async (ctx) => {
    const albums = await ctx.db.query("albums").collect();
    return albums.length;
  },
});

export const yearRange = query({
  args: {},
  handler: async (ctx) => {
    const albums = await ctx.db.query("albums").collect();
    if (albums.length === 0) return { min: 1950, max: 2025 };
    const years = albums.map((a) => a.releaseYear);
    return { min: Math.min(...years), max: Math.max(...years) };
  },
});
