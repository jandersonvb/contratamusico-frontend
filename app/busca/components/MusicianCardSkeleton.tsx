"use client";

import { Card } from "@/components/ui/card";

export function MusicianCardSkeleton() {
  return (
    <Card className="flex flex-col overflow-hidden animate-pulse border">
      <div className="relative w-full h-52 bg-muted">
        <div className="absolute top-3 right-3 h-9 w-9 rounded-full bg-muted-foreground/20" />
        <div className="absolute bottom-3 left-3 h-5 w-24 rounded bg-muted-foreground/20" />
        <div className="absolute bottom-3 right-3 h-5 w-16 rounded bg-muted-foreground/20" />
      </div>

      <div className="p-4 sm:p-5 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="h-5 w-40 rounded bg-muted-foreground/20" />
          <div className="h-6 w-14 rounded bg-muted-foreground/20" />
        </div>

        <div className="h-4 w-2/3 rounded bg-muted-foreground/15 mb-3" />

        <div className="flex gap-1.5 mb-3">
          <div className="h-5 w-16 rounded bg-muted-foreground/15" />
          <div className="h-5 w-20 rounded bg-muted-foreground/15" />
          <div className="h-5 w-12 rounded bg-muted-foreground/15" />
        </div>

        <div className="h-4 w-5/6 rounded bg-muted-foreground/15 mb-4" />

        <div className="mt-auto border-t pt-3 flex items-center justify-between">
          <div>
            <div className="h-3 w-14 rounded bg-muted-foreground/10 mb-1" />
            <div className="h-5 w-20 rounded bg-muted-foreground/20" />
          </div>
          <div className="h-9 w-24 rounded bg-muted-foreground/15" />
        </div>
      </div>
    </Card>
  );
}
