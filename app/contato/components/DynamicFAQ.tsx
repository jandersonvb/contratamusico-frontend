"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";

interface FAQItem {
  id: string | number;
  question: string;
  answer: string;
  category: string | null;
}

export function DynamicFAQ() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchFAQs() {
      try {
        const response = await fetch(`${API_URL}/faq`);
        if (!response.ok) throw new Error("Failed to fetch");
        const data = await response.json();
        setFaqs(data);
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    fetchFAQs();
  }, []);

  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-14 w-full bg-muted/50 animate-pulse rounded-md" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 border border-destructive/20 bg-destructive/10 rounded-md text-destructive flex items-center gap-2">
        <AlertCircle className="h-5 w-5" />
        <p>Não foi possível carregar as perguntas frequentes no momento.</p>
      </div>
    );
  }

  if (faqs.length === 0) {
    // Fallback para dados estáticos se a API não retornar nada (banco vazio)
    return (
      <Accordion type="multiple" className="space-y-2">
        <AccordionItem value="faq1">
          <AccordionTrigger className="flex items-center justify-between p-3 rounded-md bg-card hover:bg-muted text-left">
            <span>Como posso me cadastrar como músico?</span>
          </AccordionTrigger>
          <AccordionContent className="p-3 text-sm text-muted-foreground">
            É muito simples! Clique em &quot;Cadastrar&quot; no menu superior,
            selecione &quot;Sou Músico&quot; e preencha suas informações. Você
            pode começar com o plano gratuito e fazer upgrade quando quiser.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="faq2">
          <AccordionTrigger className="flex items-center justify-between p-3 rounded-md bg-card hover:bg-muted text-left">
            <span>Como funciona a contratação de músicos?</span>
          </AccordionTrigger>
          <AccordionContent className="p-3 text-sm text-muted-foreground">
            Você busca músicos usando nossos filtros, visualiza perfis, entra em
            contato diretamente através da plataforma e negocia os detalhes do
            evento. Todo o processo é seguro e transparente.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="faq3">
          <AccordionTrigger className="flex items-center justify-between p-3 rounded-md bg-card hover:bg-muted text-left">
            <span>Vocês cobram comissão sobre contratações?</span>
          </AccordionTrigger>
          <AccordionContent className="p-3 text-sm text-muted-foreground">
            Não! Cobramos apenas a mensalidade do plano escolhido. Você fica com
            100% do valor das suas contratações, sem taxas adicionais.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    );
  }

  return (
    <Accordion type="single" collapsible className="space-y-2">
      {faqs.map((faq) => (
        <AccordionItem key={faq.id} value={String(faq.id)}>
          <AccordionTrigger className="flex items-center justify-between p-3 rounded-md bg-card hover:bg-muted text-left">
            <span>{faq.question}</span>
          </AccordionTrigger>
          <AccordionContent className="p-3 text-sm text-muted-foreground bg-card/50">
            {faq.answer}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
