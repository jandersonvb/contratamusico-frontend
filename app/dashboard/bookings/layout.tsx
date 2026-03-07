import type { ReactNode } from "react";
import type { Metadata } from "next";
import { buildNoIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = buildNoIndexMetadata({
  title: "Minhas Contratações",
  description: "Área privada para acompanhamento de contratações realizadas.",
  path: "/dashboard/bookings",
});

export default function DashboardBookingsLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
