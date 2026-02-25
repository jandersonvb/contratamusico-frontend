"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronLeft, ChevronRight, Loader2, AlertCircle } from "lucide-react";
import { getPaymentHistory } from "@/api/payment";
import type { PaymentHistoryResponse, PaymentHistoryItem } from "@/api/payment";
import { useUserStore } from "@/lib/stores/userStore";
import { UserType } from "@/lib/types/user";

/**
 * Página de histórico de pagamentos
 * Exibe todas as transações do usuário com paginação
 */
export default function PaymentHistoryPage() {
  const router = useRouter();
  const { isLoggedIn, isLoading: isUserLoading, user } = useUserStore();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [historyData, setHistoryData] = useState<PaymentHistoryResponse | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const isClientUser = user?.userType === UserType.CLIENT;

  // Verificar autenticação
  useEffect(() => {
    if (!isUserLoading && !isLoggedIn) {
      router.push("/login");
    }
  }, [isLoggedIn, isUserLoading, router]);

  // Buscar histórico
  useEffect(() => {
    if (!isLoggedIn || isClientUser) {
      if (isClientUser) {
        setHistoryData(null);
        setError(null);
        setIsLoading(false);
      }
      return;
    }

    const fetchHistory = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await getPaymentHistory(currentPage, itemsPerPage);
        setHistoryData(data);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Erro ao carregar histórico";
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, [currentPage, isLoggedIn, isClientUser]);

  const formatCurrency = (amount: number, currency: string) => {
    const value = amount / 100; // Valor vem em centavos
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: currency || "BRL",
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      succeeded: {
        label: "Sucesso",
        className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
      },
      failed: {
        label: "Falhou",
        className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
      },
      pending: {
        label: "Pendente",
        className: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
      },
    };

    const statusInfo = statusMap[status] || {
      label: status,
      className: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400",
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.className}`}
      >
        {statusInfo.label}
      </span>
    );
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (historyData && currentPage < historyData.pagination.totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  if (isUserLoading || (!isClientUser && isLoading && !historyData)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isClientUser) {
    return (
      <div className="min-h-screen flex flex-col">
        <section className="container mx-auto px-4 py-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/perfil")}
            className="mb-4"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Voltar ao Perfil
          </Button>
          <div className="bg-card border rounded-lg p-8 text-center space-y-4">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto" />
            <p className="font-medium">Histórico de pagamentos indisponível para contratantes</p>
            <p className="text-sm text-muted-foreground">
              Contratantes não possuem assinatura na plataforma e, por isso, não têm histórico de pagamentos de plano.
            </p>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <section className="container mx-auto px-4 py-8">
        {/* Cabeçalho */}
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/perfil")}
            className="mb-4"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Voltar ao Perfil
          </Button>
          <h1 className="text-3xl font-bold">Histórico de Pagamentos</h1>
          <p className="text-muted-foreground mt-2">
            Visualize todas as suas transações e pagamentos realizados
          </p>
        </div>

        {/* Conteúdo */}
        <div className="bg-card border rounded-lg overflow-hidden">
          {error ? (
            <div className="p-8 text-center space-y-4">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
              <p className="text-muted-foreground">{error}</p>
              <Button onClick={() => setCurrentPage(1)}>Tentar Novamente</Button>
            </div>
          ) : !historyData || historyData.data.length === 0 ? (
            <div className="p-8 text-center space-y-4">
              <p className="text-muted-foreground">
                Você ainda não possui nenhum pagamento registrado
              </p>
              <Button onClick={() => router.push("/planos")}>
                Ver Planos Disponíveis
              </Button>
            </div>
          ) : (
            <>
              {/* Tabela */}
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead>ID Transação</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {historyData.data.map((payment: PaymentHistoryItem) => (
                      <TableRow key={payment.id}>
                        <TableCell className="font-medium whitespace-nowrap">
                          {formatDate(payment.createdAt)}
                        </TableCell>
                        <TableCell>{payment.description}</TableCell>
                        <TableCell className="text-right font-semibold">
                          {formatCurrency(payment.amount, payment.currency)}
                        </TableCell>
                        <TableCell className="text-center">
                          {getStatusBadge(payment.status)}
                        </TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {payment.stripePaymentId
                            ? payment.stripePaymentId.substring(0, 20) + "..."
                            : "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Paginação */}
              {historyData.pagination.totalPages > 1 && (
                <div className="flex items-center justify-between border-t p-4">
                  <p className="text-sm text-muted-foreground">
                    Mostrando {(currentPage - 1) * itemsPerPage + 1} -{" "}
                    {Math.min(
                      currentPage * itemsPerPage,
                      historyData.pagination.total
                    )}{" "}
                    de {historyData.pagination.total} pagamentos
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePrevPage}
                      disabled={currentPage === 1 || isLoading}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Anterior
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleNextPage}
                      disabled={
                        currentPage === historyData.pagination.totalPages ||
                        isLoading
                      }
                    >
                      Próxima
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}
