"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Check, Loader2, XCircle } from "lucide-react";
import { getMySubscription } from "@/api/payment";
import type { SubscriptionResponse } from "@/api/payment";

/**
 * Página de sucesso após completar o checkout do Stripe
 * Exibe confirmação da assinatura e detalhes do plano
 */
export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const [isLoading, setIsLoading] = useState(true);
  const [subscription, setSubscription] = useState<SubscriptionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setError("Sessão de pagamento não encontrada");
      setIsLoading(false);
      return;
    }

    // Buscar dados da assinatura
    const fetchSubscription = async () => {
      try {
        const data = await getMySubscription();
        setSubscription(data);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Erro ao buscar assinatura";
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    // Aguardar um pouco para garantir que o webhook foi processado
    const timer = setTimeout(fetchSubscription, 2000);
    return () => clearTimeout(timer);
  }, [sessionId]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Processando seu pagamento...</p>
        </div>
      </div>
    );
  }

  if (error || !subscription?.hasSubscription) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="container max-w-md mx-auto px-4 text-center space-y-6">
          <div className="bg-card border rounded-lg p-8">
            <XCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Ops! Algo deu errado</h1>
            <p className="text-muted-foreground mb-6">
              {error || "Não foi possível confirmar sua assinatura. Aguarde alguns instantes e verifique seu perfil."}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={() => router.push("/perfil")}>
                Ir para o Perfil
              </Button>
              <Button variant="outline" onClick={() => router.push("/contato")}>
                Falar com Suporte
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { subscription: sub } = subscription;

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30">
      <div className="container max-w-2xl mx-auto px-4 py-12">
        <div className="bg-card border rounded-lg p-8 text-center space-y-6">
          {/* Ícone de sucesso */}
          <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
            <Check className="h-10 w-10 text-green-600 dark:text-green-400" />
          </div>

          {/* Título */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">Pagamento Confirmado!</h1>
            <p className="text-lg text-muted-foreground">
              Sua assinatura foi ativada com sucesso
            </p>
          </div>

          {/* Detalhes da assinatura */}
          {sub && (
            <div className="bg-muted/50 rounded-lg p-6 space-y-4 text-left">
              <div className="flex items-center justify-between border-b pb-3">
                <h2 className="text-xl font-semibold">Detalhes da Assinatura</h2>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    sub.status === "active"
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                  }`}
                >
                  {sub.status === "active" ? "Ativo" : sub.status}
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Plano:</span>
                  <span className="font-medium">{sub.plan.title}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Valor:</span>
                  <span className="font-medium">
                    R$ {(sub.plan.monthlyPrice / 100).toFixed(2)}/mês
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-muted-foreground">Início do período:</span>
                  <span className="font-medium">
                    {new Date(sub.currentPeriodStart).toLocaleDateString("pt-BR")}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-muted-foreground">Próxima cobrança:</span>
                  <span className="font-medium">
                    {new Date(sub.currentPeriodEnd).toLocaleDateString("pt-BR")}
                  </span>
                </div>
              </div>

              {sub.plan.description && (
                <p className="text-sm text-muted-foreground pt-3 border-t">
                  {sub.plan.description}
                </p>
              )}
            </div>
          )}

          {/* Próximos passos */}
          <div className="bg-primary/5 rounded-lg p-4 text-left">
            <h3 className="font-semibold mb-2">Próximos Passos</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span>Complete seu perfil para começar a receber propostas</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span>Adicione fotos, vídeos e áudios ao seu portfólio</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span>Explore os recursos exclusivos do seu plano</span>
              </li>
            </ul>
          </div>

          {/* Botões de ação */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button className="flex-1" onClick={() => router.push("/perfil")}>
              Ir para o Perfil
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => router.push("/dashboard")}
            >
              Ir para o Dashboard
            </Button>
          </div>

          {/* Informação de suporte */}
          <p className="text-xs text-muted-foreground pt-4">
            Precisa de ajuda?{" "}
            <button
              onClick={() => router.push("/contato")}
              className="text-primary hover:underline"
            >
              Entre em contato
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
