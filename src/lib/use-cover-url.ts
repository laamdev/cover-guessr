"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export function useCoverUrl(key: string | undefined) {
  const url = useQuery(api.albums.getCoverUrl, key ? { key } : "skip");
  return url ?? null;
}
