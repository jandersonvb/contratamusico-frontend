import type { ReactNode } from "react";
import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Buscar Músicos",
  description:
    "Encontre os melhores músicos profissionais para seu evento. Filtre por instrumento, estilo musical, localização e mais.",
  path: "/busca",
  keywords: [
    "buscar músico",
    "encontrar banda",
    "contratar DJ",
    "músicos disponíveis",
    "busca de músicos",
  ],
});

export default function BuscaLayout({ children }: { children: ReactNode }) {
  return children;
}
