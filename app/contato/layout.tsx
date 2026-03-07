import type { ReactNode } from "react";
import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Contato",
  description:
    "Fale com a equipe do Contrata Músico para suporte, dúvidas comerciais, imprensa e parcerias.",
  path: "/contato",
});

export default function ContatoLayout({ children }: { children: ReactNode }) {
  return children;
}
