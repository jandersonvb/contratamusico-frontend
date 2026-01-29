import { notFound } from "next/navigation";
import { fetchMusicianById } from "@/api/musician";
import MusicianDetailClient from "./MusicianDetailClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function MusicianDetailPage({ params }: PageProps) {
  const { id } = await params;

  // Validar se o ID é um número válido
  const numericId = Number(id);
  if (!id || isNaN(numericId) || numericId <= 0) {
    notFound();
  }

  try {
    const musician = await fetchMusicianById(numericId);
    return <MusicianDetailClient musician={musician} />;
  } catch (error) {
    console.error('Error fetching musician:', error);
    notFound();
  }
}
