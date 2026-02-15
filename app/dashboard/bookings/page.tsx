"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useUserStore } from "@/lib/stores/userStore";
import { getMyBookings, updateBookingStatus, type Booking } from "@/api/booking";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const BOOKING_STATUSES = ["pendente", "negociando", "confirmado", "cancelado", "concluido"] as const;

export default function DashboardBookingsPage() {
  const router = useRouter();
  const { isLoggedIn, isLoading: isUserLoading } = useUserStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState<number | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      const data = await getMyBookings();
      setBookings(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao carregar contratações";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isUserLoading && !isLoggedIn) {
      router.push("/login");
      return;
    }

    if (isLoggedIn) {
      fetchBookings();
    }
  }, [isUserLoading, isLoggedIn, router]);

  const handleStatusChange = async (bookingId: number, status: string) => {
    setIsUpdating(bookingId);
    try {
      await updateBookingStatus(bookingId, status);
      toast.success("Status atualizado com sucesso");
      await fetchBookings();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao atualizar status";
      toast.error(message);
    } finally {
      setIsUpdating(null);
    }
  };

  if (isUserLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20">
      <section className="container mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Minhas Contratações</h1>
            <p className="text-sm text-muted-foreground">
              Acompanhe e atualize o status das solicitações.
            </p>
          </div>
          <Button variant="outline" onClick={() => router.push("/dashboard")}>
            Voltar ao Dashboard
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de solicitações</CardTitle>
          </CardHeader>
          <CardContent>
            {bookings.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhuma solicitação encontrada.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Evento</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Músico</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell>{booking.id}</TableCell>
                      <TableCell>{booking.eventType}</TableCell>
                      <TableCell>{new Date(booking.eventDate).toLocaleDateString("pt-BR")}</TableCell>
                      <TableCell>{booking.musicianName || booking.musician?.name || "-"}</TableCell>
                      <TableCell>{booking.clientName || booking.client?.name || "Anônimo"}</TableCell>
                      <TableCell>
                        <Badge variant={booking.status === "confirmado" ? "default" : "secondary"}>
                          {booking.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <select
                          value={booking.status}
                          onChange={(e) => handleStatusChange(booking.id, e.target.value)}
                          disabled={isUpdating === booking.id}
                          className="h-8 rounded-md border bg-background px-2 text-xs"
                        >
                          {BOOKING_STATUSES.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
