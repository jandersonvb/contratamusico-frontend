import type { ReactNode } from "react";
import type { Metadata } from "next";
import { buildNoIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = buildNoIndexMetadata({
  title: "Cadastro",
  description: "Área de cadastro de usuários e músicos do Contrata Músico.",
  path: "/cadastro",
});

export default function CadastroLayout({ children }: { children: ReactNode }) {
  return children;
}
