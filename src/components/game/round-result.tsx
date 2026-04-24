"use client";

import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Skull } from "lucide-react";

export function RoundResult({
  guess,
  correctYear,
  diff,
  isPerfect,
  isGameOver,
  onNext,
}: {
  guess: number;
  correctYear: number;
  diff: number;
  isPerfect: boolean;
  isGameOver: boolean;
  onNext: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <div className="flex items-center gap-2">
        {isPerfect ? (
          <CheckCircle2 className="h-6 w-6 text-primary" />
        ) : isGameOver ? (
          <Skull className="h-6 w-6 text-destructive" />
        ) : (
          <XCircle className="h-6 w-6 text-destructive" />
        )}
        <span className="text-lg font-bold uppercase tracking-wider">
          {isPerfect
            ? "Perfect! +10 bonus"
            : `Off by ${diff} year${diff !== 1 ? "s" : ""}`}
        </span>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 border border-dashed border-border px-4 py-3 text-xs sm:text-sm">
        <span className="text-muted-foreground">
          Guess: <span className="font-bold text-foreground">{guess}</span>
        </span>
        <span className="hidden text-border sm:inline">|</span>
        <span className="text-muted-foreground">
          Correct:{" "}
          <span className="font-bold text-primary">{correctYear}</span>
        </span>
        <span className="hidden text-border sm:inline">|</span>
        <span className="text-muted-foreground">
          Cost:{" "}
          <span className={`font-bold ${isPerfect ? "text-primary" : "text-destructive"}`}>
            {isPerfect ? "+10" : `-${diff}`}
          </span>
        </span>
      </div>

      <Button
        onClick={onNext}
        size="lg"
        className="mt-2 uppercase tracking-wider"
        variant={isGameOver ? "destructive" : "default"}
      >
        {isGameOver ? "Game Over" : "Next Round"}
      </Button>
    </div>
  );
}
