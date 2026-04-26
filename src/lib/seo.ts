const FALLBACK_URL = "https://cover-guessr.vercel.app";

export function jsonLdString(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export function getSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, "");

  const vercelProd = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercelProd) return `https://${vercelProd}`;

  const vercelPreview = process.env.VERCEL_URL;
  if (vercelPreview) return `https://${vercelPreview}`;

  return FALLBACK_URL;
}

export const SITE_NAME = "Cover Guessr";
export const SITE_TAGLINE = "Guess the year of any album from its cover";
export const SITE_DESCRIPTION =
  "Cover Guessr is a music trivia game: study an album's cover art and guess the release year. Sharpen your music knowledge, build streaks, and climb the leaderboard.";
export const SITE_KEYWORDS = [
  "cover guessr",
  "album cover game",
  "guess the album year",
  "music trivia",
  "music guessing game",
  "album release year",
  "music quiz",
  "album cover quiz",
];
