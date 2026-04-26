"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Header } from "@/components/header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, Flame, Target } from "lucide-react";

export default function LeaderboardPage() {
  const scores = useQuery(api.scores.getLeaderboard, { limit: 20 });

  return (
    <>
      <Header />
      <main className="mx-auto w-full min-w-0 max-w-2xl px-4 py-8">
        <div className="mb-8 flex items-center gap-3">
          <Trophy className="h-5 w-5 text-primary" />
          <h1 className="text-xl font-bold uppercase tracking-wider">
            Leaderboard
          </h1>
        </div>

        {!scores && (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        )}

        {scores && scores.length === 0 && (
          <div className="border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
            No scores yet. Be the first to play!
          </div>
        )}

        {scores && scores.length > 0 && (
          <div className="overflow-x-auto border border-dashed border-border">
            {/* Table header */}
            <div className="flex items-center gap-4 border-b border-dashed border-border px-4 py-2 text-xs uppercase tracking-wider text-muted-foreground">
              <span className="w-8 text-center">#</span>
              <span className="flex-1">Player</span>
              <span className="w-16 text-right">Streak</span>
              <span className="w-16 text-right">Perfect</span>
            </div>

            {scores.map((entry, i) => (
              <div
                key={entry._id}
                className={`flex items-center gap-4 border-b border-dashed border-border px-4 py-3 transition-colors hover:bg-muted/30 last:border-b-0 ${
                  i < 3 ? "bg-primary/5" : ""
                }`}
              >
                <span
                  className={`w-8 text-center text-xs font-bold ${
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
                  <AvatarImage src={entry.userImage} />
                  <AvatarFallback className="text-[10px]">
                    {entry.userName.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium">
                    {entry.userName}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {entry.closeGuesses} close &middot;{" "}
                    {entry.creditsRemaining} credits left
                  </p>
                </div>

                <div className="flex w-16 items-center justify-end gap-1">
                  <Flame className="h-3 w-3 text-primary" />
                  <span className="text-sm font-bold text-primary">
                    {entry.streak}
                  </span>
                </div>

                <div className="flex w-16 items-center justify-end gap-1">
                  <Target className="h-3 w-3 text-muted-foreground" />
                  <span className="text-sm font-bold">
                    {entry.perfectGuesses}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
