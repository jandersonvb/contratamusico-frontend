"use client";

import {
  benefits,
  faqComoFunciona,
  howItWorksClient,
  howItWorksMusician,
} from "@/app/lib/data/comoFunciona";
import { SEO } from "../components/SEO/SEO";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlayCircle } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function ComoFuncionaPage() {
  const [activeTab, setActiveTab] = useState<"client" | "musician">("client");

  return (
    <>
      <SEO
        title="Como Funciona"
        description="Descubra como funciona o Contrata Músico. Guia completo para contratar músicos profissionais para seu evento ou começar a trabalhar como músico. Simples, rápido e seguro."
        keywords={[
          "como contratar músico",
          "como funciona contrata músico",
          "guia para contratar banda",
          "trabalhar como músico",
          "plataforma de músicos",
        ]}
      />
      <div className="min-h-screen flex flex-col">
        {/* Hero Section */}
      <section className="bg-primary/5 py-10 sm:py-16 md:py-24">
        <div className="container mx-auto px-4 text-center space-y-4 sm:space-y-6">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
            Como Funciona o Contrata Músico
          </h1>
          <p className="text-sm sm:text-base md:text-xl text-muted-foreground max-w-2xl mx-auto">
            A maneira mais simples e segura de conectar artistas talentosos a
            eventos inesquecíveis. Entenda como transformar seu evento em um
            show.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-2 sm:pt-4">
            <Button size="default" className="w-full sm:w-auto sm:text-base" asChild>
              <Link href="/busca">Buscar Músicos</Link>
            </Button>
            <Button size="default" variant="outline" className="w-full sm:w-auto sm:text-base" asChild>
              <Link href="/cadastro">Sou Músico</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Steps Section with Custom Tabs */}
      <section className="py-10 sm:py-16 container mx-auto px-4">
        <div className="flex justify-center mb-8 sm:mb-12">
          <div className="bg-muted p-1 rounded-lg inline-flex w-full sm:w-auto">
            <button
              onClick={() => setActiveTab("client")}
              className={`flex-1 sm:flex-none px-4 sm:px-6 py-2 sm:py-2.5 rounded-md text-xs sm:text-sm font-medium transition-all ${
                activeTab === "client"
                  ? "bg-background shadow-sm text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Para Clientes
            </button>
            <button
              onClick={() => setActiveTab("musician")}
              className={`flex-1 sm:flex-none px-4 sm:px-6 py-2 sm:py-2.5 rounded-md text-xs sm:text-sm font-medium transition-all ${
                activeTab === "musician"
                  ? "bg-background shadow-sm text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Para Músicos
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {(activeTab === "client" ? howItWorksClient : howItWorksMusician).map(
            (step, index) => (
              <Card key={index} className="border-none shadow-lg">
                <CardHeader className="p-4 sm:p-6">
                  <div className="flex items-start justify-between mb-3 sm:mb-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary shrink-0">
                      <step.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-sm sm:text-base shrink-0">
                      {index + 1}
                    </div>
                  </div>
                  <CardTitle className="text-base sm:text-xl">{step.title}</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
                  <p className="text-sm sm:text-base text-muted-foreground">{step.description}</p>
                </CardContent>
              </Card>
            )
          )}
        </div>
      </section>

      {/* Video Tutorial Section (Placeholder) */}
      <section className="bg-muted/30 py-10 sm:py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-6 sm:mb-8">Veja na Prática</h2>
          <div className="max-w-4xl mx-auto aspect-video bg-slate-900 rounded-lg sm:rounded-xl flex items-center justify-center shadow-xl sm:shadow-2xl relative overflow-hidden group cursor-pointer">
            {/* Placeholder visual */}
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center opacity-50 group-hover:opacity-40 transition-opacity" />
            <div className="relative z-10 flex flex-col items-center text-white">
              <PlayCircle className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 mb-2 sm:mb-4 opacity-90 group-hover:scale-110 transition-transform" />
              <span className="text-sm sm:text-base md:text-lg font-semibold">
                Assistir Tutorial Completo
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-10 sm:py-16 container mx-auto px-4">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 sm:mb-4">Por que escolher o Contrata Músico?</h2>
          <p className="text-sm sm:text-base text-muted-foreground">Benefícios exclusivos para garantir o sucesso do seu evento</p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {benefits.map((benefit, index) => (
            <div key={index} className="flex flex-col items-center text-center space-y-2 sm:space-y-3 p-2 sm:p-4">
              <div className="p-2 sm:p-3 bg-primary/10 rounded-full text-primary">
                <benefit.icon className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8" />
              </div>
              <h3 className="font-semibold text-sm sm:text-base md:text-lg">{benefit.title}</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">{benefit.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-muted/50 py-10 sm:py-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-6 sm:mb-8 text-center">Perguntas Frequentes</h2>
          <Accordion type="single" collapsible className="w-full">
            {faqComoFunciona.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-sm sm:text-base text-left">{faq.question}</AccordionTrigger>
                <AccordionContent className="text-sm sm:text-base">{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-12 sm:py-16 md:py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center space-y-4 sm:space-y-6">
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold">
            Pronto para começar?
          </h2>
          <p className="text-sm sm:text-base md:text-xl opacity-90 max-w-2xl mx-auto">
            Junte-se a milhares de pessoas que já encontraram o som perfeito para seus momentos especiais.
          </p>
          <div className="pt-2 sm:pt-4">
            <Button size="default" variant="secondary" className="w-full sm:w-auto px-6 sm:px-8 text-sm sm:text-base md:text-lg h-10 sm:h-12" asChild>
              <Link href="/cadastro">Criar Conta Grátis</Link>
            </Button>
          </div>
        </div>
      </section>
      </div>
    </>
  );
}

