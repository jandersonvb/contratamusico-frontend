'use client';

import Script from 'next/script';
import { MusicianProfile } from '@/lib/types/musician';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://contratamusico.com.br';

interface MusicianSchemaProps {
  musician: MusicianProfile;
}

export function MusicianSchema({ musician }: MusicianSchemaProps) {
  const locationParts = musician.location?.split(', ') || [];
  const city = locationParts[0] || '';
  const state = locationParts[1] || '';

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: musician.name,
    description: musician.bio || `${musician.name} - Músico profissional especializado em ${musician.genres?.map(g => g.name).join(', ') || 'diversos estilos'}`,
    image: musician.profileImageUrl || `${siteUrl}/default-musician.jpg`,
    url: `${siteUrl}/musico/${musician.id}`,
    jobTitle: 'Músico Profissional',
    knowsAbout: musician.genres?.map(g => g.name) || [],
    address: city && state ? {
      '@type': 'PostalAddress',
      addressLocality: city,
      addressRegion: state,
      addressCountry: 'BR',
    } : undefined,
    aggregateRating: musician.rating ? {
      '@type': 'AggregateRating',
      ratingValue: musician.rating,
      bestRating: 5,
      ratingCount: musician.ratingCount || 1,
    } : undefined,
    offers: musician.priceFrom ? {
      '@type': 'Offer',
      price: musician.priceFrom / 100, // Converter de centavos para reais
      priceCurrency: 'BRL',
      availability: 'https://schema.org/InStock',
    } : undefined,
  };

  // Remover campos undefined
  Object.keys(schema).forEach(key => {
    if (schema[key as keyof typeof schema] === undefined) {
      delete schema[key as keyof typeof schema];
    }
  });

  return (
    <Script
      id={`musician-schema-${musician.id}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
