import type { ReactNode } from "react";
import type { Metadata } from "next";
import { buildNoIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = buildNoIndexMetadata({
  title: "Histórico de Pagamentos",
  description: "Área privada com o histórico de pagamentos do usuário.",
  path: "/perfil/pagamentos",
});

export default function PerfilPagamentosLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
