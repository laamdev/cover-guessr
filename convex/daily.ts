import { v } from "convex/values";
import {
  internalMutation,
  mutation,
  query,
  type MutationCtx,
  type QueryCtx,
} from "./_generated/server";
import { internal } from "./_generated/api";
import type { Doc, Id } from "./_generated/dataModel";

const DAILY_LENGTH = 10;

// Scoring tiers — max 10 per round, 100 per puzzle.
type Tier = "bullseye" | "pinpoint" | "close" | "era" | "miss";

function scoreTier(diff: number): { tier: Tier; points: number; emoji: string } {
  if (diff === 0) return { tier: "bullseye", points: 10, emoji: "🎯" };
  if (diff <= 1) return { tier: "pinpoint", points: 7, emoji: "🟩" };
  if (diff <= 3) return { tier: "close", points: 4, emoji: "🟨" };
  if (diff <= 5) return { tier: "era", points: 2, emoji: "🟧" };
  return { tier: "miss", points: 0, emoji: "⬛" };
}

// UTC date string "YYYY-MM-DD" — single source of truth for "today".
function todayUtc(): string {
  return new Date().toISOString().slice(0, 10);
}

// Yesterday's UTC date — used for streak continuity.
function yesterdayUtc(today: string): string {
  const d = new Date(today + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

// Hash a string to a 32-bit seed (xmur3). Pure, no library deps.
function hashSeed(str: string): number {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  h = Math.imul(h ^ (h >>> 16), 2246822507);
  h = Math.imul(h ^ (h >>> 13), 3266489909);
  return (h ^ (h >>> 16)) >>> 0;
}

// Mulberry32 — small, fast, good-enough seeded RNG.
function makeRng(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Deterministic Fisher-Yates: same date → same album order, even if catalog
// is later edited. Caller must still freeze the result on disk (we do).
function seededShuffle<T>(items: T[], seed: number): T[] {
  const out = items.slice();
  const rng = makeRng(seed);
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

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

function callerOwnsEntry(entry: Doc<"dailyEntries">, caller: Caller): boolean {
  if (caller.userId && entry.userId === caller.userId) return true;
  if (caller.clientId && entry.clientId === caller.clientId) return true;
  return false;
}

async function findEntryFor(
  ctx: QueryCtx | MutationCtx,
  caller: Caller,
  date: string,
): Promise<Doc<"dailyEntries"> | null> {
  if (caller.userId) {
    const userEntry = await ctx.db
      .query("dailyEntries")
      .withIndex("by_user_and_date", (q) =>
        q.eq("userId", caller.userId!).eq("date", date),
      )
      .first();
    if (userEntry) return userEntry;
  }
  if (caller.clientId) {
    const clientEntry = await ctx.db
      .query("dailyEntries")
      .withIndex("by_client_and_date", (q) =>
        q.eq("clientId", caller.clientId!).eq("date", date),
      )
      .first();
    if (clientEntry) return clientEntry;
  }
  return null;
}

// Display-time current streak: stored value is only valid if the player
// completed yesterday or today. Skip a day → display 0 (the actual reset
// happens next time they finish a daily, in bumpStreak).
function liveCurrentStreak(
  streak: { currentStreak: number; lastPlayedDate: string },
  today: string,
): number {
  if (streak.lastPlayedDate === today) return streak.currentStreak;
  if (streak.lastPlayedDate === yesterdayUtc(today)) return streak.currentStreak;
  return 0;
}

// Reads only — never creates the challenge. Used by the page to decide what
// state to render (locked already-played view vs. start screen).
export const status = query({
  args: { clientId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const caller = await getCaller(ctx, args);
    const date = todayUtc();
    const entry = await findEntryFor(ctx, caller, date);

    let streak: Doc<"dailyStreaks"> | null = null;
    if (caller.userId) {
      streak = await ctx.db
        .query("dailyStreaks")
        .withIndex("by_user", (q) => q.eq("userId", caller.userId!))
        .unique();
    }

    return {
      date,
      hasEntry: !!entry,
      entryId: entry?._id ?? null,
      status: entry?.status ?? null,
      streak: streak
        ? {
            current: liveCurrentStreak(streak, date),
            longest: streak.longestStreak,
            lastPlayedDate: streak.lastPlayedDate,
          }
        : null,
    };
  },
});

// Lazy challenge creation: first player of the day picks the album set, then
// it's frozen. Returns existing if already created.
async function getOrCreateTodayChallenge(
  ctx: MutationCtx,
  date: string,
): Promise<Doc<"dailyChallenges">> {
  const existing = await ctx.db
    .query("dailyChallenges")
    .withIndex("by_date", (q) => q.eq("date", date))
    .unique();
  if (existing) return existing;

  // Catalog scan — fine while admin-curated. If catalog grows large, switch
  // to deterministic sampling against a stable id index.
  const allAlbums = await ctx.db.query("albums").collect();
  if (allAlbums.length < DAILY_LENGTH) {
    // Fail loud rather than ship a short puzzle that breaks the X/100 UX
    // and the emoji grid. Admin needs to add more albums first.
    throw new Error(
      `Daily challenge needs at least ${DAILY_LENGTH} albums (catalog has ${allAlbums.length}). Ask an admin to add more.`,
    );
  }

  const ids = allAlbums.map((a) => a._id);
  const shuffled = seededShuffle(ids, hashSeed(`daily:${date}`));
  const albumIds = shuffled.slice(0, DAILY_LENGTH);

  const id = await ctx.db.insert("dailyChallenges", { date, albumIds });
  const created = await ctx.db.get(id);
  if (!created) throw new Error("Failed to create challenge");
  return created;
}

// Idempotent: if the caller already has an entry today, returns it. Otherwise
// creates challenge (if needed) and a fresh in-progress entry.
//
// No explicit lock needed for double-click protection: Convex tracks index
// range reads in the OCC read set, so two concurrent `start` calls both
// reading `findEntryFor` (empty) and both inserting will conflict — the
// second commit retries, sees the first insert via index, and returns it.
export const start = mutation({
  args: {
    clientId: v.optional(v.string()),
    userName: v.optional(v.string()),
    userImage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const caller = await getCaller(ctx, args);
    if (!caller.userId && !caller.clientId) {
      throw new Error("Not authenticated and no clientId provided");
    }

    const date = todayUtc();
    const existing = await findEntryFor(ctx, caller, date);
    if (existing) return existing._id;

    const challenge = await getOrCreateTodayChallenge(ctx, date);

    return await ctx.db.insert("dailyEntries", {
      date,
      userId: caller.userId ?? undefined,
      clientId: caller.userId ? undefined : caller.clientId ?? undefined,
      userName: args.userName,
      userImage: args.userImage,
      challengeId: challenge._id,
      albumOrder: challenge.albumIds,
      currentRound: 0,
      currentAlbumId: challenge.albumIds[0],
      status: "in_progress",
      score: 0,
      bullseyes: 0,
      pinpoints: 0,
      closes: 0,
      eras: 0,
      misses: 0,
      grid: "",
    });
  },
});

export const getEntry = query({
  args: { entryId: v.id("dailyEntries"), clientId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const caller = await getCaller(ctx, args);
    const entry = await ctx.db.get(args.entryId);
    if (!entry || !callerOwnsEntry(entry, caller)) return null;
    return entry;
  },
});

export const getEntryRounds = query({
  args: { entryId: v.id("dailyEntries"), clientId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const caller = await getCaller(ctx, args);
    const entry = await ctx.db.get(args.entryId);
    if (!entry || !callerOwnsEntry(entry, caller)) return [];
    return await ctx.db
      .query("dailyRounds")
      .withIndex("by_entry", (q) => q.eq("entryId", args.entryId))
      .collect();
  },
});

// Single source of truth for "should this row appear on the leaderboard?".
// Called from every mutation that can flip eligibility (submit, claim, profile).
async function syncLeaderboardEligibility(
  ctx: MutationCtx,
  entryId: Id<"dailyEntries">,
): Promise<void> {
  const entry = await ctx.db.get(entryId);
  if (!entry) return;
  const eligible =
    entry.status === "completed" && !!entry.userId && !!entry.userName;
  const desired = eligible ? entry.date : undefined;
  if (entry.leaderboardDate === desired) return;
  await ctx.db.patch(entryId, { leaderboardDate: desired });
}

async function bumpStreak(
  ctx: MutationCtx,
  userId: string,
  today: string,
): Promise<void> {
  const existing = await ctx.db
    .query("dailyStreaks")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .unique();

  if (!existing) {
    await ctx.db.insert("dailyStreaks", {
      userId,
      currentStreak: 1,
      longestStreak: 1,
      lastPlayedDate: today,
      totalCompleted: 1,
    });
    return;
  }

  // Idempotent — same-day re-completion shouldn't re-increment.
  if (existing.lastPlayedDate === today) return;

  const continued = existing.lastPlayedDate === yesterdayUtc(today);
  const next = continued ? existing.currentStreak + 1 : 1;
  await ctx.db.patch(existing._id, {
    currentStreak: next,
    longestStreak: Math.max(existing.longestStreak, next),
    lastPlayedDate: today,
    totalCompleted: existing.totalCompleted + 1,
  });
}

export const submitGuess = mutation({
  args: {
    entryId: v.id("dailyEntries"),
    guess: v.number(),
    clientId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const caller = await getCaller(ctx, args);
    const entry = await ctx.db.get(args.entryId);
    if (!entry) throw new Error("Entry not found");
    if (!callerOwnsEntry(entry, caller)) throw new Error("Not authorized");
    if (entry.status === "completed") throw new Error("Already completed");
    if (!entry.currentAlbumId) throw new Error("No current album");

    const album = await ctx.db.get(entry.currentAlbumId);
    if (!album) throw new Error("Album not found");

    const diff = Math.abs(args.guess - album.releaseYear);
    const { tier, points, emoji } = scoreTier(diff);

    const newRound = entry.currentRound + 1;
    await ctx.db.insert("dailyRounds", {
      entryId: args.entryId,
      roundNumber: newRound,
      albumId: entry.currentAlbumId,
      artist: album.artist,
      title: album.title,
      guess: args.guess,
      correctYear: album.releaseYear,
      diff,
      tier,
      points,
    });

    const isLast = newRound >= entry.albumOrder.length;
    const nextAlbumId: Id<"albums"> | undefined = isLast
      ? undefined
      : entry.albumOrder[newRound];

    const newScore = entry.score + points;
    const counts = {
      bullseyes: entry.bullseyes + (tier === "bullseye" ? 1 : 0),
      pinpoints: entry.pinpoints + (tier === "pinpoint" ? 1 : 0),
      closes: entry.closes + (tier === "close" ? 1 : 0),
      eras: entry.eras + (tier === "era" ? 1 : 0),
      misses: entry.misses + (tier === "miss" ? 1 : 0),
    };

    const completedAt = isLast ? Date.now() : undefined;
    await ctx.db.patch(args.entryId, {
      currentRound: newRound,
      currentAlbumId: nextAlbumId,
      score: newScore,
      grid: entry.grid + emoji,
      ...counts,
      status: isLast ? "completed" : "in_progress",
      ...(completedAt ? { completedAt } : {}),
    });

    // Streak only counts for signed-in users, and only on the day they
    // actually finish. Guests can play without earning streak credit.
    if (isLast && caller.userId) {
      await bumpStreak(ctx, caller.userId, entry.date);
    }
    if (isLast) {
      await syncLeaderboardEligibility(ctx, args.entryId);
    }

    return {
      diff,
      tier,
      points,
      emoji,
      guess: args.guess,
      correctYear: album.releaseYear,
      score: newScore,
      isComplete: isLast,
      currentRound: newRound,
    };
  },
});

// Claim a guest entry once the user signs in mid-flow. Idempotent.
export const claimEntry = mutation({
  args: { entryId: v.id("dailyEntries"), clientId: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Must be signed in to claim an entry");

    const entry = await ctx.db.get(args.entryId);
    if (!entry) return null;
    if (entry.userId === identity.subject) return entry._id;
    if (entry.clientId !== args.clientId) {
      throw new Error("Not authorized to claim this entry");
    }

    // Avoid stomping a different user's existing entry for the same day.
    const dupe = await ctx.db
      .query("dailyEntries")
      .withIndex("by_user_and_date", (q) =>
        q.eq("userId", identity.subject).eq("date", entry.date),
      )
      .first();
    if (dupe && dupe._id !== entry._id) {
      // User already has a real entry for today — drop the guest one.
      return dupe._id;
    }

    await ctx.db.patch(args.entryId, {
      userId: identity.subject,
      clientId: undefined,
    });

    if (entry.status === "completed") {
      await bumpStreak(ctx, identity.subject, entry.date);
    }
    await syncLeaderboardEligibility(ctx, args.entryId);
    return args.entryId;
  },
});

export const updateProfile = mutation({
  args: {
    entryId: v.id("dailyEntries"),
    userName: v.string(),
    userImage: v.optional(v.string()),
    clientId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const caller = await getCaller(ctx, args);
    const entry = await ctx.db.get(args.entryId);
    if (!entry || !callerOwnsEntry(entry, caller)) return null;
    await ctx.db.patch(args.entryId, {
      userName: args.userName,
      userImage: args.userImage,
    });
    await syncLeaderboardEligibility(ctx, args.entryId);
    return args.entryId;
  },
});

// Top entries for a given UTC date — defaults to today. Hits the sparse
// `by_leaderboard` index, which only contains entries that are completed,
// signed-in, and named. No post-filter needed.
export const leaderboard = query({
  args: {
    date: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const date = args.date ?? todayUtc();
    const limit = args.limit ?? 20;
    const rows = await ctx.db
      .query("dailyEntries")
      .withIndex("by_leaderboard", (q) => q.eq("leaderboardDate", date))
      .order("desc")
      .take(limit);
    return rows.map((r) => ({
      _id: r._id,
      userName: r.userName ?? "Anonymous",
      userImage: r.userImage,
      score: r.score,
      bullseyes: r.bullseyes,
      pinpoints: r.pinpoints,
      closes: r.closes,
      eras: r.eras,
      misses: r.misses,
      grid: r.grid,
      completedAt: r.completedAt,
    }));
  },
});

// Sweep abandoned guest entries — anything in_progress whose date is older
// than yesterday is unreachable by the player (the page won't resume past
// midnight UTC) so it just bloats storage. Self-reschedules until done.
const ABANDON_GRACE_DAYS = 2;
const CLEANUP_BATCH_SIZE = 100;

export const cleanupAbandoned = internalMutation({
  args: { batchSize: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const batch = args.batchSize ?? CLEANUP_BATCH_SIZE;
    const today = todayUtc();
    const cutoff = (() => {
      const d = new Date(today + "T00:00:00Z");
      d.setUTCDate(d.getUTCDate() - ABANDON_GRACE_DAYS);
      return d.toISOString().slice(0, 10);
    })();

    const stale = await ctx.db
      .query("dailyEntries")
      .withIndex("by_status_and_date", (q) =>
        q.eq("status", "in_progress").lt("date", cutoff),
      )
      .take(batch);

    for (const entry of stale) {
      // Cascade-delete the entry's rounds first so we don't leave orphans.
      // 9 rounds max (10th round flips status to completed), so a single
      // .collect() is bounded.
      const rounds = await ctx.db
        .query("dailyRounds")
        .withIndex("by_entry", (q) => q.eq("entryId", entry._id))
        .collect();
      for (const r of rounds) await ctx.db.delete(r._id);
      await ctx.db.delete(entry._id);
    }

    if (stale.length === batch) {
      // More to do — drop into a fresh transaction so we don't blow the
      // per-mutation read/write budget on a backlog.
      await ctx.scheduler.runAfter(0, internal.daily.cleanupAbandoned, {
        batchSize: batch,
      });
    }

    return stale.length;
  },
});

export const myStreak = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const streak = await ctx.db
      .query("dailyStreaks")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .unique();
    if (!streak) return null;
    return {
      current: liveCurrentStreak(streak, todayUtc()),
      longest: streak.longestStreak,
      lastPlayedDate: streak.lastPlayedDate,
      totalCompleted: streak.totalCompleted,
    };
  },
});
