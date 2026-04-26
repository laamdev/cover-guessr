"use client";

import { Button } from "@/components/ui/button";
import { Skull, Flame, Target, Disc3, Trophy, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { SignInButton } from "@clerk/nextjs";
import type { Doc } from "../../../convex/_generated/dataModel";

type Round = Doc<"gameRounds">;

export function GameOver({
  game,
  rounds,
  onPlayAgain,
  isGuest = false,
  scoreSaved = false,
}: {
  game: {
    credits: number;
    currentRound: number;
    perfectGuesses: number;
    closeGuesses: number;
  };
  rounds: Round[];
  onPlayAgain: () => void;
  isGuest?: boolean;
  scoreSaved?: boolean;
}) {
  const streak = rounds.length;
  const totalDiff = rounds.reduce((sum, r) => sum + r.diff, 0);
  const avgError = streak > 0 ? (totalDiff / streak).toFixed(1) : "0";

  return (
    <div className="mx-auto w-full max-w-lg space-y-8">
      <div className="text-center">
        <Skull className="mx-auto mb-4 h-10 w-10 text-destructive" />
        <h2 className="text-2xl font-bold uppercase tracking-wider">
          Game Over
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          You ran out of credits
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-px border border-dashed border-border bg-border">
        <div className="flex flex-col items-center gap-1 bg-background py-4">
          <Flame className="h-5 w-5 text-primary" />
          <span className="text-2xl font-bold text-primary">{streak}</span>
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Streak
          </span>
        </div>
        <div className="flex flex-col items-center gap-1 bg-background py-4">
          <Target className="h-5 w-5 text-primary" />
          <span className="text-2xl font-bold text-primary">
            {game.perfectGuesses}
          </span>
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Perfect
          </span>
        </div>
        <div className="flex flex-col items-center gap-1 bg-background py-4">
          <Disc3 className="h-5 w-5 text-primary" />
          <span className="text-2xl font-bold text-primary">
            {game.closeGuesses}
          </span>
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Close (10yr)
          </span>
        </div>
      </div>

      <div className="text-center text-xs text-muted-foreground">
        Average error: {avgError} years
      </div>

      {/* Guest sign-in interstitial */}
      {isGuest && streak > 0 && (
        <div className="border border-dashed border-primary/40 bg-primary/5 p-4 text-center">
          <Trophy className="mx-auto mb-2 h-5 w-5 text-primary" />
          <p className="text-sm font-medium">
            Save your {streak}-round streak to the leaderboard
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Sign in to keep your score and compete with other players.
          </p>
          <SignInButton mode="modal">
            <Button
              size="lg"
              className="mt-3 w-full uppercase tracking-wider"
            >
              Sign In to Save
            </Button>
          </SignInButton>
        </div>
      )}

      {/* Score saved confirmation */}
      {scoreSaved && (
        <div className="flex items-center justify-center gap-2 border border-dashed border-primary/40 bg-primary/5 p-3 text-sm text-primary">
          <CheckCircle2 className="h-4 w-4" />
          <span>Saved to leaderboard</span>
        </div>
      )}

      {/* Round history */}
      <div className="border border-dashed border-border">
        <div className="border-b border-dashed border-border px-4 py-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Round History
        </div>
        <div className="max-h-64 overflow-y-auto">
          {rounds.map((round, i) => (
            <div
              key={round._id}
              className="flex items-center gap-3 border-b border-dashed border-border px-3 py-2.5 last:border-b-0 sm:gap-4 sm:px-4"
            >
              <span className="w-6 shrink-0 text-xs font-bold text-muted-foreground">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="flex-1 min-w-0">
                {round.artist && round.title ? (
                  <>
                    <p className="truncate text-sm font-medium">
                      {round.title}
                    </p>
                    <p className="truncate text-xs font-normal text-muted-foreground">
                      by {round.artist}
                    </p>
                  </>
                ) : (
                  <p className="truncate text-sm font-medium">
                    Round {i + 1}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Guessed {round.guess} &middot; Correct {round.correctYear}
                </p>
              </div>
              <span
                className={`shrink-0 text-sm font-bold ${
                  round.diff === 0
                    ? "text-primary"
                    : round.diff <= 10
                      ? "text-foreground"
                      : "text-destructive"
                }`}
              >
                {round.diff === 0 ? "+10" : `-${round.diff}`}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <Button
          onClick={onPlayAgain}
          className="flex-1 uppercase tracking-wider"
          size="lg"
        >
          Play Again
        </Button>
        <Link href="/leaderboard" className="flex-1">
          <Button
            variant="outline"
            className="w-full uppercase tracking-wider"
            size="lg"
          >
            Leaderboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
