"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
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
import { useClientId } from "@/lib/use-client-id";

const STARTING_CREDITS = 100;
const STORAGE_KEY = "cover-guessr-game-id";

type GuessResult = {
  diff: number;
  isPerfect: boolean;
  isClose: boolean;
  guess: number;
  correctYear: number;
  credits: number;
  isGameOver: boolean;
  streak: number;
  perfectGuesses: number;
  closeGuesses: number;
};

export default function PlayPage() {
  const { user } = useUser();
  const { isSignedIn } = useAuth();
  const clientId = useClientId();
  const albumCount = useQuery(api.albums.count);
  const yearRange = useQuery(api.albums.yearRange);
  const startGame = useMutation(api.games.startGame);
  const submitGuess = useMutation(api.games.submitGuess);
  const claimGame = useMutation(api.games.claimGame);
  const saveScore = useMutation(api.scores.saveScore);

  // Restore gameId from localStorage
  const [gameId, setGameId] = useState<Id<"games"> | null>(() => {
    if (typeof window === "undefined") return null;
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? (stored as Id<"games">) : null;
  });

  // Wait until we know auth state AND have a clientId, then always pass both
  // so the query can match the game by user OR clientId. This lets a freshly
  // signed-in user still see their guest game until claimGame lands.
  const queryArgs =
    gameId && isSignedIn !== undefined && clientId
      ? { gameId, clientId }
      : "skip";
  const game = useQuery(api.games.getGame, queryArgs);
  const rounds = useQuery(api.games.getGameRounds, queryArgs);

  // Determine phase from game state on load/refresh
  const [phase, setPhase] = useState<"lobby" | "guessing" | "result" | "over">(
    "lobby"
  );
  const [lastResult, setLastResult] = useState<GuessResult | null>(null);
  const [resultAlbum, setResultAlbum] = useState<Doc<"albums"> | null>(null);
  const [albumCache, setAlbumCache] = useState<Map<string, Doc<"albums">>>(
    new Map()
  );
  // Run-once guards live in refs — they gate side-effects, not render.
  const restoredRef = useRef(false);
  const claimedRef = useRef(false);
  const savedRef = useRef(false);

  // Restore phase from game state after Convex loads. Setting state from
  // a server-driven subscription is the documented pattern in the React
  // docs; the lint rule's heuristic doesn't distinguish this case from
  // spurious sync. The ref guard ensures it runs exactly once per mount.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (restoredRef.current || !game) return;
    restoredRef.current = true;
    if (game.status === "completed") {
      // Signed-in users already had their score saved inline at game over,
      // so a stale completed game just means "go back to lobby". Guests
      // need to stay on the over screen so they can still sign in to save.
      if (isSignedIn) {
        setPhase("lobby");
        setGameId(null);
        localStorage.removeItem(STORAGE_KEY);
      } else {
        setPhase("over");
      }
    } else if (game.status === "in_progress") {
      setPhase("guessing");
    }
  }, [game, isSignedIn]);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Persist gameId to localStorage
  useEffect(() => {
    if (gameId) {
      localStorage.setItem(STORAGE_KEY, gameId);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [gameId]);

  // Only fetch the album needed for the guessing phase — during result we use resultAlbum
  const fetchAlbumId =
    (phase === "guessing" || phase === "lobby") && game?.currentAlbumId
      ? game.currentAlbumId
      : undefined;
  const currentAlbumQuery = useQuery(
    api.albums.getById,
    fetchAlbumId ? { id: fetchAlbumId } : "skip"
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
    if (!clientId) return;
    const id = await startGame({ clientId });
    setGameId(id);
    setPhase("guessing");
    setLastResult(null);
    setAlbumCache(new Map());
    restoredRef.current = true;
  };

  const handleGuess = async (year: number) => {
    if (!gameId || !currentAlbum || !clientId) return;
    setResultAlbum(currentAlbum);
    const result = await submitGuess({ gameId, guess: year, clientId });
    setLastResult(result);
    setPhase("result");
  };

  const handleNext = async () => {
    if (!lastResult || !game) return;

    if (lastResult.isGameOver) {
      // Signed-in users save immediately and clear the game-id stash.
      // Guests keep gameId in localStorage so a reload during the sign-in
      // flow doesn't lose the score they just earned.
      if (isSignedIn && user) {
        await saveScore({
          gameId: gameId!,
          userName:
            user.fullName ??
            user.username ??
            user.primaryEmailAddress?.emailAddress ??
            "Anonymous",
          userImage: user.imageUrl,
        });
        setHasSavedScore(true);
        localStorage.removeItem(STORAGE_KEY);
      }
      setPhase("over");
    } else {
      setPhase("guessing");
      setLastResult(null);
      setResultAlbum(null);
    }
  };

  // Claim a guest game once the user signs in mid-flow (or right after game over).
  useEffect(() => {
    if (!isSignedIn || !gameId || !clientId || claimedRef.current) return;
    if (!game || game.userId) return;
    claimedRef.current = true;
    claimGame({ gameId, clientId }).catch((err) => {
      console.error("Failed to claim game", err);
      claimedRef.current = false;
    });
  }, [isSignedIn, gameId, clientId, game, claimGame]);

  // After a guest signs in on the GameOver screen, save the score.
  // `savedRef` gates the effect against re-firing; the visual flag is set
  // from the resolved promise (allowed by react-hooks/set-state-in-effect
  // since it runs in an async callback, not the synchronous effect body).
  const [hasSavedScore, setHasSavedScore] = useState(false);
  useEffect(() => {
    if (phase !== "over" || savedRef.current) return;
    if (!isSignedIn || !user || !gameId || !game) return;
    if (game.userId !== user.id) return; // wait until the claim has landed
    savedRef.current = true;
    saveScore({
      gameId,
      userName:
        user.fullName ??
        user.username ??
        user.primaryEmailAddress?.emailAddress ??
        "Anonymous",
      userImage: user.imageUrl,
    })
      .then(() => setHasSavedScore(true))
      .catch((err) => {
        console.error("Failed to save score", err);
        savedRef.current = false;
      });
  }, [phase, isSignedIn, user, gameId, game, saveScore]);

  const handlePlayAgain = () => {
    setPhase("lobby");
    setGameId(null);
    setLastResult(null);
    setResultAlbum(null);
    setAlbumCache(new Map());
    restoredRef.current = true;
    claimedRef.current = false;
    savedRef.current = false;
    setHasSavedScore(false);
  };

  const credits = lastResult?.credits ?? game?.credits ?? STARTING_CREDITS;
  const creditPercent = Math.max(0, (credits / STARTING_CREDITS) * 100);

  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden">
      <Header />
      <main className="flex flex-1 min-h-0 min-w-0 flex-col items-center px-4 py-4 sm:py-8">
        {phase === "lobby" && (
          <div className="mx-auto my-auto max-w-md space-y-6 text-center">
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
                disabled={
                  albumCount === undefined || albumCount === 0 || !clientId
                }
              >
                {gameId ? "Continue Game" : "Start Game"}
              </Button>
            )}
          </div>
        )}

        {(phase === "guessing" || phase === "result") && game && (
          <div className="mx-auto flex w-full max-w-lg flex-1 min-h-0 flex-col items-center gap-4 sm:gap-6">
            {/* Stats bar */}
            <div className="flex w-full shrink-0 items-center gap-3 text-xs uppercase tracking-wider">
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
            <div className="w-full shrink-0">
              <Progress value={creditPercent} className="h-1.5" />
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
                  <RoundResult
                    guess={lastResult.guess}
                    correctYear={lastResult.correctYear}
                    diff={lastResult.diff}
                    isPerfect={lastResult.isPerfect}
                    isGameOver={lastResult.isGameOver}
                    onNext={handleNext}
                  />
                </div>
              </>
            )}
          </div>
        )}

        {phase === "over" && game && rounds && (
          <div className="w-full overflow-y-auto">
            <GameOver
              game={game}
              rounds={rounds}
              onPlayAgain={handlePlayAgain}
              isGuest={!isSignedIn}
              scoreSaved={hasSavedScore && !!game.userId}
            />
          </div>
        )}
      </main>
    </div>
  );
}
