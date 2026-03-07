import type { ReactNode } from "react";
import type { Metadata } from "next";
import { buildNoIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = buildNoIndexMetadata({
  title: "Pagamento Concluído",
  description: "Página privada de confirmação de pagamento do Contrata Músico.",
  path: "/pagamento/sucesso",
});

export default function PagamentoSucessoLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
