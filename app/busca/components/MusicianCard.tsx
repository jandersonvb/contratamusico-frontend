"use client";

import { useState, useEffect, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { MusicianListItem } from "@/lib/types/musician";
import { ChevronLeft, ChevronRight, Heart, Loader2, MapPin, MessageCircle, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useFavoriteStore } from "@/lib/stores/favoriteStore";
import { useUserStore } from "@/lib/stores/userStore";
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
function getAvatarUrl(name: string, size = 400): string {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=${size}&background=random&color=fff`;
}

/**
 * Verifica se a URL da imagem é válida (não vazia e começa com http)
 */
function isValidImageUrl(url: string | null | undefined): boolean {
  if (!url || typeof url !== "string") return false;
  const trimmed = url.trim();
  return (
    trimmed !== "" &&
    (trimmed.startsWith("http://") || trimmed.startsWith("https://"))
  );
}

/**
 * Card de músico estilo Fiverr.
 * - Carrossel de fotos na imagem principal (com setas de navegação)
 * - Avatar circular com a foto real do usuário
 * - Nome + badge de destaque
 * - Descrição com categoria e tags
 * - Rating com estrela + contagem
 * - Preço no rodapé com separador + botão de chat
 */
export function MusicianCard({ musician, view = "grid" }: MusicianCardProps) {
  const router = useRouter();
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [avatarError, setAvatarError] = useState(false);

  // Favoritos via store centralizada
  const { isLoggedIn } = useUserStore();
  const favorite = useFavoriteStore((s) => s.favoriteIds.has(musician.id));
  const isTogglingFav = useFavoriteStore((s) => s.togglingIds.has(musician.id));

  // Monta a lista de fotos do carrossel
  // Prioridade: photos[] > profileImageUrl > avatar com iniciais
  const photos = (() => {
    const list: string[] = [];

    // Adiciona fotos do portfolio/cover se existirem
    if (musician.photos?.length) {
      musician.photos.forEach((url) => {
        if (isValidImageUrl(url)) list.push(url);
      });
    }

    // Se não tem fotos de portfolio, usa a foto de perfil como cover
    if (list.length === 0 && isValidImageUrl(musician.profileImageUrl)) {
      list.push(musician.profileImageUrl!);
    }

    // Fallback: avatar com iniciais
    if (list.length === 0) {
      list.push(getAvatarUrl(musician.name));
    }

    return list;
  })();

  // URL do avatar (foto real do usuário)
  const avatarUrl =
    !avatarError && isValidImageUrl(musician.profileImageUrl)
      ? musician.profileImageUrl!
      : getAvatarUrl(musician.name, 64);

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
      const added = await useFavoriteStore.getState().toggleFavorite(musicianProfileId);
      toast.success(added ? "Adicionado aos favoritos" : "Removido dos favoritos");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Erro ao atualizar favorito";
      toast.error(message);
    }
  };

  // Reset states when musician changes
  useEffect(() => {
    setCurrentPhotoIndex(0);
    setImageErrors(new Set());
    setIsLoading(true);
    setAvatarError(false);
  }, [musician.id]);

  // Combina gêneros e instrumentos para as tags
  const tags = [
    ...musician.genres.map((g) => g.name),
    ...musician.instruments.map((i) => i.name),
  ].slice(0, 4);

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

  // URL da foto atual do carrossel (com fallback se deu erro)
  const currentPhotoUrl = imageErrors.has(currentPhotoIndex)
    ? getAvatarUrl(musician.name)
    : photos[currentPhotoIndex];

  // ═══════════════════════════ CARROSSEL DE IMAGEM ═══════════════════════════
  const ImageCarousel = ({ className }: { className: string }) => (
    <div className={`relative bg-muted overflow-hidden group/carousel ${className}`}>
      {/* Loading placeholder */}
      {isLoading && (
        <div className="absolute inset-0 bg-muted animate-pulse z-10" />
      )}

      {/* Imagem atual */}
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

      {/* Setas de navegação (só se tem mais de 1 foto) */}
      {hasMultiplePhotos && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-1.5 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-background/80 hover:bg-background shadow-sm opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-200 z-20"
            onClick={handlePrevPhoto}
            aria-label="Foto anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-background/80 hover:bg-background shadow-sm opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-200 z-20"
            onClick={handleNextPhoto}
            aria-label="Próxima foto"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          {/* Dots indicadores */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-20">
            {photos.map((_, idx) => (
              <button
                key={idx}
                className={`h-1.5 rounded-full transition-all duration-200 ${
                  idx === currentPhotoIndex
                    ? "w-4 bg-white"
                    : "w-1.5 bg-white/60"
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

      {/* Favourite button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 h-8 w-8 rounded-full bg-background/70 hover:bg-background transition-all duration-200 hover:scale-110 active:scale-95 z-20"
        aria-label={favorite ? `Remover ${musician.name} dos favoritos` : `Adicionar ${musician.name} aos favoritos`}
        onClick={(e) => handleToggleFavorite(e, musician.id)}
        disabled={isTogglingFav}
      >
        {isTogglingFav ? (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" aria-hidden="true" />
        ) : (
          <Heart
            className={`h-4 w-4 transition-colors ${favorite ? "fill-red-500 text-red-500" : "text-muted-foreground"}`}
            aria-hidden="true"
          />
        )}
      </Button>

      {/* Badge destaque */}
      {musician.isFeatured && (
        <Badge className="absolute top-2 left-2 text-[10px] bg-warning text-warning-foreground hover:bg-warning/90 z-20">
          Destaque
        </Badge>
      )}
    </div>
  );

  // ═══════════════════════════ AVATAR DO USUÁRIO ═══════════════════════════
  const UserAvatar = ({ size = 28 }: { size?: number }) => (
    <div
      className="rounded-full overflow-hidden bg-muted flex-shrink-0 border-2 border-background shadow-sm"
      style={{ width: size, height: size }}
    >
      <Image
        src={avatarUrl}
        alt={`Avatar de ${musician.name}`}
        width={size}
        height={size}
        className="w-full h-full object-cover"
        onError={() => setAvatarError(true)}
        unoptimized
      />
    </div>
  );

  // ──────────────────────────────── LIST VIEW ────────────────────────────────
  if (view === "list") {
    return (
      <Link href={`/musico/${musician.id}`} className="block group">
        <Card className="flex flex-row gap-2 sm:gap-4 p-2 sm:p-4 transition-all duration-300 hover:shadow-lg group-hover:-translate-y-0.5">
          <ImageCarousel className="w-28 h-28 sm:w-48 sm:h-32 flex-shrink-0 rounded-lg" />

          {/* Content */}
          <div className="flex flex-col flex-1 min-w-0 py-0.5">
            {/* Avatar + Nome + Badge */}
            <div className="flex items-center gap-2 mb-1">
              <UserAvatar size={24} />
              <span className="font-semibold text-sm line-clamp-1">
                {musician.name}
              </span>
              {musician.isFeatured && (
                <Badge className="text-[10px] bg-warning text-warning-foreground shrink-0">
                  Destaque
                </Badge>
              )}
            </div>

            {/* Categoria + Tags */}
            <p className="text-xs sm:text-sm text-muted-foreground line-clamp-1 mb-1.5">
              {musician.category || "Músico"} · {tags.join(", ")}
            </p>

            {/* Localização */}
            <p className="flex items-center gap-1 text-xs text-muted-foreground mb-1.5">
              <MapPin className="h-3 w-3 flex-shrink-0" aria-hidden="true" />
              <span className="line-clamp-1">{musician.location}</span>
            </p>

            {/* Rating */}
            <div className="flex items-center gap-1 mb-2">
              <Star className="h-3.5 w-3.5 fill-warning text-warning" aria-hidden="true" />
              <span className="font-bold text-sm">{musician.rating.toFixed(1)}</span>
              {musician.ratingCount > 0 && (
                <span className="text-xs text-muted-foreground">({musician.ratingCount})</span>
              )}
            </div>

            {/* Preço + Chat */}
            <div className="mt-auto flex items-center justify-between border-t pt-2">
              {musician.priceFrom ? (
                <div className="flex items-baseline gap-1">
                  <span className="text-[10px] text-muted-foreground">A partir de</span>
                  <span className="text-sm font-bold">
                    R$ {musician.priceFrom.toLocaleString("pt-BR")}
                  </span>
                </div>
              ) : (
                <span className="text-xs text-muted-foreground">Consultar preço</span>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:text-primary"
                onClick={handleChatClick}
                aria-label={`Enviar mensagem para ${musician.name}`}
              >
                <MessageCircle className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      </Link>
    );
  }

  // ──────────────────────────────── GRID VIEW ────────────────────────────────
  return (
    <Link href={`/musico/${musician.id}`} className="block group">
      <Card className="flex flex-col overflow-hidden transition-all duration-300 hover:shadow-lg group-hover:-translate-y-1">
        {/* Carrossel de Imagens */}
        <ImageCarousel className="w-full aspect-[16/10]" />

        {/* Content */}
        <div className="p-3 sm:p-4 flex flex-col flex-1">
          {/* Avatar + Nome + Badge */}
          <div className="flex items-center gap-2 mb-2">
            <UserAvatar size={28} />
            <span className="font-semibold text-sm line-clamp-1 flex-1">
              {musician.name}
            </span>
            {musician.isFeatured && (
              <Badge className="text-[10px] bg-warning text-warning-foreground shrink-0">
                Destaque
              </Badge>
            )}
          </div>

          {/* Categoria + Tags como descrição */}
          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
            {musician.category || "Músico"} · {tags.join(", ")}
          </p>

          {/* Localização */}
          <p className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
            <MapPin className="h-3 w-3 flex-shrink-0" aria-hidden="true" />
            <span className="line-clamp-1">{musician.location}</span>
          </p>

          {/* Rating */}
          <div className="flex items-center gap-1 mb-3">
            <Star className="h-3.5 w-3.5 fill-warning text-warning" aria-hidden="true" />
            <span
              className="font-bold text-sm"
              aria-label={`Avaliação: ${musician.rating.toFixed(1)} de 5 estrelas`}
            >
              {musician.rating.toFixed(1)}
            </span>
            {musician.ratingCount > 0 && (
              <span className="text-xs text-muted-foreground">
                ({musician.ratingCount})
              </span>
            )}
          </div>

          {/* Separador + Preço + Chat */}
          <div className="mt-auto border-t pt-2.5 flex items-center justify-between">
            {musician.priceFrom ? (
              <div className="flex items-baseline gap-1">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wide">
                  A partir de
                </span>
                <span className="text-sm font-bold">
                  R$ {musician.priceFrom.toLocaleString("pt-BR")}
                </span>
              </div>
            ) : (
              <span className="text-xs text-muted-foreground">Consultar preço</span>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:text-primary transition-colors"
              onClick={handleChatClick}
              aria-label={`Enviar mensagem para ${musician.name}`}
            >
              <MessageCircle className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </Link>
  );
}
