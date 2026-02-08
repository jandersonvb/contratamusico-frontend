"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MusicianAvatar } from "@/components/ui/musician-avatar";
import { fetchFeaturedMusicians } from "@/api/musician";
import { useFavoriteStore } from "@/lib/stores/favoriteStore";
import { useUserStore } from "@/lib/stores/userStore";
import type { MusicianListItem } from "@/lib/types/musician";
import { Heart, Loader2, Star } from "lucide-react";
import { toast } from "sonner";

/** Skeleton card for loading state */
function FeaturedMusicianSkeleton() {
  return (
    <Card className="overflow-hidden animate-pulse">
      <div className="relative h-56 w-full bg-muted" />
      <CardContent className="p-6 space-y-3">
        <div className="h-6 w-3/4 rounded bg-muted-foreground/20" />
        <div className="h-4 w-1/3 rounded bg-muted-foreground/15" />
        <div className="h-4 w-1/2 rounded bg-muted-foreground/15" />
        <div className="h-4 w-24 rounded bg-muted-foreground/20" />
        <div className="h-5 w-32 rounded bg-muted-foreground/15" />
        <div className="h-9 w-full rounded-md bg-secondary/50 mt-2" />
      </CardContent>
    </Card>
  );
}

/** Botão de favorito para cada card */
function FavoriteBtn({ musicianId }: { musicianId: number }) {
  const router = useRouter();
  const { isLoggedIn } = useUserStore();
  const isFav = useFavoriteStore((s) => s.favoriteIds.has(musicianId));
  const isToggling = useFavoriteStore((s) => s.togglingIds.has(musicianId));

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isLoggedIn) {
      toast.error("Você precisa estar logado para favoritar");
      router.push("/login");
      return;
    }

    try {
      const added = await useFavoriteStore.getState().toggleFavorite(musicianId);
      toast.success(added ? "Adicionado aos favoritos" : "Removido dos favoritos");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao atualizar favorito";
      toast.error(message);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isToggling}
      className="absolute left-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-background/70 hover:bg-background transition-all duration-200 hover:scale-110 active:scale-95 shadow-sm"
      aria-label={isFav ? "Remover dos favoritos" : "Adicionar aos favoritos"}
    >
      {isToggling ? (
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      ) : (
        <Heart
          className={`h-4 w-4 transition-colors ${isFav ? "fill-red-500 text-red-500" : "text-muted-foreground"}`}
        />
      )}
    </button>
  );
}

export function FeaturedMusicians() {
  const [musicians, setMusicians] = useState<MusicianListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadFeaturedMusicians();
  }, []);

  const loadFeaturedMusicians = async () => {
    try {
      const data = await fetchFeaturedMusicians(6);
      setMusicians(data);
    } catch (error) {
      console.error("Error loading featured musicians:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <section className="py-16" aria-label="Carregando músicos em destaque">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-2 text-3xl font-semibold">Destaques</h2>
            <p className="text-muted-foreground">
              Perfis mais procurados da semana
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">
            {Array.from({ length: 6 }).map((_, i) => (
              <FeaturedMusicianSkeleton key={i} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (musicians.length === 0) {
    return null;
  }

  return (
    <section className="py-16" aria-labelledby="featured-title">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h2 id="featured-title" className="mb-2 text-3xl font-semibold">Destaques</h2>
          <p className="text-muted-foreground">
            Perfis mais procurados da semana
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {musicians.map((musician) => (
            <Card
              key={musician.id}
              className="overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1 focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2"
            >
              <div className="relative h-56 w-full bg-muted overflow-hidden group">
                <MusicianAvatar
                  src={musician.profileImageUrl}
                  name={musician.name}
                  size={800}
                  fill
                  className="transition-transform duration-300 group-hover:scale-105"
                />
                <FavoriteBtn musicianId={musician.id} />
                {musician.isFeatured && (
                  <span className="absolute right-3 top-3 rounded-full bg-warning text-warning-foreground px-3 py-1 text-xs font-medium">
                    Destaque
                  </span>
                )}
              </div>
              <CardContent className="p-6">
                <h3 className="mb-2 text-xl font-semibold line-clamp-1">{musician.name}</h3>
                {musician.category && (
                  <div className="mb-2 text-sm text-primary font-medium">{musician.category}</div>
                )}
                <div className="mb-2 text-sm text-muted-foreground line-clamp-1">
                  {musician.location}
                </div>
                <div className="flex items-center gap-1 mb-3">
                  <Star className="h-4 w-4 fill-warning text-warning" aria-hidden="true" />
                  <span className="text-sm font-medium" aria-label={`Avaliação: ${musician.rating.toFixed(1)} de 5`}>
                    {musician.rating.toFixed(1)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    ({musician.ratingCount} {musician.ratingCount === 1 ? 'avaliação' : 'avaliações'})
                  </span>
                </div>
                {musician.priceFrom && (
                  <div className="mb-4 font-semibold text-primary">
                    A partir de R$ {musician.priceFrom.toLocaleString("pt-BR")}
                  </div>
                )}
                <Link href={`/musico/${musician.id}`}>
                  <Button variant="secondary" size="sm" className="w-full transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]">
                    Ver perfil
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
