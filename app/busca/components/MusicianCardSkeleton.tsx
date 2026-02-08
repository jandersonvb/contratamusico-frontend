"use client";

import { Card } from "@/components/ui/card";

/**
 * Skeleton loader for MusicianCard component (Fiverr-style layout).
 * Matches the card structure: image 16:10, avatar+name, description,
 * location, rating, and price bar.
 */
export function MusicianCardSkeleton() {
  return (
    <Card className="flex flex-col overflow-hidden animate-pulse">
      {/* Image placeholder - 16:10 aspect ratio */}
      <div className="relative w-full aspect-[16/10] bg-muted">
        {/* Favorite button skeleton */}
        <div className="absolute top-2 right-2 h-8 w-8 rounded-full bg-muted-foreground/20" />
      </div>

      {/* Content */}
      <div className="p-3 sm:p-4 flex flex-col flex-1">
        {/* Avatar + Name */}
        <div className="flex items-center gap-2 mb-2">
          <div className="w-7 h-7 rounded-full bg-muted-foreground/20 flex-shrink-0" />
          <div className="h-4 w-28 rounded bg-muted-foreground/20" />
        </div>

        {/* Description (2 lines) */}
        <div className="space-y-1 mb-2">
          <div className="h-4 w-full rounded bg-muted-foreground/15" />
          <div className="h-4 w-3/4 rounded bg-muted-foreground/15" />
        </div>

        {/* Location */}
        <div className="h-3.5 w-2/3 rounded bg-muted-foreground/15 mb-2" />

        {/* Rating */}
        <div className="flex items-center gap-1 mb-3">
          <div className="h-3.5 w-3.5 rounded bg-muted-foreground/20" />
          <div className="h-4 w-8 rounded bg-muted-foreground/20" />
          <div className="h-3.5 w-10 rounded bg-muted-foreground/15" />
        </div>

        {/* Price bar */}
        <div className="mt-auto border-t pt-2.5 flex items-center justify-between">
          <div className="flex items-baseline gap-1">
            <div className="h-3 w-14 rounded bg-muted-foreground/10" />
            <div className="h-4 w-16 rounded bg-muted-foreground/20" />
          </div>
          <div className="h-8 w-8 rounded bg-muted-foreground/10" />
        </div>
      </div>
    </Card>
  );
}
