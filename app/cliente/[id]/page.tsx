import { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchPublicClientById } from "@/api/user";
import ClientDetailClient from "./ClientDetailClient";
import { buildPageMetadata } from "@/lib/seo";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const numericId = Number(id);

  if (!id || Number.isNaN(numericId) || numericId <= 0) {
    return {
      title: "Contratante não encontrado",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  try {
    const client = await fetchPublicClientById(numericId);

    return buildPageMetadata({
      title: `${client.name} - Contratante`,
      description: `Perfil público de ${client.name}. Localização: ${client.location || "não informada"}.`,
      path: `/cliente/${client.id}`,
    });
  } catch {
    return {
      title: "Contratante não encontrado",
      robots: {
        index: false,
        follow: false,
      },
    };
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

