import type { ReactNode } from "react";
import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Planos e Preços",
  description:
    "Confira os planos para músicos da plataforma, com recursos para ampliar sua presença e gerar mais contatos.",
  path: "/planos",
  keywords: [
    "planos para músicos",
    "preços contrata músico",
    "assinatura músico",
    "plano premium",
    "plano gratuito músico",
  ],
});

export default function PlanosLayout({ children }: { children: ReactNode }) {
  return children;
}
