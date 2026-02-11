"use client";

import { Booking, getMyBookings } from "@/api/booking";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MusicianAvatar } from "@/components/ui/musician-avatar";
import { useUserStore } from "@/lib/stores/userStore";
import { useChatStore } from "@/lib/stores/chatStore";
import { useFavoriteStore } from "@/lib/stores/favoriteStore";
import { CalendarDays, Heart, Loader2, MapPin, MessageSquare, Plus, Star, Users2 } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoggedIn, isLoading: userLoading } = useUserStore();
  const { unreadCount } = useChatStore();
  const { favorites, favoriteIds, hasUnseenFavorites, markFavoritesAsSeen } = useFavoriteStore();
  const favoritesCount = favoriteIds.size;
  const favoritesHasBadge = hasUnseenFavorites();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(true);
  const [hydrated, setHydrated] = useState(false);

  // Garantir hidratação antes de verificar autenticação
  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    // Só redireciona após a hidratação estar completa
    if (hydrated && !userLoading && !isLoggedIn) {
      router.push("/login");
    }
  }, [hydrated, isLoggedIn, userLoading, router]);

  useEffect(() => {
    if (hydrated && isLoggedIn) {
      fetchBookings();
    } else if (hydrated && !isLoggedIn && !userLoading) {
      // Se hidratado e não logado, para o loading
      setIsLoadingBookings(false);
    }
  }, [hydrated, isLoggedIn, userLoading]);

  const fetchBookings = async () => {
    try {
      const data = await getMyBookings();
      setBookings(Array.isArray(data) ? data : []);
    } catch (error) {
      // Silenciosamente trata erros, define como array vazio
      if (process.env.NODE_ENV === 'development') {
        console.warn('Dashboard: Erro ao carregar bookings', error);
      }
      setBookings([]);
    } finally {
      setIsLoadingBookings(false);
    }
  };

  // Estatísticas dinâmicas
  const stats = [
    { label: "Total de contratações", value: bookings.length, icon: Users2, href: undefined as string | undefined, highlight: false },
    { label: "Mensagens não lidas", value: unreadCount, icon: MessageSquare, href: "/mensagens", highlight: unreadCount > 0 },
    { label: "Próximos eventos", value: bookings.filter(b => b.status === "confirmado").length, icon: CalendarDays, href: undefined as string | undefined, highlight: false },
    { label: "Favoritos", value: favoritesCount, icon: Heart, href: "/favoritos", highlight: favoritesHasBadge },
  ];

  if (userLoading || isLoadingBookings) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Cabeçalho */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">
            Olá, {user?.firstName ?? "música(o)"}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Aqui está um resumo do que está acontecendo na sua conta.
          </p>
        </div>
        <Button onClick={() => router.push("/busca")} className="shrink-0 w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          <span className="sm:hidden">Buscar músicos</span>
          <span className="hidden sm:inline">Novo pedido / Buscar músicos</span>
        </Button>
      </div>

      {/* Cards de métricas */}
      <div className="grid grid-cols-1 min-[360px]:grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon;
          const cardContent = (
            <Card
              key={s.label}
              className={`shadow-sm transition-all duration-200 ${
                s.highlight
                  ? "border-primary bg-primary/5 ring-1 ring-primary/20 hover:bg-primary/10"
                  : ""
              } ${s.href ? "cursor-pointer hover:shadow-md" : ""}`}
              onClick={
                s.href
                  ? () => {
                      if (s.href === "/favoritos") {
                        markFavoritesAsSeen();
                      }
                      router.push(s.href!);
                    }
                  : undefined
              }
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 sm:p-4 pb-1 sm:pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium leading-tight">{s.label}</CardTitle>
                <div className="relative shrink-0 ml-2">
                  <Icon className={`h-4 w-4 sm:h-5 sm:w-5 ${s.highlight ? "text-primary" : "text-muted-foreground"}`} />
                  {s.highlight && (
                    <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse" />
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-3 sm:p-4 pt-0 sm:pt-0">
                <div className={`text-xl sm:text-2xl font-bold ${s.highlight ? "text-primary" : ""}`}>
                  {s.value}
                </div>
                {s.highlight && (
                  <p className="text-[11px] text-primary/70 font-medium mt-0.5">
                    Clique para ver
                  </p>
                )}
              </CardContent>
            </Card>
          );
          return <div key={s.label}>{cardContent}</div>;
        })}
      </div>

      {/* Solicitações + Favoritos recentes */}
      <div className="grid lg:grid-cols-3 gap-4 mt-6">
        <Card className="lg:col-span-2">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-lg sm:text-xl">Minhas Solicitações</CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0 space-y-3">
            {bookings.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground text-sm sm:text-base">
                Nenhuma solicitação encontrada
              </div>
            ) : (
              bookings.slice(0, 5).map((booking) => (
                <div
                  key={booking.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 rounded-md border p-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="font-medium truncate text-sm sm:text-base">{booking.eventType}</div>
                    <div className="text-xs sm:text-sm text-muted-foreground">
                      {new Date(booking.eventDate).toLocaleDateString('pt-BR')}
                      {booking.musicianName && ` • ${booking.musicianName}`}
                    </div>
                  </div>
                  <Badge
                    variant={booking.status === "confirmado" ? "default" : "secondary"}
                    className="capitalize w-fit text-xs"
                  >
                    {booking.status}
                  </Badge>
                </div>
              ))
            )}
            {bookings.length > 5 && (
              <Button variant="outline" className="w-full text-sm">
                Ver todas ({bookings.length})
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Favoritos recentes */}
        <Card>
          <CardHeader className="p-4 sm:p-6 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-500" />
              Favoritos
            </CardTitle>
            {favoritesCount > 0 && (
              <Link href="/favoritos" onClick={markFavoritesAsSeen}>
                <Button variant="ghost" size="sm" className="text-xs">
                  Ver todos
                </Button>
              </Link>
            )}
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0 space-y-3">
            {favorites.length === 0 ? (
              <div className="text-center py-6">
                <Heart className="h-10 w-10 mx-auto text-muted-foreground/30 mb-2" />
                <p className="text-sm text-muted-foreground mb-3">
                  Nenhum favorito ainda
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push("/busca")}
                  className="text-xs"
                >
                  Buscar Músicos
                </Button>
              </div>
            ) : (
              favorites.slice(0, 4).map((fav) => {
                const m = fav.musician;
                return (
                  <Link
                    key={fav.id}
                    href={`/musico/${fav.musicianProfileId}`}
                    className="flex items-center gap-3 rounded-md border p-2.5 hover:bg-muted/50 transition-colors"
                  >
                    <div className="h-10 w-10 rounded-full overflow-hidden flex-shrink-0">
                      <MusicianAvatar
                        src={m.profileImageUrl}
                        name={m.name}
                        size={40}
                        className="h-10 w-10 rounded-full"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-sm truncate">{m.name}</div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {m.category && <span>{m.category}</span>}
                        {m.location && (
                          <span className="flex items-center gap-0.5">
                            <MapPin className="h-2.5 w-2.5" />
                            <span className="truncate max-w-[100px]">{m.location}</span>
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-0.5 flex-shrink-0">
                      <Star className="h-3 w-3 fill-warning text-warning" />
                      <span className="text-xs font-medium">{m.rating.toFixed(1)}</span>
                    </div>
                  </Link>
                );
              })
            )}
            {favorites.length > 4 && (
              <Link href="/favoritos" onClick={markFavoritesAsSeen}>
                <Button variant="outline" className="w-full text-sm">
                  Ver todos ({favoritesCount})
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
