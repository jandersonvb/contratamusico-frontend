"use client";

import {
  benefits,
  faqComoFunciona,
  howItWorksClient,
  howItWorksMusician,
} from "@/app/lib/data/comoFunciona";
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
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="bg-primary/5 py-16 md:py-24">
        <div className="container mx-auto px-4 text-center space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Como Funciona o Contrata Músico
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            A maneira mais simples e segura de conectar artistas talentosos a
            eventos inesquecíveis. Entenda como transformar seu evento em um
            show.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button size="lg" asChild>
              <Link href="/busca">Buscar Músicos</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/cadastro">Sou Músico</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Steps Section with Custom Tabs */}
      <section className="py-16 container mx-auto px-4">
        <div className="flex justify-center mb-12">
          <div className="bg-muted p-1 rounded-lg inline-flex">
            <button
              onClick={() => setActiveTab("client")}
              className={`px-6 py-2.5 rounded-md text-sm font-medium transition-all ${
                activeTab === "client"
                  ? "bg-background shadow-sm text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Para Clientes
            </button>
            <button
              onClick={() => setActiveTab("musician")}
              className={`px-6 py-2.5 rounded-md text-sm font-medium transition-all ${
                activeTab === "musician"
                  ? "bg-background shadow-sm text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Para Músicos
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {(activeTab === "client" ? howItWorksClient : howItWorksMusician).map(
            (step, index) => (
              <Card key={index} className="relative border-none shadow-lg">
                <div className="absolute -top-4 -left-4 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                  {index + 1}
                </div>
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4 text-primary">
                    <step.icon className="w-6 h-6" />
                  </div>
                  <CardTitle className="text-xl">{step.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{step.description}</p>
                </CardContent>
              </Card>
            )
          )}
        </div>
      </section>

      {/* Video Tutorial Section (Placeholder) */}
      <section className="bg-muted/30 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-8">Veja na Prática</h2>
          <div className="max-w-4xl mx-auto aspect-video bg-slate-900 rounded-xl flex items-center justify-center shadow-2xl relative overflow-hidden group cursor-pointer">
            {/* Placeholder visual */}
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center opacity-50 group-hover:opacity-40 transition-opacity" />
            <div className="relative z-10 flex flex-col items-center text-white">
              <PlayCircle className="w-20 h-20 mb-4 opacity-90 group-hover:scale-110 transition-transform" />
              <span className="text-lg font-semibold">
                Assistir Tutorial Completo
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Por que escolher o Contrata Músico?</h2>
          <p className="text-muted-foreground">Benefícios exclusivos para garantir o sucesso do seu evento</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit, index) => (
            <div key={index} className="flex flex-col items-center text-center space-y-3 p-4">
              <div className="p-3 bg-primary/10 rounded-full text-primary">
                <benefit.icon className="w-8 h-8" />
              </div>
              <h3 className="font-semibold text-lg">{benefit.title}</h3>
              <p className="text-sm text-muted-foreground">{benefit.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-muted/50 py-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-3xl font-bold mb-8 text-center">Perguntas Frequentes</h2>
          <Accordion type="single" collapsible className="w-full">
            {faqComoFunciona.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger>{faq.question}</AccordionTrigger>
                <AccordionContent>{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold">
            Pronto para começar?
          </h2>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            Junte-se a milhares de pessoas que já encontraram o som perfeito para seus momentos especiais.
          </p>
          <div className="pt-4">
            <Button size="lg" variant="secondary" className="px-8 text-lg h-12" asChild>
              <Link href="/cadastro">Criar Conta Grátis</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

