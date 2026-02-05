"use client";

import { Card } from "@/components/ui/card";

/**
 * Skeleton loader for MusicianCard component.
 * Provides visual feedback during loading states.
 */
export function MusicianCardSkeleton() {
  return (
    <Card className="flex flex-col overflow-hidden animate-pulse">
      {/* Image placeholder */}
      <div className="relative w-full aspect-square bg-muted">
        {/* Rating badge skeleton */}
        <div className="absolute top-2 left-2 h-5 w-12 rounded-full bg-muted-foreground/20" />
        {/* Favorite button skeleton */}
        <div className="absolute top-2 right-2 h-8 w-8 rounded-full bg-muted-foreground/20" />
      </div>
      
      {/* Content */}
      <div className="p-4 flex flex-col flex-1 space-y-3">
        {/* Name */}
        <div className="h-6 w-3/4 rounded bg-muted-foreground/20" />
        
        {/* Category */}
        <div className="h-4 w-1/3 rounded bg-muted-foreground/15" />
        
        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          <div className="h-5 w-16 rounded-full bg-muted-foreground/15" />
          <div className="h-5 w-20 rounded-full bg-muted-foreground/15" />
          <div className="h-5 w-14 rounded-full bg-muted-foreground/15" />
        </div>
        
        {/* Location */}
        <div className="h-4 w-2/3 rounded bg-muted-foreground/15" />
        
        {/* Stats */}
        <div className="flex gap-4">
          <div className="h-4 w-20 rounded bg-muted-foreground/10" />
          <div className="h-4 w-24 rounded bg-muted-foreground/10" />
        </div>
        
        {/* Price */}
        <div className="h-5 w-28 rounded bg-muted-foreground/20" />
        
        {/* Buttons */}
        <div className="mt-auto flex gap-2 pt-2">
          <div className="h-9 flex-1 rounded-md bg-primary/20" />
          <div className="h-9 flex-1 rounded-md bg-muted-foreground/15" />
        </div>
      </div>
    </Card>
  );
}
