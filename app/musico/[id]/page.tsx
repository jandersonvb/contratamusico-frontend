import { notFound } from "next/navigation";
import { fetchMusicianById } from "@/api/musician";
import MusicianDetailClient from "./MusicianDetailClient";
import { Metadata } from "next";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const numericId = Number(id);

  if (!id || isNaN(numericId) || numericId <= 0) {
    return {
      title: "Músico não encontrado",
    };
  }

  try {
    const musician = await fetchMusicianById(numericId);
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://contratamusico.com.br';
    const musicianUrl = `${siteUrl}/musico/${musician.id}`;
    
    const genresText = musician.genres?.map(g => g.name).join(", ") || "";
    const instrumentsText = musician.instruments?.map(i => i.name).join(", ") || "";
    const locationText = musician.location ? `em ${musician.location}` : "";

    const description = musician.bio 
      || `Contrate ${musician.name}, músico profissional especializado em ${genresText}. ${instrumentsText} ${locationText}. Veja portfólio, avaliações e contrate agora.`;

    return {
      title: `${musician.name} - Músico Profissional`,
      description: description.slice(0, 160),
      keywords: [
        musician.name,
        ...(musician.genres?.map(g => g.name) || []),
        ...(musician.instruments?.map(i => i.name) || []),
        "músico profissional",
        "contratar músico",
        musician.location || "",
      ].filter(Boolean),
      openGraph: {
        type: "profile",
        url: musicianUrl,
        title: `${musician.name} - Músico Profissional`,
        description: description.slice(0, 200),
        images: [
          {
            url: musician.profileImageUrl || `${siteUrl}/default-musician.jpg`,
            width: 800,
            height: 600,
            alt: musician.name,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: `${musician.name} - Músico Profissional`,
        description: description.slice(0, 200),
        images: [musician.profileImageUrl || `${siteUrl}/default-musician.jpg`],
      },
      alternates: {
        canonical: musicianUrl,
      },
      robots: {
        index: true,
        follow: true,
      },
    };
  } catch {
    return {
      title: "Músico não encontrado",
      robots: {
        index: false,
        follow: false,
      },
    };
  }
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
