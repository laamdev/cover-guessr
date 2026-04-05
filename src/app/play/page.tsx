"use client";

import { useState, useCallback, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id, Doc } from "../../../convex/_generated/dataModel";
import { Header } from "@/components/header";
import { CoverImage } from "@/components/game/cover-image";
import { YearSlider } from "@/components/game/year-slider";
import { RoundResult } from "@/components/game/round-result";
import { GameOver } from "@/components/game/game-over";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Zap, Target, Flame } from "lucide-react";

const STARTING_CREDITS = 100;
const STORAGE_KEY = "cover-guessr-game-id";

type GuessResult = {
  diff: number;
  isPerfect: boolean;
  isClose: boolean;
  correctYear: number;
  credits: number;
  isGameOver: boolean;
  streak: number;
  perfectGuesses: number;
  closeGuesses: number;
};

export default function PlayPage() {
  const { user } = useUser();
  const albumCount = useQuery(api.albums.count);
  const yearRange = useQuery(api.albums.yearRange);
  const startGame = useMutation(api.games.startGame);
  const submitGuess = useMutation(api.games.submitGuess);
  const saveScore = useMutation(api.scores.saveScore);

  // Restore gameId from localStorage
  const [gameId, setGameId] = useState<Id<"games"> | null>(() => {
    if (typeof window === "undefined") return null;
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? (stored as Id<"games">) : null;
  });

  const game = useQuery(api.games.getGame, gameId ? { gameId } : "skip");

  // Determine phase from game state on load/refresh
  const [phase, setPhase] = useState<"lobby" | "guessing" | "result" | "over">(
    "lobby"
  );
  const [lastResult, setLastResult] = useState<GuessResult | null>(null);
  const [resultAlbum, setResultAlbum] = useState<Doc<"albums"> | null>(null);
  const [albumCache, setAlbumCache] = useState<Map<string, Doc<"albums">>>(
    new Map()
  );
  const [hasRestored, setHasRestored] = useState(false);

  // Restore phase from game state after Convex loads
  useEffect(() => {
    if (hasRestored || !game) return;
    setHasRestored(true);
    if (game.status === "completed") {
      setPhase("lobby");
      setGameId(null);
      localStorage.removeItem(STORAGE_KEY);
    } else if (game.status === "in_progress") {
      setPhase("guessing");
    }
  }, [game, hasRestored]);

  // Persist gameId to localStorage
  useEffect(() => {
    if (gameId) {
      localStorage.setItem(STORAGE_KEY, gameId);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [gameId]);

  // Only fetch the album needed for the guessing phase — during result we use resultAlbum
  const shouldFetchAlbum =
    game?.currentAlbumId && (phase === "guessing" || phase === "lobby");
  const currentAlbumQuery = useQuery(
    api.albums.getById,
    shouldFetchAlbum ? { id: game.currentAlbumId } : "skip"
  );

  // Cache albums as they load
  if (currentAlbumQuery && !albumCache.has(currentAlbumQuery._id)) {
    albumCache.set(currentAlbumQuery._id, currentAlbumQuery);
  }

  // During guessing: use query or cache. During result: use resultAlbum.
  const currentAlbum =
    phase === "result" || phase === "over"
      ? resultAlbum
      : currentAlbumQuery ??
        (game?.currentAlbumId
          ? albumCache.get(game.currentAlbumId) ?? null
          : null);

  const handleStartGame = async () => {
    if (!user) return;
    const id = await startGame({ userId: user.id });
    setGameId(id);
    setPhase("guessing");
    setLastResult(null);
    setAlbumCache(new Map());
    setHasRestored(true);
  };

  const handleGuess = async (year: number) => {
    if (!gameId || !currentAlbum) return;
    setResultAlbum(currentAlbum);
    const result = await submitGuess({ gameId, guess: year });
    setLastResult(result);
    setPhase("result");
  };

  const handleNext = async () => {
    if (!lastResult || !game || !user) return;

    if (lastResult.isGameOver) {
      await saveScore({
        userId: user.id,
        userName:
          user.fullName ??
          user.username ??
          user.primaryEmailAddress?.emailAddress ??
          "Anonymous",
        userImage: user.imageUrl,
        gameId: gameId!,
        streak: lastResult.streak,
        perfectGuesses: lastResult.perfectGuesses,
        closeGuesses: lastResult.closeGuesses,
        creditsRemaining: lastResult.credits,
      });
      setPhase("over");
      localStorage.removeItem(STORAGE_KEY);
    } else {
      setPhase("guessing");
      setLastResult(null);
      setResultAlbum(null);
    }
  };

  const handlePlayAgain = () => {
    setPhase("lobby");
    setGameId(null);
    setLastResult(null);
    setResultAlbum(null);
    setAlbumCache(new Map());
    setHasRestored(true);
  };

  const credits = lastResult?.credits ?? game?.credits ?? STARTING_CREDITS;
  const creditPercent = Math.max(0, (credits / STARTING_CREDITS) * 100);

  return (
    <>
      <Header />
      <main className="flex flex-1 flex-col items-center px-4 py-8">
        {phase === "lobby" && (
          <div className="mx-auto max-w-md space-y-6 text-center">
            <h1 className="text-2xl font-bold uppercase tracking-wider">
              Ready to Play?
            </h1>
            <p className="text-sm text-muted-foreground">
              Guess album release years to survive. You start with{" "}
              <span className="font-bold text-primary">{STARTING_CREDITS}</span>{" "}
              credits — each guess costs you the year difference. Perfect
              guesses earn a +10 bonus. How long can you survive?
            </p>

            <div className="border border-dashed border-border">
              <div className="flex justify-between border-b border-dashed border-border px-4 py-3 text-sm">
                <span className="text-muted-foreground">Starting credits</span>
                <span className="font-bold text-primary">
                  {STARTING_CREDITS}
                </span>
              </div>
              <div className="flex justify-between border-b border-dashed border-border px-4 py-3 text-sm">
                <span className="text-muted-foreground">Perfect bonus</span>
                <span className="font-bold">+10</span>
              </div>
              <div className="flex justify-between px-4 py-3 text-sm">
                <span className="text-muted-foreground">Albums available</span>
                <span className="font-bold">{albumCount ?? "..."}</span>
              </div>
            </div>

            {albumCount === 0 ? (
              <p className="text-sm text-destructive">
                No albums available. Ask an admin to add some.
              </p>
            ) : (
              <Button
                onClick={handleStartGame}
                size="lg"
                className="w-full uppercase tracking-wider"
                disabled={albumCount === undefined || albumCount === 0}
              >
                {gameId ? "Continue Game" : "Start Game"}
              </Button>
            )}
          </div>
        )}

        {(phase === "guessing" || phase === "result") && game && (
          <div className="mx-auto flex w-full max-w-lg flex-col items-center gap-6">
            {/* Stats bar */}
            <div className="flex w-full items-center gap-3 text-xs uppercase tracking-wider">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Flame className="h-3.5 w-3.5" />
                <span className="font-bold text-foreground">
                  {lastResult?.streak ?? game.currentRound}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Target className="h-3.5 w-3.5" />
                <span className="font-bold text-foreground">
                  {lastResult?.perfectGuesses ?? game.perfectGuesses}
                </span>
              </div>
              <div className="flex-1" />
              <div className="flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5 text-primary" />
                <span className="font-bold text-primary">{credits}</span>
              </div>
            </div>

            {/* Credits bar */}
            <div className="w-full">
              <Progress value={creditPercent} className="h-1.5" />
            </div>

            {phase === "guessing" && (
              <>
                {currentAlbum ? (
                  <CoverImage coverKey={currentAlbum.coverKey} />
                ) : (
                  <Skeleton className="aspect-square w-full max-w-sm" />
                )}
                <YearSlider
                  onSubmit={handleGuess}
                  disabled={!currentAlbum}
                  minYear={yearRange?.min}
                  maxYear={yearRange?.max}
                />
              </>
            )}

            {phase === "result" && lastResult && (
              <>
                {resultAlbum && (
                  <CoverImage coverKey={resultAlbum.coverKey} />
                )}
                {resultAlbum && (
                  <p className="text-sm font-medium">
                    {resultAlbum.artist} — {resultAlbum.title}
                  </p>
                )}
                <RoundResult
                  guess={game.rounds[game.rounds.length - 1]?.guess ?? 0}
                  correctYear={lastResult.correctYear}
                  diff={lastResult.diff}
                  isPerfect={lastResult.isPerfect}
                  isGameOver={lastResult.isGameOver}
                  onNext={handleNext}
                />
              </>
            )}
          </div>
        )}

        {phase === "over" && game && (
          <GameOver
            game={game}
            onPlayAgain={handlePlayAgain}
          />
        )}
      </main>
    </>
  );
}
