import type { ReactNode } from "react";
import type { Metadata } from "next";
import { buildNoIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = buildNoIndexMetadata({
  title: "Dashboard",
  description: "Área privada de gerenciamento da plataforma Contrata Músico.",
  path: "/dashboard",
});

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
