"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MusicianAvatar } from "@/components/ui/musician-avatar";
import { useUserStore } from "@/lib/stores/userStore";
import { useFavoriteStore } from "@/lib/stores/favoriteStore";
import {
  ArrowUpDown,
  CalendarDays,
  Heart,
  LayoutGrid,
  List,
  Loader2,
  MapPin,
  MessageCircle,
  Music2,
  Star,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

type SortOption = "recent" | "rating" | "priceAsc" | "priceDesc" | "name";

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "recent", label: "Mais recentes" },
  { value: "rating", label: "Melhor avaliação" },
  { value: "priceAsc", label: "Menor preço" },
  { value: "priceDesc", label: "Maior preço" },
  { value: "name", label: "Nome (A-Z)" },
];

export default function FavoritosPage() {
  const router = useRouter();
  const [sortBy, setSortBy] = useState<SortOption>("recent");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const { isLoggedIn, isLoading: userLoading } = useUserStore();
  const {
    favorites,
    isLoading,
    fetchFavorites,
    markFavoritesAsSeen,
    togglingIds,
  } = useFavoriteStore();

  useEffect(() => {
    if (!userLoading && !isLoggedIn) {
      router.push("/login");
    }
  }, [isLoggedIn, userLoading, router]);

  useEffect(() => {
    if (isLoggedIn) {
      fetchFavorites();
    }
  }, [isLoggedIn, fetchFavorites]);

  useEffect(() => {
    if (isLoggedIn) {
      markFavoritesAsSeen();
    }
  }, [isLoggedIn, favorites, markFavoritesAsSeen]);

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

  const sortedFavorites = useMemo(() => {
    const ordered = [...favorites];

    switch (sortBy) {
      case "rating":
        ordered.sort((a, b) => b.musician.rating - a.musician.rating);
        break;
      case "priceAsc":
        ordered.sort((a, b) => a.musician.priceFrom - b.musician.priceFrom);
        break;
      case "priceDesc":
        ordered.sort((a, b) => b.musician.priceFrom - a.musician.priceFrom);
        break;
      case "name":
        ordered.sort((a, b) =>
          a.musician.name.localeCompare(b.musician.name, "pt-BR")
        );
        break;
      case "recent":
      default:
        ordered.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
    }

    return ordered;
  }, [favorites, sortBy]);

  const averageRating = useMemo(() => {
    if (favorites.length === 0) return 0;
    const total = favorites.reduce((sum, item) => sum + item.musician.rating, 0);
    return total / favorites.length;
  }, [favorites]);

  const lastAddedDate = useMemo(() => {
    if (favorites.length === 0) return null;
    const latest = favorites.reduce((acc, item) => {
      const current = new Date(item.createdAt).getTime();
      return current > acc ? current : acc;
    }, 0);
    return new Date(latest).toLocaleDateString("pt-BR");
  }, [favorites]);

  if (userLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary/25 via-background to-background">
      <section className="container mx-auto px-4 py-8 flex-1">
        <div className="mb-6 rounded-2xl border bg-card p-5 sm:p-7 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 h-36 w-36 rounded-full bg-primary/10 blur-2xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 h-36 w-36 rounded-full bg-accent/10 blur-2xl pointer-events-none" />

          <div className="relative">
            <div className="flex items-center gap-2 text-primary mb-2">
              <Heart className="h-4 w-4 fill-current" />
              <span className="text-xs font-semibold uppercase tracking-wider">
                Biblioteca pessoal
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold mb-2">Meus Favoritos</h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              {favorites.length > 0
                ? `Você salvou ${favorites.length} músico${favorites.length > 1 ? "s" : ""} para decidir com calma.`
                : "Salve músicos para comparar propostas, estilos e disponibilidade."}
            </p>

            {favorites.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                <Badge variant="secondary" className="font-medium">
                  <Heart className="h-3.5 w-3.5 mr-1.5 fill-current" />
                  {favorites.length} salvo{favorites.length > 1 ? "s" : ""}
                </Badge>
                <Badge variant="secondary" className="font-medium">
                  <Star className="h-3.5 w-3.5 mr-1.5 fill-warning text-warning" />
                  Média {averageRating.toFixed(1)}
                </Badge>
                {lastAddedDate && (
                  <Badge variant="secondary" className="font-medium">
                    <CalendarDays className="h-3.5 w-3.5 mr-1.5" />
                    Último salvo em {lastAddedDate}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>

        {favorites.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-16 px-6">
              <div className="text-center max-w-lg mx-auto">
                <Heart className="h-16 w-16 mx-auto text-muted-foreground/30 mb-5" />
                <h2 className="text-xl font-semibold mb-2">Nenhum favorito ainda</h2>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Explore músicos e clique no coração para criar sua shortlist.
                  Seus favoritos ficam organizados aqui para comparação rápida.
                </p>
                <Button
                  onClick={() => router.push("/busca")}
                  size="lg"
                  className="min-w-44"
                >
                  Buscar Músicos
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
              <div className="relative w-full sm:w-64">
                <ArrowUpDown className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="h-10 w-full rounded-md border bg-background pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  aria-label="Ordenar favoritos"
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="inline-flex rounded-lg border bg-card p-1">
                <Button
                  type="button"
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                >
                  <LayoutGrid className="h-4 w-4 mr-1.5" /> Grade
                </Button>
                <Button
                  type="button"
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4 mr-1.5" /> Lista
                </Button>
              </div>
            </div>

            <div
              className={
                viewMode === "grid"
                  ? "grid sm:grid-cols-2 xl:grid-cols-3 gap-5"
                  : "space-y-4"
              }
            >
              {sortedFavorites.map((favorite) => {
                const m = favorite.musician;
                const isRemoving = togglingIds.has(favorite.musicianProfileId);

                if (viewMode === "list") {
                  return (
                    <Card
                      key={favorite.id}
                      className="border p-3 sm:p-4 transition-all duration-300 hover:shadow-md"
                    >
                      <div className="flex gap-3 sm:gap-4">
                        <div className="relative h-20 w-20 sm:h-24 sm:w-24 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                          <MusicianAvatar
                            src={m.profileImageUrl}
                            name={m.name}
                            size={240}
                            fill
                          />
                          <button
                            onClick={() =>
                              handleRemoveFavorite(favorite.musicianProfileId)
                            }
                            disabled={isRemoving}
                            className="absolute top-1.5 right-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-background/85 hover:bg-background text-red-500 transition-colors z-10 shadow-sm"
                            aria-label="Remover dos favoritos"
                          >
                            {isRemoving ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Heart className="h-3.5 w-3.5 fill-current" />
                            )}
                          </button>
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <h3 className="font-semibold text-base line-clamp-1">
                                {m.name}
                              </h3>
                              <p className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                                <MapPin className="h-3 w-3 flex-shrink-0" />
                                <span className="line-clamp-1">{m.location}</span>
                              </p>
                            </div>
                            <Badge
                              variant="outline"
                              className="shrink-0 text-[11px] border-warning/40 text-warning"
                            >
                              <Star className="h-3 w-3 mr-1 fill-warning text-warning" />
                              {m.rating.toFixed(1)}
                            </Badge>
                          </div>

                          <div className="mt-2 flex flex-wrap gap-1">
                            {m.genres?.slice(0, 2).map((genre) => (
                              <Badge
                                key={genre.id}
                                variant="secondary"
                                className="text-[10px] font-medium"
                              >
                                {genre.name}
                              </Badge>
                            ))}
                            {m.category && (
                              <Badge
                                variant="outline"
                                className="text-[10px] font-medium"
                              >
                                {m.category}
                              </Badge>
                            )}
                          </div>

                          <div className="mt-2 flex items-center justify-between gap-2">
                            {m.priceFrom ? (
                              <span className="text-sm font-semibold text-primary">
                                R$ {m.priceFrom.toLocaleString("pt-BR")}
                              </span>
                            ) : (
                              <span className="text-xs text-muted-foreground">
                                Consultar preço
                              </span>
                            )}

                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 px-2 sm:px-3"
                                onClick={() =>
                                  router.push(
                                    `/mensagens?musico=${favorite.musicianProfileId}`
                                  )
                                }
                              >
                                <MessageCircle className="h-4 w-4 sm:mr-1.5" />
                                <span className="hidden sm:inline">Mensagem</span>
                              </Button>

                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 px-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() =>
                                  handleRemoveFavorite(favorite.musicianProfileId)
                                }
                                disabled={isRemoving}
                              >
                                <Trash2 className="h-3.5 w-3.5 sm:mr-1" />
                                <span className="hidden sm:inline">Remover</span>
                              </Button>

                              <Link href={`/musico/${favorite.musicianProfileId}`}>
                                <Button size="sm" className="h-8 px-2 sm:px-3 text-xs sm:text-sm">
                                  Perfil
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                }

                return (
                  <Card
                    key={favorite.id}
                    className="group overflow-hidden border transition-all duration-300 hover:shadow-lg flex flex-col hover:-translate-y-1"
                  >
                    <div className="relative bg-muted overflow-hidden h-52 w-full">
                      <MusicianAvatar
                        src={m.profileImageUrl}
                        name={m.name}
                        size={600}
                        fill
                        className="transition-transform duration-500 group-hover:scale-105"
                      />

                      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />

                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2">
                        {m.category ? (
                          <Badge className="bg-white/90 text-black hover:bg-white max-w-[60%] truncate">
                            {m.category}
                          </Badge>
                        ) : (
                          <span />
                        )}
                        <span className="text-[11px] text-white/90 whitespace-nowrap">
                          {new Date(favorite.createdAt).toLocaleDateString("pt-BR")}
                        </span>
                      </div>

                      <button
                        onClick={() => handleRemoveFavorite(favorite.musicianProfileId)}
                        disabled={isRemoving}
                        className="absolute top-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-background/85 hover:bg-background text-red-500 transition-all duration-200 hover:scale-110 active:scale-95 z-10 shadow-sm"
                        aria-label="Remover dos favoritos"
                      >
                        {isRemoving ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Heart className="h-4 w-4 fill-current" />
                        )}
                      </button>
                    </div>

                    <CardContent className="p-4 sm:p-5 flex flex-1 flex-col">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <h3 className="font-semibold text-lg leading-tight line-clamp-2">
                          {m.name}
                        </h3>
                        <Badge
                          variant="outline"
                          className="shrink-0 font-semibold border-warning/40 text-warning"
                        >
                          <Star className="h-3.5 w-3.5 mr-1 fill-warning text-warning" />
                          {m.rating.toFixed(1)}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-3">
                        <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                        <span className="line-clamp-1">{m.location}</span>
                        {m.ratingCount > 0 && (
                          <span className="text-xs">
                            · {m.ratingCount} {m.ratingCount === 1 ? "avaliação" : "avaliações"}
                          </span>
                        )}
                      </div>

                      {m.genres && m.genres.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {m.genres.slice(0, 3).map((genre) => (
                            <Badge key={genre.id} variant="secondary" className="text-[11px] font-medium">
                              {genre.name}
                            </Badge>
                          ))}
                          {m.genres.length > 3 && (
                            <Badge variant="outline" className="text-[11px] font-medium">
                              +{m.genres.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}

                      {m.instruments && m.instruments.length > 0 && (
                        <div className="flex items-start gap-1.5 text-sm text-muted-foreground mb-4">
                          <Music2 className="h-4 w-4 flex-shrink-0 mt-0.5" />
                          <span className="line-clamp-2">
                            {m.instruments.map((i) => i.name).join(", ")}
                          </span>
                        </div>
                      )}

                      <div className="mt-auto border-t pt-3">
                        <div className="flex items-center justify-between gap-3 mb-3">
                          <div>
                            <span className="block text-[10px] uppercase tracking-wide text-muted-foreground">
                              Cachê base
                            </span>
                            {m.priceFrom ? (
                              <span className="text-base font-bold text-primary">
                                R$ {m.priceFrom.toLocaleString("pt-BR")}
                              </span>
                            ) : (
                              <span className="text-sm text-muted-foreground">
                                Consultar preço
                              </span>
                            )}
                          </div>

                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-9 px-3"
                            onClick={() => router.push(`/mensagens?musico=${favorite.musicianProfileId}`)}
                          >
                            <MessageCircle className="h-4 w-4 mr-1.5" />
                            Mensagem
                          </Button>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => handleRemoveFavorite(favorite.musicianProfileId)}
                            disabled={isRemoving}
                          >
                            {isRemoving ? (
                              <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                            ) : (
                              <Trash2 className="h-4 w-4 mr-1.5" />
                            )}
                            Remover
                          </Button>

                          <Link href={`/musico/${favorite.musicianProfileId}`} className="flex-1">
                            <Button size="sm" className="w-full">
                              Ver perfil
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
