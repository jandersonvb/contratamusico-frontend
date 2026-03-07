import type { ReactNode } from "react";
import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Como Funciona",
  description:
    "Descubra como funciona o Contrata Músico para contratar profissionais ou divulgar seu trabalho como músico.",
  path: "/como-funciona",
  keywords: [
    "como contratar músico",
    "como funciona contrata músico",
    "guia para contratar banda",
    "trabalhar como músico",
  ],
});

export default function ComoFuncionaLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
