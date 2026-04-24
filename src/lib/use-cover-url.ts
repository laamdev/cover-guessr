"use client";

import { useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState, useEffect } from "react";

export function useCoverUrl(key: string | undefined) {
  const getCoverUrl = useAction(api.albums.getCoverUrl);
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!key) return;
    let cancelled = false;
    getCoverUrl({ key }).then((result) => {
      if (!cancelled) setUrl(result);
    });
    return () => {
      cancelled = true;
    };
  }, [key, getCoverUrl]);

  return url;
}
