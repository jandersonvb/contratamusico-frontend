"use client";

import { AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { getFaq } from "@/api/faq";
import { FAQAccordionList } from "@/components/faq/FAQAccordionList";

interface FAQItem {
  id: string | number;
  question: string;
  answer: string;
  category: string | null;
}

export function DynamicFAQ() {
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchFAQs() {
      try {
        const data = await getFaq();
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
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-24 w-full animate-pulse rounded-2xl border border-border/60 bg-muted/40"
          />
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
      <FAQAccordionList
        type="multiple"
        items={[
          {
            id: "faq1",
            question: "Como posso me cadastrar como músico?",
            answer:
              "É muito simples! Clique em \"Cadastrar\" no menu superior, selecione \"Sou Músico\" e preencha suas informações. Você pode começar com o plano gratuito e fazer upgrade quando quiser.",
          },
          {
            id: "faq2",
            question: "Como funciona a contratação de músicos?",
            answer:
              "Você busca músicos usando nossos filtros, visualiza perfis, entra em contato diretamente através da plataforma e negocia os detalhes do evento. Todo o processo é seguro e transparente.",
          },
          {
            id: "faq3",
            question: "Vocês cobram comissão sobre contratações?",
            answer:
              "Não. Cobramos apenas a mensalidade do plano escolhido. Você fica com 100% do valor das suas contratações, sem taxas adicionais.",
          },
        ]}
      />
    );
  }

  return <FAQAccordionList items={faqs} />;
}
