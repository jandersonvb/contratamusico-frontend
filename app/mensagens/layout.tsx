import type { ReactNode } from "react";
import type { Metadata } from "next";
import { buildNoIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = buildNoIndexMetadata({
  title: "Mensagens",
  description: "Área privada de mensagens entre usuários da plataforma.",
  path: "/mensagens",
});

export default function MensagensLayout({ children }: { children: ReactNode }) {
  return children;
}
