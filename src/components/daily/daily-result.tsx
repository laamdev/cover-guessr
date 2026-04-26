"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SignInButton } from "@clerk/nextjs";
import {
  Share2,
  Copy,
  Check,
  Calendar,
  Flame,
  Trophy,
} from "lucide-react";
import { toast } from "sonner";
import type { Doc } from "../../../convex/_generated/dataModel";

type Entry = Doc<"dailyEntries">;
type Round = Doc<"dailyRounds">;

type StreakInfo = {
  current: number;
  longest: number;
  lastPlayedDate: string;
} | null;

type LeaderboardRow = {
  _id: string;
  userName: string;
  userImage?: string;
  score: number;
  bullseyes: number;
  grid: string;
};

const SITE_HOST = "coverguessr.com";

function formatDate(date: string): string {
  // "YYYY-MM-DD" → "Apr 27, 2026" — interpret as UTC so it stays stable.
  const d = new Date(date + "T00:00:00Z");
  return d.toLocaleDateString(undefined, {
    timeZone: "UTC",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function buildShareText(entry: Entry): string {
  const date = formatDate(entry.date);
  return [
    `Cover Guessr · ${date}`,
    `${entry.score}/100 · 🎯${entry.bullseyes} 🟩${entry.pinpoints} 🟨${entry.closes} 🟧${entry.eras} ⬛${entry.misses}`,
    entry.grid,
    SITE_HOST,
  ].join("\n");
}

export function DailyResult({
  entry,
  rounds,
  streak,
  leaderboard,
  isGuest,
}: {
  entry: Entry;
  rounds: Round[];
  streak: StreakInfo;
  leaderboard: LeaderboardRow[] | undefined;
  isGuest: boolean;
}) {
  const [copied, setCopied] = useState(false);

  const sortedRounds = [...rounds].sort(
    (a, b) => a.roundNumber - b.roundNumber,
  );

  const shareText = buildShareText(entry);

  const handleShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ text: shareText });
        return;
      } catch {
        // User cancelled or share unsupported — fall through to copy.
      }
    }
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      toast.success("Copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy — try selecting the text manually.");
    }
  };

  return (
    <div className="mx-auto w-full max-w-lg space-y-8">
      <div className="text-center">
        <div className="mb-3 inline-flex items-center gap-2 border border-dashed border-primary/40 bg-primary/5 px-3 py-1 text-[10px] uppercase tracking-widest text-primary">
          <Calendar className="h-3 w-3" />
          {formatDate(entry.date)}
        </div>
        <h2 className="text-2xl font-bold uppercase tracking-wider">
          Daily Complete
        </h2>
        <div className="mt-4 font-mono text-5xl font-bold text-primary tabular-nums">
          {entry.score}
          <span className="text-2xl text-muted-foreground">/100</span>
        </div>
      </div>

      {/* Emoji grid hero */}
      <div className="border border-dashed border-border p-6 text-center">
        <p className="font-mono text-2xl tracking-widest sm:text-3xl">
          {entry.grid}
        </p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[11px] uppercase tracking-wider text-muted-foreground">
          <span>🎯 {entry.bullseyes}</span>
          <span>🟩 {entry.pinpoints}</span>
          <span>🟨 {entry.closes}</span>
          <span>🟧 {entry.eras}</span>
          <span>⬛ {entry.misses}</span>
        </div>
      </div>

      <div className="flex gap-3">
        <Button
          onClick={handleShare}
          size="lg"
          className="flex-1 uppercase tracking-wider"
        >
          {copied ? (
            <>
              <Check className="mr-2 h-4 w-4" />
              Copied
            </>
          ) : (
            <>
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </>
          )}
        </Button>
        <Button
          onClick={async () => {
            await navigator.clipboard.writeText(shareText);
            setCopied(true);
            toast.success("Copied to clipboard");
            setTimeout(() => setCopied(false), 2000);
          }}
          variant="outline"
          size="lg"
          className="uppercase tracking-wider"
          aria-label="Copy result"
        >
          <Copy className="h-4 w-4" />
        </Button>
      </div>

      {/* Streak card — only shows for signed-in players */}
      {streak && (
        <div className="grid grid-cols-3 gap-px border border-dashed border-border bg-border">
          <div className="flex flex-col items-center gap-1 bg-background py-4">
            <Flame className="h-5 w-5 text-primary" />
            <span className="text-2xl font-bold text-primary">
              {streak.current}
            </span>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Streak
            </span>
          </div>
          <div className="flex flex-col items-center gap-1 bg-background py-4">
            <Trophy className="h-5 w-5 text-primary" />
            <span className="text-2xl font-bold text-primary">
              {streak.longest}
            </span>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Best
            </span>
          </div>
          <div className="flex flex-col items-center gap-1 bg-background py-4">
            <Calendar className="h-5 w-5 text-primary" />
            <span className="text-2xl font-bold text-primary">
              {entry.score}
            </span>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Today
            </span>
          </div>
        </div>
      )}

      {/* Sign-in prompt for guests with a non-zero score */}
      {isGuest && entry.score > 0 && (
        <div className="border border-dashed border-primary/40 bg-primary/5 p-4 text-center">
          <Trophy className="mx-auto mb-2 h-5 w-5 text-primary" />
          <p className="text-sm font-medium">
            Sign in to start your daily streak
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Today&apos;s score is saved. Sign in to keep it on the leaderboard
            and start your streak.
          </p>
          <SignInButton mode="modal">
            <Button size="lg" className="mt-3 w-full uppercase tracking-wider">
              Sign In to Save
            </Button>
          </SignInButton>
        </div>
      )}

      {/* Round-by-round breakdown */}
      <div className="border border-dashed border-border">
        <div className="border-b border-dashed border-border px-4 py-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Round Breakdown
        </div>
        <div className="max-h-72 overflow-y-auto">
          {sortedRounds.map((round) => (
            <div
              key={round._id}
              className="flex items-center gap-3 border-b border-dashed border-border px-3 py-2.5 last:border-b-0 sm:gap-4 sm:px-4"
            >
              <span className="w-6 shrink-0 text-xs font-bold text-muted-foreground">
                {String(round.roundNumber).padStart(2, "0")}
              </span>
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-medium">{round.title}</p>
                <p className="truncate text-xs font-normal text-muted-foreground">
                  by {round.artist}
                </p>
                <p className="text-xs text-muted-foreground">
                  Guessed {round.guess} · Correct {round.correctYear}
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-0.5">
                <span
                  className={`text-sm font-bold ${
                    round.points >= 7
                      ? "text-primary"
                      : round.points > 0
                        ? "text-foreground"
                        : "text-destructive"
                  }`}
                >
                  +{round.points}
                </span>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  {round.tier}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Today's leaderboard */}
      <div className="border border-dashed border-border">
        <div className="flex items-center justify-between border-b border-dashed border-border px-4 py-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          <span>Today&apos;s Top</span>
          <Trophy className="h-3 w-3" />
        </div>
        {!leaderboard && (
          <div className="space-y-2 p-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        )}
        {leaderboard && leaderboard.length === 0 && (
          <div className="px-4 py-6 text-center text-xs text-muted-foreground">
            You&apos;re the first to finish today.
          </div>
        )}
        {leaderboard && leaderboard.length > 0 && (
          <div>
            {leaderboard.map((row, i) => (
              <div
                key={row._id}
                className="flex items-center gap-3 border-b border-dashed border-border px-3 py-2 last:border-b-0 sm:px-4"
              >
                <span
                  className={`w-6 shrink-0 text-center text-xs font-bold ${
                    i === 0
                      ? "text-yellow-500"
                      : i === 1
                        ? "text-gray-400"
                        : i === 2
                          ? "text-amber-600"
                          : "text-muted-foreground"
                  }`}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <Avatar className="h-6 w-6">
                  <AvatarImage src={row.userImage} />
                  <AvatarFallback className="text-[10px]">
                    {row.userName.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="flex-1 truncate text-sm">{row.userName}</span>
                <span className="font-mono text-sm font-bold text-primary tabular-nums">
                  {row.score}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
