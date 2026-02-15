"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Shield, Users, Music2, Briefcase, CreditCard, Star } from "lucide-react";
import { toast } from "sonner";
import { useUserStore } from "@/lib/stores/userStore";
import { UserRole } from "@/lib/types/user";
import {
  getAdminDashboard,
  getAdminUsers,
  getAdminMusicians,
  toggleAdminFeatured,
  type AdminDashboardResponse,
  type AdminUserItem,
  type AdminMusicianItem,
  type PaginatedResponse,
} from "@/api/admin";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const DEFAULT_LIMIT = 20;

export default function AdminPage() {
  const router = useRouter();
  const { user, isLoggedIn, isLoading: isUserLoading, fetchUser } = useUserStore();

  const [dashboard, setDashboard] = useState<AdminDashboardResponse | null>(null);
  const [usersData, setUsersData] = useState<PaginatedResponse<AdminUserItem> | null>(null);
  const [musiciansData, setMusiciansData] = useState<PaginatedResponse<AdminMusicianItem> | null>(null);

  const [usersPage, setUsersPage] = useState(1);
  const [musiciansPage, setMusiciansPage] = useState(1);
  const [loadingDashboard, setLoadingDashboard] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingMusicians, setLoadingMusicians] = useState(true);
  const [togglingMusicianId, setTogglingMusicianId] = useState<number | null>(null);

  const isAdmin = user?.role === UserRole.ADMIN;

  useEffect(() => {
    if (isLoggedIn && !user) {
      fetchUser();
    }
  }, [isLoggedIn, user, fetchUser]);

  useEffect(() => {
    if (!isUserLoading && !isLoggedIn) {
      router.push("/login");
      return;
    }

    if (!isUserLoading && isLoggedIn && user && !isAdmin) {
      router.push("/dashboard");
    }
  }, [isUserLoading, isLoggedIn, user, isAdmin, router]);

  const loadDashboard = useCallback(async () => {
    if (!isLoggedIn || !isAdmin) return;

    setLoadingDashboard(true);
    try {
      const data = await getAdminDashboard();
      setDashboard(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao carregar dashboard admin";
      toast.error(message);
    } finally {
      setLoadingDashboard(false);
    }
  }, [isLoggedIn, isAdmin]);

  const loadUsers = useCallback(async () => {
    if (!isLoggedIn || !isAdmin) return;

    setLoadingUsers(true);
    try {
      const data = await getAdminUsers(usersPage, DEFAULT_LIMIT);
      setUsersData(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao carregar usuários";
      toast.error(message);
    } finally {
      setLoadingUsers(false);
    }
  }, [isLoggedIn, isAdmin, usersPage]);

  const loadMusicians = useCallback(async () => {
    if (!isLoggedIn || !isAdmin) return;

    setLoadingMusicians(true);
    try {
      const data = await getAdminMusicians(musiciansPage, DEFAULT_LIMIT);
      setMusiciansData(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao carregar músicos";
      toast.error(message);
    } finally {
      setLoadingMusicians(false);
    }
  }, [isLoggedIn, isAdmin, musiciansPage]);

  useEffect(() => {
    if (isLoggedIn && isAdmin) {
      loadDashboard();
    }
  }, [isLoggedIn, isAdmin, loadDashboard]);

  useEffect(() => {
    if (isLoggedIn && isAdmin) {
      loadUsers();
    }
  }, [isLoggedIn, isAdmin, loadUsers]);

  useEffect(() => {
    if (isLoggedIn && isAdmin) {
      loadMusicians();
    }
  }, [isLoggedIn, isAdmin, loadMusicians]);

  const handleToggleFeatured = async (musicianId: number) => {
    setTogglingMusicianId(musicianId);
    try {
      const result = await toggleAdminFeatured(musicianId);
      toast.success(result.message);
      await Promise.all([loadMusicians(), loadDashboard()]);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao alterar destaque";
      toast.error(message);
    } finally {
      setTogglingMusicianId(null);
    }
  };

  const metricCards = useMemo(() => {
    if (!dashboard) return [];
    return [
      { label: "Usuários", value: dashboard.totalUsers, icon: Users },
      { label: "Músicos", value: dashboard.totalMusicians, icon: Music2 },
      { label: "Contratantes", value: dashboard.totalClients, icon: Briefcase },
      { label: "Assinaturas ativas", value: dashboard.activeSubscriptions, icon: CreditCard },
    ];
  }, [dashboard]);

  if (isUserLoading || (isLoggedIn && !user) || (isLoggedIn && user && !isAdmin)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isLoggedIn) {
    return null;
  }

  return (
    <div className="min-h-screen bg-muted/20">
      <section className="container mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center gap-3">
          <Shield className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Painel Administrativo</h1>
            <p className="text-sm text-muted-foreground">
              Gestão geral da plataforma e monitoramento operacional.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {loadingDashboard && !dashboard ? (
            <div className="col-span-full flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            metricCards.map((card) => {
              const Icon = card.icon;
              return (
                <Card key={card.label}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center justify-between">
                      {card.label}
                      <Icon className="h-4 w-4 text-muted-foreground" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{card.value}</div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Usuários</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {loadingUsers && !usersData ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Nome</TableHead>
                      <TableHead>E-mail</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Papel</TableHead>
                      <TableHead>Cidade/UF</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {usersData?.data.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.id}</TableCell>
                        <TableCell>{item.firstName} {item.lastName}</TableCell>
                        <TableCell>{item.email}</TableCell>
                        <TableCell>{item.userType}</TableCell>
                        <TableCell>
                          <Badge variant={item.role === UserRole.ADMIN ? "default" : "secondary"}>
                            {item.role}
                          </Badge>
                        </TableCell>
                        <TableCell>{item.city || "-"}{item.state ? `/${item.state}` : ""}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Página {usersData?.pagination.page ?? 1} de {usersData?.pagination.totalPages ?? 1}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setUsersPage((prev) => Math.max(1, prev - 1))}
                      disabled={(usersData?.pagination.page ?? 1) <= 1 || loadingUsers}
                    >
                      Anterior
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setUsersPage((prev) => prev + 1)}
                      disabled={
                        !usersData ||
                        (usersData.pagination.page >= usersData.pagination.totalPages) ||
                        loadingUsers
                      }
                    >
                      Próxima
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Músicos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {loadingMusicians && !musiciansData ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Nome</TableHead>
                      <TableHead>E-mail</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Avaliação</TableHead>
                      <TableHead>Destaque</TableHead>
                      <TableHead>Ação</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {musiciansData?.data.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.id}</TableCell>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>{item.email}</TableCell>
                        <TableCell>{item.category || "-"}</TableCell>
                        <TableCell>
                          <span className="inline-flex items-center gap-1">
                            <Star className="h-3.5 w-3.5 text-yellow-500" />
                            {item.rating.toFixed(1)} ({item.ratingCount})
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant={item.isFeatured ? "default" : "secondary"}>
                            {item.isFeatured ? "Sim" : "Não"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant={item.isFeatured ? "outline" : "default"}
                            onClick={() => handleToggleFeatured(item.id)}
                            disabled={togglingMusicianId === item.id}
                          >
                            {togglingMusicianId === item.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : item.isFeatured ? (
                              "Remover destaque"
                            ) : (
                              "Destacar"
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Página {musiciansData?.pagination.page ?? 1} de {musiciansData?.pagination.totalPages ?? 1}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setMusiciansPage((prev) => Math.max(1, prev - 1))}
                      disabled={(musiciansData?.pagination.page ?? 1) <= 1 || loadingMusicians}
                    >
                      Anterior
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setMusiciansPage((prev) => prev + 1)}
                      disabled={
                        !musiciansData ||
                        (musiciansData.pagination.page >= musiciansData.pagination.totalPages) ||
                        loadingMusicians
                      }
                    >
                      Próxima
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
