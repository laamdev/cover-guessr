import { v } from "convex/values";
import { mutation, query, MutationCtx } from "./_generated/server";
import { r2 } from "./r2";

const COVER_URL_EXPIRY_SECONDS = 60 * 60 * 24 * 7;
const ALBUM_COUNT_KEY = "albumCount";

async function bumpAlbumCount(ctx: MutationCtx, delta: number) {
  const counter = await ctx.db
    .query("stats")
    .withIndex("by_key", (q) => q.eq("key", ALBUM_COUNT_KEY))
    .unique();
  if (counter) {
    await ctx.db.patch(counter._id, { value: counter.value + delta });
  } else {
    // First write — backfill from the current table state (already reflects this mutation).
    const albums = await ctx.db.query("albums").collect();
    await ctx.db.insert("stats", {
      key: ALBUM_COUNT_KEY,
      value: albums.length,
    });
  }
}

// Requires the Clerk "convex" JWT template to include a `role` claim:
//   { "role": "{{user.public_metadata.role}}" }
// Without that claim, every signed-in user would be rejected here — safe-by-default.
async function requireAdmin(ctx: MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Not authenticated");
  const role = (identity as { role?: unknown }).role;
  if (role !== "admin") {
    throw new Error("Not authorized: admin role required");
  }
  return identity;
}

const ADMIN_LIST_LIMIT = 500;

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("albums").take(ADMIN_LIST_LIMIT);
  },
});

export const getById = query({
  args: { id: v.id("albums") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
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

    const id = await ctx.db.insert("albums", {
      ...args,
      addedBy: identity.subject,
    });
    await bumpAlbumCount(ctx, 1);
    return id;
  },
});

export const update = mutation({
  args: {
    id: v.id("albums"),
    title: v.string(),
    artist: v.string(),
    releaseYear: v.number(),
    coverKey: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const { id, coverKey, ...fields } = args;
    const existing = await ctx.db.get(id);
    if (!existing) throw new Error("Album not found");

    if (
      existing.title !== args.title ||
      existing.artist !== args.artist
    ) {
      const dup = await ctx.db
        .query("albums")
        .withIndex("by_artist_and_title", (q) =>
          q.eq("artist", args.artist).eq("title", args.title),
        )
        .unique();
      if (dup && dup._id !== id) {
        throw new Error(
          `Album "${args.title}" by ${args.artist} already exists`,
        );
      }
    }

    const previousCoverKey = existing.coverKey;
    await ctx.db.patch(id, {
      ...fields,
      ...(coverKey ? { coverKey } : {}),
    });
    if (coverKey && coverKey !== previousCoverKey) {
      await r2.deleteObject(ctx, previousCoverKey);
    }
  },
});

export const remove = mutation({
  args: { id: v.id("albums") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const album = await ctx.db.get(args.id);
    if (!album) return;
    await ctx.db.delete(args.id);
    await r2.deleteObject(ctx, album.coverKey);
    await bumpAlbumCount(ctx, -1);
  },
});

export const getCoverUrl = query({
  args: { key: v.string() },
  handler: async (_ctx, args) => {
    return await r2.getUrl(args.key, { expiresIn: COVER_URL_EXPIRY_SECONDS });
  },
});

export const count = query({
  args: {},
  handler: async (ctx) => {
    const counter = await ctx.db
      .query("stats")
      .withIndex("by_key", (q) => q.eq("key", ALBUM_COUNT_KEY))
      .unique();
    if (counter) return counter.value;
    // Counter not yet initialized — fall back once. The next add/remove writes it.
    return (await ctx.db.query("albums").collect()).length;
  },
});

export const yearRange = query({
  args: {},
  handler: async (ctx) => {
    const oldest = await ctx.db
      .query("albums")
      .withIndex("by_year")
      .first();
    if (!oldest) return { min: 1950, max: 2025 };
    const newest = await ctx.db
      .query("albums")
      .withIndex("by_year")
      .order("desc")
      .first();
    return {
      min: oldest.releaseYear,
      max: newest?.releaseYear ?? oldest.releaseYear,
    };
  },
});
