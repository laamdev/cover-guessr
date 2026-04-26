"use client";

import { useState, useEffect } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id, Doc } from "../../../convex/_generated/dataModel";
import { Header } from "@/components/header";
import { CoverImage } from "@/components/game/cover-image";
import { YearSlider } from "@/components/game/year-slider";
import { DailyRoundResult } from "@/components/daily/daily-round-result";
import { DailyResult } from "@/components/daily/daily-result";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Calendar, Flame } from "lucide-react";
import Link from "next/link";
import { useClientId } from "@/lib/use-client-id";

const DAILY_LENGTH = 10;
const STORAGE_KEY = "cover-guessr-daily-entry-id";

type Tier = "bullseye" | "pinpoint" | "close" | "era" | "miss";

type GuessResult = {
  diff: number;
  tier: Tier;
  points: number;
  emoji: string;
  guess: number;
  correctYear: number;
  score: number;
  isComplete: boolean;
  currentRound: number;
};

export default function DailyPage() {
  const { user } = useUser();
  const { isSignedIn } = useAuth();
  const clientId = useClientId();

  const yearRange = useQuery(api.albums.yearRange);
  const status = useQuery(
    api.daily.status,
    clientId ? { clientId } : "skip",
  );

  const startDaily = useMutation(api.daily.start);
  const submitGuess = useMutation(api.daily.submitGuess);
  const claimEntry = useMutation(api.daily.claimEntry);
  const updateProfile = useMutation(api.daily.updateProfile);

  const [entryId, setEntryId] = useState<Id<"dailyEntries"> | null>(() => {
    if (typeof window === "undefined") return null;
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? (stored as Id<"dailyEntries">) : null;
  });

  // Sync entryId from server status — handles cross-device or fresh-tab loads
  // where localStorage doesn't have the id but the server knows the user
  // already started today's puzzle.
  useEffect(() => {
    if (!status) return;
    if (status.entryId && status.entryId !== entryId) {
      setEntryId(status.entryId);
    }
    if (!status.hasEntry && entryId) {
      // Server has no entry for today — stale localStorage from a previous day.
      setEntryId(null);
    }
  }, [status, entryId]);

  useEffect(() => {
    if (entryId) {
      localStorage.setItem(STORAGE_KEY, entryId);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [entryId]);

  const queryArgs =
    entryId && isSignedIn !== undefined && clientId
      ? { entryId, clientId }
      : "skip";
  const entry = useQuery(api.daily.getEntry, queryArgs);
  const rounds = useQuery(api.daily.getEntryRounds, queryArgs);

  const leaderboard = useQuery(
    api.daily.leaderboard,
    entry?.status === "completed" ? { date: entry.date, limit: 10 } : "skip",
  );

  const [phase, setPhase] = useState<"intro" | "guessing" | "result" | "done">(
    "intro",
  );
  const [lastResult, setLastResult] = useState<GuessResult | null>(null);
  const [resultAlbum, setResultAlbum] = useState<Doc<"albums"> | null>(null);
  const [albumCache, setAlbumCache] = useState<Map<string, Doc<"albums">>>(
    new Map(),
  );
  const [hasRestored, setHasRestored] = useState(false);

  // Restore phase from server entry on first load.
  useEffect(() => {
    if (hasRestored || !entry) return;
    setHasRestored(true);
    if (entry.status === "completed") {
      setPhase("done");
    } else {
      setPhase("guessing");
    }
  }, [entry, hasRestored]);

  // Claim a guest entry once the user signs in mid-flow.
  const [hasClaimed, setHasClaimed] = useState(false);
  useEffect(() => {
    if (!isSignedIn || !entryId || !clientId || hasClaimed) return;
    if (!entry || entry.userId) return;
    setHasClaimed(true);
    claimEntry({ entryId, clientId }).catch((err) => {
      console.error("Failed to claim daily entry", err);
      setHasClaimed(false);
    });
  }, [isSignedIn, entryId, clientId, entry, hasClaimed, claimEntry]);

  // After claiming, push the user's name/image so they show up on leaderboard.
  const [hasNamed, setHasNamed] = useState(false);
  useEffect(() => {
    if (hasNamed || !isSignedIn || !user || !entry || !entryId) return;
    if (entry.userId !== user.id) return;
    if (entry.userName) {
      setHasNamed(true);
      return;
    }
    setHasNamed(true);
    updateProfile({
      entryId,
      userName:
        user.fullName ??
        user.username ??
        user.primaryEmailAddress?.emailAddress ??
        "Anonymous",
      userImage: user.imageUrl,
      clientId: clientId ?? undefined,
    }).catch((err) => console.error("Failed to update entry profile", err));
  }, [hasNamed, isSignedIn, user, entry, entryId, updateProfile, clientId]);

  // Fetch the current album during guessing.
  const fetchAlbumId =
    phase === "guessing" && entry?.currentAlbumId
      ? entry.currentAlbumId
      : undefined;
  const currentAlbumQuery = useQuery(
    api.albums.getById,
    fetchAlbumId ? { id: fetchAlbumId } : "skip",
  );

  if (currentAlbumQuery && !albumCache.has(currentAlbumQuery._id)) {
    albumCache.set(currentAlbumQuery._id, currentAlbumQuery);
  }

  const currentAlbum =
    phase === "result"
      ? resultAlbum
      : currentAlbumQuery ??
        (entry?.currentAlbumId
          ? albumCache.get(entry.currentAlbumId) ?? null
          : null);

  const handleStart = async () => {
    if (!clientId) return;
    const id = await startDaily({
      clientId,
      userName:
        user?.fullName ??
        user?.username ??
        user?.primaryEmailAddress?.emailAddress ??
        undefined,
      userImage: user?.imageUrl ?? undefined,
    });
    setEntryId(id);
    setPhase("guessing");
    setLastResult(null);
    setAlbumCache(new Map());
    setHasRestored(true);
  };

  const handleGuess = async (year: number) => {
    if (!entryId || !currentAlbum || !clientId) return;
    setResultAlbum(currentAlbum);
    const result = await submitGuess({ entryId, guess: year, clientId });
    setLastResult(result);
    setPhase("result");
  };

  const handleNext = () => {
    if (!lastResult) return;
    if (lastResult.isComplete) {
      setPhase("done");
    } else {
      setPhase("guessing");
      setLastResult(null);
      setResultAlbum(null);
    }
  };

  const currentRound = lastResult?.currentRound ?? entry?.currentRound ?? 0;
  const progressPct = (currentRound / DAILY_LENGTH) * 100;
  const score = lastResult?.score ?? entry?.score ?? 0;

  // Renders below ----------------------------------------------------------

  // Loading
  if (!status || !clientId) {
    return (
      <div className="flex h-[100dvh] flex-col">
        <Header />
        <main className="flex flex-1 items-center justify-center p-4">
          <Skeleton className="h-32 w-full max-w-md" />
        </main>
      </div>
    );
  }

  // Intro screen — no entry yet for today
  if (!entryId && !status.hasEntry) {
    return (
      <div className="flex h-[100dvh] flex-col">
        <Header />
        <main className="flex flex-1 min-h-0 flex-col items-center justify-center px-4 py-4">
          <div className="mx-auto max-w-md space-y-6 text-center">
            <div className="inline-flex items-center gap-2 border border-dashed border-primary/40 bg-primary/5 px-3 py-1 text-[10px] uppercase tracking-widest text-primary">
              <Calendar className="h-3 w-3" />
              {status.date}
            </div>
            <h1 className="text-2xl font-bold uppercase tracking-wider">
              Daily Challenge
            </h1>
            <p className="text-sm text-muted-foreground">
              Ten albums. One puzzle a day. Same set for everyone — share your
              score and compare with friends.
            </p>

            <div className="border border-dashed border-border text-left">
              <div className="flex items-center justify-between border-b border-dashed border-border px-4 py-2.5 text-xs">
                <span className="text-muted-foreground">🎯 Bullseye</span>
                <span className="font-bold">+10 · exact year</span>
              </div>
              <div className="flex items-center justify-between border-b border-dashed border-border px-4 py-2.5 text-xs">
                <span className="text-muted-foreground">🟩 Pinpoint</span>
                <span className="font-bold">+7 · within 1 year</span>
              </div>
              <div className="flex items-center justify-between border-b border-dashed border-border px-4 py-2.5 text-xs">
                <span className="text-muted-foreground">🟨 Close</span>
                <span className="font-bold">+4 · within 3 years</span>
              </div>
              <div className="flex items-center justify-between border-b border-dashed border-border px-4 py-2.5 text-xs">
                <span className="text-muted-foreground">🟧 Right era</span>
                <span className="font-bold">+2 · within 5 years</span>
              </div>
              <div className="flex items-center justify-between px-4 py-2.5 text-xs">
                <span className="text-muted-foreground">⬛ Miss</span>
                <span className="font-bold">0 · over 5 years off</span>
              </div>
            </div>

            {status.streak && status.streak.current > 0 && (
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <Flame className="h-3.5 w-3.5 text-primary" />
                <span>
                  Current streak:{" "}
                  <span className="font-bold text-primary">
                    {status.streak.current}
                  </span>
                </span>
              </div>
            )}

            <Button
              onClick={handleStart}
              size="lg"
              className="w-full uppercase tracking-wider"
              disabled={!clientId}
            >
              Start Today&apos;s Puzzle
            </Button>
            <p className="text-[11px] text-muted-foreground">
              One attempt per day. Resets at midnight UTC.
            </p>
          </div>
        </main>
      </div>
    );
  }

  // Done — show full results
  if (phase === "done" && entry && rounds) {
    return (
      <div className="flex min-h-[100dvh] flex-col">
        <Header />
        <main className="mx-auto w-full max-w-2xl px-4 py-8">
          <DailyResult
            entry={entry}
            rounds={rounds}
            streak={status.streak}
            leaderboard={leaderboard}
            isGuest={!isSignedIn}
          />
          <div className="mt-8 flex justify-center">
            <Link href="/play">
              <Button
                variant="outline"
                size="lg"
                className="uppercase tracking-wider"
              >
                Play Survival Mode
              </Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  // Guessing or result — active gameplay
  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden">
      <Header />
      <main className="flex flex-1 min-h-0 min-w-0 flex-col items-center px-4 py-4 sm:py-8">
        {entry && (
          <div className="mx-auto flex w-full max-w-lg flex-1 min-h-0 flex-col items-center gap-4 sm:gap-6">
            {/* Progress bar */}
            <div className="flex w-full shrink-0 items-center gap-3 text-xs uppercase tracking-wider">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                <span className="font-bold text-foreground">
                  {Math.min(currentRound + (phase === "result" ? 0 : 1), DAILY_LENGTH)}
                  /{DAILY_LENGTH}
                </span>
              </div>
              <div className="flex-1" />
              <div className="flex items-center gap-1.5">
                <span className="text-muted-foreground">Score</span>
                <span className="font-bold text-primary tabular-nums">
                  {score}
                </span>
              </div>
            </div>

            <div className="w-full shrink-0">
              <Progress value={progressPct} className="h-1.5" />
            </div>

            {phase === "guessing" && (
              <>
                <div className="flex w-full flex-1 min-h-0 items-center justify-center [container-type:size]">
                  {currentAlbum ? (
                    <CoverImage coverKey={currentAlbum.coverKey} />
                  ) : (
                    <Skeleton className="aspect-square w-[min(100cqi,100cqb)] max-w-sm" />
                  )}
                </div>
                <div className="w-full shrink-0">
                  <YearSlider
                    onSubmit={handleGuess}
                    disabled={!currentAlbum}
                    minYear={yearRange?.min}
                    maxYear={yearRange?.max}
                  />
                </div>
              </>
            )}

            {phase === "result" && lastResult && (
              <>
                <div className="flex w-full flex-1 min-h-0 items-center justify-center [container-type:size]">
                  {resultAlbum && (
                    <CoverImage coverKey={resultAlbum.coverKey} />
                  )}
                </div>
                {resultAlbum && (
                  <div className="shrink-0 text-center">
                    <p className="text-sm font-medium">{resultAlbum.title}</p>
                    <p className="text-xs font-normal text-muted-foreground">
                      by {resultAlbum.artist}
                    </p>
                  </div>
                )}
                <div className="shrink-0">
                  <DailyRoundResult
                    guess={lastResult.guess}
                    correctYear={lastResult.correctYear}
                    diff={lastResult.diff}
                    tier={lastResult.tier}
                    points={lastResult.points}
                    isComplete={lastResult.isComplete}
                    onNext={handleNext}
                  />
                </div>
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
