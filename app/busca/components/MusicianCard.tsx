"use client";

import { useState, useEffect, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { MusicianListItem } from "@/lib/types/musician";
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  Loader2,
  MapPin,
  MessageCircle,
  Music2,
  Star,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useFavoriteStore } from "@/lib/stores/favoriteStore";
import { useUserStore } from "@/lib/stores/userStore";
import { toast } from "sonner";

interface MusicianCardProps {
  musician: MusicianListItem;
  view?: "grid" | "list";
}

function getAvatarUrl(name: string, size = 400): string {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=${size}&background=random&color=fff`;
}

function isValidImageUrl(url: string | null | undefined): boolean {
  if (!url || typeof url !== "string") return false;
  const trimmed = url.trim();
  return (
    trimmed !== "" &&
    (trimmed.startsWith("http://") || trimmed.startsWith("https://"))
  );
}

export function MusicianCard({ musician, view = "grid" }: MusicianCardProps) {
  const router = useRouter();
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  const { isLoggedIn } = useUserStore();
  const favorite = useFavoriteStore((s) => s.favoriteIds.has(musician.id));
  const isTogglingFav = useFavoriteStore((s) => s.togglingIds.has(musician.id));

  const photos = (() => {
    const list: string[] = [];

    if (musician.photos?.length) {
      musician.photos.forEach((url) => {
        if (isValidImageUrl(url)) list.push(url);
      });
    }

    if (list.length === 0 && isValidImageUrl(musician.profileImageUrl)) {
      list.push(musician.profileImageUrl!);
    }

    if (list.length === 0) {
      list.push(getAvatarUrl(musician.name));
    }

    return list;
  })();

  const genreTags = musician.genres.slice(0, 3);
  const instrumentsLabel = musician.instruments.map((i) => i.name).join(", ");
  const hasMultiplePhotos = photos.length > 1;

  const handleToggleFavorite = async (
    e: React.MouseEvent,
    musicianProfileId: number
  ) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isLoggedIn) {
      toast.error("Você precisa estar logado para favoritar");
      router.push("/login");
      return;
    }

    try {
      const added = await useFavoriteStore
        .getState()
        .toggleFavorite(musicianProfileId);
      toast.success(added ? "Adicionado aos favoritos" : "Removido dos favoritos");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Erro ao atualizar favorito";
      toast.error(message);
    }
  };

  useEffect(() => {
    setCurrentPhotoIndex(0);
    setImageErrors(new Set());
    setIsLoading(true);
  }, [musician.id]);

  const handleImageError = useCallback((index: number) => {
    setImageErrors((prev) => new Set(prev).add(index));
    setIsLoading(false);
  }, []);

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  const handlePrevPhoto = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentPhotoIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1));
    setIsLoading(true);
  };

  const handleNextPhoto = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentPhotoIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1));
    setIsLoading(true);
  };

  const handleChatClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/mensagens?musico=${musician.id}`);
  };

  const currentPhotoUrl = imageErrors.has(currentPhotoIndex)
    ? getAvatarUrl(musician.name)
    : photos[currentPhotoIndex];

  const ImageCarousel = ({ className }: { className: string }) => (
    <div className={`relative bg-muted overflow-hidden group/carousel ${className}`}>
      {isLoading && <div className="absolute inset-0 bg-muted animate-pulse z-10" />}

      <Image
        src={currentPhotoUrl}
        alt={`Foto de ${musician.name}`}
        width={600}
        height={375}
        className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
        onError={() => handleImageError(currentPhotoIndex)}
        onLoad={handleImageLoad}
        unoptimized
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-transparent" />

      {hasMultiplePhotos && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-background/80 hover:bg-background shadow-sm opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-200 z-20"
            onClick={handlePrevPhoto}
            aria-label="Foto anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-background/80 hover:bg-background shadow-sm opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-200 z-20"
            onClick={handleNextPhoto}
            aria-label="Próxima foto"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-20">
            {photos.map((_, idx) => (
              <button
                key={idx}
                className={`h-1.5 rounded-full transition-all duration-200 ${
                  idx === currentPhotoIndex ? "w-4 bg-white" : "w-1.5 bg-white/65"
                }`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setCurrentPhotoIndex(idx);
                  setIsLoading(true);
                }}
                aria-label={`Ir para foto ${idx + 1}`}
              />
            ))}
          </div>
        </>
      )}

      <Button
        variant="ghost"
        size="icon"
        className="absolute top-3 right-3 h-9 w-9 rounded-full bg-background/80 hover:bg-background transition-all duration-200 hover:scale-110 active:scale-95 z-20"
        aria-label={
          favorite
            ? `Remover ${musician.name} dos favoritos`
            : `Adicionar ${musician.name} aos favoritos`
        }
        onClick={(e) => handleToggleFavorite(e, musician.id)}
        disabled={isTogglingFav}
      >
        {isTogglingFav ? (
          <Loader2
            className="h-4 w-4 animate-spin text-muted-foreground"
            aria-hidden="true"
          />
        ) : (
          <Heart
            className={`h-4 w-4 transition-colors ${
              favorite ? "fill-red-500 text-red-500" : "text-muted-foreground"
            }`}
            aria-hidden="true"
          />
        )}
      </Button>

      <div className="absolute left-3 right-3 bottom-3 flex items-center justify-between gap-2 z-20">
        <Badge className="bg-white/90 text-black hover:bg-white max-w-[70%] truncate">
          {musician.category || "Músico"}
        </Badge>
        {musician.isFeatured && (
          <Badge className="text-[10px] bg-warning text-warning-foreground shrink-0">
            Destaque
          </Badge>
        )}
      </div>
    </div>
  );

  if (view === "list") {
    return (
      <Link href={`/musico/${musician.id}`} className="block group">
        <Card className="border p-3 sm:p-4 transition-all duration-300 hover:shadow-md">
          <div className="flex gap-3 sm:gap-4">
            <div className="relative h-20 w-20 sm:h-24 sm:w-24 rounded-lg overflow-hidden bg-muted flex-shrink-0">
              <Image
                src={currentPhotoUrl}
                alt={`Foto de ${musician.name}`}
                fill
                className="object-cover"
                unoptimized
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-1.5 right-1.5 h-7 w-7 rounded-full bg-background/85 hover:bg-background z-10"
                aria-label={
                  favorite
                    ? `Remover ${musician.name} dos favoritos`
                    : `Adicionar ${musician.name} aos favoritos`
                }
                onClick={(e) => handleToggleFavorite(e, musician.id)}
                disabled={isTogglingFav}
              >
                {isTogglingFav ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                ) : (
                  <Heart
                    className={`h-3.5 w-3.5 ${favorite ? "fill-red-500 text-red-500" : "text-muted-foreground"}`}
                  />
                )}
              </Button>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="font-semibold text-base line-clamp-1">{musician.name}</h3>
                  <p className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                    <MapPin className="h-3 w-3 flex-shrink-0" aria-hidden="true" />
                    <span className="line-clamp-1">{musician.location}</span>
                  </p>
                </div>
                <Badge variant="outline" className="shrink-0 text-[11px] border-warning/40 text-warning">
                  <Star className="h-3 w-3 mr-1 fill-warning text-warning" />
                  {musician.rating.toFixed(1)}
                </Badge>
              </div>

              <div className="mt-2 flex flex-wrap gap-1">
                {genreTags.slice(0, 2).map((genre) => (
                  <Badge key={genre.id} variant="secondary" className="text-[10px] font-medium">
                    {genre.name}
                  </Badge>
                ))}
                {musician.category && (
                  <Badge variant="outline" className="text-[10px] font-medium">
                    {musician.category}
                  </Badge>
                )}
              </div>

              <div className="mt-2 flex items-center justify-between gap-2">
                {musician.priceFrom ? (
                  <span className="text-sm font-semibold text-primary">
                    R$ {musician.priceFrom.toLocaleString("pt-BR")}
                  </span>
                ) : (
                  <span className="text-xs text-muted-foreground">Consultar preço</span>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 sm:px-3"
                  onClick={handleChatClick}
                  aria-label={`Enviar mensagem para ${musician.name}`}
                >
                  <MessageCircle className="h-4 w-4 sm:mr-1.5" />
                  <span className="hidden sm:inline">Mensagem</span>
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </Link>
    );
  }

  return (
    <Link href={`/musico/${musician.id}`} className="block group">
      <Card className="flex flex-col overflow-hidden border transition-all duration-300 hover:shadow-lg group-hover:-translate-y-1">
        <ImageCarousel className="w-full h-52" />

        <div className="p-4 sm:p-5 flex flex-col flex-1">
          <div className="flex items-start justify-between gap-3 mb-2">
            <h3 className="font-semibold text-lg leading-tight line-clamp-2 flex-1">
              {musician.name}
            </h3>
            <Badge
              variant="outline"
              className="shrink-0 font-semibold border-warning/40 text-warning"
            >
              <Star className="h-3.5 w-3.5 mr-1 fill-warning text-warning" />
              {musician.rating.toFixed(1)}
            </Badge>
          </div>

          <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-3">
            <MapPin className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
            <span className="line-clamp-1">{musician.location}</span>
            {musician.ratingCount > 0 && (
              <span className="text-xs">· {musician.ratingCount}</span>
            )}
          </div>

          {genreTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {genreTags.map((genre) => (
                <Badge key={genre.id} variant="secondary" className="text-[11px] font-medium">
                  {genre.name}
                </Badge>
              ))}
              {musician.genres.length > 3 && (
                <Badge variant="outline" className="text-[11px] font-medium">
                  +{musician.genres.length - 3}
                </Badge>
              )}
            </div>
          )}

          {instrumentsLabel && (
            <div className="flex items-start gap-1.5 text-sm text-muted-foreground mb-4">
              <Music2 className="h-4 w-4 flex-shrink-0 mt-0.5" aria-hidden="true" />
              <span className="line-clamp-2">{instrumentsLabel}</span>
            </div>
          )}

          <div className="mt-auto border-t pt-3 flex items-center justify-between gap-3">
            {musician.priceFrom ? (
              <div>
                <span className="block text-[10px] uppercase tracking-wide text-muted-foreground">
                  A partir de
                </span>
                <span className="text-base font-bold text-primary">
                  R$ {musician.priceFrom.toLocaleString("pt-BR")}
                </span>
              </div>
            ) : (
              <span className="text-sm text-muted-foreground">Consultar preço</span>
            )}

            <Button
              variant="ghost"
              size="sm"
              className="h-9 px-3"
              onClick={handleChatClick}
              aria-label={`Enviar mensagem para ${musician.name}`}
            >
              <MessageCircle className="h-4 w-4 mr-1.5" />
              Mensagem
            </Button>
          </div>
        </div>
      </Card>
    </Link>
  );
}
