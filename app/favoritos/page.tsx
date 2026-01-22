"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useUserStore } from "@/lib/stores/userStore";
import { getMyFavorites, removeFavorite } from "@/api/favorite";
import type { Favorite } from "@/api/favorite";
import { Loader2, Heart, Star, MapPin } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function FavoritosPage() {
  const router = useRouter();
  const { isLoggedIn, isLoading: userLoading } = useUserStore();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [removingId, setRemovingId] = useState<number | null>(null);

  useEffect(() => {
    if (!userLoading && !isLoggedIn) {
      router.push("/login");
    }
  }, [isLoggedIn, userLoading, router]);

  useEffect(() => {
    if (isLoggedIn) {
      fetchFavorites();
    }
  }, [isLoggedIn]);

  const fetchFavorites = async () => {
    try {
      const data = await getMyFavorites();
      setFavorites(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao carregar favoritos';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveFavorite = async (musicianProfileId: number) => {
    setRemovingId(musicianProfileId);

    try {
      await removeFavorite(musicianProfileId);
      setFavorites(favorites.filter(fav => fav.musicianProfileId !== musicianProfileId));
      toast.success("Removido dos favoritos");
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao remover favorito';
      toast.error(message);
    } finally {
      setRemovingId(null);
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
            Músicos que você salvou para consultar depois
          </p>
        </div>

        {favorites.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <Heart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h2 className="text-xl font-semibold mb-2">
                  Nenhum favorito ainda
                </h2>
                <p className="text-muted-foreground mb-6">
                  Explore músicos incríveis e adicione aos seus favoritos!
                </p>
                <Button onClick={() => router.push("/busca")}>
                  Buscar Músicos
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((favorite) => (
              <Card key={favorite.id} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg truncate">
                        {favorite.musicianName || "Músico"}
                      </h3>
                      {favorite.musicianCategory && (
                        <p className="text-sm text-primary">
                          {favorite.musicianCategory}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleRemoveFavorite(favorite.musicianProfileId)}
                      disabled={removingId === favorite.musicianProfileId}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      {removingId === favorite.musicianProfileId ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <Heart className="h-5 w-5 fill-current" />
                      )}
                    </button>
                  </div>

                  {favorite.musicianRating !== undefined && (
                    <div className="flex items-center gap-1 mb-4">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm font-medium">
                        {favorite.musicianRating.toFixed(1)}
                      </span>
                    </div>
                  )}

                  <div className="text-xs text-muted-foreground mb-4">
                    Adicionado em {new Date(favorite.createdAt).toLocaleDateString('pt-BR')}
                  </div>

                  <Link href={`/musico/${favorite.musicianProfileId}`}>
                    <Button className="w-full" variant="secondary">
                      Ver Perfil
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

