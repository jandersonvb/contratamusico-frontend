import type { ReactNode } from "react";
import type { Metadata } from "next";
import { buildNoIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = buildNoIndexMetadata({
  title: "Perfil",
  description: "Área privada de gerenciamento do perfil do usuário.",
  path: "/perfil",
});

export default function PerfilLayout({ children }: { children: ReactNode }) {
  return children;
}
