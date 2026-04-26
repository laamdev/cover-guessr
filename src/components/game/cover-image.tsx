"use client";

import { useCoverUrl } from "@/lib/use-cover-url";
import { Skeleton } from "@/components/ui/skeleton";
import { Disc3 } from "lucide-react";

export function CoverImage({ coverKey }: { coverKey: string }) {
  const url = useCoverUrl(coverKey);

  if (!url) {
    return (
      <div className="relative aspect-square w-[min(100cqi,100cqb)] max-w-sm overflow-hidden rounded-lg">
        <Skeleton className="h-full w-full" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Disc3 className="h-12 w-12 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative aspect-square w-[min(100cqi,100cqb)] max-w-sm overflow-hidden rounded-lg shadow-2xl">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt="Album cover"
        className="h-full w-full object-contain"
      />
    </div>
  );
}
