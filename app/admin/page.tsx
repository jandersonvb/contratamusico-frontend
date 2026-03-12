"use client";

import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  CalendarClock,
  CreditCard,
  Loader2,
  Music2,
  RefreshCw,
  Search,
  Shield,
  Star,
  TrendingUp,
  UserPlus,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { useUserStore } from "@/lib/stores/userStore";
import { UserRole, UserType } from "@/lib/types/user";
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
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const DEFAULT_LIMIT = 20;
const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 2,
});
const numberFormatter = new Intl.NumberFormat("pt-BR");

type UserRoleFilter = "all" | UserRole;
type UserTypeFilter = "all" | UserType;
type FeaturedFilter = "all" | "featured" | "not-featured";

function normalizeText(value: string | number | null | undefined): string {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function formatDate(value: string | null | undefined): string {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("pt-BR");
}

function formatDateTime(value: string | null | undefined): string {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function formatUserType(value: string): string {
  if (value === UserType.CLIENT) return "Contratante";
  if (value === UserType.MUSICIAN) return "Músico";
  return value;
}

function formatBookingStatus(value: string): string {
  const normalized = normalizeText(value);

  if (normalized === "confirmado" || normalized === "confirmed") return "Confirmado";
  if (normalized === "pendente" || normalized === "pending") return "Pendente";
  if (normalized === "cancelado" || normalized === "canceled" || normalized === "cancelled") {
    return "Cancelado";
  }

  return value;
}

function getBookingStatusVariant(
  value: string
): "default" | "secondary" | "destructive" | "outline" {
  const normalized = normalizeText(value);

  if (normalized === "confirmado" || normalized === "confirmed") return "default";
  if (normalized === "pendente" || normalized === "pending") return "secondary";
  if (normalized === "cancelado" || normalized === "canceled" || normalized === "cancelled") {
    return "destructive";
  }

  return "outline";
}

export default function AdminPage() {
  const router = useRouter();
  const { user, isLoggedIn, isLoading: isUserLoading, fetchUser, logout } = useUserStore();
  const [isSessionValidated, setIsSessionValidated] = useState(false);

  const [dashboard, setDashboard] = useState<AdminDashboardResponse | null>(null);
  const [usersData, setUsersData] = useState<PaginatedResponse<AdminUserItem> | null>(null);
  const [musiciansData, setMusiciansData] = useState<PaginatedResponse<AdminMusicianItem> | null>(null);

  const [usersPage, setUsersPage] = useState(1);
  const [musiciansPage, setMusiciansPage] = useState(1);
  const [loadingDashboard, setLoadingDashboard] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingMusicians, setLoadingMusicians] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [togglingMusicianId, setTogglingMusicianId] = useState<number | null>(null);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<string | null>(null);
  const [userSearch, setUserSearch] = useState("");
  const [musicianSearch, setMusicianSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState<UserRoleFilter>("all");
  const [userTypeFilter, setUserTypeFilter] = useState<UserTypeFilter>("all");
  const [featuredFilter, setFeaturedFilter] = useState<FeaturedFilter>("all");
  const didHandleAuthError = useRef(false);
  const deferredUserSearch = useDeferredValue(userSearch);
  const deferredMusicianSearch = useDeferredValue(musicianSearch);

  const isAdmin = user?.role === UserRole.ADMIN;

  useEffect(() => {
    let isMounted = true;

    const validateSession = async () => {
      if (!isLoggedIn) {
        if (isMounted) {
          setIsSessionValidated(true);
        }
        return;
      }

      if (isMounted) {
        setIsSessionValidated(false);
      }

      try {
        await fetchUser();
      } finally {
        if (isMounted) {
          setIsSessionValidated(true);
        }
      }
    };

    void validateSession();

    return () => {
      isMounted = false;
    };
  }, [isLoggedIn, fetchUser]);

  useEffect(() => {
    if (!isSessionValidated) {
      return;
    }

    if (!isUserLoading && !isLoggedIn) {
      router.push("/login");
      return;
    }

    if (!isUserLoading && isLoggedIn && user && !isAdmin) {
      router.push("/dashboard");
    }
  }, [isSessionValidated, isUserLoading, isLoggedIn, user, isAdmin, router]);

  const handleRequestError = useCallback((error: unknown, fallbackMessage: string) => {
    const message = error instanceof Error ? error.message : fallbackMessage;
    const normalizedMessage = message.toLowerCase();
    const isAuthError =
      normalizedMessage.includes("unauthorized") ||
      normalizedMessage.includes("forbidden") ||
      normalizedMessage.includes("acesso negado") ||
      normalizedMessage.includes("token não encontrado") ||
      normalizedMessage.includes("token nao encontrado");

    if (isAuthError) {
      if (didHandleAuthError.current) return;
      didHandleAuthError.current = true;
      logout();
      toast.error("Sua sessão expirou. Faça login novamente.");
      router.push("/login");
      return;
    }

    toast.error(message);
  }, [logout, router]);

  const loadDashboard = useCallback(async () => {
    if (!isSessionValidated || !isLoggedIn || !isAdmin) return;

    setLoadingDashboard(true);
    try {
      const data = await getAdminDashboard();
      setDashboard(data);
      setLastUpdatedAt(new Date().toISOString());
    } catch (error) {
      handleRequestError(error, "Erro ao carregar dashboard admin");
    } finally {
      setLoadingDashboard(false);
    }
  }, [isSessionValidated, isLoggedIn, isAdmin, handleRequestError]);

  const loadUsers = useCallback(async () => {
    if (!isSessionValidated || !isLoggedIn || !isAdmin) return;

    setLoadingUsers(true);
    try {
      const data = await getAdminUsers(usersPage, DEFAULT_LIMIT);
      setUsersData(data);
      setLastUpdatedAt(new Date().toISOString());
    } catch (error) {
      handleRequestError(error, "Erro ao carregar usuários");
    } finally {
      setLoadingUsers(false);
    }
  }, [isSessionValidated, isLoggedIn, isAdmin, usersPage, handleRequestError]);

  const loadMusicians = useCallback(async () => {
    if (!isSessionValidated || !isLoggedIn || !isAdmin) return;

    setLoadingMusicians(true);
    try {
      const data = await getAdminMusicians(musiciansPage, DEFAULT_LIMIT);
      setMusiciansData(data);
      setLastUpdatedAt(new Date().toISOString());
    } catch (error) {
      handleRequestError(error, "Erro ao carregar músicos");
    } finally {
      setLoadingMusicians(false);
    }
  }, [isSessionValidated, isLoggedIn, isAdmin, musiciansPage, handleRequestError]);

  const refreshAll = useCallback(async () => {
    if (!isSessionValidated || !isLoggedIn || !isAdmin) return;

    setIsRefreshing(true);
    try {
      await Promise.all([loadDashboard(), loadUsers(), loadMusicians()]);
    } finally {
      setIsRefreshing(false);
    }
  }, [isSessionValidated, isLoggedIn, isAdmin, loadDashboard, loadUsers, loadMusicians]);

  useEffect(() => {
    if (isSessionValidated && isLoggedIn && isAdmin) {
      void loadDashboard();
    }
  }, [isSessionValidated, isLoggedIn, isAdmin, loadDashboard]);

  useEffect(() => {
    if (isSessionValidated && isLoggedIn && isAdmin) {
      void loadUsers();
    }
  }, [isSessionValidated, isLoggedIn, isAdmin, loadUsers]);

  useEffect(() => {
    if (isSessionValidated && isLoggedIn && isAdmin) {
      void loadMusicians();
    }
  }, [isSessionValidated, isLoggedIn, isAdmin, loadMusicians]);

  const handleToggleFeatured = async (musicianId: number) => {
    setTogglingMusicianId(musicianId);
    try {
      const result = await toggleAdminFeatured(musicianId);
      toast.success(result.message);
      await Promise.all([loadMusicians(), loadDashboard()]);
    } catch (error) {
      handleRequestError(error, "Erro ao alterar destaque");
    } finally {
      setTogglingMusicianId(null);
    }
  };

  const metricCards = useMemo(() => {
    if (!dashboard) return [];
    return [
      {
        label: "Usuários",
        value: numberFormatter.format(dashboard.totalUsers),
        description: "Base total cadastrada na plataforma.",
        icon: Users,
      },
      {
        label: "Músicos",
        value: numberFormatter.format(dashboard.totalMusicians),
        description: "Perfis musicais disponíveis para contratação.",
        icon: Music2,
      },
      {
        label: "Contratantes",
        value: numberFormatter.format(dashboard.totalClients),
        description: "Contas com perfil de cliente.",
        icon: Briefcase,
      },
      {
        label: "Contratações",
        value: numberFormatter.format(dashboard.totalBookings),
        description: "Pedidos e eventos registrados.",
        icon: CalendarClock,
      },
      {
        label: "Assinaturas ativas",
        value: numberFormatter.format(dashboard.activeSubscriptions),
        description: "Planos pagos ativos no momento.",
        icon: CreditCard,
      },
      {
        label: "Receita mensal",
        value: currencyFormatter.format(dashboard.monthlyRevenue / 100),
        description: "Faturamento consolidado no período.",
        icon: TrendingUp,
      },
    ];
  }, [dashboard]);

  const filteredUsers = useMemo(() => {
    const query = normalizeText(deferredUserSearch);

    return (usersData?.data ?? []).filter((item) => {
      const matchesRole = userRoleFilter === "all" || item.role === userRoleFilter;
      const matchesType = userTypeFilter === "all" || item.userType === userTypeFilter;
      const haystack = normalizeText(
        [item.id, item.firstName, item.lastName, item.email, item.city, item.state].join(" ")
      );

      return matchesRole && matchesType && (!query || haystack.includes(query));
    });
  }, [usersData, deferredUserSearch, userRoleFilter, userTypeFilter]);

  const filteredMusicians = useMemo(() => {
    const query = normalizeText(deferredMusicianSearch);

    return (musiciansData?.data ?? []).filter((item) => {
      const matchesFeatured =
        featuredFilter === "all" ||
        (featuredFilter === "featured" && item.isFeatured) ||
        (featuredFilter === "not-featured" && !item.isFeatured);
      const haystack = normalizeText(
        [item.id, item.name, item.email, item.category, item.location, item.eventsCount].join(" ")
      );

      return matchesFeatured && (!query || haystack.includes(query));
    });
  }, [musiciansData, deferredMusicianSearch, featuredFilter]);

  const userSummary = useMemo(() => {
    return {
      visible: filteredUsers.length,
      total: usersData?.pagination.total ?? 0,
      admins: filteredUsers.filter((item) => item.role === UserRole.ADMIN).length,
      musicians: filteredUsers.filter((item) => item.userType === UserType.MUSICIAN).length,
      clients: filteredUsers.filter((item) => item.userType === UserType.CLIENT).length,
    };
  }, [filteredUsers, usersData]);

  const musicianSummary = useMemo(() => {
    const averageRating =
      filteredMusicians.length > 0
        ? filteredMusicians.reduce((sum, item) => sum + item.rating, 0) / filteredMusicians.length
        : 0;

    return {
      visible: filteredMusicians.length,
      total: musiciansData?.pagination.total ?? 0,
      featured: filteredMusicians.filter((item) => item.isFeatured).length,
      events: filteredMusicians.reduce((sum, item) => sum + item.eventsCount, 0),
      averageRating,
    };
  }, [filteredMusicians, musiciansData]);

  if (!isSessionValidated || isUserLoading || (isLoggedIn && !user) || (isLoggedIn && user && !isAdmin)) {
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
      <section className="container mx-auto space-y-6 px-4 py-8">
        <div className="rounded-3xl border bg-background p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <Badge variant="outline" className="w-fit gap-2 rounded-full px-3 py-1">
                <Shield className="h-3.5 w-3.5" />
                Área administrativa interna
              </Badge>
              <div>
                <h1 className="text-2xl font-bold sm:text-3xl">Painel Administrativo</h1>
                <p className="mt-1 max-w-2xl text-sm text-muted-foreground sm:text-base">
                  Visão operacional da plataforma com indicadores, atividade recente e gestão de
                  destaque dos músicos.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">
                  {dashboard ? `${dashboard.recentSignups.length} cadastros recentes` : "Sem resumo"}
                </Badge>
                <Badge variant="secondary">
                  {dashboard
                    ? `${dashboard.recentBookings.length} contratações recentes`
                    : "Sem atividade"}
                </Badge>
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:items-end">
              <p className="text-sm text-muted-foreground">
                {lastUpdatedAt
                  ? `Última atualização em ${formatDateTime(lastUpdatedAt)}`
                  : "Dados carregados diretamente da API administrativa."}
              </p>
              <Button variant="outline" onClick={() => void refreshAll()} disabled={isRefreshing}>
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
                Atualizar dados
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
          {loadingDashboard && !dashboard
            ? Array.from({ length: 6 }).map((_, index) => (
                <Card key={index}>
                  <CardHeader>
                    <Skeleton className="h-4 w-28" />
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Skeleton className="h-8 w-24" />
                    <Skeleton className="h-4 w-full" />
                  </CardContent>
                </Card>
              ))
            : metricCards.map((card) => {
                const Icon = card.icon;
                return (
                  <Card key={card.label}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between text-sm font-medium">
                        <span>{card.label}</span>
                        <span className="rounded-lg bg-primary/10 p-2 text-primary">
                          <Icon className="h-4 w-4" />
                        </span>
                      </CardTitle>
                      <CardDescription>{card.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{card.value}</div>
                    </CardContent>
                  </Card>
                );
              })}
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-4 w-4 text-primary" />
                Cadastros Recentes
              </CardTitle>
              <CardDescription>Últimos usuários criados na plataforma.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {loadingDashboard && !dashboard ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="rounded-xl border p-4">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="mt-2 h-4 w-56" />
                    </div>
                  ))}
                </div>
              ) : dashboard?.recentSignups.length ? (
                dashboard.recentSignups.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col gap-2 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="font-medium">
                        {item.firstName} {item.lastName}
                      </p>
                      <p className="truncate text-sm text-muted-foreground">{item.email}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary">{formatUserType(item.userType)}</Badge>
                      <Badge variant="outline">{formatDateTime(item.createdAt)}</Badge>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-xl border border-dashed bg-muted/20 px-4 py-8 text-center">
                  <p className="font-medium">Nenhum cadastro recente</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Novos usuários aparecerão aqui conforme o dashboard.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarClock className="h-4 w-4 text-primary" />
                Contratações Recentes
              </CardTitle>
              <CardDescription>Pedidos mais novos para acompanhamento rápido.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {loadingDashboard && !dashboard ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="rounded-xl border p-4">
                      <Skeleton className="h-4 w-44" />
                      <Skeleton className="mt-2 h-4 w-full" />
                    </div>
                  ))}
                </div>
              ) : dashboard?.recentBookings.length ? (
                dashboard.recentBookings.map((item) => (
                  <div key={item.id} className="rounded-xl border p-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div className="space-y-1">
                        <p className="font-medium">{item.eventType}</p>
                        <p className="text-sm text-muted-foreground">
                          Cliente: {item.client} • Músico: {item.musician}
                        </p>
                      </div>
                      <Badge variant={getBookingStatusVariant(item.status)}>
                        {formatBookingStatus(item.status)}
                      </Badge>
                    </div>
                    <p className="mt-3 text-sm text-muted-foreground">
                      Evento em {formatDate(item.eventDate)} • criado em {formatDateTime(item.createdAt)}
                    </p>
                  </div>
                ))
              ) : (
                <div className="rounded-xl border border-dashed bg-muted/20 px-4 py-8 text-center">
                  <p className="font-medium">Nenhuma contratação recente</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Os novos pedidos aparecerão aqui assim que forem registrados.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="space-y-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <CardTitle>Usuários</CardTitle>
                <CardDescription>
                  Busca e filtros aplicados aos resultados carregados na página atual.
                </CardDescription>
              </div>

              <div className="grid gap-2 sm:grid-cols-2 lg:min-w-[540px]">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={userSearch}
                    onChange={(event) => setUserSearch(event.target.value)}
                    placeholder="Buscar por nome, e-mail ou local"
                    className="pl-9"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {([
                    { value: "all", label: "Todos" },
                    { value: UserRole.ADMIN, label: "Admins" },
                    { value: UserRole.USER, label: "Usuários" },
                  ] as const).map((option) => (
                    <Button
                      key={option.value}
                      type="button"
                      size="sm"
                      variant={userRoleFilter === option.value ? "default" : "outline"}
                      onClick={() => setUserRoleFilter(option.value)}
                      className="rounded-full"
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {([
                { value: "all", label: "Todos os tipos" },
                { value: UserType.MUSICIAN, label: "Músicos" },
                { value: UserType.CLIENT, label: "Contratantes" },
              ] as const).map((option) => (
                <Button
                  key={option.value}
                  type="button"
                  size="sm"
                  variant={userTypeFilter === option.value ? "secondary" : "ghost"}
                  onClick={() => setUserTypeFilter(option.value)}
                  className="rounded-full"
                >
                  {option.label}
                </Button>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">{numberFormatter.format(userSummary.total)} no total</Badge>
              <Badge variant="secondary">{numberFormatter.format(userSummary.visible)} visíveis</Badge>
              <Badge variant="outline">{numberFormatter.format(userSummary.admins)} admins</Badge>
              <Badge variant="outline">{numberFormatter.format(userSummary.musicians)} músicos</Badge>
              <Badge variant="outline">{numberFormatter.format(userSummary.clients)} contratantes</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {loadingUsers && !usersData ? (
              <div className="space-y-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-48 w-full" />
              </div>
            ) : filteredUsers.length ? (
              <>
                <div className="overflow-x-auto rounded-xl border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Usuário</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Papel</TableHead>
                        <TableHead>Localização</TableHead>
                        <TableHead>Cadastro</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="min-w-[240px]">
                            <div className="space-y-1">
                              <p className="font-medium">
                                #{item.id} • {item.firstName} {item.lastName}
                              </p>
                              <p className="text-sm text-muted-foreground">{item.email}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{formatUserType(item.userType)}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={item.role === UserRole.ADMIN ? "default" : "outline"}>
                              {item.role}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {item.city || item.state
                              ? `${item.city || "-"}${item.state ? `/${item.state}` : ""}`
                              : "-"}
                          </TableCell>
                          <TableCell>{formatDateTime(item.createdAt)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
                        usersData.pagination.page >= usersData.pagination.totalPages ||
                        loadingUsers
                      }
                    >
                      Próxima
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="rounded-xl border border-dashed bg-muted/20 px-4 py-8 text-center">
                <p className="font-medium">Nenhum usuário encontrado</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Ajuste a busca ou os filtros para localizar registros nesta página.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="space-y-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <CardTitle>Músicos</CardTitle>
                <CardDescription>
                  Curadoria de destaque com busca e filtros sobre os perfis carregados.
                </CardDescription>
              </div>

              <div className="grid gap-2 sm:grid-cols-2 lg:min-w-[540px]">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={musicianSearch}
                    onChange={(event) => setMusicianSearch(event.target.value)}
                    placeholder="Buscar por nome, categoria ou cidade"
                    className="pl-9"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {([
                    { value: "all", label: "Todos" },
                    { value: "featured", label: "Em destaque" },
                    { value: "not-featured", label: "Sem destaque" },
                  ] as const).map((option) => (
                    <Button
                      key={option.value}
                      type="button"
                      size="sm"
                      variant={featuredFilter === option.value ? "default" : "outline"}
                      onClick={() => setFeaturedFilter(option.value)}
                      className="rounded-full"
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">{numberFormatter.format(musicianSummary.total)} no total</Badge>
              <Badge variant="secondary">{numberFormatter.format(musicianSummary.visible)} visíveis</Badge>
              <Badge variant="outline">
                {numberFormatter.format(musicianSummary.featured)} em destaque
              </Badge>
              <Badge variant="outline">Nota média {musicianSummary.averageRating.toFixed(1)}</Badge>
              <Badge variant="outline">{numberFormatter.format(musicianSummary.events)} eventos</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {loadingMusicians && !musiciansData ? (
              <div className="space-y-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-48 w-full" />
              </div>
            ) : filteredMusicians.length ? (
              <>
                <div className="overflow-x-auto rounded-xl border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Músico</TableHead>
                        <TableHead>Categoria</TableHead>
                        <TableHead>Localização</TableHead>
                        <TableHead>Indicadores</TableHead>
                        <TableHead>Destaque</TableHead>
                        <TableHead>Ação</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredMusicians.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="min-w-[240px]">
                            <div className="space-y-1">
                              <p className="font-medium">
                                #{item.id} • {item.name}
                              </p>
                              <p className="text-sm text-muted-foreground">{item.email}</p>
                              <p className="text-xs text-muted-foreground">
                                Cadastro em {formatDate(item.createdAt)}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>{item.category || "-"}</TableCell>
                          <TableCell>{item.location || "-"}</TableCell>
                          <TableCell>
                            <div className="space-y-1 text-sm">
                              <span className="inline-flex items-center gap-1">
                                <Star className="h-3.5 w-3.5 text-yellow-500" />
                                {item.rating.toFixed(1)} ({numberFormatter.format(item.ratingCount)})
                              </span>
                              <p className="text-muted-foreground">
                                {numberFormatter.format(item.eventsCount)} eventos
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={item.isFeatured ? "default" : "outline"}>
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
                                "Remover"
                              ) : (
                                "Destacar"
                              )}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
                        musiciansData.pagination.page >= musiciansData.pagination.totalPages ||
                        loadingMusicians
                      }
                    >
                      Próxima
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="rounded-xl border border-dashed bg-muted/20 px-4 py-8 text-center">
                <p className="font-medium">Nenhum músico encontrado</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Ajuste a busca ou o filtro de destaque para localizar perfis nesta página.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
