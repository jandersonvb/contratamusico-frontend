"use client";

import { useState, useEffect, useCallback } from "react";
import { SEO } from "../components/SEO/SEO";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { planFaq } from "@/lib/plans";
import { Check, X, Star as StarIcon, Loader2 } from "lucide-react";
import Link from "next/link";
import { getPlans, createCheckoutSession } from "@/api";
import type { Plan } from "@/api/plan";
import { toast } from "sonner";
import { useUserStore } from "@/lib/stores/userStore";
import { UserType } from "@/lib/types/user";
import { useRouter } from "next/navigation";

const STATS_FEATURE_REGEX = /estat[ií]stic/i;
const WHATSAPP_FEATURE_REGEX = /whats ?app/i;
const WHATSAPP_FEATURE_FALLBACK_TEXT = "Contato por mensagem e WhatsApp";

function getVisiblePlanFeatures(plan: Plan): Plan["features"] {
  const nonStatsFeatures = plan.features.filter(
    (feature) => !STATS_FEATURE_REGEX.test(feature.text),
  );

  const whatsappFeature = nonStatsFeatures.find((feature) =>
    WHATSAPP_FEATURE_REGEX.test(feature.text),
  );

  const featuresWithoutWhatsapp = nonStatsFeatures.filter(
    (feature) => !WHATSAPP_FEATURE_REGEX.test(feature.text),
  );

  if (!plan.hasWhatsapp) {
    return featuresWithoutWhatsapp;
  }

  if (whatsappFeature) {
    return [...featuresWithoutWhatsapp, whatsappFeature];
  }

  const fallbackFeatureId = nonStatsFeatures.reduce(
    (highestId, feature) => Math.max(highestId, feature.id),
    0,
  ) + 1;

  return [
    ...featuresWithoutWhatsapp,
    {
      id: fallbackFeatureId,
      planId: plan.id,
      text: WHATSAPP_FEATURE_FALLBACK_TEXT,
      available: true,
      highlight: false,
    },
  ];
}

export default function PlanosPage() {
  const router = useRouter();
  const { isLoggedIn, user } = useUserStore();
  const [annual, setAnnual] = useState(false);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingPlanId, setProcessingPlanId] = useState<number | null>(null);
  const isClientUser = user?.userType === UserType.CLIENT;

  const fetchPlans = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getPlans("musician");
      setPlans(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao carregar planos";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const handleSubscribe = async (plan: Plan) => {
    if (!isLoggedIn) {
      toast.error("Você precisa estar logado para assinar um plano");
      router.push("/login");
      return;
    }

    if (!user) {
      toast.info("Carregando sua sessão. Tente novamente em instantes.");
      return;
    }

    if (user.userType === UserType.CLIENT) {
      toast.info("Contratantes não precisam assinar plano.");
      router.push("/dashboard");
      return;
    }

    if (plan.monthlyPrice === 0) {
      toast.info("Plano gratuito - não requer pagamento");
      return;
    }

    setProcessingPlanId(plan.id);

    try {
      const { checkoutUrl } = await createCheckoutSession({
        planId: plan.id,
        billingInterval: annual ? 'yearly' : 'monthly',
      });

      // Redireciona para o checkout do Stripe
      window.location.href = checkoutUrl;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao processar pagamento';
      toast.error(message);
      setProcessingPlanId(null);
    }
  };

  return (
    <>
      <SEO
        title="Planos e Preços"
        description="Confira os planos para músicos da plataforma. Opções gratuitas e premium com recursos exclusivos. Planos mensais e anuais com desconto."
        keywords={[
          "planos para músicos",
          "preços contrata músico",
          "assinatura músico",
          "plano premium",
          "plano gratuito músico",
        ]}
      />
      <div className="min-h-screen flex flex-col">
        {/* Hero / Toggles */}
      <section className="bg-muted/50 border-b py-8 sm:py-12">
        <div className="container mx-auto px-4 text-center space-y-4 sm:space-y-6">
          <h1 className="text-2xl sm:text-3xl font-bold">
            Escolha o Plano Ideal para Você
          </h1>
          <p className="max-w-2xl mx-auto text-sm sm:text-base text-muted-foreground">
            Planos para músicos com recursos que evoluem junto com sua presença na plataforma.
          </p>
          {isClientUser && (
            <p className="max-w-2xl mx-auto text-xs sm:text-sm text-muted-foreground">
              Contratantes não precisam de assinatura. Use a plataforma normalmente para buscar e contratar músicos.
            </p>
          )}
          <div className="flex items-center justify-center gap-3 sm:gap-4 mt-4">
            <span className="text-xs sm:text-sm">Mensal</span>
            <Switch
              id="billingToggle"
              checked={annual}
              onCheckedChange={(val: boolean) => setAnnual(!!val)}
            />
            <span className="text-xs sm:text-sm flex items-center gap-1">
              Anual
              <span className="ml-1 inline-block px-1.5 sm:px-2 py-0.5 rounded-full bg-primary/10 text-[10px] sm:text-xs text-primary">
                -20%
              </span>
            </span>
          </div>
        </div>
      </section>
      {/* Plans section */}
      <section className="py-8 sm:py-12">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              {plans.map((plan) => {
                const price = annual ? plan.yearlyPrice : plan.monthlyPrice;
                const formattedPrice = price === 0 
                  ? "R$ 0" 
                  : `R$ ${(price / 100).toFixed(2).replace('.', ',')}`;
                const isProcessing = processingPlanId === plan.id;
                const isFeatured = Boolean(plan.badge);
                const visibleFeatures = getVisiblePlanFeatures(plan);
                return (
                  <div
                    key={plan.id}
                    className={`group relative bg-card border rounded-xl p-4 sm:p-6 flex flex-col shadow-sm transition-all duration-300 will-change-transform hover:-translate-y-2 hover:shadow-xl ${
                      isFeatured
                        ? "ring-2 ring-primary border-primary/60"
                        : "hover:border-primary/40"
                    }`}
                  >
                    {plan.badge && (
                      <span className="absolute left-1/2 -translate-x-1/2 -top-3 bg-primary text-primary-foreground text-[10px] sm:text-xs font-semibold px-2 sm:px-3 py-1 rounded-md shadow-sm">
                        {plan.badge}
                      </span>
                    )}
                    <h3 className={`text-xl sm:text-2xl font-extrabold tracking-tight text-center mb-1 ${
                      isFeatured ? "text-primary" : "text-foreground"
                    }`}>
                      {plan.title}
                    </h3>
                    <div className={`mx-auto mb-3 h-1 w-14 rounded-full transition-colors ${
                      isFeatured ? "bg-primary" : "bg-primary/25 group-hover:bg-primary/50"
                    }`} />
                    <div className="flex items-baseline justify-center gap-1 mb-2">
                      <span className="text-2xl sm:text-3xl font-bold text-primary">
                        {formattedPrice}
                      </span>
                      {price !== 0 && <span className="text-xs sm:text-sm">/mês</span>}
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground text-center mb-3 sm:mb-4 min-h-[40px] sm:min-h-[48px]">
                      {plan.description}
                    </p>
                    <ul className="space-y-1.5 sm:space-y-2 flex-1 mb-4 sm:mb-6">
                      {visibleFeatures.map((feature) => (
                        <li
                          key={feature.id}
                          className={`flex items-center gap-2 text-xs sm:text-sm ${
                            feature.available
                              ? ""
                              : "text-muted-foreground line-through"
                          }`}
                        >
                          {feature.available ? (
                            <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-500 shrink-0" />
                          ) : (
                            <X className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-red-500 shrink-0" />
                          )}
                          <span>{feature.text}</span>
                          {feature.highlight && (
                            <StarIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-yellow-400 shrink-0" />
                          )}
                        </li>
                      ))}
                    </ul>
                    <Button
                      className={`w-full mt-auto text-sm font-semibold transition-colors ${
                        isFeatured
                          ? ""
                          : "border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                      }`}
                      variant={isFeatured ? "default" : "outline"}
                      onClick={() => handleSubscribe(plan)}
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Processando...
                        </>
                      ) : isClientUser ? (
                        "Disponível para músicos"
                      ) : plan.monthlyPrice === 0 ? (
                        "Começar Grátis"
                      ) : (
                        "Assinar Agora"
                      )}
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
      {/* FAQ section */}
      <section className="bg-muted/50 border-t py-8 sm:py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 text-center">
            Perguntas Frequentes
          </h2>
          <Accordion type="multiple" className="max-w-3xl mx-auto space-y-2">
            {planFaq.map((faq, idx) => (
              <AccordionItem key={idx} value={`faq-${idx}`}>
                <AccordionTrigger className="flex items-center justify-between p-2 sm:p-3 rounded-md bg-card hover:bg-muted text-left text-sm sm:text-base">
                  <span>{faq.question}</span>
                </AccordionTrigger>
                <AccordionContent className="p-2 sm:p-3 text-xs sm:text-sm text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>
      {/* CTA section */}
      <section className="py-8 sm:py-12">
        <div className="container mx-auto px-4 text-center space-y-3 sm:space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold">Pronto para Começar?</h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto">
            Conecte-se com músicos e contratantes e encontre o match perfeito.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
            <Button size="default" className="w-full sm:w-auto" asChild>
              <Link href="/cadastro">Começar Agora</Link>
            </Button>           
          </div>
        </div>
      </section>
      </div>
    </>
  );
}
