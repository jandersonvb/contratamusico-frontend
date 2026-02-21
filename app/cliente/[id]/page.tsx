import { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchPublicClientById } from "@/api/user";
import ClientDetailClient from "./ClientDetailClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const numericId = Number(id);

  if (!id || Number.isNaN(numericId) || numericId <= 0) {
    return { title: "Contratante não encontrado" };
  }

  try {
    const client = await fetchPublicClientById(numericId);
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://contratamusico.com.br";

    return {
      title: `${client.name} - Contratante`,
      description: `Perfil público de ${client.name}. Localização: ${client.location || "não informada"}.`,
      alternates: {
        canonical: `${siteUrl}/cliente/${client.id}`,
      },
    };
  } catch {
    return { title: "Contratante não encontrado" };
  }
}

export default async function ClientDetailPage({ params }: PageProps) {
  const { id } = await params;
  const numericId = Number(id);

  if (!id || Number.isNaN(numericId) || numericId <= 0) {
    notFound();
  }

  try {
    const client = await fetchPublicClientById(numericId);
    return <ClientDetailClient client={client} />;
  } catch {
    notFound();
  }
}

