import type { ReactNode } from "react";
import type { Metadata } from "next";
import { buildNoIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = buildNoIndexMetadata({
  title: "Painel Administrativo",
  description: "Área administrativa interna da plataforma Contrata Músico.",
  path: "/admin",
});

export default function AdminLayout({ children }: { children: ReactNode }) {
  return children;
}
