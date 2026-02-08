"use client";

import { usePathname } from "next/navigation";
import { Footer } from "./Footer";

/** Rotas onde o Footer não deve aparecer (telas imersivas) */
const HIDDEN_ROUTES = ["/mensagens"];

export function ConditionalFooter() {
  const pathname = usePathname();

  if (HIDDEN_ROUTES.includes(pathname)) {
    return null;
  }

  return <Footer />;
}
