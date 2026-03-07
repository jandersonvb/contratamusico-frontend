import type { ReactNode } from "react";
import type { Metadata } from "next";
import { buildNoIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = buildNoIndexMetadata({
  title: "Login",
  description: "Área de autenticação do Contrata Músico.",
  path: "/login",
});

export default function LoginLayout({ children }: { children: ReactNode }) {
  return children;
}
