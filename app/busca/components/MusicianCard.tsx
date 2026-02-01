"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { MusicianListItem } from "@/lib/types/musician";
import { Calendar, Clock, Heart, Mail, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface MusicianCardProps {
  musician: MusicianListItem;
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
  // Combina gêneros e instrumentos para as tags
  const tags = [
    ...musician.genres.map((g) => g.name),
    ...musician.instruments.map((i) => i.name),
  ].slice(0, 4);

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
            ? "relative w-40 h-40 flex-shrink-0 rounded-lg overflow-hidden bg-muted"
            : "relative w-full aspect-square bg-muted"
        }
      >
        {musician.profileImageUrl ? (
          <Image
            src={musician.profileImageUrl}
            alt={musician.name}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          /* Avatar gerado com iniciais se não houver foto */
          <Image
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(musician.name)}&size=400&background=random&color=fff`}
            alt={musician.name}
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
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
        {musician.isFeatured && (
          <Badge className="absolute bottom-2 left-2 text-xs bg-amber-500 hover:bg-amber-600">
            Destaque
          </Badge>
        )}
      </div>
      {/* Content */}
      <div className="p-4 flex flex-col flex-1 space-y-2">
        <h3 className="font-semibold text-lg leading-tight">{musician.name}</h3>
        <p className="text-sm text-muted-foreground">{musician.category || "Músico"}</p>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
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
            <Calendar className="h-4 w-4" /> {musician.eventsCount}+ eventos
          </span>
          {musician.ratingCount > 0 && (
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" /> {musician.ratingCount} avaliações
            </span>
          )}
        </div>
        {musician.priceFrom && (
          <div className="flex items-baseline gap-1">
            <span className="text-xs text-muted-foreground">A partir de</span>
            <span className="text-base font-semibold">
              R$ {musician.priceFrom.toLocaleString("pt-BR")}
            </span>
          </div>
        )}
        <div className="mt-auto flex gap-2">
          <Button size="sm" asChild>
            <Link href={`/musico/${musician.id}`}>Ver Perfil</Link>
          </Button>
          <Button variant="outline" size="sm">
            <Mail className="h-4 w-4 mr-1" /> Contatar
          </Button>
        </div>
      </div>
    </Card>
  );
}
