"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MusicianAvatar } from "@/components/ui/musician-avatar";
import { useUserStore } from "@/lib/stores/userStore";
import { useFavoriteStore } from "@/lib/stores/favoriteStore";
import { Loader2, Heart, Star, MapPin, Music, Trash2 } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function FavoritosPage() {
  const router = useRouter();
  const { isLoggedIn, isLoading: userLoading } = useUserStore();
  const { favorites, isLoading, fetchFavorites } = useFavoriteStore();

  useEffect(() => {
    if (!userLoading && !isLoggedIn) {
      router.push("/login");
    }
  }, [isLoggedIn, userLoading, router]);

  // Recarrega favoritos ao montar para garantir dados frescos
  useEffect(() => {
    if (isLoggedIn) {
      fetchFavorites();
    }
  }, [isLoggedIn, fetchFavorites]);

  const handleRemoveFavorite = async (musicianProfileId: number) => {
    try {
      await useFavoriteStore.getState().toggleFavorite(musicianProfileId);
      toast.success("Removido dos favoritos");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Erro ao remover favorito";
      toast.error(message);
    }
  };

  if (userLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <section className="container mx-auto px-4 py-8 flex-1">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Meus Favoritos</h1>
          <p className="text-muted-foreground">
            {favorites.length > 0
              ? `Você tem ${favorites.length} músico${favorites.length > 1 ? "s" : ""} salvo${favorites.length > 1 ? "s" : ""}`
              : "Músicos que você salvou para consultar depois"}
          </p>
        </div>

        {favorites.length === 0 ? (
          <Card>
            <CardContent className="py-16">
              <div className="text-center">
                <Heart className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
                <h2 className="text-xl font-semibold mb-2">
                  Nenhum favorito ainda
                </h2>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Explore músicos incríveis e clique no coração para salvá-los aqui!
                </p>
                <Button onClick={() => router.push("/busca")} size="lg">
                  Buscar Músicos
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((favorite) => {
              const m = favorite.musician;
              const isRemoving = useFavoriteStore.getState().togglingIds.has(
                favorite.musicianProfileId
              );

              return (
                <Card
                  key={favorite.id}
                  className="overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group"
                >
                  {/* Imagem / Avatar do músico */}
                  <div className="relative h-48 w-full bg-muted overflow-hidden">
                    <MusicianAvatar
                      src={m.profileImageUrl}
                      name={m.name}
                      size={600}
                      fill
                      className="transition-transform duration-300 group-hover:scale-105"
                    />

                    {/* Botão de remover favorito */}
                    <button
                      onClick={() =>
                        handleRemoveFavorite(favorite.musicianProfileId)
                      }
                      disabled={isRemoving}
                      className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-background/70 hover:bg-background text-red-500 transition-all duration-200 hover:scale-110 active:scale-95 z-10 shadow-sm"
                      aria-label="Remover dos favoritos"
                    >
                      {isRemoving ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Heart className="h-4 w-4 fill-current" />
                      )}
                    </button>
                  </div>

                  <CardContent className="p-5">
                    {/* Nome */}
                    <h3 className="font-semibold text-lg truncate mb-1">
                      {m.name}
                    </h3>

                    {/* Categoria */}
                    {m.category && (
                      <p className="text-sm text-primary font-medium mb-2">
                        {m.category}
                      </p>
                    )}

                    {/* Localização */}
                    {m.location && (
                      <p className="flex items-center gap-1.5 text-sm text-muted-foreground mb-2">
                        <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                        <span className="truncate">{m.location}</span>
                      </p>
                    )}

                    {/* Rating */}
                    <div className="flex items-center gap-1.5 mb-3">
                      <Star
                        className="h-4 w-4 fill-warning text-warning"
                        aria-hidden="true"
                      />
                      <span className="text-sm font-bold">
                        {m.rating.toFixed(1)}
                      </span>
                      {m.ratingCount > 0 && (
                        <span className="text-xs text-muted-foreground">
                          ({m.ratingCount}{" "}
                          {m.ratingCount === 1 ? "avaliação" : "avaliações"})
                        </span>
                      )}
                    </div>

                    {/* Gêneros */}
                    {m.genres && m.genres.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {m.genres.slice(0, 3).map((genre) => (
                          <Badge
                            key={genre.id}
                            variant="secondary"
                            className="text-[10px] font-normal"
                          >
                            {genre.name}
                          </Badge>
                        ))}
                        {m.genres.length > 3 && (
                          <Badge
                            variant="outline"
                            className="text-[10px] font-normal"
                          >
                            +{m.genres.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Instrumentos */}
                    {m.instruments && m.instruments.length > 0 && (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
                        <Music className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">
                          {m.instruments.map((i) => i.name).join(", ")}
                        </span>
                      </div>
                    )}

                    {/* Separador + Preço + Ações */}
                    <div className="border-t pt-3 flex items-center justify-between">
                      {m.priceFrom ? (
                        <div className="flex items-baseline gap-1">
                          <span className="text-[10px] text-muted-foreground uppercase tracking-wide">
                            A partir de
                          </span>
                          <span className="text-sm font-bold text-primary">
                            R$ {m.priceFrom.toLocaleString("pt-BR")}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          Consultar preço
                        </span>
                      )}
                      <div className="flex items-center gap-1.5">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() =>
                            handleRemoveFavorite(favorite.musicianProfileId)
                          }
                          disabled={isRemoving}
                          aria-label="Remover dos favoritos"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <Link href={`/musico/${favorite.musicianProfileId}`}>
                          <Button size="sm" variant="secondary">
                            Ver Perfil
                          </Button>
                        </Link>
                      </div>
                    </div>

                    {/* Data de adição */}
                    <div className="text-[10px] text-muted-foreground mt-2 text-right">
                      Salvo em{" "}
                      {new Date(favorite.createdAt).toLocaleDateString("pt-BR")}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
