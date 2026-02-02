"use client";

import { Booking, getMyBookings } from "@/api/booking";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUserStore } from "@/lib/stores/userStore";
import { CalendarDays, Loader2, MessageSquare, Plus, Star, Users2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoggedIn, isLoading: userLoading } = useUserStore();
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
    { label: "Total de contratações", value: bookings.length, icon: Users2 },
    { label: "Mensagens não lidas", value: 0, icon: MessageSquare }, // TODO: implementar mensagens
    { label: "Próximos eventos", value: bookings.filter(b => b.status === "confirmado").length, icon: CalendarDays },
    { label: "Avaliação média", value: "N/A", icon: Star }, // TODO: buscar do perfil do músico
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
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">
            Olá, {user?.firstName ?? "música(o)"} 👋
          </h1>
          <p className="text-muted-foreground">
            Aqui está um resumo do que está acontecendo na sua conta.
          </p>
        </div>
        <Button onClick={() => router.push("/busca")} className="shrink-0">
          <Plus className="h-4 w-4 mr-2" />
          Novo pedido / Buscar músicos
        </Button>
      </div>

      {/* Cards de métricas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label} className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{s.label}</CardTitle>
                <Icon className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{s.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Próximos eventos / convites */}
      <div className="grid lg:grid-cols-3 gap-4 mt-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Minhas Solicitações</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {bookings.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                Nenhuma solicitação encontrada
              </div>
            ) : (
              bookings.slice(0, 5).map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between rounded-md border p-3"
                >
                  <div className="min-w-0">
                    <div className="font-medium truncate">{booking.eventType}</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(booking.eventDate).toLocaleDateString('pt-BR')}
                      {booking.musicianName && ` • ${booking.musicianName}`}
                    </div>
                  </div>
                  <Badge
                    variant={booking.status === "confirmado" ? "default" : "secondary"}
                    className="capitalize"
                  >
                    {booking.status}
                  </Badge>
                </div>
              ))
            )}
            {bookings.length > 5 && (
              <Button variant="outline" className="w-full">
                Ver todas ({bookings.length})
              </Button>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
