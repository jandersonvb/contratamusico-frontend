import type { ReactNode } from "react";
import type { Metadata } from "next";
import { buildNoIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = buildNoIndexMetadata({
  title: "Recuperar Senha",
  description: "Área de solicitação de recuperação de senha do Contrata Músico.",
  path: "/esqueci-senha",
});

export default function EsqueciSenhaLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
