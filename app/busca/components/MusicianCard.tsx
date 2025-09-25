"use client";

import Image from "next/image";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, Calendar, Clock, MapPin, Mail } from "lucide-react";
import type { Musician } from "@/lib/musicians";

interface MusicianCardProps {
  musician: Musician;
  /**
   * When set to "list" the card renders horizontally instead of
   * vertically. This prop allows the results area to switch
   * between grid and list views.
   */
  view?: "grid" | "list";
}

/**
 * Displays a single musician's information in a card. Uses shadcn/ui
 * primitives like Card, Badge and Button along with lucide-react
 * icons for a clean, accessible UI. The card supports both grid and
 * list layouts depending on the `view` prop.
 */
export function MusicianCard({ musician, view = "grid" }: MusicianCardProps) {
  return (
    <Card
      className={
        view === "list"
          ? "flex flex-row gap-4 p-4"
          : "flex flex-col overflow-hidden"
      }
    >
      {/* Image and overlay */}
      <div
        className={
          view === "list"
            ? "relative w-40 h-40 flex-shrink-0"
            : "relative w-full aspect-square"
        }
      >
        <Image
          src={musician.image}
          alt={musician.name}
          fill
          className="object-cover"
        />
        {/* Rating badge */}
        <Badge className="absolute top-2 left-2 text-xs">
          ⭐ {musician.rating.toFixed(1)}
        </Badge>
        {/* Favourite button placeholder */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 rounded-full bg-background/70 hover:bg-background"
          aria-label="Adicionar aos favoritos"
        >
          <Heart className="h-4 w-4" />
        </Button>
      </div>
      {/* Content */}
      <div className="p-4 flex flex-col flex-1 space-y-2">
        <h3 className="font-semibold text-lg leading-tight">{musician.name}</h3>
        <p className="text-sm text-muted-foreground">{musician.category}</p>
        <div className="flex flex-wrap gap-2">
          {musician.tags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="text-xs py-0.5 px-2"
            >
              {tag}
            </Badge>
          ))}
        </div>
        <p className="flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" /> {musician.location}
        </p>
        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="h-4 w-4" /> {musician.events}+ eventos
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" /> Resp. em {musician.responseTime}
          </span>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-xs text-muted-foreground">A partir de</span>
          <span className="text-base font-semibold">R$ {musician.price}</span>
        </div>
        <div className="mt-auto flex gap-2">
          <Button size="sm" asChild>
            <Link href={`/musicos/${musician.id}`}>Ver Perfil</Link>
          </Button>
          <Button variant="outline" size="sm">
            <Mail className="h-4 w-4 mr-1" /> Contatar
          </Button>
        </div>
      </div>
    </Card>
  );
}
