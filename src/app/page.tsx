"use client";

import { useState, useEffect } from "react";
import { useAuth, SignInButton } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/header";
import { Disc3, Trophy, Clock } from "lucide-react";
import Link from "next/link";
import type { VideoGame, WebApplication, WithContext } from "schema-dts";
import {
  getSiteUrl,
  jsonLdString,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TAGLINE,
} from "@/lib/seo";

const siteUrl = getSiteUrl();

const webAppJsonLd: WithContext<WebApplication> = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "@id": `${siteUrl}/#webapp`,
  name: SITE_NAME,
  alternateName: "CoverGuessr",
  url: siteUrl,
  description: SITE_DESCRIPTION,
  applicationCategory: "GameApplication",
  applicationSubCategory: "MusicTriviaGame",
  operatingSystem: "Any (web browser)",
  browserRequirements: "Requires JavaScript and a modern web browser.",
  inLanguage: "en",
  isAccessibleForFree: true,
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
};

const gameJsonLd: WithContext<VideoGame> = {
  "@context": "https://schema.org",
  "@type": "VideoGame",
  "@id": `${siteUrl}/#game`,
  name: SITE_NAME,
  url: siteUrl,
  description: SITE_TAGLINE,
  genre: ["Music trivia", "Guessing game"],
  gamePlatform: "Web browser",
  playMode: "SinglePlayer",
  numberOfPlayers: {
    "@type": "QuantitativeValue",
    minValue: 1,
    maxValue: 1,
  },
};

export default function Home() {
  const { isSignedIn } = useAuth();
  const [hasActiveGame, setHasActiveGame] = useState(false);

  useEffect(() => {
    setHasActiveGame(!!localStorage.getItem("cover-guessr-game-id"));
  }, []);
  const albumCount = useQuery(api.albums.count);

  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: jsonLdString(webAppJsonLd) }}
      />
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: jsonLdString(gameJsonLd) }}
      />
      <Header />
      <main className="flex flex-1 flex-col items-center justify-center p-4">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-6 inline-block border border-dashed border-primary/40 px-3 py-1 text-xs uppercase tracking-widest text-primary">
            / Music &middot; Time &middot; Memory /
          </div>

          <h1 className="mb-6 text-5xl font-bold tracking-tighter flex flex-col -space-y-4 sm:text-7xl">
            <span>Cover</span>
            <span className="text-primary font-mono text-2xl sm:text-4xl">
              Guessr
            </span>
          </h1>

          <p className="mx-auto mb-10 max-w-md text-sm leading-relaxed text-muted-foreground">
            Can you guess when an album was released just by looking at its
            cover? Test your music knowledge and compete for the top spot.
          </p>

          <div className="mb-10 grid gap-px border border-dashed border-border bg-border sm:grid-cols-3">
            <div className="flex flex-col items-center gap-2 bg-background p-6">
              <Disc3 className="h-6 w-6 text-primary" />
              <span className="text-xs font-medium uppercase tracking-wider">
                See the Cover
              </span>
              <span className="text-xs text-muted-foreground">
                Album cover art is revealed
              </span>
            </div>
            <div className="flex flex-col items-center gap-2 bg-background p-6">
              <Clock className="h-6 w-6 text-primary" />
              <span className="text-xs font-medium uppercase tracking-wider">
                Guess the Year
              </span>
              <span className="text-xs text-muted-foreground">
                Slide to pick the release year
              </span>
            </div>
            <div className="flex flex-col items-center gap-2 bg-background p-6">
              <Trophy className="h-6 w-6 text-primary" />
              <span className="text-xs font-medium uppercase tracking-wider">
                Score Points
              </span>
              <span className="text-xs text-muted-foreground">
                Closer guess = more points
              </span>
            </div>
          </div>

          <div className="mb-8 inline-flex flex-wrap items-center justify-center gap-x-6 gap-y-1 border border-dashed border-border px-4 py-3 text-xs text-muted-foreground sm:px-6">
            <span>
              Albums:{" "}
              <span className="font-bold text-foreground">
                {albumCount ?? "..."}
              </span>
            </span>
            <span className="text-border">|</span>
            <span>
              Credits: <span className="font-bold text-foreground">100</span>
            </span>
            <span className="text-border">|</span>
            <span>
              Mode: <span className="font-bold text-foreground">Survival</span>
            </span>
          </div>

          <div className="flex justify-center">
            {isSignedIn ? (
              <Link href="/play">
                <Button
                  size="lg"
                  className="text-sm uppercase tracking-wider px-8"
                >
                  {hasActiveGame ? "Continue Playing" : "Start Playing"}
                </Button>
              </Link>
            ) : (
              <SignInButton mode="modal">
                <Button
                  size="lg"
                  className="text-sm uppercase tracking-wider px-8"
                >
                  Sign In to Play
                </Button>
              </SignInButton>
            )}
          </div>
        </div>
      </main>

      <footer className="border-t border-dashed border-border py-4 text-center text-xs text-muted-foreground">
        Cover Guessr &middot; Test your music knowledge
      </footer>
    </>
  );
}
