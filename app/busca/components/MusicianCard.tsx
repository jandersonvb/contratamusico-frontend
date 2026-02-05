"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { MusicianListItem } from "@/lib/types/musician";
import { Calendar, Clock, Heart, Mail, MapPin, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { addFavorite, removeFavorite } from "@/api/favorite";
import { toast } from "sonner";

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
 * Gera URL do avatar com iniciais do nome
 */
function getAvatarUrl(name: string): string {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=400&background=random&color=fff`;
}

/**
 * Verifica se a URL da imagem é válida (não vazia e começa com http)
 */
function isValidImageUrl(url: string | null | undefined): boolean {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  return trimmed !== "" && (trimmed.startsWith("http://") || trimmed.startsWith("https://"));
}

/**
 * Displays a single musician's information in a card. Uses shadcn/ui
 * primitives like Card, Badge and Button along with lucide-react
 * icons for a clean, accessible UI. The card supports both grid and
 * list layouts depending on the `view` prop.
 */
export function MusicianCard({ musician, view = "grid" }: MusicianCardProps) {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [favorite, setFavorite] = useState(false);
  
  const handleToggleFavorite = async (musicianProfileId: number) => {
    try {
      if (favorite) {
        await removeFavorite(musicianProfileId);
        setFavorite(false);
      } else {
        await addFavorite(musicianProfileId);
        setFavorite(true);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao atualizar favorito';
      toast.error(message);
    }
  };
  // Reset states when musician changes
  useEffect(() => {
    setImageError(false);
    setIsLoading(true);
  }, [musician.id]);
  
  // Combina gêneros e instrumentos para as tags
  const tags = [
    ...musician.genres.map((g) => g.name),
    ...musician.instruments.map((i) => i.name),
  ].slice(0, 4);

  // Determina a URL da imagem a ser usada
  const hasValidImage = isValidImageUrl(musician.profileImageUrl) && !imageError;
  const imageUrl = hasValidImage 
    ? musician.profileImageUrl! 
    : getAvatarUrl(musician.name);

  const handleImageError = () => {
    setImageError(true);
    setIsLoading(false);
  };

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  return (
    <Card
      className={cn(
        "transition-all duration-300 hover:shadow-lg focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2",
        view === "list"
          ? "flex flex-row gap-2 sm:gap-4 p-2 sm:p-4"
          : "flex flex-col overflow-hidden"
      )}
    >
      {/* Image and overlay */}
      <div
        className={
          view === "list"
            ? "relative w-28 h-28 sm:w-40 sm:h-40 flex-shrink-0 rounded-lg overflow-hidden bg-muted"
            : "relative w-full aspect-square bg-muted"
        }
      >
        {/* Loading placeholder */}
        {isLoading && (
          <div className="absolute inset-0 bg-muted animate-pulse" />
        )}
        <Image
          src={imageUrl}
          alt={`Foto de ${musician.name}`}
          width={600}
          height={600}
          className="absolute inset-0 w-full h-full object-cover object-center"
          onError={handleImageError}
          onLoad={handleImageLoad}
          unoptimized // Sempre desativa otimização para evitar erros com URLs externas
        />
        {/* Rating badge */}
        <Badge className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 text-[10px] sm:text-xs bg-background/90 text-foreground backdrop-blur-sm">
          <Star className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5 sm:mr-1 fill-warning text-warning" aria-hidden="true" />
          <span aria-label={`Avaliação: ${musician.rating.toFixed(1)} de 5 estrelas`}>
            {musician.rating.toFixed(1)}
          </span>
        </Badge>
        {/* Favourite button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 h-7 w-7 sm:h-9 sm:w-9 rounded-full bg-background/70 hover:bg-background transition-all duration-200 hover:scale-110 active:scale-95"
          aria-label={`Adicionar ${musician.name} aos favoritos`}
          onClick={() => handleToggleFavorite(musician.id)}
        >
          <Heart className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${favorite ? "fill-warning text-warning" : "text-muted-foreground"}`} aria-hidden="true" />
          <span className="sr-only">{favorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}</span>
        </Button>
        {musician.isFeatured && (
          <Badge className="absolute bottom-1.5 left-1.5 sm:bottom-2 sm:left-2 text-[10px] sm:text-xs bg-warning text-warning-foreground hover:bg-warning/90">
            <span aria-label="Músico em destaque">Destaque</span>
          </Badge>
        )}
      </div>
      {/* Content */}
      <div className="p-3 sm:p-4 flex flex-col flex-1 space-y-1.5 sm:space-y-2">
        <h3 className="font-semibold text-base sm:text-lg leading-tight line-clamp-1">{musician.name}</h3>
        <p className="text-xs sm:text-sm text-muted-foreground">{musician.category || "Músico"}</p>
        <div className="flex flex-wrap gap-1" role="list" aria-label="Especialidades">
          {tags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="text-[10px] sm:text-xs py-0 sm:py-0.5 px-1.5 sm:px-2 transition-colors duration-200"
              role="listitem"
            >
              {tag}
            </Badge>
          ))}
        </div>
        <p className="flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm text-muted-foreground">
          <MapPin className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" aria-hidden="true" />
          <span className="line-clamp-1">{musician.location}</span>
        </p>
        <div className="flex flex-wrap gap-2 sm:gap-4 text-[10px] sm:text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3 sm:h-4 sm:w-4" aria-hidden="true" />
            <span>{musician.eventsCount}+ eventos</span>
          </span>
          {musician.ratingCount > 0 && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3 sm:h-4 sm:w-4" aria-hidden="true" />
              <span>{musician.ratingCount} avaliações</span>
            </span>
          )}
        </div>
        {musician.priceFrom && (
          <div className="flex items-baseline gap-1">
            <span className="text-[10px] sm:text-xs text-muted-foreground">A partir de</span>
            <span className="text-sm sm:text-base font-semibold text-primary">
              R$ {musician.priceFrom.toLocaleString("pt-BR")}
            </span>
          </div>
        )}
        <div className="mt-auto flex gap-2 pt-2">
          <Button size="sm" asChild className="flex-1 sm:flex-none text-xs sm:text-sm transition-all duration-200 hover:scale-105 active:scale-95">
            <Link href={`/musico/${musician.id}`}>Ver Perfil</Link>
          </Button>
          <Button variant="outline" size="sm" className="flex-1 sm:flex-none text-xs sm:text-sm transition-all duration-200 hover:scale-105 active:scale-95">
            <Mail className="h-3 w-3 sm:h-4 sm:w-4 mr-1" aria-hidden="true" />
            Contatar
          </Button>
        </div>
      </div>
    </Card>
  );
}
