import type { ReactNode } from "react";
import type { Metadata } from "next";
import { buildNoIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = buildNoIndexMetadata({
  title: "Redefinir Senha",
  description: "Área privada para redefinição de senha do Contrata Músico.",
  path: "/recuperar-senha",
});

export default function RecuperarSenhaLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
