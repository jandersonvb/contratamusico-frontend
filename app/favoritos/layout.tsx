import type { ReactNode } from "react";
import type { Metadata } from "next";
import { buildNoIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = buildNoIndexMetadata({
  title: "Favoritos",
  description: "Área privada com os perfis salvos pelo usuário.",
  path: "/favoritos",
});

export default function FavoritosLayout({ children }: { children: ReactNode }) {
  return children;
}
