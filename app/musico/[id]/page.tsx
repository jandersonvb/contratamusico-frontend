import { notFound } from "next/navigation";
import { fetchMusicianById } from "@/api/musician";
import MusicianDetailClient from "./MusicianDetailClient";
import { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import { withSiteUrl } from "@/lib/env";

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
    const musicianUrl = withSiteUrl(`/musico/${musician.id}`);
    
    const genresText = musician.genres?.map(g => g.name).join(", ") || "";
    const instrumentsText = musician.instruments?.map(i => i.name).join(", ") || "";
    const locationText = musician.location ? `em ${musician.location}` : "";

    const description = musician.bio 
      || `Contrate ${musician.name}, músico profissional especializado em ${genresText}. ${instrumentsText} ${locationText}. Veja portfólio, avaliações e contrate agora.`;

    return {
      ...buildPageMetadata({
        title: `${musician.name} - Músico Profissional`,
        description: description.slice(0, 160),
        path: `/musico/${musician.id}`,
        keywords: [
          musician.name,
          ...(musician.genres?.map((genre) => genre.name) || []),
          ...(musician.instruments?.map((instrument) => instrument.name) || []),
          "músico profissional",
          "contratar músico",
          musician.location || "",
        ].filter(Boolean),
        type: "profile",
        image: musician.profileImageUrl || "/images/default-musician.svg",
      }),
      openGraph: {
        type: "profile",
        url: musicianUrl,
        title: `${musician.name} - Músico Profissional`,
        description: description.slice(0, 200),
        images: [
          {
            url: musician.profileImageUrl || withSiteUrl("/images/default-musician.svg"),
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
        images: [musician.profileImageUrl || withSiteUrl("/images/default-musician.svg")],
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
