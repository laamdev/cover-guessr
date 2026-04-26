"use client";

import { Button } from "@/components/ui/button";

type Tier = "bullseye" | "pinpoint" | "close" | "era" | "miss";

const TIER_LABEL: Record<Tier, string> = {
  bullseye: "Bullseye",
  pinpoint: "Pinpoint",
  close: "Close",
  era: "Right Era",
  miss: "Miss",
};

const TIER_EMOJI: Record<Tier, string> = {
  bullseye: "🎯",
  pinpoint: "🟩",
  close: "🟨",
  era: "🟧",
  miss: "⬛",
};

export function DailyRoundResult({
  guess,
  correctYear,
  diff,
  tier,
  points,
  isComplete,
  onNext,
}: {
  guess: number;
  correctYear: number;
  diff: number;
  tier: Tier;
  points: number;
  isComplete: boolean;
  onNext: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <div className="flex items-center gap-2">
        <span className="text-2xl">{TIER_EMOJI[tier]}</span>
        <span className="text-lg font-bold uppercase tracking-wider">
          {TIER_LABEL[tier]} · +{points}
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
          Off by:{" "}
          <span className="font-bold text-foreground">
            {diff} year{diff !== 1 ? "s" : ""}
          </span>
        </span>
      </div>

      <Button
        onClick={onNext}
        size="lg"
        className="mt-2 uppercase tracking-wider"
      >
        {isComplete ? "See Results" : "Next Round"}
      </Button>
    </div>
  );
}
