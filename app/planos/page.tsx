"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { musicianPlans, clientPlans, planFaq } from "@/lib/plans";
import { Check, X, Star as StarIcon } from "lucide-react";
import Link from "next/link";

/**
 * Pricing page that showcases subscription plans for musicians and clients.
 * Users can toggle between categories and monthly or yearly billing. Each
 * plan displays its features and a call‑to‑action button. An FAQ
 * accordion answers common questions and a final call‑to‑action invites
 * users to sign up or contact sales.
 */
export default function PlanosPage() {
  const [category, setCategory] = useState<"musicians" | "clients">(
    "musicians"
  );
  const [annual, setAnnual] = useState(false);
  const plans = category === "musicians" ? musicianPlans : clientPlans;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero / Toggles */}
      <section className="bg-muted/50 border-b py-12">
        <div className="container mx-auto px-4 text-center space-y-6">
          <h1 className="text-3xl font-bold">
            Escolha o Plano Ideal para Você
          </h1>
          <p className="max-w-2xl mx-auto text-muted-foreground">
            Oferecemos opções flexíveis para músicos e clientes, com recursos
            que se adaptam às suas necessidades
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Button
              variant={category === "musicians" ? "default" : "outline"}
              onClick={() => setCategory("musicians")}
            >
              Para Músicos
            </Button>
            <Button
              variant={category === "clients" ? "default" : "outline"}
              onClick={() => setCategory("clients")}
            >
              Para Clientes
            </Button>
          </div>
          <div className="flex items-center justify-center gap-4 mt-4">
            <span className="text-sm">Mensal</span>
            <Switch
              id="billingToggle"
              checked={annual}
              onCheckedChange={(val: boolean) => setAnnual(!!val)}
            />
            <span className="text-sm flex items-center gap-1">
              Anual
              <span className="ml-1 inline-block px-2 py-0.5 rounded-full bg-primary/10 text-xs text-primary">
                -20%
              </span>
            </span>
          </div>
        </div>
      </section>
      {/* Plans section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan) => {
              const price = annual ? plan.yearly : plan.monthly;
              return (
                <div
                  key={plan.id}
                  className={`relative bg-card border rounded-lg p-6 flex flex-col ${
                    plan.badge ? "ring-2 ring-primary" : ""
                  }`}
                >
                  {plan.badge && (
                    <span className="absolute top-0 right-0 mt-2 mr-2 bg-primary text-primary-foreground text-xs font-medium px-2 py-0.5 rounded">
                      {plan.badge}
                    </span>
                  )}
                  <h3 className="text-xl font-semibold mb-1">{plan.title}</h3>
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="text-3xl font-bold text-primary">
                      {price === 0 ? "R$ 0" : `R$ ${price}`}
                    </span>
                    {price !== 0 && <span className="text-sm">/mês</span>}
                  </div>
                  <p className="text-sm text-muted-foreground mb-4 min-h-[48px]">
                    {plan.description}
                  </p>
                  <ul className="space-y-2 flex-1 mb-6">
                    {plan.features.map((feature, idx) => (
                      <li
                        key={idx}
                        className={`flex items-center gap-2 text-sm ${
                          feature.available
                            ? ""
                            : "text-muted-foreground line-through"
                        }`}
                      >
                        {feature.available ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <X className="h-4 w-4 text-red-500" />
                        )}
                        {feature.text}
                        {feature.highlight && (
                          <StarIcon className="h-4 w-4 text-yellow-400" />
                        )}
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full mt-auto"
                    variant={plan.monthly === 0 ? "outline" : "default"}
                  >
                    {plan.cta}
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      </section>
      {/* FAQ section */}
      <section className="bg-muted/50 border-t py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-semibold mb-6 text-center">
            Perguntas Frequentes
          </h2>
          <Accordion type="multiple" className="max-w-3xl mx-auto space-y-2">
            {planFaq.map((faq, idx) => (
              <AccordionItem key={idx} value={`faq-${idx}`}>
                <AccordionTrigger className="flex items-center justify-between p-3 rounded-md bg-card hover:bg-muted">
                  <span>{faq.question}</span>
                </AccordionTrigger>
                <AccordionContent className="p-3 text-sm text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>
      {/* CTA section */}
      <section className="py-12">
        <div className="container mx-auto px-4 text-center space-y-4">
          <h2 className="text-2xl font-bold">Pronto para Começar?</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Junte‑se a milhares de músicos e clientes que já encontraram o match
            perfeito
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/cadastro">Começar Agora</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/contato">Falar com Vendas</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
