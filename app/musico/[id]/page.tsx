import { notFound } from "next/navigation";
import { musicianDetails } from "@/lib/musicianDetails";
import MusicianDetailClient from "./MusicianDetailClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function MusicianDetailPage({ params }: PageProps) {
  const { id } = await params;

  const musician = musicianDetails.find((m) => m.id === Number(id));

  if (!musician) {
    notFound();
  }

  return <MusicianDetailClient musician={musician} />;
}
