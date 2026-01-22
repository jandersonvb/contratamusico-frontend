import { notFound } from "next/navigation";
import { fetchMusicianById } from "@/api/musician";
import MusicianDetailClient from "./MusicianDetailClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function MusicianDetailPage({ params }: PageProps) {
  const { id } = await params;

  try {
    const musician = await fetchMusicianById(Number(id));
    return <MusicianDetailClient musician={musician} />;
  } catch (error) {
    console.error('Error fetching musician:', error);
    notFound();
  }
}
